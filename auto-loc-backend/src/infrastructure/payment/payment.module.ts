import { Module, Global } from '@nestjs/common';
import { WaveProvider } from './providers/wave.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';
import { PaytechProvider } from './providers/paytech.provider';
import { PaymentProviderFactory } from './payment-provider.factory';
import { PaymentService } from './payment.service';

@Global()
@Module({
    providers: [
        WaveProvider,
        OrangeMoneyProvider,
        PaytechProvider,
        PaymentProviderFactory,
        PaymentService,
    ],
    exports: [
        PaymentService,
        PaymentProviderFactory,
    ],
})
export class PaymentModule { }
