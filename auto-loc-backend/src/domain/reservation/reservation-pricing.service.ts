import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Arrondit un montant aux 100 FCFA les plus proches.
 */
export function roundToNearest100(amount: number): number {
    return Math.round(amount / 100) * 100;
}

/** Taux de commission AutoLoc unique, appliqué à toutes les réservations. */
export const COMMISSION_RATE = new Prisma.Decimal('0.10');

/**
 * Taux de commission AutoLoc : 10% fixe, quel que soit le prix journalier.
 */
export function calculateCommissionRate(_prixParJour?: Prisma.Decimal | number): Prisma.Decimal {
    return COMMISSION_RATE;
}

/**
 * Borne le nombre de jours hors Dakar à [1, nbJours].
 * Non renseigné → toute la durée de la location.
 */
export function resolveNbJoursHorsDakar(nbJours: number, nbJoursHorsDakar?: number | null): number {
    if (nbJoursHorsDakar == null || !Number.isFinite(nbJoursHorsDakar)) return nbJours;
    return Math.min(nbJours, Math.max(1, Math.floor(nbJoursHorsDakar)));
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DateRange {
    debut: Date;
    fin: Date;
    nbJours: number;
}

export interface TarifTierInput {
    joursMin: number;
    joursMax: number | null;
    prix: Prisma.Decimal | number;
}

export interface PricingResult {
    /** Prix journalier de location (tarif progressif appliqué), hors supplément. */
    prixParJour: Prisma.Decimal;
    /** Nombre de jours facturés au supplément hors Dakar (0 si non applicable). */
    nbJoursHorsDakar: number;
    /** supplément/jour × nbJoursHorsDakar. */
    montantHorsDakar: Prisma.Decimal;
    totalBase: Prisma.Decimal;
    tauxCommission: Prisma.Decimal;
    montantCommission: Prisma.Decimal;
    totalLocataire: Prisma.Decimal;
    netProprietaire: Prisma.Decimal;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ReservationPricingService {
    /**
     * Normalise les dates ISO → Date UTC minuit, calcule le nombre de jours.
     * Comptage inclusif : début et fin sont facturés.
     * Lève BadRequestException si dateFin < dateDebut.
     */
    parseDatesAndDuration(dateDebutIso: string, dateFinIso: string): DateRange {
        const debut = new Date(dateDebutIso);
        const fin = new Date(dateFinIso);
        debut.setUTCHours(0, 0, 0, 0);
        fin.setUTCHours(0, 0, 0, 0);

        if (fin < debut) {
            throw new BadRequestException(
                'dateFin must be on or after dateDebut',
            );
        }

        const nbJours = Math.max(1, Math.round(
            (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24),
        ));

        return { debut, fin, nbJours };
    }

    /**
     * Résout le prix par jour en fonction du nombre de jours et des tarifs progressifs.
     * Parcourt les tiers triés par joursMin pour trouver le bracket correspondant.
     * Retourne le prixParJour de base si aucun tier ne correspond.
     */
    resolveTieredPrice(
        prixParJour: Prisma.Decimal,
        nbJours: number,
        tiers?: TarifTierInput[],
    ): Prisma.Decimal {
        if (!tiers || tiers.length === 0) return prixParJour;

        const sorted = [...tiers].sort((a, b) => a.joursMin - b.joursMin);
        for (const tier of sorted) {
            const inMin = nbJours >= tier.joursMin;
            const inMax = tier.joursMax === null || nbJours <= tier.joursMax;
            if (inMin && inMax) {
                return tier.prix instanceof Prisma.Decimal
                    ? tier.prix
                    : new Prisma.Decimal(tier.prix);
            }
        }

        return prixParJour;
    }

    /**
     * Calcule tous les montants de la réservation.
     * Utilise les tarifs progressifs si fournis, sinon le prix par jour de base.
     * Le supplément hors Dakar n'est facturé que sur les jours déclarés hors Dakar.
     * Commission fixe de 10% sur la location seule (le supplément hors Dakar en est exempté
     * et revient intégralement au propriétaire), arrondie aux 100 FCFA.
     */
    calculate(
        prixParJour: Prisma.Decimal,
        nbJours: number,
        tiers?: TarifTierInput[],
        supplementHorsDakar: number = 0,
        nbJoursHorsDakar?: number | null,
    ): PricingResult {
        const effectivePrice = this.resolveTieredPrice(prixParJour, nbJours, tiers);

        const joursHorsDakar = supplementHorsDakar > 0
            ? resolveNbJoursHorsDakar(nbJours, nbJoursHorsDakar)
            : 0;
        const montantHorsDakar = new Prisma.Decimal(supplementHorsDakar).mul(joursHorsDakar);

        const totalLocation = effectivePrice.mul(nbJours);
        const totalBase = totalLocation.add(montantHorsDakar);
        const tauxCommission = calculateCommissionRate(effectivePrice);
        const rawCommission = totalLocation.mul(tauxCommission).toNumber();

        const montantCommissionNum = roundToNearest100(rawCommission);
        const montantCommission = new Prisma.Decimal(montantCommissionNum);
        const totalLocataire = totalBase.add(montantCommission);
        const netProprietaire = totalBase;

        return {
            prixParJour: effectivePrice,
            nbJoursHorsDakar: joursHorsDakar,
            montantHorsDakar,
            totalBase,
            tauxCommission,
            montantCommission,
            totalLocataire,
            netProprietaire,
        };
    }

    /**
     * Calcule l'âge à partir de la date de naissance.
     */
    calculateAge(dateNaissance: Date): number {
        const today = new Date();
        let age = today.getFullYear() - dateNaissance.getFullYear();
        const m = today.getMonth() - dateNaissance.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dateNaissance.getDate())) {
            age--;
        }
        return age;
    }
}
