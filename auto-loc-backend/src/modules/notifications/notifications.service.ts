import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { RegisterExpoTokenDto } from './dto/register-expo.dto';
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
      this.logger.warn('VAPID keys are not configured. Web Push notifications will not work.');
    }
  }

  /**
   * Enregistre ou met à jour un abonnement push web (VAPID)
   */
  async subscribe(userId: string, dto: SubscribeDto) {
    this.logger.log(`Nouveau push subscription web pour l'utilisateur ${userId}`);

    const user = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
      select: { userId: true },
    });

    if (!user) {
      this.logger.warn(`Abonnement push ignoré : aucun compte Utilisateur trouvé pour ${userId}`);
      return null;
    }

    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId: user.userId,
        userAgent: dto.userAgent,
        deviceType: dto.deviceType,
      },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId: user.userId,
        userAgent: dto.userAgent,
        deviceType: dto.deviceType,
      },
    });
  }

  /**
   * Enregistre un token Expo Push (React Native Mobile)
   */
  async registerExpoToken(userId: string, dto: RegisterExpoTokenDto) {
    this.logger.log(`Enregistrement token Expo Push pour ${userId}: ${dto.expoPushToken}`);

    const user = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
      select: { userId: true },
    });

    if (!user) {
      this.logger.warn(`Token Expo ignoré : aucun Utilisateur trouvé pour ${userId}`);
      return null;
    }

    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.expoPushToken },
      update: {
        p256dh: 'expo',
        auth: 'expo',
        userId: user.userId,
        deviceType: dto.deviceType || 'mobile',
      },
      create: {
        endpoint: dto.expoPushToken,
        p256dh: 'expo',
        auth: 'expo',
        userId: user.userId,
        deviceType: dto.deviceType || 'mobile',
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
   * Envoie une notification à tous les appareils d'un utilisateur (Mobile Expo & Web Push)
   */
  async sendToUser(userId: string, payload: { title: string; body: string; url?: string; data?: Record<string, any> }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`Aucun abonnement trouvé pour l'utilisateur ${userId}`);
      return [];
    }

    const expoTokens: string[] = [];
    const webSubscriptions: any[] = [];

    for (const sub of subscriptions) {
      if (sub.endpoint.startsWith('ExponentPushToken') || sub.p256dh === 'expo') {
        expoTokens.push(sub.endpoint);
      } else if (sub.p256dh && sub.auth && sub.p256dh !== 'expo') {
        webSubscriptions.push(sub);
      }
    }

    const results: Array<{ endpoint: string; success: boolean; error?: string }> = [];

    // 1. Dispatch Expo Mobile Notifications
    if (expoTokens.length > 0) {
      const messages = expoTokens.map((token) => ({
        to: token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: { url: payload.url, ...(payload.data || {}) },
      }));

      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        const resData = (await response.json()) as { data?: Array<{ status: string; message?: string }> };
        this.logger.log(`Notification Expo envoyée à ${expoTokens.length} appareil(s)`, resData);

        expoTokens.forEach((token, index) => {
          const itemStatus = resData?.data?.[index];
          const isSuccess = itemStatus?.status === 'ok';
          results.push({
            endpoint: token,
            success: isSuccess,
            error: isSuccess ? undefined : itemStatus?.message || 'Expo push failed',
          });
        });
      } catch (err: any) {
        this.logger.error(`Erreur d'envoi Expo Push: ${err?.message}`);
        expoTokens.forEach((token) => {
          results.push({ endpoint: token, success: false, error: err?.message });
        });
      }
    }

    // 2. Dispatch Web Push Notifications
    if (webSubscriptions.length > 0) {
      const webResults = await Promise.all(
        webSubscriptions.map(async (sub) => {
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
            this.logger.error(`Erreur WebPush pour l'endpoint ${sub.endpoint}: ${error.message}`);
            if (error.statusCode === 410 || error.statusCode === 404) {
              await this.unsubscribe(sub.endpoint);
            }
            return { endpoint: sub.endpoint, success: false, error: error.message };
          }
        }),
      );
      results.push(...webResults);
    }

    return results;
  }
}

