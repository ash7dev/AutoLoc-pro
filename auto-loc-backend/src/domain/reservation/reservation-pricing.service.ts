import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Calcule le taux de commission dégressif selon le barème officiel :
 * - ≤ 20 000 FCFA / jour        : 17,5% (0.1750)
 * - 20 001 à 35 000 FCFA / jour : 15,5% (0.1550)
 * - 35 001 à 60 000 FCFA / jour : 13,5% (0.1350)
 * - 60 001 à 100 000 FCFA / jour: 11,5% (0.1150)
 * - > 100 000 FCFA / jour       : 10,0% (0.1000)
 */
export function calculateCommissionRate(prixParJour: Prisma.Decimal | number): Prisma.Decimal {
    const val = typeof prixParJour === 'number' ? prixParJour : prixParJour.toNumber();
    if (val <= 20000) return new Prisma.Decimal('0.1750');
    if (val <= 35000) return new Prisma.Decimal('0.1550');
    if (val <= 60000) return new Prisma.Decimal('0.1350');
    if (val <= 100000) return new Prisma.Decimal('0.1150');
    return new Prisma.Decimal('0.1000');
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
     * Ajoute le supplément hors Dakar le cas échéant.
     * Commission dégressive selon le barème officiel.
     */
    calculate(
        prixParJour: Prisma.Decimal,
        nbJours: number,
        tiers?: TarifTierInput[],
        supplementHorsDakar: number = 0,
    ): PricingResult {
        const effectivePrice = this.resolveTieredPrice(prixParJour, nbJours, tiers);
        const finalPriceParJour = effectivePrice.add(new Prisma.Decimal(supplementHorsDakar));

        const totalBase = finalPriceParJour.mul(nbJours);
        const tauxCommission = calculateCommissionRate(finalPriceParJour);
        const montantCommission = totalBase
            .mul(tauxCommission)
            .toDecimalPlaces(2);
        const totalLocataire = totalBase.add(montantCommission);
        const netProprietaire = totalBase;

        return {
            prixParJour: finalPriceParJour,
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
