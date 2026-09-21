import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { StatutReservation } from '@prisma/client';

@Injectable()
export class AnalyticsAggregationTask {
  private readonly logger = new Logger(AnalyticsAggregationTask.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Agrégation nocturne des snapshots propriétaires à 2h du matin (heure de Dakar)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'aggregate-owner-daily-snapshots',
    timeZone: 'Africa/Dakar',
  })
  async aggregateDailySnapshots() {
    this.logger.log('🔄 [CRON] Démarrage de l\'agrégation des snapshots propriétaires...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

      // Obtenir tous les propriétaires ayant des véhicules
      const owners = await this.prisma.utilisateur.findMany({
        where: { vehicules: { some: {} } },
        select: { id: true },
      });

      let processedCount = 0;

      for (const owner of owners) {
        const activeStatuses = [
          StatutReservation.PAYEE,
          StatutReservation.CONFIRMEE,
          StatutReservation.EN_COURS,
          StatutReservation.TERMINEE,
        ];

        // Réservations de la journée
        const reservations = await this.prisma.reservation.findMany({
          where: {
            proprietaireId: owner.id,
            statut: { in: activeStatuses },
            dateDebut: { lte: endOfDay },
            dateFin: { gte: startOfDay },
          },
          select: {
            totalBase: true,
            montantCommission: true,
            netProprietaire: true,
            fraisLivraison: true,
            supplementHorsDakar: true,
          },
        });

        let caBrut = 0;
        let comm = 0;
        let net = 0;

        for (const r of reservations) {
          caBrut += Number(r.totalBase || 0) + Number(r.fraisLivraison || 0) + Number(r.supplementHorsDakar || 0);
          comm += Number(r.montantCommission || 0);
          net += Number(r.netProprietaire || 0);
        }

        // Enregistrer / mettre à jour le snapshot
        await this.prisma.ownerDailySnapshot.upsert({
          where: {
            proprietaireId_date: {
              proprietaireId: owner.id,
              date: startOfDay,
            },
          },
          create: {
            proprietaireId: owner.id,
            date: startOfDay,
            caBrut,
            commissionAutoLoc: comm,
            netProprietaire: net,
            joursLoues: reservations.length,
          },
          update: {
            caBrut,
            commissionAutoLoc: comm,
            netProprietaire: net,
            joursLoues: reservations.length,
          },
        });

        processedCount++;
      }

      this.logger.log(`✅ [CRON] ${processedCount} snapshots propriétaires générés pour le ${dateStr}`);
    } catch (error) {
      this.logger.error(
        `❌ [CRON] Erreur lors de l'agrégation des snapshots: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
