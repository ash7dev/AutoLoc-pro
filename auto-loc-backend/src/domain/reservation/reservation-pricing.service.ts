import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// ── Constants ──────────────────────────────────────────────────────────────────

const TAUX_COMMISSION = new Prisma.Decimal('0.1500');

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
    prixParJour: Prisma.Decimal;
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
     * Lève BadRequestException si dateFin <= dateDebut.
     */
    parseDatesAndDuration(dateDebutIso: string, dateFinIso: string): DateRange {
        const debut = new Date(dateDebutIso);
        const fin = new Date(dateFinIso);
        debut.setUTCHours(0, 0, 0, 0);
        fin.setUTCHours(0, 0, 0, 0);

        if (fin <= debut) {
            throw new BadRequestException(
                'dateFin must be strictly after dateDebut',
            );
        }

        const nbJours = Math.round(
            (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24),
        );

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
     * Commission 15% ajoutée côté locataire ; propriétaire reçoit 100% du prix base.
     */
    calculate(
        prixParJour: Prisma.Decimal,
        nbJours: number,
        tiers?: TarifTierInput[],
    ): PricingResult {
        const effectivePrice = this.resolveTieredPrice(prixParJour, nbJours, tiers);
        const totalBase = effectivePrice.mul(nbJours);
        const montantCommission = totalBase
            .mul(TAUX_COMMISSION)
            .toDecimalPlaces(2);
        const totalLocataire = totalBase.add(montantCommission);
        const netProprietaire = totalBase;

        return {
            prixParJour: effectivePrice,
            totalBase,
            tauxCommission: TAUX_COMMISSION,
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
