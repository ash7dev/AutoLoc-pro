import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_TEMPLATES, NotificationType } from './email-templates';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SendNotificationParams {
  /** ID utilisateur destinataire (pour résoudre email/téléphone) */
  userId?: string;
  /** Email direct (si userId pas disponible) */
  email?: string;
  /** Type de notification */
  type: NotificationType;
  /** Données contextuelles pour le template */
  data: Record<string, unknown>;
}

export interface SendResult {
  channel: 'email' | 'log';
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resendApiKey: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY', '');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'noreply@autoloc.sn',
    );
  }

  /**
   * Envoie une notification par email.
   * Si RESEND_API_KEY n'est pas configuré, log le contenu (mode stub).
   */
  async send(params: SendNotificationParams): Promise<SendResult> {
    const startTime = Date.now();
    const template = EMAIL_TEMPLATES[params.type];

    if (!template) {
      this.logger.warn(`Unknown notification type: ${params.type}`);
      return { channel: 'log', success: false, error: 'Unknown type' };
    }

    const toEmail = params.email ?? `user-${params.userId ?? 'unknown'}@stub.local`;

    // Mode stub si pas de clé API Resend
    if (!this.resendApiKey) {
      const durationMs = Date.now() - startTime;
      this.logger.log(
        `📧 [EMAIL:stub] type=${params.type} to=${toEmail} ` +
        `subject="${template.subject}" duration=${durationMs}ms`,
      );
      return { channel: 'log', success: true };
    }

    // Envoi réel via Resend API
    try {
      const htmlBody = template.body(params.data);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [toEmail],
          subject: template.subject,
          html: htmlBody,
        }),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `EMAIL_ERROR type=${params.type} to=${toEmail} ` +
          `status=${response.status} error=${errorText} duration=${durationMs}ms`,
        );
        return {
          channel: 'email',
          success: false,
          error: `Resend API error: ${response.status}`,
        };
      }

      const result = (await response.json()) as { id?: string };

      this.logger.log(
        `📧 [EMAIL:sent] type=${params.type} to=${toEmail} ` +
        `messageId=${result.id} duration=${durationMs}ms`,
      );

      return {
        channel: 'email',
        success: true,
        messageId: result.id,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `EMAIL_EXCEPTION type=${params.type} to=${toEmail} ` +
        `error=${error} duration=${durationMs}ms`,
      );
      return { channel: 'email', success: false, error };
    }
  }

  /**
   * Backward-compatible wrapper — existing callers use sendWhatsApp.
   * Routes through logging for now; will be replaced by a real WhatsApp provider.
   */
  async sendWhatsApp(message: { to: string; body: string }): Promise<void> {
    this.logger.log(
      `📨 [WhatsApp:stub] to=${message.to} body="${message.body}"`,
    );
  }
  /**
   * Send an SMS notification (stub — ready for Twilio integration).
   * To integrate:
   *   npm install twilio
   *   const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
   *   await client.messages.create({ from: process.env.TWILIO_SMS_FROM, to, body });
   */
  async sendSms(message: { to: string; body: string }): Promise<void> {
    this.logger.log(
      `📱 [SMS:stub] to=${message.to} body="${message.body}"`,
    );
  }
}
