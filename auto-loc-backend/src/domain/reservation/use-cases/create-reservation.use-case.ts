import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FournisseurPaiement, ModePaiementReservation, Prisma, StatutReservation } from '@prisma/client';
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
const DEPOSIT_RATE = new Prisma.Decimal('0.3000');

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateReservationInput {
    vehiculeId: string;
    dateDebut: string;
    dateFin: string;
    fournisseur: FournisseurPaiement;
    idempotencyKey?: string;
    adresseLivraison?: string;
    fraisLivraison?: number;
    modePaiement?: ModePaiementReservation;
    horsDakar?: boolean;
    /** Méthode de paiement cible (ex: 'WAVE', 'ORANGE_MONEY', 'FREE_MONEY'). */
    targetPayment?: string;
    /** Numéro de téléphone du payeur (requis pour InTouch API directe). */
    payerPhone?: string;
}

export interface CreateReservationResult {
    reservationId: string;
    modePaiement: ModePaiementReservation;
    totalLocataire: string;
    montantPayeEnLigne: string;
    montantSoldeCheckin: string;
    montantCommissionEnLigne: string;
    montantProprietaireEnLigne: string;
    /** URL de redirection — null si le paiement passe par le widget InTouch */
    paymentUrl: string | null;
    /** Config widget TouchPay — présent uniquement pour le fournisseur INTOUCH */
    widgetConfig?: import('../../../infrastructure/payment/payment-provider.interface').IntouchWidgetConfig;
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
        const modePaiement = input.modePaiement ?? ModePaiementReservation.TOTAL_EN_LIGNE;
        const paymentBreakdown = this.calculatePaymentBreakdown(
            modePaiement,
            totalAvecLivraison,
            price.montantCommission,
            price.netProprietaire,
        );

        // ── 6. Initiate payment ───────────────────────────────────────────────────
        // Pre-generate reservation UUID so the success/cancel URLs can include it.
        const reservationId = randomUUID();
        const paymentRef = `${input.vehiculeId.slice(0, 8)}-${Date.now()}`;
        const { paymentUrl, widgetConfig } = await this.payment.initiatePayment(
            input.fournisseur,
            paymentBreakdown.montantPayeEnLigne,
            paymentRef,
            {
                targetPayment: input.targetPayment,
                reservationId,
                payerPhone: input.payerPhone,
                payerEmail: locataire.email,
                payerFirstName: locataire.prenom,
                payerLastName: locataire.nom,
            },
        );

        // Délai de confirmation adaptatif pour same-day bookings
        const timeUntilStart = dates.debut.getTime() - Date.now();
        const hoursUntilStart = timeUntilStart / (60 * 60 * 1000);

        let delaiSignature: Date;
        if (hoursUntilStart < 24) {
            // Same-day ou < 24h : délai = 50% du temps restant
            // Minimum 1h, maximum 6h
            const adaptiveDelayMs = Math.max(
                1 * 60 * 60 * 1000, // min 1h
                Math.min(
                    6 * 60 * 60 * 1000, // max 6h
                    timeUntilStart * 0.5 // 50% du temps restant
                )
            );
            delaiSignature = new Date(Date.now() + adaptiveDelayMs);
            this.logger.log(`Same-day booking: deadline set to ${Math.round(adaptiveDelayMs / (60 * 60 * 1000))}h (start in ${hoursUntilStart.toFixed(1)}h)`);
        } else {
            // Réservation normale : 48h standard
            delaiSignature = new Date(Date.now() + SIGNATURE_DEADLINE_MS);
        }

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
                            id: reservationId,
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
                            modePaiement,
                            tauxAcompte: paymentBreakdown.tauxAcompte,
                            montantPayeEnLigne: paymentBreakdown.montantPayeEnLigne,
                            montantSoldeCheckin: paymentBreakdown.montantSoldeCheckin,
                            montantCommissionEnLigne: paymentBreakdown.montantCommissionEnLigne,
                            montantProprietaireEnLigne: paymentBreakdown.montantProprietaireEnLigne,
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
                            montant: paymentBreakdown.montantPayeEnLigne,
                            devise: 'XOF',
                            fournisseur: input.fournisseur,
                            idTransactionFournisseur: paymentRef,
                            statut: 'EN_ATTENTE',
                            telephonePaiement: input.payerPhone || locataire.telephone,
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
            modePaiement,
            totalLocataire: totalAvecLivraison.toString(),
            montantPayeEnLigne: paymentBreakdown.montantPayeEnLigne.toString(),
            montantSoldeCheckin: paymentBreakdown.montantSoldeCheckin.toString(),
            montantCommissionEnLigne: paymentBreakdown.montantCommissionEnLigne.toString(),
            montantProprietaireEnLigne: paymentBreakdown.montantProprietaireEnLigne.toString(),
            paymentUrl: reservation.paymentUrl ?? paymentUrl ?? null,
            widgetConfig,
        };
        await this.idempotency.commitResult(idempotencyKey, result);
        await this.queue.schedulePaymentExpiry(reservation.id);

        // Email supprimé intentionnellement : l'utilisateur vient de créer la réservation
        // et est encore sur le flux de paiement. L'email pertinent est reservation.paid.
        // Note : L'alerte Telegram n'est envoyée qu'au moment du paiement confirmé (SUCCESS),
        // dans confirm-payment.use-case.ts.

        const city = vehicule.ville?.toLowerCase?.() ?? '';
        const cityPattern = city
            ? `${SEARCH_CACHE_PREFIX}${city}:*`
            : `${SEARCH_CACHE_PREFIX}*`;
        await this.redis.delPattern(cityPattern).catch(() => { });

        // Invalidate Next.js cache for the affected vehicle and city/explorer
        this.revalidate.revalidatePath(`/vehicle/${input.vehiculeId}`).catch(() => { });
        this.revalidate.revalidatePath('/explorer').catch(() => { });
        this.revalidate.revalidatePath('/reservations').catch(() => { });
        if (city) {
            this.revalidate.revalidatePath(`/location/${encodeURIComponent(city)}`).catch(() => { });
        }

        return result;
    }

    private calculatePaymentBreakdown(
        modePaiement: ModePaiementReservation,
        totalLocataire: Prisma.Decimal,
        montantCommission: Prisma.Decimal,
        netProprietaire: Prisma.Decimal,
    ) {
        if (modePaiement === ModePaiementReservation.ACOMPTE_SOLDE_CHECKIN) {
            const montantPayeEnLigne = totalLocataire
                .mul(DEPOSIT_RATE)
                .toDecimalPlaces(2);
            const montantSoldeCheckin = totalLocataire
                .sub(montantPayeEnLigne)
                .toDecimalPlaces(2);
            const montantCommissionEnLigne = Prisma.Decimal.min(
                montantCommission,
                montantPayeEnLigne,
            ).toDecimalPlaces(2);
            const montantProprietaireEnLigne = Prisma.Decimal.min(
                netProprietaire,
                Prisma.Decimal.max(
                    new Prisma.Decimal(0),
                    montantPayeEnLigne.sub(montantCommissionEnLigne),
                ),
            ).toDecimalPlaces(2);

            return {
                tauxAcompte: DEPOSIT_RATE,
                montantPayeEnLigne,
                montantSoldeCheckin,
                montantCommissionEnLigne,
                montantProprietaireEnLigne,
            };
        }

        return {
            tauxAcompte: null,
            montantPayeEnLigne: totalLocataire.toDecimalPlaces(2),
            montantSoldeCheckin: new Prisma.Decimal(0),
            montantCommissionEnLigne: montantCommission.toDecimalPlaces(2),
            montantProprietaireEnLigne: netProprietaire.toDecimalPlaces(2),
        };
    }

    // ── Private validators ────────────────────────────────────────────────────────

    private async validateLocataire(userSub: string) {
        const locataire = await this.prisma.utilisateur.findUnique({
            where: { userId: userSub },
            select: {
                id: true,
                email: true,
                prenom: true,
                nom: true,
                telephone: true,
                statutKyc: true,
                dateNaissance: true,
                actif: true,
                bloqueJusqua: true,
                phoneVerified: true,
                permisUrl: true,
                profileCompleted: true,
            },
        });
        if (!locataire) throw new ForbiddenException('Profil incomplet');
        if (!locataire.actif) throw new ForbiddenException('Compte suspendu');
        if (locataire.bloqueJusqua && locataire.bloqueJusqua > new Date()) {
            throw new ForbiddenException('Compte temporairement bloqué');
        }
        if (!locataire.profileCompleted || !locataire.prenom || !locataire.nom) {
            throw new ForbiddenException('Profil incomplet');
        }
        if (!locataire.phoneVerified) {
            throw new ForbiddenException('Numéro de téléphone non vérifié');
        }
        if (locataire.statutKyc !== 'EN_ATTENTE' && locataire.statutKyc !== 'VERIFIE') {
            throw new ForbiddenException('Vérification d’identité requise');
        }
        if (!locataire.permisUrl) {
            throw new ForbiddenException('Permis de conduire requis');
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
