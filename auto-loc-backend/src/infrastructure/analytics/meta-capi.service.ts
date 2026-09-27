import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface MetaUserData {
  email?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
  contentName?: string;
  contentType?: string;
  orderId?: string;
  contents?: Array<{ id: string; quantity: number }>;
}

export interface SendMetaEventPayload {
  eventName: 'PageView' | 'ViewContent' | 'Search' | 'InitiateCheckout' | 'Purchase';
  eventId?: string;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
}

@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);
  private readonly pixelId: string;
  private readonly accessToken: string;
  private readonly apiVersion = 'v19.0';

  constructor(private readonly configService: ConfigService) {
    this.pixelId =
      this.configService.get<string>('META_PIXEL_ID') || '1108223318341633';
    this.accessToken =
      this.configService.get<string>('META_CAPI_ACCESS_TOKEN') || '';
  }

  /**
   * Generates a SHA-256 hash for user data field matching Meta requirement.
   */
  private hashField(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const normalized = value.trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Normalizes phone number format (removes +, spaces, leading zeros).
   */
  private normalizePhone(phone: string | undefined): string | undefined {
    if (!phone) return undefined;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned ? cleaned : undefined;
  }

  /**
   * Sends a Server-to-Server Conversions API event to Meta.
   */
  async sendEvent(payload: SendMetaEventPayload): Promise<boolean> {
    if (!this.pixelId) {
      this.logger.warn('Meta CAPI disabled: META_PIXEL_ID missing.');
      return false;
    }

    const { eventName, eventId, eventSourceUrl, userData, customData } = payload;

    const hashedEmail = this.hashField(userData?.email);
    const hashedPhone = this.hashField(this.normalizePhone(userData?.phone));

    const eventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl || 'https://autoloc.sn',
          action_source: 'website',
          user_data: {
            em: hashedEmail ? [hashedEmail] : undefined,
            ph: hashedPhone ? [hashedPhone] : undefined,
            client_ip_address: userData?.clientIpAddress,
            client_user_agent: userData?.clientUserAgent,
          },
          custom_data: customData
            ? {
                currency: customData.currency || 'XOF',
                value: customData.value,
                content_name: customData.contentName,
                content_type: customData.contentType || 'product',
                order_id: customData.orderId,
                contents: customData.contents,
              }
            : undefined,
        },
      ],
    };

    if (!this.accessToken) {
      this.logger.debug(
        `Meta CAPI event simulated [${eventName}] (set META_CAPI_ACCESS_TOKEN to send live to Facebook).`,
      );
      return true;
    }

    const endpoint = `https://graph.facebook.net/${this.apiVersion}/${this.pixelId}/events?access_token=${this.accessToken}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error(
          `Meta CAPI Error [${response.status}]: ${JSON.stringify(responseData)}`,
        );
        return false;
      }

      this.logger.log(
        `Meta CAPI Event [${eventName}] successfully sent to Meta (Event ID: ${eventId || 'N/A'}).`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to dispatch Meta CAPI event', error);
      return false;
    }
  }
}
