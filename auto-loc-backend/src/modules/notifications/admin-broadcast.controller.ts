import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';

export interface SendBroadcastDto {
  title: string;
  message: string;
  targetAudience: 'TOUS' | 'HOTES' | 'LOCATAIRES' | 'KYC_VALIDE';
  channels: Array<'PUSH_MOBILE' | 'WEB_PUSH' | 'EMAIL' | 'WHATSAPP'>;
  url?: string;
  imageUrl?: string;
}

@Controller('admin/broadcast')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminBroadcastController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /admin/broadcast/audience-stats — Statistiques d'audience et portée des canaux
   */
  @Get('audience-stats')
  getAudienceStats() {
    return this.notificationsService.adminGetAudienceStats();
  }

  /**
   * GET /admin/broadcast/history — Historique des diffusions et campagnes passées
   */
  @Get('history')
  getHistory() {
    return this.notificationsService.adminGetBroadcastHistory();
  }

  /**
   * POST /admin/broadcast/send — Envoie une notification multi-canale (Push Mobile, Web Push, Email)
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  sendBroadcast(@Body() dto: SendBroadcastDto) {
    return this.notificationsService.adminSendBroadcast(dto);
  }
}
