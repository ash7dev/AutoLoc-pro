import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { StatutVehicule } from '@prisma/client';
import {
  VEHICLE_QUEUE_NAME,
  VEHICLE_ARCHIVE_CLEANUP_JOB,
  VEHICLE_CLOUDINARY_DELETE_JOB,
} from '../queue.config';

@Processor(VEHICLE_QUEUE_NAME)
export class VehicleArchiveCleanupProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Process(VEHICLE_ARCHIVE_CLEANUP_JOB)
  async handleArchiveCleanup(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const archivedVehicles = await this.prisma.vehicule.findMany({
      where: {
        statut: StatutVehicule.ARCHIVE,
        archiveLe: { lte: thirtyDaysAgo },
      },
      select: { id: true },
    });

    if (archivedVehicles.length === 0) return;

    for (const vehicle of archivedVehicles) {
      try {
        await this.deleteVehicleCompletely(vehicle.id);
      } catch (error) {
        console.error(`Failed to delete archived vehicle ${vehicle.id}:`, error);
      }
    }
  }

  // Suppression différée des images Cloudinary après archivage (expiration cache CDN).
  // Ne supprime pas l'enregistrement DB — le cron vehicle-archive-cleanup s'en charge à J+30.
  @Process(VEHICLE_CLOUDINARY_DELETE_JOB)
  async handleCloudinaryDelete(job: Job<{ vehicleId: string }>): Promise<void> {
    await this.deleteCloudinaryAssets(job.data.vehicleId);
  }

  private async deleteCloudinaryAssets(vehicleId: string): Promise<void> {
    const [photos, vehicle] = await Promise.all([
      this.prisma.photoVehicule.findMany({
        where: { vehiculeId: vehicleId },
        select: { publicId: true },
      }),
      this.prisma.vehicule.findUnique({
        where: { id: vehicleId },
        select: { carteGrisePublicId: true, assuranceDocPublicId: true },
      }),
    ]);

    const publicIds = [
      ...photos.map((p) => p.publicId).filter(Boolean) as string[],
      vehicle?.carteGrisePublicId,
      vehicle?.assuranceDocPublicId,
    ].filter(Boolean) as string[];

    if (publicIds.length > 0) {
      await Promise.all(
        publicIds.map((id) => this.cloudinary.deleteByPublicId(id).catch(() => {})),
      );
    }
  }

  private async deleteVehicleCompletely(vehicleId: string): Promise<void> {
    await this.deleteCloudinaryAssets(vehicleId);
    await this.prisma.vehicule.delete({ where: { id: vehicleId } });
  }
}

export { VEHICLE_QUEUE_NAME, VEHICLE_ARCHIVE_CLEANUP_JOB };
