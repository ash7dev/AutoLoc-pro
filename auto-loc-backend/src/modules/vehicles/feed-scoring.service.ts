import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * 🎯 Service de scoring avancé pour le feed
 *
 * Algorithme de pondération multi-critères pour classer les véhicules :
 * - Popularité (30%) : vues, clics, réservations
 * - Qualité (25%) : note moyenne, nombre d'avis
 * - Fraîcheur (15%) : nouveauté du véhicule
 * - Engagement (20%) : taux de conversion (clics/vues)
 * - Premium (10%) : véhicules mis en avant
 */

interface ScoreWeights {
  popularity: number;
  quality: number;
  recency: number;
  engagement: number;
  premium: number;
}

interface VehicleScoreData {
  id: string;
  totalLocations: number;
  note: Decimal;
  totalAvis: number;
  creeLe: Date;
  isFeatured: boolean;
  vues30j: number;
  clics30j: number;
}

@Injectable()
export class FeedScoringService {
  private readonly logger = new Logger(FeedScoringService.name);

  // Poids du scoring (total = 1.0)
  private readonly WEIGHTS: ScoreWeights = {
    popularity: 0.30,
    quality: 0.25,
    recency: 0.15,
    engagement: 0.20,
    premium: 0.10,
  };

  // Facteurs de normalisation
  private readonly MAX_LOCATIONS_FOR_SCORE = 100; // Au-delà, score plafonné
  private readonly MAX_NOTE = 5;
  private readonly MIN_AVIS_FOR_RELIABILITY = 3;
  private readonly RECENCY_WINDOW_DAYS = 90; // 3 mois considérés comme "récent"
  private readonly MIN_VIEWS_FOR_ENGAGEMENT = 10; // Minimum de vues pour calculer l'engagement

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcule le score composite d'un véhicule
   */
  calculateVehicleScore(data: VehicleScoreData): number {
    const popularityScore = this.calculatePopularityScore(data);
    const qualityScore = this.calculateQualityScore(data);
    const recencyScore = this.calculateRecencyScore(data);
    const engagementScore = this.calculateEngagementScore(data);
    const premiumScore = data.isFeatured ? 1.0 : 0.0;

    const globalScore =
      popularityScore * this.WEIGHTS.popularity +
      qualityScore * this.WEIGHTS.quality +
      recencyScore * this.WEIGHTS.recency +
      engagementScore * this.WEIGHTS.engagement +
      premiumScore * this.WEIGHTS.premium;

    return Math.round(globalScore * 10000) / 10000; // Arrondi à 4 décimales
  }

  /**
   * Score de popularité basé sur le nombre de réservations
   * Normalisation avec fonction logarithmique pour éviter la domination des super-stars
   */
  private calculatePopularityScore(data: VehicleScoreData): number {
    if (data.totalLocations === 0) return 0;

    // Utilisation d'une courbe logarithmique pour éviter les écarts trop importants
    const normalizedLocations = Math.min(data.totalLocations, this.MAX_LOCATIONS_FOR_SCORE);
    const score = Math.log10(normalizedLocations + 1) / Math.log10(this.MAX_LOCATIONS_FOR_SCORE + 1);

    return Math.min(score, 1.0);
  }

  /**
   * Score de qualité basé sur la note moyenne et le nombre d'avis
   * Applique un coefficient de confiance basé sur le nombre d'avis
   */
  private calculateQualityScore(data: VehicleScoreData): number {
    if (data.totalAvis === 0) return 0;

    const noteNormalized = Number(data.note) / this.MAX_NOTE;

    // Coefficient de confiance : plus il y a d'avis, plus on fait confiance à la note
    // Formule : min(1, totalAvis / MIN_AVIS_FOR_RELIABILITY)
    const reliabilityFactor = Math.min(1.0, data.totalAvis / this.MIN_AVIS_FOR_RELIABILITY);

    return noteNormalized * reliabilityFactor;
  }

  /**
   * Score de fraîcheur : décroissance exponentielle sur 90 jours
   * Les nouveaux véhicules obtiennent un boost pour être visibles
   */
  private calculateRecencyScore(data: VehicleScoreData): number {
    const now = Date.now();
    const createdAt = data.creeLe.getTime();
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

    if (ageInDays < 0) return 1.0; // Véhicule du futur ? Score max

    // Décroissance exponentielle : score = e^(-age / window)
    const decayFactor = this.RECENCY_WINDOW_DAYS;
    const score = Math.exp(-ageInDays / decayFactor);

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Score d'engagement : taux de clics / vues
   * Mesure l'attractivité du véhicule (photos, titre, prix)
   */
  private calculateEngagementScore(data: VehicleScoreData): number {
    if (data.vues30j < this.MIN_VIEWS_FOR_ENGAGEMENT) {
      // Pas assez de données, score neutre
      return 0.5;
    }

    if (data.clics30j === 0) return 0;

    const clickThroughRate = data.clics30j / data.vues30j;

    // CTR typique pour un site e-commerce : 2-5%
    // On normalise avec un CTR cible de 5% = score 1.0
    const normalizedCTR = clickThroughRate / 0.05;

    return Math.min(normalizedCTR, 1.0);
  }

  /**
   * Calcule et met à jour les métriques de tous les véhicules vérifiés
   * À appeler via un cron quotidien
   */
  async refreshAllVehicleMetrics(): Promise<number> {
    const startTime = Date.now();
    this.logger.log('🔄 Démarrage du refresh des métriques véhicules...');

    try {
      const vehicles = await this.prisma.vehicule.findMany({
        where: { statut: 'VERIFIE' },
        select: {
          id: true,
          totalLocations: true,
          note: true,
          totalAvis: true,
          creeLe: true,
          isFeatured: true,
        },
      });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      let updatedCount = 0;

      for (const vehicle of vehicles) {
        // Compter les vues et clics des 30 derniers jours
        const [vues30j, clics30j] = await Promise.all([
          this.prisma.vehiculeView.count({
            where: {
              vehiculeId: vehicle.id,
              creeLe: { gte: thirtyDaysAgo },
            },
          }),
          this.prisma.vehiculeClick.count({
            where: {
              vehiculeId: vehicle.id,
              creeLe: { gte: thirtyDaysAgo },
            },
          }),
        ]);

        const tauxEngagement = vues30j > 0 ? clics30j / vues30j : 0;

        const scoreData: VehicleScoreData = {
          id: vehicle.id,
          totalLocations: vehicle.totalLocations,
          note: vehicle.note,
          totalAvis: vehicle.totalAvis,
          creeLe: vehicle.creeLe,
          isFeatured: vehicle.isFeatured,
          vues30j,
          clics30j,
        };

        const scorePopularite = this.calculatePopularityScore(scoreData);
        const scoreQualite = this.calculateQualityScore(scoreData);
        const scoreFraicheur = this.calculateRecencyScore(scoreData);
        const scoreGlobal = this.calculateVehicleScore(scoreData);

        // Upsert des métriques
        await this.prisma.vehiculeMetrics.upsert({
          where: { vehiculeId: vehicle.id },
          create: {
            vehiculeId: vehicle.id,
            vues30j,
            clics30j,
            tauxEngagement,
            scorePopularite,
            scoreQualite,
            scoreFraicheur,
            scoreGlobal,
          },
          update: {
            vues30j,
            clics30j,
            tauxEngagement,
            scorePopularite,
            scoreQualite,
            scoreFraicheur,
            scoreGlobal,
            derniereMiseAJour: new Date(),
          },
        });

        updatedCount++;
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Métriques mises à jour pour ${updatedCount} véhicules en ${duration}ms`,
      );

      return updatedCount;
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors du refresh des métriques: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Enregistre une vue de véhicule
   */
  async trackView(params: {
    vehiculeId: string;
    userId?: string;
    sessionId?: string;
    source?: string;
    ville?: string;
  }): Promise<void> {
    try {
      await this.prisma.vehiculeView.create({
        data: {
          vehiculeId: params.vehiculeId,
          userId: params.userId ?? null,
          sessionId: params.sessionId ?? null,
          source: params.source ?? null,
          ville: params.ville ?? null,
        },
      });
    } catch (error) {
      // Ne pas bloquer la requête si le tracking échoue
      this.logger.warn(`⚠️  Échec du tracking de vue: ${error}`);
    }
  }

  /**
   * Enregistre un clic sur un véhicule
   */
  async trackClick(params: {
    vehiculeId: string;
    userId?: string;
    sessionId?: string;
    source?: string;
    actionType: string;
  }): Promise<void> {
    try {
      await this.prisma.vehiculeClick.create({
        data: {
          vehiculeId: params.vehiculeId,
          userId: params.userId ?? null,
          sessionId: params.sessionId ?? null,
          source: params.source ?? null,
          actionType: params.actionType,
        },
      });
    } catch (error) {
      this.logger.warn(`⚠️  Échec du tracking de clic: ${error}`);
    }
  }

  /**
   * Enregistre une recherche utilisateur
   */
  async trackSearch(params: {
    userId?: string;
    sessionId?: string;
    ville?: string;
    type?: string;
    prixMin?: number;
    prixMax?: number;
    dateDebut?: string;
    dateFin?: string;
    transmission?: string;
    carburant?: string;
    placesMin?: number;
    equipements?: string[];
    resultCount: number;
  }): Promise<void> {
    try {
      await this.prisma.searchHistory.create({
        data: {
          userId: params.userId ?? null,
          sessionId: params.sessionId ?? null,
          ville: params.ville ?? null,
          type: params.type as any,
          prixMin: params.prixMin ?? null,
          prixMax: params.prixMax ?? null,
          dateDebut: params.dateDebut ? new Date(params.dateDebut) : null,
          dateFin: params.dateFin ? new Date(params.dateFin) : null,
          transmission: params.transmission as any,
          carburant: params.carburant as any,
          placesMin: params.placesMin ?? null,
          equipements: params.equipements ?? [],
          resultCount: params.resultCount,
        },
      });
    } catch (error) {
      this.logger.warn(`⚠️  Échec du tracking de recherche: ${error}`);
    }
  }
}
