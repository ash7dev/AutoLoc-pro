import { Module, Global } from '@nestjs/common';
import { WaveProvider } from './providers/wave.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';
import { IntouchProvider } from './providers/intouch.provider';
import { PaymentProviderFactory } from './payment-provider.factory';
import { PaymentService } from './payment.service';

@Global()
@Module({
    providers: [
        WaveProvider,
        OrangeMoneyProvider,
        IntouchProvider,
        PaymentProviderFactory,
        PaymentService,
    ],
    exports: [
        PaymentService,
        PaymentProviderFactory,
    ],
})
export class PaymentModule { }
