import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
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
   * GET /wallet/accounts
   * Retourne les derniers numéros de virement utilisés (Wave / Orange Money).
   */
  @Get('accounts')
  @HttpCode(200)
  getAccounts(@CurrentUser() user: RequestUser) {
    return this.walletService.getLastWithdrawalAccounts(user);
  }

  /**
   * GET /wallet/transactions
   * Liste paginée des transactions avec filtres optionnels (page, limit, type, sens).
   */
  @Get('transactions')
  @HttpCode(200)
  getTransactions(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('sens') sens?: string,
  ) {
    return this.walletService.getTransactions(user, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
      sens,
    });
  }

  /**
   * GET /wallet/penalites
   * Retourne les pénalités en attente du propriétaire.
   */
  @Get('penalites')
  @HttpCode(200)
  getPenalites(@CurrentUser() user: RequestUser) {
    return this.walletService.getPendingPenalties(user);
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
    await this.walletService.requestWithdrawal(user, dto.montant, dto.methode, dto.numeroDestinataire);
    return { ok: true };
  }
}
