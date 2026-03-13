import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ReservationOwnerGuard } from '../../shared/guards/reservation-owner.guard';
import { ReservationDomainModule } from '../../domain/reservation/reservation.domain.module';
import { DisputesModule } from '../disputes/disputes.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { ContractModule } from '../../infrastructure/contract/contract.module';

@Module({
  imports: [ReservationDomainModule, DisputesModule, CloudinaryModule, ContractModule],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    JwtAuthGuard,
    ReservationOwnerGuard,
  ],
})
export class ReservationsModule { }
