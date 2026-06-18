import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { AdminVehiclesController } from './admin-vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ResourceOwnerGuard } from '../../shared/guards/resource-owner.guard';
import { OptionalJwtAuthGuard } from '../../shared/guards/optional-jwt-auth.guard';
import { ReservationDomainModule } from '../../domain/reservation/reservation.domain.module';
import { RevalidateModule } from '../../infrastructure/revalidate/revalidate.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [ReservationDomainModule, RevalidateModule, QueueModule],
  controllers: [VehiclesController, AdminVehiclesController],
  providers: [
    VehiclesService,
    JwtAuthGuard,
    ResourceOwnerGuard,
    OptionalJwtAuthGuard,
  ],
})
export class VehiclesModule { }
