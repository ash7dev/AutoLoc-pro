import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const email = this.configService.get<string>('VAPID_EMAIL', 'contact@autoloc.sn');

    if (publicKey && privateKey) {
      webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
      this.logger.log('VAPID details set successfully');
    } else {
      this.logger.warn('VAPID keys are not configured. Push notifications will not work.');
    }
  }

  /**
   * Enregistre ou met à jour un abonnement push
   */
  async subscribe(userId: string, dto: SubscribeDto) {
    this.logger.log(`Nouveau push subscription pour l'utilisateur ${userId}`);

    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId,
        userAgent: dto.userAgent,
        deviceType: dto.deviceType,
      },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId,
        userAgent: dto.userAgent,
        deviceType: dto.deviceType,
      },
    });
  }

  /**
   * Supprime un abonnement (ex: au logout ou si invalide)
   */
  async unsubscribe(endpoint: string) {
    try {
      await this.prisma.pushSubscription.delete({
        where: { endpoint },
      });
    } catch (e) {
      // Ignorer si déjà supprimé
    }
  }

  /**
   * Envoie une notification à tous les appareils d'un utilisateur
   */
  async sendToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`Aucun abonnement trouvé pour l'utilisateur ${userId}`);
      return [];
    }

    const results = await Promise.all(
      subscriptions.map(async (sub: { endpoint: string; p256dh: any; auth: any; }) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(payload),
          );
          return { endpoint: sub.endpoint, success: true };
        } catch (error: any) {
          this.logger.error(`Erreur push pour l'endpoint ${sub.endpoint}: ${error.message}`);

          // Gérer les abonnements expirés (410 Gone ou 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            this.logger.warn(`Abonnement expiré, suppression de l'endpoint: ${sub.endpoint}`);
            await this.unsubscribe(sub.endpoint);
          }
          return { endpoint: sub.endpoint, success: false, error: error.message };
        }
      }),
    );

    return results;
  }
}
