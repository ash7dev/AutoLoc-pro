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
   * Envoie une notification multicanale (Email, WhatsApp, SMS).
   */
  async send(params: SendNotificationParams): Promise<SendResult> {
    const template = EMAIL_TEMPLATES[params.type];

    if (!template) {
      this.logger.warn(`Unknown notification type: ${params.type}`);
      return { channel: 'log', success: false, error: 'Unknown type' };
    }

    // 1. Résolution des destinataires (Email et Téléphone)
    let toEmail = params.email;
    let toPhone: string | undefined;

    if (params.userId) {
      const user = await this.prisma.utilisateur.findUnique({
        where: { userId: params.userId },
        select: { email: true, telephone: true },
      });
      if (user) {
        toEmail = toEmail || user.email || undefined;
        toPhone = user.telephone || undefined;
      }
    }

    // 2. Envoi EMAIL (Canal principal pour les détails)
    let emailResult: SendResult = { channel: 'email', success: false };
    if (toEmail) {
      emailResult = await this.sendEmail(toEmail, params.type, params.data);
    }

    // 3. Envoi WHATSAPP / SMS (Canal instantané)
    if (toPhone) {
      await this.sendInstantNotification(toPhone, params.type, params.data);
    }

    return emailResult;
  }

  /**
   * Logique interne pour l'envoi d'email
   */
  private async sendEmail(to: string, type: NotificationType, data: Record<string, unknown>): Promise<SendResult> {
    const template = EMAIL_TEMPLATES[type];
    if (!this.resendApiKey) {
      this.logger.log(`📧 [EMAIL:stub] type=${type} to=${to}`);
      return { channel: 'log', success: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          reply_to: this.supportEmail,
          subject: template.subject,
          html: template.body(data),
        }),
      });

      if (!response.ok) throw new Error(`Resend error: ${response.status}`);
      const res = await response.json() as { id: string };
      return { channel: 'email', success: true, messageId: res.id };
    } catch (err) {
      this.logger.error(`❌ [EMAIL:error] ${type} to ${to}: ${err}`);
      return { channel: 'email', success: false, error: String(err) };
    }
  }

  /**
   * Gère l'envoi WhatsApp avec fallback SMS selon le type de notification
   */
  private async sendInstantNotification(phone: string, type: NotificationType, data: Record<string, unknown>) {
    const mapping = this.getWhatsAppMapping(type, data);
    if (!mapping) return;

    try {
      // Tentative WhatsApp
      await this.sendWhatsApp({
        to: phone,
        contentSid: mapping.contentSid,
        contentVariables: mapping.variables,
        body: mapping.fallbackText,
      });
    } catch (err) {
      // Fallback SMS si WhatsApp échoue
      this.logger.warn(`⚠️ WhatsApp failed for ${type}, falling back to SMS: ${err}`);
      await this.sendSms({
        to: phone,
        body: mapping.smsText || mapping.fallbackText,
      }).catch(e => this.logger.error(`❌ SMS fallback failed: ${e}`));
    }
  }

  /**
   * Définit quel template WhatsApp utiliser pour chaque type de notification
   */
  private getWhatsAppMapping(type: NotificationType, data: Record<string, unknown>) {
    const resId = String(data.reservationId || '').slice(0, 8).toUpperCase();

    // Formatage des dates pour WhatsApp
    const formatDate = (date: any) => date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
    const dateDeb = formatDate(data.dateDebut);
    const dateFin = formatDate(data.dateFin);

    // Détection du rôle (Propriétaire vs Locataire) pour les messages partagés
    const isOwner = data.isOwner === true || type.includes('.owner');

    const mappings: Partial<Record<NotificationType, any>> = {
      // --- AUTH ---
      'verification.code': {
        contentSid: 'HX4adc3c841559018e04cdd9a2e5ccfcf5', // verification_code_v2 (Copy Code)
        variables: { '1': String(data.code) },
        fallbackText: `Votre code AutoLoc est : ${data.code}`,
      },

      // --- RÉSERVATION ---
      'reservation.paid.owner': {
        contentSid: 'HX0541d129bdc928f330296030babe8eb0', // proprio_resa_payee_bouton
        variables: {
          '1': String(data.vehicule || 'véhicule'),
          '2': dateDeb, '3': dateFin,
          '4': String(data.netProprietaire || '0'),
          '5': data.reservationId
        },
        fallbackText: `💰 AutoLoc — Nouvelle réservation payée pour ${data.vehicule} ! Confirmez ici.`,
      },
      'reservation.confirmed': {
        contentSid: 'HX0f3dd2d8599bed754c1c7a23240383a3', // locataire_resa_validee_bouton
        variables: {
          '1': String(data.vehicule || 'véhicule'),
          '2': dateDeb, '3': dateFin,
          '4': data.reservationId
        },
        fallbackText: `🎉 AutoLoc — Votre réservation pour ${data.vehicule} est CONFIRMÉE !`,
      },

      // --- RAPPELS ---
      'reservation.checkin.reminder_veille': {
        contentSid: isOwner ? 'HXcbab671391d91e8189aa12b5826c376a' : 'HX4798cd370aa0e7b57351f1c82bc2ab36',
        variables: isOwner ? { '1': String(data.vehicule), '2': data.reservationId } : { '1': String(data.vehicule), '2': data.reservationId },
        fallbackText: `📅 AutoLoc — Demain commence la location #${resId} !`,
      },
      'reservation.checkin.reminder_jour': {
        contentSid: isOwner ? 'HX524bd6c9f5d7f86b87b62a7186a035cd' : 'HX775bb91c71a231c662fc90bfade9eea3',
        variables: { '1': String(data.vehicule), '2': data.reservationId },
        fallbackText: `🚨 AutoLoc — Urgent ! Le check-in n'est pas validé.`,
      },
      'reservation.checkout.reminder': {
        contentSid: isOwner ? 'HXfbbfd96be6664f4302a0e4b1f26d991d' : 'HX59be7100c1005d17ad94970cd86802f6',
        variables: { '1': data.reservationId },
        fallbackText: `🏁 AutoLoc — Fin de location imminente !`,
      },

      // --- POST-LOCATION ---
      'avis.request': {
        contentSid: 'HXc3c0380d917646821570d1f37f2128b3', // demande_avis_bouton
        variables: { '1': data.reservationId },
        fallbackText: `⭐ AutoLoc — Comment s'est passé votre trajet ? Laissez un avis !`,
      },

      'reservation.cancelled': {
        contentSid: isOwner ? 'HXbed44dd662edaa6268b7b5f612e37bcd' : (data.isRefusal ? 'HX83a61506118d14b83322837d951f517d' : 'HX50d492580774fe56c5cd5002b8168016'),
        variables: {
          '1': isOwner ? resId : (data.isRefusal ? String(data.vehicule) : resId),
          '2': isOwner ? String(data.vehicule) : (data.isRefusal ? dateDeb : String(data.vehicule)),
          '3': isOwner ? String(data.raison || 'Annulation') : (data.isRefusal ? dateFin : String(data.raison || 'Annulation')),
          '4': data.reservationId
        },
        fallbackText: `❌ AutoLoc — Réservation #${resId} annulée.`,
      },

      // --- AUTRES ---
      'litige.ouvert': {
        contentSid: isOwner ? 'HX4313142d799e90f5094ca0b6fa3e3477' : 'HXf4707c67600cf74d0b7dec5c1cce97d9',
        variables: isOwner ? { '1': resId, '2': String(data.vehicule), '3': data.reservationId } : { '1': resId, '2': String(data.vehicule), '3': data.reservationId },
        fallbackText: `🚨 AutoLoc — Un litige a été ouvert sur la réservation #${resId}.`,
      },
      'kyc.verified': {
        contentSid: 'HXD98d7356c7a8a91551acf470eebe1611', // compte_verifie_succes
        variables: {},
        fallbackText: `✅ AutoLoc — Votre identité est vérifiée !`,
      },
      'kyc.rejected': {
        contentSid: 'HXfaf8c7435b4fd336a3c7f043ea771657', // kyc_rejected
        variables: {},
        fallbackText: `⚠️ AutoLoc — Votre identité n'a pu être vérifiée.`,
      },
      'wallet.credited': {
        contentSid: 'HX98001603553f6e8526ce737ff1270f50', // wallet_credite_owner
        variables: { '1': resId, '2': String(data.montant), '3': data.reservationId },
        fallbackText: `💰 AutoLoc — Votre compte a été crédité de ${data.montant} FCFA.`,
      }
    };

    return mappings[type];
  }

  /**
   * Envoie un message WhatsApp via Twilio.
   * Supporte soit un message texte simple, soit un template officiel (Content SID).
   */
  async sendWhatsApp(message: { to: string; body?: string; contentSid?: string; contentVariables?: Record<string, string> }): Promise<void> {
    if (!this.twilioClient) {
      this.logger.log(`📨 [WhatsApp:stub] to=${message.to} body="${message.body || message.contentSid}"`);
      return;
    }

    // S'assurer que le format du numéro de destination est correct
    const to = message.to.startsWith('whatsapp:') ? message.to : `whatsapp:${message.to.startsWith('+') ? message.to : '+' + message.to}`;

    const payload: any = {
      from: this.twilioWhatsappFrom,
      to,
    };

    if (message.contentSid) {
      payload.contentSid = message.contentSid;
      if (message.contentVariables) {
        payload.contentVariables = JSON.stringify(message.contentVariables);
      }
    } else if (message.body) {
      payload.body = message.body;
    } else {
      throw new Error('Either body or contentSid must be provided for WhatsApp');
    }

    const response = await this.twilioClient.messages.create(payload);
    this.logger.log(`📨 [WhatsApp:accepted] sid=${response.sid} to=${to} type=${message.contentSid ? 'template' : 'text'} status=${response.status}`);
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
