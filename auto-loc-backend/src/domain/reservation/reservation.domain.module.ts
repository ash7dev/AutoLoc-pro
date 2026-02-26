import { Module, forwardRef } from '@nestjs/common';
import { ReservationPricingService } from './reservation-pricing.service';
import { ReservationAvailabilityService } from './reservation-availability.service';
import { ReservationIdempotencyService } from './reservation-idempotency.service';
import { ReservationStateMachine } from './reservation.state-machine';
import { CancellationPolicyService } from './cancellation-policy.service';
import { ContractGenerationService } from './contract-generation.service';
import { CreateReservationUseCase } from './use-cases/create-reservation.use-case';
import { ConfirmReservationUseCase } from './use-cases/confirm-reservation.use-case';
import { ConfirmPaymentUseCase } from './use-cases/confirm-payment.use-case';
import { CancelReservationUseCase } from './use-cases/cancel-reservation.use-case';
import { CheckInUseCase } from './use-cases/checkin.use-case';
import { CheckOutUseCase } from './use-cases/checkout.use-case';
import { ExpireReservationUseCase } from './use-cases/expire-reservation.use-case';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { ContractModule } from '../../infrastructure/contract/contract.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { RevalidateModule } from '../../infrastructure/revalidate/revalidate.module';

@Module({
    imports: [
        forwardRef(() => QueueModule),
        ContractModule,
        CloudinaryModule,
        RevalidateModule,
    ],
    providers: [
        // Domain services
        ReservationPricingService,
        ReservationAvailabilityService,
        ReservationIdempotencyService,
        ReservationStateMachine,
        CancellationPolicyService,
        ContractGenerationService,
        // Use cases
        CreateReservationUseCase,
        ConfirmReservationUseCase,
        ConfirmPaymentUseCase,
        CancelReservationUseCase,
        CheckInUseCase,
        CheckOutUseCase,
        ExpireReservationUseCase,
    ],
    exports: [
        ReservationPricingService,
        CreateReservationUseCase,
        ConfirmReservationUseCase,
        ConfirmPaymentUseCase,
        CancelReservationUseCase,
        CheckInUseCase,
        CheckOutUseCase,
        ExpireReservationUseCase,
        ReservationStateMachine,
        ContractGenerationService,
    ],
})
export class ReservationDomainModule { }
