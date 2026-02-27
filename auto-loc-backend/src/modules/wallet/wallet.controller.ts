import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RoleProfile } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/auth.types';
import { WalletService } from './wallet.service';
import { WithdrawalDto } from './dto/withdrawal.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.PROPRIETAIRE)
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  /**
   * GET /wallet/me
   * Retourne le wallet propriétaire + balance + transactions récentes.
   */
  @Get('me')
  @HttpCode(200)
  getMe(@CurrentUser() user: RequestUser) {
    return this.walletService.getWallet(user);
  }

  /**
   * POST /wallet/withdraw
   * Demande un retrait (débit immédiat du wallet).
   */
  @Post('withdraw')
  @HttpCode(200)
  async withdraw(
    @CurrentUser() user: RequestUser,
    @Body() dto: WithdrawalDto,
  ) {
    await this.walletService.requestWithdrawal(user, dto.montant);
    return { ok: true };
  }
}
