import { Module } from '@nestjs/common';
import { CreditWalletUseCase } from './use-cases/credit-wallet.use-case';

@Module({
    providers: [CreditWalletUseCase],
    exports: [CreditWalletUseCase],
})
export class WalletDomainModule { }
