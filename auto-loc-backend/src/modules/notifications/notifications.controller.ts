import { Body, Controller, Delete, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/auth.types';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { RegisterExpoTokenDto } from './dto/register-expo.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /notifications/subscribe — Enregistre un nouvel abonnement web push (VAPID)
   */
  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @CurrentUser() user: RequestUser,
    @Body() dto: SubscribeDto,
  ) {
    return this.notificationsService.subscribe(user.sub, dto);
  }

  /**
   * POST /notifications/register-expo — Enregistre un token Expo Push (React Native)
   */
  @Post('register-expo')
  @UseGuards(JwtAuthGuard)
  async registerExpoToken(
    @CurrentUser() user: RequestUser,
    @Body() dto: RegisterExpoTokenDto,
  ) {
    return this.notificationsService.registerExpoToken(user.sub, dto);
  }

  /**
   * DELETE /notifications/unsubscribe — Supprime un abonnement
   */
  @Delete('unsubscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribe(@Query('endpoint') endpoint: string) {
    return this.notificationsService.unsubscribe(endpoint);
  }

  /**
   * POST /notifications/test — Envoie une notification de test à l'utilisateur actuel
   */
  @Post('test')
  @UseGuards(JwtAuthGuard)
  async test(@CurrentUser() user: RequestUser) {
    return this.notificationsService.sendToUser(user.sub, {
      title: 'AutoLoc Test',
      body: 'Ceci est une notification de test ! 🚗',
      url: '/dashboard',
    });
  }
}

