import { Module, forwardRef } from '@nestjs/common';
import { PaymentWebhookController } from './payment-webhook.controller';
import { ReservationDomainModule } from '../../domain/reservation/reservation.domain.module';

@Module({
    imports: [
        forwardRef(() => ReservationDomainModule),
    ],
    controllers: [PaymentWebhookController],
})
export class PaymentsModule { }
