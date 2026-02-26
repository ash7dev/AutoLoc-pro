import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// ── Constants métier ───────────────────────────────────────────────────────────

// Seuils locataire (politique modérée)
const TENANT_FULL_REFUND_DAYS = 5;    // > 5 jours → 100% (commission retenue)
const TENANT_PARTIAL_REFUND_DAYS = 2; // 2-5 jours → 75%
// < 24h (< 1 jour) → 0%

// Seuils propriétaire (pénalités strictes)
const OWNER_NO_PENALTY_DAYS = 7;       // > 7 jours → 0% pénalité
const OWNER_MEDIUM_PENALTY_DAYS = 3;   // 3-7 jours → 20% pénalité
// < 3 jours → 40% pénalité
// Jour même → annulation impossible (sauf accord)

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReservationForCancellation {
    dateDebut: Date;
    totalLocataire: Prisma.Decimal;
    totalBase: Prisma.Decimal;
    montantCommission: Prisma.Decimal;
    netProprietaire: Prisma.Decimal;
}

export interface CancellationResult {
    /** Pourcentage du montant remboursé au locataire */
    refundPercentage: number;
    /** Montant effectivement remboursé */
    refundAmount: Prisma.Decimal;
    /** Commission plateforme retenue */
    commissionRetained: Prisma.Decimal;
    /** Pourcentage de pénalité propriétaire */
    ownerPenaltyPercentage: number;
    /** Montant de la pénalité propriétaire */
    ownerPenaltyAmount: Prisma.Decimal;
    /** Avertissements / messages à afficher */
    warnings: string[];
    /** false si l'annulation est bloquée (ex: proprio jour même) */
    canCancel: boolean;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class CancellationPolicyService {
    /**
     * Calcule le remboursement pour une annulation par le locataire.
     * Politique modérée :
     * - > 5 jours  → 100% remb. (commission 15% retenue = locataire récupère totalBase)
     * - 2-5 jours  → 75% du totalLocataire (commission + 25% restant retenus)
     * - < 24h      → 0%
     */
    calculateForTenant(
        reservation: ReservationForCancellation,
        cancelDate: Date = new Date(),
    ): CancellationResult {
        const daysUntil = this.daysUntilStart(reservation.dateDebut, cancelDate);
        const zero = new Prisma.Decimal(0);

        if (daysUntil > TENANT_FULL_REFUND_DAYS) {
            // > 5 jours : remboursement intégral MOINS les frais de service (commission)
            const refundAmount = reservation.totalBase; // totalLocataire - commission
            return {
                refundPercentage: 100,
                refundAmount,
                commissionRetained: reservation.montantCommission,
                ownerPenaltyPercentage: 0,
                ownerPenaltyAmount: zero,
                warnings: [],
                canCancel: true,
            };
        }

        if (daysUntil >= TENANT_PARTIAL_REFUND_DAYS) {
            // 2-5 jours : 75% du totalLocataire
            const refundAmount = reservation.totalLocataire
                .mul(new Prisma.Decimal('0.75'))
                .toDecimalPlaces(2);
            return {
                refundPercentage: 75,
                refundAmount,
                commissionRetained: reservation.totalLocataire
                    .sub(refundAmount)
                    .toDecimalPlaces(2),
                ownerPenaltyPercentage: 0,
                ownerPenaltyAmount: zero,
                warnings: [
                    `Annulation entre 2 et 5 jours : 75% remboursé (${refundAmount} FCFA)`,
                ],
                canCancel: true,
            };
        }

        // < 24h : aucun remboursement
        return {
            refundPercentage: 0,
            refundAmount: zero,
            commissionRetained: reservation.totalLocataire,
            ownerPenaltyPercentage: 0,
            ownerPenaltyAmount: zero,
            warnings: ['Annulation moins de 24h avant la location : aucun remboursement'],
            canCancel: true,
        };
    }

    /**
     * Calcule les pénalités pour une annulation par le propriétaire.
     * Le client est TOUJOURS remboursé intégralement.
     * - > 7 jours  → aucune pénalité (avertissement)
     * - 3-7 jours  → pénalité 20% sur prochaine location
     * - < 3 jours  → pénalité 40%
     * - Jour même  → annulation impossible depuis la plateforme
     */
    calculateForOwner(
        reservation: ReservationForCancellation,
        cancelDate: Date = new Date(),
    ): CancellationResult {
        const daysUntil = this.daysUntilStart(reservation.dateDebut, cancelDate);
        const zero = new Prisma.Decimal(0);

        // Remboursement intégral au client dans TOUS les cas proprio
        const refundAmount = reservation.totalLocataire;

        if (daysUntil < 1) {
            // Jour même : annulation impossible
            return {
                refundPercentage: 100,
                refundAmount,
                commissionRetained: zero,
                ownerPenaltyPercentage: 40,
                ownerPenaltyAmount: reservation.totalBase
                    .mul(new Prisma.Decimal('0.40'))
                    .toDecimalPlaces(2),
                warnings: [
                    'Annulation le jour même impossible depuis la plateforme, sauf accord avec le locataire',
                ],
                canCancel: false,
            };
        }

        if (daysUntil < OWNER_MEDIUM_PENALTY_DAYS) {
            // < 3 jours : 40% pénalité
            const penaltyAmount = reservation.totalBase
                .mul(new Prisma.Decimal('0.40'))
                .toDecimalPlaces(2);
            return {
                refundPercentage: 100,
                refundAmount,
                commissionRetained: zero,
                ownerPenaltyPercentage: 40,
                ownerPenaltyAmount: penaltyAmount,
                warnings: [
                    `Pénalité de 40% (${penaltyAmount} FCFA) sera déduite de votre prochaine location`,
                    'Avertissement : annulations répétées entraînent la désactivation du compte',
                ],
                canCancel: true,
            };
        }

        if (daysUntil <= OWNER_NO_PENALTY_DAYS) {
            // 3-7 jours : 20% pénalité
            const penaltyAmount = reservation.totalBase
                .mul(new Prisma.Decimal('0.20'))
                .toDecimalPlaces(2);
            return {
                refundPercentage: 100,
                refundAmount,
                commissionRetained: zero,
                ownerPenaltyPercentage: 20,
                ownerPenaltyAmount: penaltyAmount,
                warnings: [
                    `Pénalité de 20% (${penaltyAmount} FCFA) sera déduite de votre prochaine location`,
                    'Dernier avertissement avant suspension',
                ],
                canCancel: true,
            };
        }

        // > 7 jours : aucune pénalité
        return {
            refundPercentage: 100,
            refundAmount,
            commissionRetained: zero,
            ownerPenaltyPercentage: 0,
            ownerPenaltyAmount: zero,
            warnings: [
                'Avertissement : les annulations répétées risquent de mener au bannissement',
            ],
            canCancel: true,
        };
    }

    /**
     * Exception à la politique modérée (force majeure locataire).
     * Retourne 100% remboursement, aucune commission retenue.
     */
    calculateForceMajeure(
        reservation: ReservationForCancellation,
    ): CancellationResult {
        return {
            refundPercentage: 100,
            refundAmount: reservation.totalLocataire,
            commissionRetained: new Prisma.Decimal(0),
            ownerPenaltyPercentage: 0,
            ownerPenaltyAmount: new Prisma.Decimal(0),
            warnings: [],
            canCancel: true,
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Nombre de jours complets entre cancelDate et dateDebut.
     * Si négatif (dateDebut déjà passée), retourne 0.
     */
    daysUntilStart(dateDebut: Date, cancelDate: Date): number {
        const diffMs = dateDebut.getTime() - cancelDate.getTime();
        const days = diffMs / (1000 * 60 * 60 * 24);
        return Math.max(0, days);
    }
}
