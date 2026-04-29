import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
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
  private twilioClient: any; // Déclaration propre ici
  private readonly resendApiKey: string;
  private readonly fromEmail: string;
  private readonly supportEmail: string;
  private readonly adminEmail: string;

  private readonly twilioWhatsappFrom: string;
  private readonly twilioSmsFrom: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY', '');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'AutoLoc <noreply@autoloc.sn>',
    );
    this.supportEmail = this.configService.get<string>(
      'SUPPORT_EMAIL',
      'support@autoloc.sn',
    );
    this.adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'support@autoloc.sn', // Fallback to support if admin not created
    );

    // Initialisation Twilio
    const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioWhatsappFrom = this.configService.get<string>(
      'TWILIO_WHATSAPP_FROM',
      'whatsapp:+221711194969',
    );
    this.twilioSmsFrom = this.configService.get<string>(
      'TWILIO_SMS_FROM',
      'AutoLoc',
    );

    if (twilioSid && twilioToken) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const twilio = require('twilio');
        this.twilioClient = twilio(twilioSid, twilioToken);
        this.logger.log('Twilio client initialized');
      } catch (err) {
        this.logger.error(`Failed to initialize Twilio client: ${err}`);
      }
    } else {
      this.logger.warn('Twilio credentials missing. SMS/WhatsApp will run in stub mode.');
    }
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

    let toEmail = params.email;
    if (!toEmail && params.userId) {
      const user = await this.prisma.utilisateur.findUnique({
        where: { id: params.userId },
        select: { email: true },
      });
      toEmail = user?.email ?? undefined;
    }
    if (!toEmail) {
      this.logger.warn(`No email resolved for type=${params.type} userId=${params.userId ?? 'unknown'} — skipping`);
      return { channel: 'log', success: false, error: 'No recipient email' };
    }

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
          reply_to: this.supportEmail,
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
   * Envoie un message WhatsApp via Twilio.
   */
  async sendWhatsApp(message: { to: string; body: string }): Promise<void> {
    if (!this.twilioClient) {
      this.logger.log(`📨 [WhatsApp:stub] to=${message.to} body="${message.body}"`);
      return;
    }

    // S'assurer que le format du numéro de destination est correct
    const to = message.to.startsWith('whatsapp:') ? message.to : `whatsapp:${message.to.startsWith('+') ? message.to : '+' + message.to}`;

    const response = await this.twilioClient.messages.create({
      from: this.twilioWhatsappFrom,
      to,
      body: message.body,
    });
    this.logger.log(`📨 [WhatsApp:accepted] sid=${response.sid} to=${to} from=${this.twilioWhatsappFrom} status=${response.status}`);
  }

  /**
   * Envoie un SMS classique via Twilio.
   */
  async sendSms(message: { to: string; body: string }): Promise<void> {
    if (!this.twilioClient) {
      this.logger.log(`📱 [SMS:stub] to=${message.to} body="${message.body}"`);
      return;
    }

    // Enlever le préfixe whatsapp s'il y est, pour s'assurer que c'est un SMS
    const to = message.to.replace('whatsapp:', '');
    const cleanTo = to.startsWith('+') ? to : `+${to}`;

    const response = await this.twilioClient.messages.create({
      from: this.twilioSmsFrom,
      to: cleanTo,
      body: message.body,
    });
    this.logger.log(`📱 [SMS:accepted] sid=${response.sid} to=${cleanTo} from=${this.twilioSmsFrom} status=${response.status}`);
  }

  /**
   * Envoie une alerte interne à l'administrateur (via Resend ou log).
   */
  async sendInternalAlert(subject: string, body: string): Promise<void> {
    if (!this.resendApiKey) {
      this.logger.log(`🚨 [ALERT:stub] subject="${subject}" body="${body}"`);
      return;
    }

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [this.adminEmail],
          subject: `🚨 ALERT: ${subject}`,
          text: body,
        }),
      });
    } catch (err) {
      this.logger.error(`Failed to send internal alert: ${err}`);
    }
  }
}
