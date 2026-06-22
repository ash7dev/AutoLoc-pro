import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * 🎨 Service de personnalisation du feed
 *
 * Analyse l'historique utilisateur pour adapter le feed :
 * - Villes fréquemment recherchées
 * - Types de véhicules préférés
 * - Budget moyen
 * - Équipements favoris
 */

interface UserPreferenceData {
  villesPreferes: string[];
  typesPreferes: string[];
  budgetMoyen: number | null;
  transmissionPreferee: string | null;
  carburantPrefere: string | null;
  equipementsPreferes: string[];
}

@Injectable()
export class FeedPersonalizationService {
  private readonly logger = new Logger(FeedPersonalizationService.name);

  private readonly HISTORY_WINDOW_DAYS = 90; // Analyse sur 3 mois
  private readonly MIN_SEARCHES_FOR_PREFERENCE = 3; // Minimum de recherches pour déduire une préférence

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère ou calcule les préférences d'un utilisateur
   */
  async getUserPreferences(userId: string): Promise<UserPreferenceData | null> {
    try {
      // Vérifier si des préférences existent déjà
      const existing = await this.prisma.userPreferences.findUnique({
        where: { userId },
      });

      // Si les préférences ont moins de 7 jours, les retourner directement
      if (existing) {
        const age = Date.now() - existing.derniereMiseAJour.getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (age < sevenDays) {
          return {
            villesPreferes: existing.villesPreferes,
            typesPreferes: existing.typesPreferes as string[],
            budgetMoyen: existing.budgetMoyen ? Number(existing.budgetMoyen) : null,
            transmissionPreferee: existing.transmissionPreferee ?? null,
            carburantPrefere: existing.carburantPrefere ?? null,
            equipementsPreferes: existing.equipementsPreferes,
          };
        }
      }

      // Recalculer les préférences depuis l'historique
      return await this.refreshUserPreferences(userId);
    } catch (error) {
      this.logger.warn(`⚠️  Impossible de charger les préférences pour ${userId}: ${error}`);
      return null;
    }
  }

  /**
   * Recalcule les préférences utilisateur depuis son historique de recherche
   */
  async refreshUserPreferences(userId: string): Promise<UserPreferenceData | null> {
    const windowStart = new Date(Date.now() - this.HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const searches = await this.prisma.searchHistory.findMany({
      where: {
        userId,
        creeLe: { gte: windowStart },
      },
      orderBy: { creeLe: 'desc' },
      take: 100, // Limiter aux 100 dernières recherches
    });

    if (searches.length < this.MIN_SEARCHES_FOR_PREFERENCE) {
      // Pas assez de données pour déduire des préférences
      return null;
    }

    // Analyse des villes les plus recherchées
    const villeCounts = new Map<string, number>();
    searches.forEach((s) => {
      if (s.ville) {
        villeCounts.set(s.ville, (villeCounts.get(s.ville) ?? 0) + 1);
      }
    });
    const villesPreferes = Array.from(villeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);

    // Analyse des types de véhicules
    const typeCounts = new Map<string, number>();
    searches.forEach((s) => {
      if (s.type) {
        typeCounts.set(s.type, (typeCounts.get(s.type) ?? 0) + 1);
      }
    });
    const typesPreferes = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);

    // Calcul du budget moyen (moyenne des prixMax fournis)
    const budgets = searches
      .map((s) => (s.prixMax ? Number(s.prixMax) : null))
      .filter((p) => p !== null && p > 0) as number[];
    const budgetMoyen = budgets.length > 0
      ? Math.round(budgets.reduce((sum, b) => sum + b, 0) / budgets.length)
      : null;

    // Transmission préférée (mode statistique)
    const transmissionCounts = new Map<string, number>();
    searches.forEach((s) => {
      if (s.transmission) {
        transmissionCounts.set(s.transmission, (transmissionCounts.get(s.transmission) ?? 0) + 1);
      }
    });
    const transmissionPreferee = this.getMode(transmissionCounts);

    // Carburant préféré
    const carburantCounts = new Map<string, number>();
    searches.forEach((s) => {
      if (s.carburant) {
        carburantCounts.set(s.carburant, (carburantCounts.get(s.carburant) ?? 0) + 1);
      }
    });
    const carburantPrefere = this.getMode(carburantCounts);

    // Équipements les plus recherchés
    const equipementCounts = new Map<string, number>();
    searches.forEach((s) => {
      s.equipements.forEach((eq) => {
        equipementCounts.set(eq, (equipementCounts.get(eq) ?? 0) + 1);
      });
    });
    const equipementsPreferes = Array.from(equipementCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0]);

    const preferences: UserPreferenceData = {
      villesPreferes,
      typesPreferes,
      budgetMoyen,
      transmissionPreferee,
      carburantPrefere,
      equipementsPreferes,
    };

    // Sauvegarder les préférences (cast explicite pour les enums)
    await this.prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        villesPreferes: preferences.villesPreferes,
        typesPreferes: preferences.typesPreferes as any, // Cast car string[] → TypeVehicule[]
        budgetMoyen: preferences.budgetMoyen,
        transmissionPreferee: preferences.transmissionPreferee as any,
        carburantPrefere: preferences.carburantPrefere as any,
        equipementsPreferes: preferences.equipementsPreferes,
      },
      update: {
        villesPreferes: preferences.villesPreferes,
        typesPreferes: preferences.typesPreferes as any,
        budgetMoyen: preferences.budgetMoyen,
        transmissionPreferee: preferences.transmissionPreferee as any,
        carburantPrefere: preferences.carburantPrefere as any,
        equipementsPreferes: preferences.equipementsPreferes,
        derniereMiseAJour: new Date(),
      },
    });

    return preferences;
  }

  /**
   * Génère des conditions SQL pour personnaliser le feed
   */
  buildPersonalizedConditions(preferences: UserPreferenceData | null): Prisma.Sql {
    if (!preferences) {
      return Prisma.empty;
    }

    const conditions: Prisma.Sql[] = [];

    // Boost pour les villes préférées
    if (preferences.villesPreferes.length > 0) {
      const villesBoost = Prisma.sql`
        CASE
          WHEN LOWER(v.ville) = ANY(ARRAY[${Prisma.join(preferences.villesPreferes.map((v) => v.toLowerCase()))}]::text[]) THEN 1.2
          ELSE 1.0
        END
      `;
      conditions.push(villesBoost);
    }

    // Boost pour les types préférés
    if (preferences.typesPreferes.length > 0) {
      const typesBoost = Prisma.sql`
        CASE
          WHEN v.type::text = ANY(ARRAY[${Prisma.join(preferences.typesPreferes)}]::text[]) THEN 1.15
          ELSE 1.0
        END
      `;
      conditions.push(typesBoost);
    }

    // Boost pour les véhicules dans la tranche budgétaire
    if (preferences.budgetMoyen) {
      const budgetMin = preferences.budgetMoyen * 0.8;
      const budgetMax = preferences.budgetMoyen * 1.2;
      const budgetBoost = Prisma.sql`
        CASE
          WHEN v."prixParJour" BETWEEN ${budgetMin} AND ${budgetMax} THEN 1.1
          ELSE 1.0
        END
      `;
      conditions.push(budgetBoost);
    }

    if (conditions.length === 0) {
      return Prisma.sql`1.0`;
    }

    // Combiner tous les boosts (multiplication)
    return Prisma.sql`(${Prisma.join(conditions, ' * ')})`;
  }

  /**
   * Génère un filtre SQL pour limiter aux préférences utilisateur (optionnel)
   */
  buildPersonalizedFilter(preferences: UserPreferenceData | null): Prisma.Sql {
    if (!preferences) {
      return Prisma.empty;
    }

    const filters: Prisma.Sql[] = [];

    // Filtrer par villes préférées (optionnel, peut être trop restrictif)
    if (preferences.villesPreferes.length > 0) {
      filters.push(
        Prisma.sql`LOWER(v.ville) = ANY(ARRAY[${Prisma.join(preferences.villesPreferes.map((v) => v.toLowerCase()))}]::text[])`,
      );
    }

    if (filters.length === 0) {
      return Prisma.empty;
    }

    return Prisma.sql`AND (${Prisma.join(filters, ' OR ')})`;
  }

  /**
   * Utilitaire : récupère la valeur la plus fréquente (mode statistique)
   */
  private getMode(counts: Map<string, number>): string | null {
    if (counts.size === 0) return null;

    let maxCount = 0;
    let mode: string | null = null;

    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });

    return mode;
  }

  /**
   * Analyse rapide pour déterminer si l'utilisateur a des préférences exploitables
   */
  async hasUserPreferences(userId: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - this.HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const searchCount = await this.prisma.searchHistory.count({
      where: {
        userId,
        creeLe: { gte: windowStart },
      },
    });

    return searchCount >= this.MIN_SEARCHES_FOR_PREFERENCE;
  }
}
