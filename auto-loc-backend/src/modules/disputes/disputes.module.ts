import { Module } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { ReservationDomainModule } from '../../domain/reservation/reservation.domain.module';

@Module({
  imports: [ReservationDomainModule],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
