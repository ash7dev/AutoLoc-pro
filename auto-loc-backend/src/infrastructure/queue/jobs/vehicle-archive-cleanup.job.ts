import { Processor, Process } from '@nestjs/bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { StatutVehicule } from '@prisma/client';

const VEHICLE_QUEUE_NAME = 'vehicle-jobs';
const VEHICLE_ARCHIVE_CLEANUP_JOB = 'vehicle-archive-cleanup';

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

    // Find all vehicles archived more than 30 days ago
    const archivedVehicles = await this.prisma.vehicule.findMany({
      where: {
        statut: StatutVehicule.ARCHIVE,
        archiveLe: {
          lte: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
      },
    });

    if (archivedVehicles.length === 0) {
      return;
    }

    // Delete each vehicle and its photos
    for (const vehicle of archivedVehicles) {
      try {
        await this.deleteVehicleCompletely(vehicle.id);
      } catch (error) {
        console.error(`Failed to delete archived vehicle ${vehicle.id}:`, error);
      }
    }
  }

  private async deleteVehicleCompletely(vehicleId: string): Promise<void> {
    // Get all photo public IDs
    const photos = await this.prisma.photoVehicule.findMany({
      where: { vehiculeId: vehicleId },
      select: { publicId: true },
    });

    // Delete photos from Cloudinary
    const publicIds = photos.map((p) => p.publicId).filter(Boolean) as string[];
    if (publicIds.length > 0) {
      await Promise.all(
        publicIds.map((id) => this.cloudinary.deleteByPublicId(id).catch(() => { })),
      );
    }

    // Delete vehicle from database (cascade will delete photos, equipment, etc.)
    await this.prisma.vehicule.delete({
      where: { id: vehicleId },
    });
  }
}

export { VEHICLE_QUEUE_NAME, VEHICLE_ARCHIVE_CLEANUP_JOB };
