import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// ── Constants métier ───────────────────────────────────────────────────────────
// Les seuils sont maintenant hardcodés directement dans les méthodes pour plus de clarté

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
     *
     * USE CASE 1 - AVANT confirmation (statut PAYEE) :
     * → Remboursement intégral 100% (y compris la commission)
     * Le proprio n'a même pas encore confirmé, le locataire récupère tout.
     *
     * USE CASE 2 - APRÈS confirmation (statut CONFIRMEE) :
     * - > 5 jours  → 100% du totalBase (commission 15% retenue)
     * - 3-5 jours  → 75% du totalLocataire
     * - 1-3 jours  → 50% du totalLocataire
     * - < 24h      → 0%
     */
    calculateForTenant(
        reservation: ReservationForCancellation,
        cancelDate: Date = new Date(),
        isConfirmed: boolean = false,
    ): CancellationResult {
        const daysUntil = this.daysUntilStart(reservation.dateDebut, cancelDate);
        const zero = new Prisma.Decimal(0);

        // USE CASE 1 : Réservation PAS encore confirmée → remboursement intégral
        if (!isConfirmed) {
            return {
                refundPercentage: 100,
                refundAmount: reservation.totalLocataire, // Même la commission
                commissionRetained: zero,
                ownerPenaltyPercentage: 0,
                ownerPenaltyAmount: zero,
                warnings: ['Réservation non confirmée : remboursement intégral'],
                canCancel: true,
            };
        }

        // USE CASE 2 : Réservation CONFIRMÉE → politique stricte

        if (daysUntil > 5) {
            // > 5 jours : remboursement du totalBase (commission retenue)
            return {
                refundPercentage: 100,
                refundAmount: reservation.totalBase,
                commissionRetained: reservation.montantCommission,
                ownerPenaltyPercentage: 0,
                ownerPenaltyAmount: zero,
                warnings: [],
                canCancel: true,
            };
        }

        if (daysUntil >= 3) {
            // 3-5 jours : 75% du totalLocataire
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
                    `Annulation entre 3 et 5 jours : 75% remboursé (${refundAmount} FCFA)`,
                ],
                canCancel: true,
            };
        }

        if (daysUntil >= 1) {
            // 1-3 jours : 50% du totalLocataire
            const refundAmount = reservation.totalLocataire
                .mul(new Prisma.Decimal('0.50'))
                .toDecimalPlaces(2);
            return {
                refundPercentage: 50,
                refundAmount,
                commissionRetained: reservation.totalLocataire
                    .sub(refundAmount)
                    .toDecimalPlaces(2),
                ownerPenaltyPercentage: 0,
                ownerPenaltyAmount: zero,
                warnings: [
                    `Annulation entre 1 et 3 jours : 50% remboursé (${refundAmount} FCFA)`,
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
     *
     * USE CASE 3 - Réservation PAYEE (pas encore confirmée) :
     * → Refus de réservation
     * → Remboursement intégral 100% (même la commission)
     * → Aucune pénalité pour le proprio
     *
     * USE CASE 4 - Réservation CONFIRMEE ou EN_COURS :
     * Le locataire est TOUJOURS remboursé intégralement.
     * Pénalités différées (prélevées sur prochaine location) :
     * - > 7 jours  → 0% pénalité (avertissement seulement)
     * - 3-7 jours  → 20% pénalité
     * - < 3 jours  → 40% pénalité
     * - < 24h      → 40% pénalité + BLOCAGE (admin doit forcer)
     */
    calculateForOwner(
        reservation: ReservationForCancellation,
        cancelDate: Date = new Date(),
        isConfirmed: boolean = true, // Par défaut on suppose CONFIRMEE
    ): CancellationResult {
        const daysUntil = this.daysUntilStart(reservation.dateDebut, cancelDate);
        const zero = new Prisma.Decimal(0);

        // Remboursement intégral au client dans TOUS les cas proprio
        const refundAmount = reservation.totalLocataire;

        // USE CASE 3 : Réservation PAS encore confirmée (refus)
        if (!isConfirmed) {
            return {
                refundPercentage: 100,
                refundAmount,
                commissionRetained: zero,
                ownerPenaltyPercentage: 0,
                ownerPenaltyAmount: zero,
                warnings: ['Propriétaire refuse la réservation : remboursement intégral au locataire'],
                canCancel: true,
            };
        }

        // USE CASE 4 : Réservation CONFIRMÉE → pénalités

        if (daysUntil < 1) {
            // < 24h : annulation BLOQUÉE
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
                    'Annulation le jour même impossible depuis la plateforme, sauf accord avec le locataire',
                ],
                canCancel: false,
            };
        }

        if (daysUntil < 3) {
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

        if (daysUntil <= 7) {
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
     * PUBLIC pour être utilisé dans les use-cases.
     */
    public daysUntilStart(dateDebut: Date, cancelDate: Date): number {
        const diffMs = dateDebut.getTime() - cancelDate.getTime();
        const days = diffMs / (1000 * 60 * 60 * 24);
        return Math.max(0, days);
    }
}
