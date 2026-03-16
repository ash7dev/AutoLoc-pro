import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { WalletService } from './wallet.service';

@Controller('admin/withdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminWalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * GET /admin/withdrawals
   * Liste toutes les demandes de retrait pour le tableau de bord admin.
   */
  @Get()
  list() {
    return this.walletService.adminListWithdrawals();
  }
}
