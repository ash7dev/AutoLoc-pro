import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { WalletService } from './wallet.service';

@Controller('admin/refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminRefundsController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * GET /admin/refunds
   * Liste tous les remboursements en attente suite aux annulations.
   */
  @Get()
  list() {
    return this.walletService.adminListRefunds();
  }

  /**
   * PATCH /admin/refunds/:id/process
   * Marque le remboursement comme effectué après virement InTouch manuel.
   * L'admin a fait le virement InTouch avant de cliquer.
   */
  @Patch(':id/process')
  @HttpCode(HttpStatus.OK)
  processRefund(@Param('id', ParseUUIDPipe) paiementId: string) {
    return this.walletService.adminProcessRefund(paiementId);
  }
}
