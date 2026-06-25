import { Controller, Get, Query, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard} from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { WalletService } from './wallet.service';

@Controller('admin/penalties')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminPenaltiesController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Liste toutes les pénalités
   * Paramètres query:
   * - statut: EN_ATTENTE | DEDUIT | ANNULE (optionnel)
   */
  @Get()
  async listPenalties(@Query('statut') statut?: string) {
    return this.walletService.adminGetAllPenalties(statut);
  }

  /**
   * Annuler manuellement une pénalité
   */
  @Patch(':id/cancel')
  async cancelPenalty(
    @Param('id') id: string,
    @Body('raison') raison: string,
  ) {
    return this.walletService.adminCancelPenalty(id, raison);
  }
}
