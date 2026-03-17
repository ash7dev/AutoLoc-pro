import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
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

  /**
   * PATCH /admin/withdrawals/:id/approve
   * Valide & marque le retrait effectué (EN_ATTENTE → EFFECTUE).
   * L'admin a fait le virement Wave/OM avant de cliquer.
   */
  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.walletService.adminApproveWithdrawal(id);
  }

  /**
   * PATCH /admin/withdrawals/:id/reject
   * Rejette une demande de retrait et rembourse le wallet (EN_ATTENTE → REJETE).
   */
  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('raison') raison: string,
  ) {
    return this.walletService.adminRejectWithdrawal(id, raison ?? '');
  }
}
