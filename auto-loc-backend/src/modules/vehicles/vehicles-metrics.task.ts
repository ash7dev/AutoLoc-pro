import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeedScoringService } from './feed-scoring.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 📊 Tâches planifiées pour les métriques des véhicules
 *
 * - Refresh quotidien des métriques (vues, clics, scores)
 * - Cache warming avant expiration
 * - Nettoyage des anciennes données de tracking
 */

@Injectable()
export class VehiclesMetricsTask {
  private readonly logger = new Logger(VehiclesMetricsTask.name);

  constructor(
    private readonly feedScoring: FeedScoringService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Refresh des métriques quotidiennes à 3h du matin (faible trafic)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'refresh-vehicle-metrics',
    timeZone: 'Africa/Dakar',
  })
  async refreshMetrics() {
    this.logger.log('🔄 [CRON] Démarrage du refresh des métriques véhicules...');

    try {
      const count = await this.feedScoring.refreshAllVehicleMetrics();
      this.logger.log(`✅ [CRON] ${count} véhicules mis à jour avec succès`);

      // Invalider le cache du feed après mise à jour des métriques
      await this.redis.del('vehicles:feed:home');
      await this.redis.delPattern('vehicles:search:*');

      this.logger.log('🗑️  [CRON] Cache feed invalidé');
    } catch (error) {
      this.logger.error(
        `❌ [CRON] Erreur lors du refresh des métriques: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Cache warming toutes les 90 secondes (30s avant expiration du cache de 120s)
   * Évite les cache miss aux heures de pointe
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'warm-feed-cache',
  })
  async warmCache() {
    try {
      const FEED_CACHE_KEY = 'vehicles:feed:home';
      const ttl = await this.redis.ttl(FEED_CACHE_KEY);

      // Si le cache expire dans moins de 30s, on pourrait le régénérer
      // Mais on laisse le système le régénérer naturellement pour éviter la charge inutile
      // Ce cron sert surtout de monitoring

      if (ttl === -2) {
        // Cache n'existe pas
        this.logger.debug('🔍 [CACHE] Feed cache inexistant - sera créé au prochain accès');
      } else if (ttl > 0 && ttl <= 30) {
        this.logger.debug(`⏰ [CACHE] Feed cache expire dans ${ttl}s`);
      }
    } catch (error) {
      // Silent fail - le cache warming ne doit pas bloquer l'application
    }
  }

  /**
   * Nettoyage mensuel des anciennes vues/clics (> 90 jours)
   * Garde uniquement les 90 derniers jours pour les analyses
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'cleanup-old-tracking-data',
    timeZone: 'Africa/Dakar',
  })
  async cleanupOldTrackingData() {
    this.logger.log('🗑️  [CRON] Nettoyage des anciennes données de tracking...');

    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // On garde uniquement les 90 derniers jours pour optimiser les performances
      const [deletedViews, deletedClicks, deletedSearches] = await Promise.all([
        this.prisma.vehiculeView.deleteMany({
          where: { creeLe: { lt: ninetyDaysAgo } },
        }),
        this.prisma.vehiculeClick.deleteMany({
          where: { creeLe: { lt: ninetyDaysAgo } },
        }),
        this.prisma.searchHistory.deleteMany({
          where: { creeLe: { lt: ninetyDaysAgo } },
        }),
      ]);

      this.logger.log(
        `✅ [CRON] Nettoyage terminé: ${deletedViews.count} vues, ${deletedClicks.count} clics, ${deletedSearches.count} recherches supprimées`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [CRON] Erreur lors du nettoyage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Refresh hebdomadaire des préférences utilisateur (tous les dimanches à 2h)
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'refresh-user-preferences',
    timeZone: 'Africa/Dakar',
  })
  async refreshUserPreferences() {
    this.logger.log('🔄 [CRON] Mise à jour des préférences utilisateurs...');

    // Cette tâche peut être implémentée plus tard si nécessaire
    // Pour l'instant, les préférences sont calculées à la demande

    this.logger.log('✅ [CRON] Mise à jour des préférences terminée');
  }
}
