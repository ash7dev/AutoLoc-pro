import {
    ForbiddenException,
    Injectable,
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
}

export interface CreateReservationResult {
    reservationId: string;
    paymentUrl: string;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CreateReservationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly queue: QueueService,
        private readonly payment: PaymentService,
        private readonly pricing: ReservationPricingService,
        private readonly availability: ReservationAvailabilityService,
        private readonly idempotency: ReservationIdempotencyService,
        private readonly revalidate: RevalidateService,
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
        const price = this.pricing.calculate(
            vehicule.prixParJour,
            dates.nbJours,
            vehicule.tarifsProgressifs,
        );

        // ── 6. Initiate payment ───────────────────────────────────────────────────
        const paymentRef = `${input.vehiculeId.slice(0, 8)}-${Date.now()}`;
        const paymentUrl = await this.payment.initiatePayment(
            input.fournisseur,
            price.totalLocataire,
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
                            totalLocataire: price.totalLocataire,
                            netProprietaire: price.netProprietaire,
                            statut: StatutReservation.EN_ATTENTE_PAIEMENT,
                            paymentUrl,
                            delaiSignature,
                        },
                        select: { id: true, paymentUrl: true },
                    });

                    await tx.paiement.create({
                        data: {
                            reservationId: res.id,
                            montant: price.totalLocataire,
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
            await this.payment.refundPayment(input.fournisseur, paymentRef).catch(() => { });
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
                statutKyc: true,
                dateNaissance: true,
                actif: true,
                bloqueJusqua: true,
            },
        });
        if (!locataire) throw new ForbiddenException('Profile not completed');
        if (!locataire.actif) throw new ForbiddenException('Account suspended');
        if (locataire.bloqueJusqua && locataire.bloqueJusqua > new Date()) {
            throw new ForbiddenException('Account temporarily blocked');
        }
        if (locataire.statutKyc !== 'VERIFIE') {
            throw new ForbiddenException('KYC verification required');
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
                tarifsProgressifs: {
                    orderBy: { joursMin: 'asc' },
                    select: { joursMin: true, joursMax: true, prix: true },
                },
            },
        });
        if (!vehicule) throw new NotFoundException('Vehicle not found');
        if (vehicule.statut !== 'VERIFIE') {
            throw new ForbiddenException('Vehicle is not available for rental');
        }
        if (vehicule.proprietaireId === locataire.id) {
            throw new ForbiddenException('Cannot rent your own vehicle');
        }
        if (nbJours < vehicule.joursMinimum) {
            throw new ForbiddenException(
                `Minimum rental duration is ${vehicule.joursMinimum} day(s)`,
            );
        }
        if (!locataire.dateNaissance) {
            throw new ForbiddenException('Birth date required to verify age');
        }
        const age = this.pricing.calculateAge(locataire.dateNaissance);
        if (age < vehicule.ageMinimum) {
            throw new ForbiddenException(
                `Minimum driver age is ${vehicule.ageMinimum} years`,
            );
        }
        return vehicule;
    }
}
