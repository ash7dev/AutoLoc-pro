import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

/**
 * 🗑️ Nettoyage automatique des photos d'état des lieux
 *
 * Supprime les photos Cloudinary des réservations terminées depuis plus de 10 jours
 * pour économiser l'espace de stockage et respecter la RGPD (conservation limitée)
 */

@Injectable()
export class CleanupPhotosTask {
  private readonly logger = new Logger(CleanupPhotosTask.name);
  private readonly RETENTION_DAYS = 10; // Garder les photos pendant 10 jours après la fin

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Nettoie les vieilles photos chaque jour à 4h du matin (heure Dakar)
   * Période de faible trafic pour minimiser l'impact
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'cleanup-old-reservation-photos',
    timeZone: 'Africa/Dakar',
  })
  async cleanupOldPhotos() {
    this.logger.log('🗑️ [CRON] Démarrage du nettoyage des photos d\'état des lieux...');

    try {
      // Date limite: dateFin + 10 jours
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - this.RETENTION_DAYS);

      // Trouver les réservations TERMINEE avec photos à supprimer
      const reservations = await this.prisma.reservation.findMany({
        where: {
          statut: 'TERMINEE',
          dateFin: {
            lt: retentionDate, // Date de fin > 10 jours
          },
          photosEtatLieu: {
            some: {}, // A au moins une photo
          },
        },
        select: {
          id: true,
          dateFin: true,
          photosEtatLieu: {
            select: {
              id: true,
              url: true,
              publicId: true,
            },
          },
        },
      });

      if (reservations.length === 0) {
        this.logger.log('✅ [CRON] Aucune photo à supprimer');
        return;
      }

      this.logger.log(
        `📋 [CRON] ${reservations.length} réservation(s) avec photos à nettoyer`,
      );

      let totalPhotosDeleted = 0;
      let totalPhotosFailed = 0;
      let reservationsUpdated = 0;

      // Traiter chaque réservation
      for (const reservation of reservations) {
        try {
          const photos = reservation.photosEtatLieu;

          if (!photos || photos.length === 0) continue;

          this.logger.debug(
            `🗑️  [CRON] Suppression de ${photos.length} photo(s) pour réservation ${reservation.id}`,
          );

          // Supprimer les photos de Cloudinary
          const urls = photos.map(p => p.url);
          const result = await this.cloudinary.deleteMultipleByUrl(urls);
          totalPhotosDeleted += result.deleted;
          totalPhotosFailed += result.failed;

          // Supprimer les enregistrements de photos dans la DB
          await this.prisma.photoEtatLieu.deleteMany({
            where: { reservationId: reservation.id },
          });

          reservationsUpdated++;
        } catch (error) {
          this.logger.error(
            `❌ [CRON] Erreur lors du nettoyage de la réservation ${reservation.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          // Continue avec la prochaine réservation
        }
      }

      this.logger.log(
        `✅ [CRON] Nettoyage terminé: ${totalPhotosDeleted} photo(s) supprimée(s), ` +
        `${totalPhotosFailed} échec(s), ${reservationsUpdated} réservation(s) mise(s) à jour`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [CRON] Erreur générale lors du nettoyage des photos: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
