import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';
import { WalletController } from './wallet.controller';
import { AdminWalletController } from './admin-wallet.controller';
import { AdminPenaltiesController } from './admin-penalties.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [WalletController, AdminWalletController, AdminPenaltiesController],
  providers: [WalletService],
})
export class WalletModule { }
