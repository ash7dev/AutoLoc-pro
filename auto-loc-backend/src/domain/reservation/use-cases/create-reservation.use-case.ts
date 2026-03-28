import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { FournisseurPaiement, Prisma, StatutReservation } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { PaymentService } from '../../../infrastructure/payment/payment.service';
import { RequestUser } from '../../../common/types/auth.types';
import { ReservationPricingService } from '../reservation-pricing.service';
import { ReservationAvailabilityService } from '../reservation-availability.service';
import {
    ReservationIdempotencyService,
    IdempotencyResult,
} from '../reservation-idempotency.service';
import { RevalidateService } from '../../../infrastructure/revalidate/revalidate.service';
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';

// ── Constants ──────────────────────────────────────────────────────────────────

const SIGNATURE_DEADLINE_MS = 48 * 60 * 60 * 1000;
const SEARCH_CACHE_PREFIX = 'vehicles:search:';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateReservationInput {
    vehiculeId: string;
    dateDebut: string;
    dateFin: string;
    fournisseur: FournisseurPaiement;
    idempotencyKey?: string;
    adresseLivraison?: string;
    fraisLivraison?: number;
    horsDakar?: boolean;
}

export interface CreateReservationResult {
    reservationId: string;
    paymentUrl: string;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CreateReservationUseCase {
    private readonly logger = new Logger(CreateReservationUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly queue: QueueService,
        private readonly payment: PaymentService,
        private readonly pricing: ReservationPricingService,
        private readonly availability: ReservationAvailabilityService,
        private readonly idempotency: ReservationIdempotencyService,
        private readonly revalidate: RevalidateService,
        private readonly telegram: TelegramService,
    ) { }

    async execute(
        user: RequestUser,
        input: CreateReservationInput,
        headerIdempotencyKey?: string,
    ): Promise<CreateReservationResult> {
        // ── 1. Validate locataire ─────────────────────────────────────────────────
        const locataire = await this.validateLocataire(user.sub);

        // ── 2. Parse dates ────────────────────────────────────────────────────────
        const dates = this.pricing.parseDatesAndDuration(
            input.dateDebut,
            input.dateFin,
        );

        // ── 2.5 Validate dateDebut is not in the past ─────────────────────────────
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);
        if (dates.debut < todayUTC) {
            throw new BadRequestException(
                'La date de début de location ne peut pas être dans le passé',
            );
        }

        // ── 3. Validate vehicle & business rules ──────────────────────────────────
        const vehicule = await this.validateVehicle(
            input.vehiculeId,
            locataire,
            dates.nbJours,
        );

        // ── 4. Idempotency check ──────────────────────────────────────────────────
        const idempotencyKey = headerIdempotencyKey ?? input.idempotencyKey;
        const cached = await this.idempotency.checkExisting(idempotencyKey);
        if (cached) return cached;
        await this.idempotency.acquireLock(idempotencyKey);

        // ── 5. Calculate pricing ──────────────────────────────────────────────────
        // Supplément hors Dakar : source de vérité = véhicule en DB, jamais frontend
        const supplementHorsDakar = input.horsDakar && vehicule.autoriseHorsDakar
            ? Number(vehicule.supplementHorsDakarParJour ?? 0)
            : 0;

        const price = this.pricing.calculate(
            vehicule.prixParJour,
            dates.nbJours,
            vehicule.tarifsProgressifs,
            supplementHorsDakar,
        );

        // Frais de livraison : source de vérité = véhicule en DB, jamais frontend
        const fraisLivraison = input.adresseLivraison && vehicule.fraisLivraison
            ? Number(vehicule.fraisLivraison)
            : 0;
        const totalAvecLivraison = price.totalLocataire.add(new Prisma.Decimal(fraisLivraison));

        // ── 6. Initiate payment ───────────────────────────────────────────────────
        const paymentRef = `${input.vehiculeId.slice(0, 8)}-${Date.now()}`;
        const paymentUrl = await this.payment.initiatePayment(
            input.fournisseur,
            totalAvecLivraison,
            paymentRef,
        );

        const delaiSignature = new Date(Date.now() + SIGNATURE_DEADLINE_MS);

        // ── 7. Transaction RepeatableRead ─────────────────────────────────────────
        let reservation: { id: string; paymentUrl: string | null } | null = null;
        try {
            reservation = await this.prisma.$transaction(
                async (tx) => {
                    await this.availability.ensureAvailable(
                        tx as any,
                        input.vehiculeId,
                        dates.debut,
                        dates.fin,
                    );

                    const res = await tx.reservation.create({
                        data: {
                            vehiculeId: input.vehiculeId,
                            locataireId: locataire.id,
                            proprietaireId: vehicule.proprietaireId,
                            dateDebut: dates.debut,
                            dateFin: dates.fin,
                            prixParJour: price.prixParJour,
                            totalBase: price.totalBase,
                            tauxCommission: price.tauxCommission,
                            montantCommission: price.montantCommission,
                            totalLocataire: totalAvecLivraison,
                            netProprietaire: price.netProprietaire,
                            statut: StatutReservation.EN_ATTENTE_PAIEMENT,
                            paymentUrl,
                            delaiSignature,
                            adresseLivraison: input.adresseLivraison ?? null,
                            fraisLivraison: fraisLivraison > 0 ? fraisLivraison : null,
                            horsDakar: !!input.horsDakar && vehicule.autoriseHorsDakar,
                            supplementHorsDakar: supplementHorsDakar > 0 ? supplementHorsDakar : null,
                        },
                        select: { id: true, paymentUrl: true },
                    });

                    await tx.paiement.create({
                        data: {
                            reservationId: res.id,
                            montant: totalAvecLivraison,
                            devise: 'XOF',
                            fournisseur: input.fournisseur,
                            idTransactionFournisseur: paymentRef,
                            statut: 'EN_ATTENTE',
                        },
                    });

                    if (idempotencyKey) {
                        await tx.idempotencyKey.create({
                            data: {
                                key: idempotencyKey,
                                reservationId: res.id,
                                paymentUrl,
                                paymentRef,
                                expiresAt: new Date(
                                    Date.now() + this.idempotency.ttlSeconds * 1000,
                                ),
                            },
                        });
                    }

                    await tx.reservationHistorique.create({
                        data: {
                            reservationId: res.id,
                            ancienStatut: null,
                            nouveauStatut: StatutReservation.EN_ATTENTE_PAIEMENT,
                            modifiePar: locataire.id,
                        },
                    });

                    return res;
                },
                { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
            );
        } catch (err) {
            // Le paiement a été initié AVANT la transaction — on tente un remboursement.
            // Si le remboursement échoue, on logue pour permettre un traitement manuel.
            await this.payment
                .refundPayment(input.fournisseur, paymentRef)
                .catch((refundErr: unknown) => {
                    const msg = refundErr instanceof Error ? refundErr.message : String(refundErr);
                    this.logger.error(
                        `Remboursement automatique échoué après échec de transaction — ` +
                        `intervention manuelle requise. ` +
                        `fournisseur=${input.fournisseur} ref=${paymentRef} vehiculeId=${input.vehiculeId}`,
                        msg,
                    );
                });
            await this.idempotency.releaseLock(idempotencyKey);
            throw err;
        }

        // ── 8. Post-commit side effects ───────────────────────────────────────────
        const result: IdempotencyResult = {
            reservationId: reservation.id,
            paymentUrl: reservation.paymentUrl ?? paymentUrl,
        };
        await this.idempotency.commitResult(idempotencyKey, result);
        await this.queue.schedulePaymentExpiry(reservation.id);

        // Email supprimé intentionnellement : l'utilisateur vient de créer la réservation
        // et est encore sur le flux de paiement. L'email pertinent est reservation.paid.

        // Alerte admin Telegram — fire-and-forget
        const debutFmt = dates.debut.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        const finFmt = dates.fin.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        this.telegram.sendAdminAlert(
            `📋 <b>Nouvelle réservation</b>\n` +
            `Véhicule : ${vehicule.marque} ${vehicule.modele} — ${vehicule.ville}\n` +
            `Période : ${debutFmt} → ${finFmt} (${dates.nbJours}j)\n` +
            `Montant : ${price.totalLocataire} FCFA\n` +
            `<a href="https://autoloc.sn/dashboard/admin/reservations">Voir →</a>`,
        ).catch(() => { });

        const city = vehicule.ville?.toLowerCase?.() ?? '';
        const cityPattern = city
            ? `${SEARCH_CACHE_PREFIX}${city}:*`
            : `${SEARCH_CACHE_PREFIX}*`;
        await this.redis.delPattern(cityPattern).catch(() => { });

        // Invalidate Next.js cache for the affected vehicle and city/explorer
        this.revalidate.revalidatePath(`/vehicle/${input.vehiculeId}`).catch(() => { });
        this.revalidate.revalidatePath('/explorer').catch(() => { });
        if (city) {
            this.revalidate.revalidatePath(`/location/${encodeURIComponent(city)}`).catch(() => { });
        }

        return result;
    }

    // ── Private validators ────────────────────────────────────────────────────────

    private async validateLocataire(userSub: string) {
        const locataire = await this.prisma.utilisateur.findUnique({
            where: { userId: userSub },
            select: {
                id: true,
                email: true,
                prenom: true,
                statutKyc: true,
                dateNaissance: true,
                actif: true,
                bloqueJusqua: true,
            },
        });
        if (!locataire) throw new ForbiddenException('Profil incomplet');
        if (!locataire.actif) throw new ForbiddenException('Compte suspendu');
        if (locataire.bloqueJusqua && locataire.bloqueJusqua > new Date()) {
            throw new ForbiddenException('Compte temporairement bloqué');
        }
        return locataire;
    }

    private async validateVehicle(
        vehiculeId: string,
        locataire: { id: string; dateNaissance: Date | null },
        nbJours: number,
    ) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id: vehiculeId },
            select: {
                id: true,
                statut: true,
                proprietaireId: true,
                prixParJour: true,
                joursMinimum: true,
                ageMinimum: true,
                ville: true,
                marque: true,
                modele: true,
                fraisLivraison: true,
                autoriseHorsDakar: true,
                supplementHorsDakarParJour: true,
                tarifsProgressifs: {
                    orderBy: { joursMin: 'asc' },
                    select: { joursMin: true, joursMax: true, prix: true },
                },
            },
        });
        if (!vehicule) throw new NotFoundException('Véhicule introuvable');
        if (vehicule.statut !== 'VERIFIE') {
            throw new ForbiddenException('Ce véhicule n\'est pas disponible à la location');
        }
        if (vehicule.proprietaireId === locataire.id) {
            throw new ForbiddenException('Vous ne pouvez pas louer votre propre véhicule');
        }
        if (nbJours < vehicule.joursMinimum) {
            throw new ForbiddenException(
                `La durée minimale de location est de ${vehicule.joursMinimum} jour(s)`,
            );
        }
        if (!locataire.dateNaissance) {
            throw new ForbiddenException('Date de naissance requise pour vérifier l\'âge');
        }
        const age = this.pricing.calculateAge(locataire.dateNaissance);
        if (age < vehicule.ageMinimum) {
            throw new ForbiddenException(
                `L'âge minimum pour ce véhicule est de ${vehicule.ageMinimum} ans`,
            );
        }
        return vehicule;
    }
}
