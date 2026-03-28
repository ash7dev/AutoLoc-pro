import { Module } from '@nestjs/common';
import { ReservationAutoCloseJob } from '../../jobs/reservation-auto-close.job';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ReservationOwnerGuard } from '../../shared/guards/reservation-owner.guard';
import { ReservationDomainModule } from '../../domain/reservation/reservation.domain.module';
import { DisputesModule } from '../disputes/disputes.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { ContractModule } from '../../infrastructure/contract/contract.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [ReservationDomainModule, DisputesModule, CloudinaryModule, ContractModule, QueueModule],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    JwtAuthGuard,
    ReservationOwnerGuard,
    ReservationAutoCloseJob,
  ],
})
export class ReservationsModule { }
