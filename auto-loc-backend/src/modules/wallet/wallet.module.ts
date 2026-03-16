import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';
import { WalletController } from './wallet.controller';
import { AdminWalletController } from './admin-wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [WalletController, AdminWalletController],
  providers: [WalletService],
})
export class WalletModule { }
