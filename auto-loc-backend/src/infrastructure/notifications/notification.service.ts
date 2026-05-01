import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EMAIL_TEMPLATES, NotificationType } from './email-templates';
import { NotificationsService } from '../../modules/notifications/notifications.service';

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
  /** Téléphone direct (si userId pas disponible ou pour surcharger) */
  phone?: string;
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
    private readonly pushNotifications: NotificationsService,
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
    let toPhone = params.phone;

    if (params.userId) {
      // On cherche par userId (Supabase) OU par id (interne), puis on prend
      // le téléphone depuis Utilisateur ou Profile selon le flux d'onboarding.
      const user = await this.prisma.utilisateur.findFirst({
        where: {
          OR: [
            { userId: params.userId },
            { id: params.userId },
          ],
        },
        select: {
          email: true,
          telephone: true,
          profile: { select: { phone: true } },
        },
      });
      if (user) {
        toEmail = toEmail || user.email || undefined;
        toPhone = toPhone || user.telephone || user.profile?.phone || undefined;
      }
    }

    this.logger.debug(`Notification routing: type=${params.type} email=${toEmail} phone=${toPhone}`);

    // 2. Envoi EMAIL (Canal principal pour les détails)
    let emailResult: SendResult = { channel: 'email', success: false };
    if (toEmail) {
      emailResult = await this.sendEmail(toEmail, params.type, params.data);
    }

    // 3. Envoi WHATSAPP / SMS (Canal instantané)
    if (toPhone) {
      await this.sendInstantNotification(toPhone, params.type, params.data);
    }

    // 4. Push notification PWA (fire-and-forget)
    if (params.userId) {
      const pushPayload = this.getPushPayload(params.type, params.data);
      if (pushPayload) {
        this.pushNotifications.sendToUser(params.userId, pushPayload)
          .catch(err => this.logger.error(`Push notification failed for ${params.type}: ${err}`));
      }
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

  private getPushPayload(type: NotificationType, data: Record<string, unknown>): { title: string; body: string; url?: string } | null {
    const resId = String(data.reservationId || '').slice(0, 8).toUpperCase();
    const vehicule = String(data.vehicule || 'véhicule');
    const resUrl = data.reservationId ? `/dashboard/reservations/${data.reservationId}` : undefined;

    const payloads: Partial<Record<NotificationType, { title: string; body: string; url?: string }>> = {
      'reservation.paid': { title: 'Paiement validé', body: `Paiement pour ${vehicule} (#${resId}) reçu. En attente de confirmation.`, url: resUrl },
      'reservation.paid.owner': { title: 'Nouvelle réservation 💰', body: `${vehicule} — réservation payée (#${resId}). Confirmez-la !`, url: resUrl },
      'reservation.confirmed': { title: 'Réservation confirmée 🎉', body: `${vehicule} (#${resId}) est confirmé. C'est parti !`, url: resUrl },
      'reservation.cancelled': { title: 'Réservation annulée', body: `La réservation #${resId} pour ${vehicule} a été annulée.`, url: resUrl },
      'reservation.checkin.reminder_veille': { title: 'Rappel check-in demain 📅', body: `${vehicule} (#${resId}) — le check-in est demain.`, url: resUrl },
      'reservation.checkin.reminder_jour': { title: 'Check-in aujourd\'hui 🚗', body: `${vehicule} (#${resId}) — le check-in est aujourd\'hui.`, url: resUrl },
      'reservation.checkin': { title: 'Location démarrée 🚗', body: `La location de ${vehicule} (#${resId}) est en cours.`, url: resUrl },
      'reservation.checkout': { title: 'Location terminée 🏁', body: `La location de ${vehicule} (#${resId}) est terminée.`, url: resUrl },
      'reservation.checkout.reminder': { title: 'Fin de location imminente', body: `La location de ${vehicule} (#${resId}) se termine bientôt.`, url: resUrl },
      'kyc.verified': { title: 'Identité vérifiée ✅', body: 'Votre identité a été vérifiée. Vous pouvez louer !', url: '/dashboard/profile' },
      'kyc.rejected': { title: 'Vérification refusée ⚠️', body: 'Votre vérification d\'identité a été refusée. Réessayez.', url: '/dashboard/profile' },
      'wallet.credited': { title: 'Wallet crédité 💰', body: `Votre wallet a été crédité de ${data.montant} FCFA.`, url: '/dashboard/wallet' },
      'litige.ouvert': { title: 'Litige ouvert 🚨', body: `Un litige a été ouvert sur la réservation #${resId}.`, url: resUrl },
      'avis.request': { title: 'Laissez un avis ⭐', body: `Comment s'est passée la location de ${vehicule} ?`, url: resUrl },
      'user.welcome': { title: 'Bienvenue sur AutoLoc 👋', body: 'Votre profil est prêt. Commencez à louer !', url: '/dashboard' },
    };

    return payloads[type] ?? null;
  }

  /**
   * Définit quel template WhatsApp utiliser pour chaque type de notification
   */
  private getWhatsAppMapping(type: NotificationType, data: Record<string, unknown>) {
    // Types explicitement supprimés — email suffit, pas de WhatsApp
    const WHATSAPP_SUPPRESSED = new Set<NotificationType>(['reservation.paid']);
    if (WHATSAPP_SUPPRESSED.has(type)) return null;

    const resId = String(data.reservationId || '').slice(0, 8).toUpperCase();

    // Formatage des dates pour WhatsApp (avec heure)
    const formatDate = (date: any) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      if (hours === '00' && minutes === '00') {
        return `${day}/${month}/${year}`;
      }
      return `${day}/${month}/${year} à ${hours}h${minutes}`;
    };
    const dateDeb = formatDate(data.dateDebut) || 'Début';
    const dateFin = formatDate(data.dateFin) || 'Fin';

    // Détection du rôle (Propriétaire vs Locataire) pour les messages partagés
    const isOwner = data.isOwner === true || type.includes('.owner');

    const mappings: Partial<Record<NotificationType, any>> = {
      // --- AUTH ---
      'verification.code': {
        contentSid: 'HX4adc3c841559018e04cdd9a2e5ccfcf5', // verification_code_v2 (Copy Code)
        variables: { '1': String(data.code || data.otp) },
        fallbackText: `Votre code AutoLoc est : ${data.code || data.otp}`,
      },
      'auth.login_otp': {
        contentSid: 'HX4adc3c841559018e04cdd9a2e5ccfcf5', // verification_code_v2 (Copy Code)
        variables: { '1': String(data.code || data.otp) },
        fallbackText: `🔐 AutoLoc — Votre code de connexion est : ${data.code || data.otp}`,
      },

      'reservation.paid.owner': {
        contentSid: 'HX0541d129bdc928f330296030babe8eb0', // proprio_resa_payee_bouton
        variables: {
          '1': String(data.vehicule || 'véhicule'),
          '2': dateDeb, '3': dateFin,
          '4': String(data.netProprietaire || '0'),
          '5': data.reservationId as string
        },
        fallbackText: `💰 AutoLoc — Nouvelle réservation payée pour ${data.vehicule} ! Confirmez ici.`,
      },
      // reservation.paid — pas de WhatsApp au locataire (email suffit, pas prioritaire)
      // Le message "en attente de confirmation" génère de l'anxiété sans valeur ajoutée.
      'reservation.confirmed': {
        contentSid: 'HX0d287413da68b4f90bd00fbca59a941a', // locataire_resa_validee_bouton
        variables: {
          '1': String(data.vehicule || 'véhicule'),
          '2': dateDeb, '3': dateFin,
          '4': data.reservationId as string
        },
        fallbackText: `🎉 AutoLoc — Votre réservation pour ${data.vehicule} est CONFIRMÉE !`,
      },

      // --- RAPPELS ---
      'reservation.checkin.reminder_veille': {
        contentSid: isOwner ? 'HX9e798e37ec4561fbb3ca229ab2503c63' : 'HX96ca66cfcad4161c3a2906fb6c6cdc8f',
        variables: {
          '1': String(data.vehicule),
          '2': resId,
          '3': String(data.otherPartyPhone || ''),
          '4': String(data.dateDebut || ''),
          '5': String(data.dateFin || ''),
          '6': data.reservationId as string,
        },
        fallbackText: `📅 AutoLoc — Demain commence la location de ${data.vehicule || 'votre véhicule'} (#${resId}).\n⏰ Début : ${data.dateDebut || 'à confirmer'} → Fin : ${data.dateFin || 'à confirmer'}\n📞 Contact : ${data.otherPartyPhone || 'N/A'}`,
      },
      'reservation.checkin.reminder_jour': {
        contentSid: isOwner ? 'HX83b935cb406574f0fbbf866b1b6d4b86' : 'HX4ec154df382ce08b5322a09074ddbbfe',
        variables: {
          '1': String(data.vehicule || 'véhicule'),
          '2': resId,
          '3': String(data.otherPartyPhone || ''),
          '4': String(data.dateDebut || ''),
          '5': data.reservationId as string,
        },
        fallbackText: `🚗 AutoLoc — La location de ${data.vehicule || 'votre véhicule'} commence aujourd'hui (#${resId}).\n⏰ Heure : ${data.dateDebut || 'à confirmer'}\n📞 Contact : ${data.otherPartyPhone || 'N/A'}`,
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
        variables: { '1': String(data.prenom || 'Cher membre') },
        fallbackText: `✅ AutoLoc — Votre identité est vérifiée !`,
      },
      'kyc.rejected': {
        contentSid: 'HXfaf8c7435b4fd336a3c7f043ea771657', // kyc_rejected
        variables: { '1': String(data.prenom || 'Cher membre') },
        fallbackText: `⚠️ AutoLoc — Votre identité n'a pu être vérifiée.`,
      },
      'wallet.credited': {
        contentSid: 'HX98001603553f6e8526ce737ff1270f50', // wallet_credite_owner
        variables: { '1': resId, '2': String(data.montant), '3': data.reservationId },
        fallbackText: `💰 AutoLoc — Votre compte a été crédité de ${data.montant} FCFA.`,
      },
      'user.welcome': {
        contentSid: 'HXD98d7356c7a8a91551acf470eebe1611', // compte_verifie_succes
        variables: { '1': String(data.prenom || 'Cher membre') },
        fallbackText: `👋 Bienvenue sur AutoLoc ${data.prenom || ''} ! Votre profil est prêt.`,
      },
    };

    if (mappings[type]) {
      return mappings[type];
    }

    this.logger.warn(`No dedicated WhatsApp template for ${type}, using text fallback`);
    return this.getGenericWhatsAppMapping(type, data, resId, dateDeb, dateFin);
  }

  /**
   * Fallback WhatsApp texte pour les types qui n'ont pas encore de Content SID dédié.
   * Cela garantit qu'on n'a pas de "trou noir" si un template Twilio manque.
   */
  private getGenericWhatsAppMapping(
    type: NotificationType,
    data: Record<string, unknown>,
    resId: string,
    dateDeb: string,
    dateFin: string,
  ) {
    const vehicule = String(data.vehicule || data.vehicle || 'véhicule');
    const prenom = String(data.prenom || data.locatairePrenom || data.proprietairePrenom || '').trim();
    const prefix = prenom ? ` ${prenom}` : '';

    const fallbackTextByType: Record<NotificationType, string> = {
      'reservation.created': `⏳ AutoLoc${prefix} : votre réservation #${resId} est en attente de paiement pour ${vehicule}. Finalisez le paiement pour la confirmer.`,
      'reservation.confirmed': `🎉 AutoLoc${prefix} : votre réservation #${resId} pour ${vehicule} est confirmée. Début prévu ${dateDeb}${dateFin ? `, fin ${dateFin}` : ''}.`,
      'reservation.paid': `💰 AutoLoc${prefix} : votre paiement pour ${vehicule} est validé. Réservation #${resId} en attente de confirmation.`,
      'reservation.paid.owner': `💰 AutoLoc${prefix} : une réservation payée concerne ${vehicule}. Réservation #${resId}.`,
      'reservation.cancelled': `❌ AutoLoc${prefix} : la réservation #${resId} pour ${vehicule} a été annulée.`,
      'reservation.checkin': `🚗 AutoLoc${prefix} : le check-in de la réservation #${resId} est validé. La location est en cours.`,
      'reservation.checkin.owner_confirmed': `⏳ AutoLoc${prefix} : le propriétaire a confirmé le check-in pour la réservation #${resId}.`,
      'reservation.checkin.tenant_confirmed': `⏳ AutoLoc${prefix} : le locataire a confirmé le check-in pour la réservation #${resId}.`,
      'reservation.checkin.reminder_veille': `📅 AutoLoc${prefix} : rappel check-in demain pour ${vehicule}. Réservation #${resId}.`,
      'reservation.checkin.reminder_jour': `🚨 AutoLoc${prefix} : check-in à finaliser aujourd'hui pour ${vehicule}. Réservation #${resId}.`,
      'reservation.checkin.tacit_window': `⏱️ AutoLoc${prefix} : vous avez 24h pour valider le check-in de la réservation #${resId}.`,
      'reservation.checkin.tacit_applied': `🟢 AutoLoc${prefix} : la réservation #${resId} est démarrée par validation tacite.`,
      'reservation.checkout': `🏁 AutoLoc${prefix} : la réservation #${resId} est terminée. Pensez à laisser un avis.`,
      'reservation.checkout.reminder': `🏁 AutoLoc${prefix} : la location #${resId} se termine bientôt.`,
      'avis.request': `⭐ AutoLoc${prefix} : votre avis est demandé pour la réservation #${resId}.`,
      'avis.recu': `⭐ AutoLoc${prefix} : vous avez reçu un nouvel avis pour la réservation #${resId}.`,
      'verification.code': `🔐 AutoLoc${prefix} : votre code de vérification est ${String(data.code || '').trim()}.`,
      'kyc.verified': `✅ AutoLoc${prefix} : votre identité est vérifiée. Vous pouvez utiliser la plateforme.`,
      'kyc.rejected': `⚠️ AutoLoc${prefix} : votre vérification d'identité a été rejetée. Merci de corriger votre dossier.`,
      'litige.ouvert': `🚨 AutoLoc${prefix} : un litige a été ouvert pour la réservation #${resId}.`,
      'litige.resolu': `✅ AutoLoc${prefix} : le litige de la réservation #${resId} est résolu.`,
      'user.welcome': `👋 Bienvenue sur AutoLoc${prefix} ! Votre compte est prêt.`,
      'wallet.credited': `💰 AutoLoc${prefix} : votre wallet a été crédité pour la réservation #${resId}.`,
      'auth.login_otp': ''
    };

    const fallbackText = fallbackTextByType[type];
    if (!fallbackText) {
      return undefined;
    }

    return {
      body: fallbackText,
      fallbackText,
      smsText: fallbackText,
    };
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
      const normalizedVariables = message.contentVariables
        ? Object.fromEntries(
          Object.entries(message.contentVariables)
            .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
            .map(([key, value]) => [String(key), String(value)]),
        )
        : undefined;
      if (normalizedVariables && Object.keys(normalizedVariables).length > 0) {
        payload.contentVariables = JSON.stringify(normalizedVariables);
      }
    } else if (message.body) {
      payload.body = message.body;
    } else {
      throw new Error('Either body or contentSid must be provided for WhatsApp');
    }

    try {
      const response = await this.twilioClient.messages.create(payload);
      this.logger.log(`📨 [WhatsApp:accepted] sid=${response.sid} to=${to} type=${message.contentSid ? 'template' : 'text'} status=${response.status}`);
    } catch (error) {
      this.logger.error(
        `❌ [WhatsApp:error] to=${to} contentSid=${message.contentSid ?? 'none'} vars=${payload.contentVariables ?? 'none'}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
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
