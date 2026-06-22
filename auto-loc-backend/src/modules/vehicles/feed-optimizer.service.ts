import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { Prisma } from '@prisma/client';

/**
 * 🚀 Service d'optimisation avancée du feed
 *
 * - Diversification géographique : évite la concentration sur une seule ville
 * - Cache warming : préchauffe le cache avant expiration
 * - Distribution intelligente : équilibre entre popularité et diversité
 */

interface VehicleRow {
  id: string;
  ville: string;
  scoreGlobal: number;
  [key: string]: any;
}

@Injectable()
export class FeedOptimizerService {
  private readonly logger = new Logger(FeedOptimizerService.name);

  // Quotas de diversification
  private readonly MAX_VEHICLES_PER_CITY_RATIO = 0.4; // Max 40% d'une même ville
  private readonly PREFERRED_CITY_DISTRIBUTION = 3; // Idéalement 3+ villes différentes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Applique une diversification géographique sur une liste de véhicules
   * Garantit qu'aucune ville ne domine le feed
   */
  diversifyByGeography<T extends VehicleRow>(
    vehicles: T[],
    sectionSize: number,
  ): T[] {
    if (vehicles.length <= sectionSize) {
      return vehicles;
    }

    const maxPerCity = Math.ceil(sectionSize * this.MAX_VEHICLES_PER_CITY_RATIO);
    const cityCounts = new Map<string, number>();
    const selected: T[] = [];

    // Tri par score décroissant pour privilégier les meilleurs
    const sorted = [...vehicles].sort((a, b) => b.scoreGlobal - a.scoreGlobal);

    for (const vehicle of sorted) {
      if (selected.length >= sectionSize) break;

      const cityCount = cityCounts.get(vehicle.ville) ?? 0;

      // Si la ville n'a pas atteint son quota, on ajoute le véhicule
      if (cityCount < maxPerCity) {
        selected.push(vehicle);
        cityCounts.set(vehicle.ville, cityCount + 1);
      }
    }

    // Si on n'a pas assez de véhicules (toutes les villes ont atteint leur quota),
    // on complète avec les meilleurs restants
    if (selected.length < sectionSize) {
      const remaining = sorted.filter((v) => !selected.includes(v));
      selected.push(...remaining.slice(0, sectionSize - selected.length));
    }

    return selected;
  }

  /**
   * Applique un algorithme d'interleaving pour mélanger les sources
   * Évite d'avoir tous les véhicules premium d'une même ville
   */
  interleaveByCity<T extends VehicleRow>(vehicles: T[]): T[] {
    if (vehicles.length <= 1) return vehicles;

    // Grouper par ville
    const byCity = new Map<string, T[]>();
    vehicles.forEach((v) => {
      const arr = byCity.get(v.ville) ?? [];
      arr.push(v);
      byCity.set(v.ville, arr);
    });

    // Interleaving : prendre 1 véhicule de chaque ville en rotation
    const result: T[] = [];
    const cities = Array.from(byCity.keys());
    let cityIndex = 0;

    while (result.length < vehicles.length) {
      const city = cities[cityIndex];
      const cityVehicles = byCity.get(city)!;

      if (cityVehicles.length > 0) {
        result.push(cityVehicles.shift()!);
      }

      // Passer à la ville suivante
      cityIndex = (cityIndex + 1) % cities.length;

      // Retirer les villes vides
      if (byCity.get(city)!.length === 0) {
        byCity.delete(city);
        const idx = cities.indexOf(city);
        if (idx !== -1) cities.splice(idx, 1);
        if (cities.length === 0) break;
        cityIndex = cityIndex % cities.length;
      }
    }

    return result;
  }

  /**
   * Préchauffe le cache du feed avant son expiration
   * Évite les "cache miss" aux heures de pointe
   */
  async warmFeedCache(buildFeedCallback: () => Promise<any>): Promise<void> {
    const FEED_CACHE_KEY = 'vehicles:feed:home';
    const FEED_CACHE_TTL = 120;
    const WARM_BEFORE_EXPIRY = 30; // Réchauffer 30s avant expiration

    try {
      // Vérifier le TTL actuel du cache
      const ttl = await this.redis.ttl(FEED_CACHE_KEY);

      // Si le cache expire dans moins de WARM_BEFORE_EXPIRY secondes, le régénérer
      if (ttl > 0 && ttl <= WARM_BEFORE_EXPIRY) {
        this.logger.log(`🔥 Warming feed cache (TTL: ${ttl}s)...`);

        const freshData = await buildFeedCallback();
        await this.redis.set(FEED_CACHE_KEY, JSON.stringify(freshData), FEED_CACHE_TTL);

        this.logger.log('✅ Feed cache warmed successfully');
      }
    } catch (error) {
      this.logger.error(
        `❌ Feed cache warming failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Génère un score de diversité pour un ensemble de véhicules
   * Plus le score est élevé, plus le feed est diversifié
   */
  calculateDiversityScore(vehicles: VehicleRow[]): number {
    if (vehicles.length === 0) return 0;

    const cities = new Set(vehicles.map((v) => v.ville));
    const cityCount = cities.size;

    // Ratio de diversité : nombre de villes uniques / total véhicules
    const diversityRatio = cityCount / vehicles.length;

    // Score de distribution : entropie de Shannon
    const cityCounts = new Map<string, number>();
    vehicles.forEach((v) => {
      cityCounts.set(v.ville, (cityCounts.get(v.ville) ?? 0) + 1);
    });

    let entropy = 0;
    cityCounts.forEach((count) => {
      const p = count / vehicles.length;
      entropy -= p * Math.log2(p);
    });

    // Normaliser l'entropie (max = log2(cityCount))
    const maxEntropy = cityCount > 1 ? Math.log2(cityCount) : 1;
    const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

    // Score composite
    return (diversityRatio + normalizedEntropy) / 2;
  }

  /**
   * Applique un boost de score basé sur les métriques
   * Intègre le score ML-like dans le tri SQL
   */
  buildScoreBoostSQL(): Prisma.Sql {
    return Prisma.sql`
      COALESCE(
        (
          SELECT m."scoreGlobal"
          FROM "vehicule_metrics" m
          WHERE m."vehiculeId" = v.id
        ),
        0
      )
    `;
  }

  /**
   * Génère la condition ORDER BY optimale avec boost de score
   */
  buildOptimizedOrderBy(
    baseOrderField: string = 'v.note',
    baseOrderDir: 'ASC' | 'DESC' = 'DESC',
  ): Prisma.Sql {
    const scoreBoost = this.buildScoreBoostSQL();

    // Formule : score_final = (base_metric * 0.5) + (ML_score * 0.5)
    // Puis tri par isFeatured DESC, puis score_final DESC
    return Prisma.sql`
      v."isFeatured" DESC,
      (
        (${Prisma.raw(baseOrderField)} * 0.5) +
        (${scoreBoost} * 0.5)
      ) ${Prisma.raw(baseOrderDir)}
    `;
  }

  /**
   * Détecte et log les anomalies du feed (debug)
   */
  async detectFeedAnomalies(feedData: {
    premium: VehicleRow[];
    nouveautes: VehicleRow[];
    recommended: { items: VehicleRow[] };
  }): Promise<void> {
    const allVehicles = [
      ...feedData.premium,
      ...feedData.nouveautes,
      ...feedData.recommended.items,
    ];

    // Anomalie 1 : Doublons
    const ids = allVehicles.map((v) => v.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      this.logger.warn(`⚠️  Feed anomaly: ${ids.length - uniqueIds.size} duplicate(s) detected`);
    }

    // Anomalie 2 : Concentration géographique excessive
    const cities = new Map<string, number>();
    allVehicles.forEach((v) => {
      cities.set(v.ville, (cities.get(v.ville) ?? 0) + 1);
    });

    cities.forEach((count, city) => {
      const ratio = count / allVehicles.length;
      if (ratio > 0.5) {
        this.logger.warn(
          `⚠️  Feed anomaly: ${city} represents ${(ratio * 100).toFixed(1)}% of feed (>50%)`,
        );
      }
    });

    // Anomalie 3 : Score de diversité faible
    const diversityScore = this.calculateDiversityScore(allVehicles);
    if (diversityScore < 0.3) {
      this.logger.warn(
        `⚠️  Feed anomaly: Low diversity score (${diversityScore.toFixed(2)})`,
      );
    }

    // Métriques positives
    this.logger.debug(
      `📊 Feed stats: ${uniqueIds.size} vehicles, ${cities.size} cities, diversity: ${diversityScore.toFixed(2)}`,
    );
  }
}
