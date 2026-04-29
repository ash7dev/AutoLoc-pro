import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { assertValidImageBuffer } from '../../infrastructure/cloudinary/utils/file-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { ProfileResponse } from '../../common/types/auth.types';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { RoleProfile, StatutKyc } from '@prisma/client';
import { JwksService } from '../../infrastructure/jwt/jwks.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ALLOWED_MIMES } from '../upload/upload.config';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
const DEFAULT_ROLE = 'LOCATAIRE';
const ACCESS_TOKEN_TTL_DEFAULT = '15m';
const REFRESH_TOKEN_TTL_DEFAULT = '30d';
const OTP_TTL_SECONDS = 5 * 60;
const OTP_KEY_PREFIX = 'auth:phone-otp:';
const OTP_COOLDOWN_SECONDS = 60;
const OTP_COOLDOWN_PREFIX = 'auth:phone-otp:cooldown:';
const REFRESH_SESSION_PREFIX = 'auth:refresh-session:';
const PHONE_LOGIN_OTP_PREFIX = 'auth:phone-login-otp:';
const PHONE_LOGIN_COOLDOWN_PREFIX = 'auth:phone-login-otp:cooldown:';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwksService: JwksService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly cloudinary: CloudinaryService,
    private readonly notification: NotificationService,
    private readonly telegram: TelegramService,
  ) { }

  async checkAvailability(email?: string, phone?: string): Promise<{
    available: boolean;
    message?: string;
    exists?: boolean;
    hasUtilisateur?: boolean;
  }> {
    if (!email && !phone) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    if (email) {
      const normalizedEmail = this.normalizeEmail(email);
      const [existingUtilisateurEmail, existingProfileEmail] = await Promise.all([
        this.prisma.utilisateur.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        }),
        this.prisma.profile.findFirst({
          where: { email: normalizedEmail },
          select: { id: true },
        }),
      ]);

      if (existingUtilisateurEmail || existingProfileEmail) {
        return {
          available: false,
          message: 'Cet email est déjà associé à un compte',
          exists: true,
          hasUtilisateur: !!existingUtilisateurEmail,
        };
      }
    }

    if (phone) {
      const normalizedPhone = this.normalizePhone(phone);
      const [existingUtilisateurPhone, existingProfilePhone] = await Promise.all([
        this.prisma.utilisateur.findUnique({
          where: { telephone: normalizedPhone },
          select: { id: true },
        }),
        this.prisma.profile.findFirst({
          where: { phone: normalizedPhone },
          select: { id: true },
        }),
      ]);

      if (existingUtilisateurPhone || existingProfilePhone) {
        return {
          available: false,
          message: 'Ce numéro de téléphone est déjà associé à un compte',
          exists: true,
          hasUtilisateur: !!existingUtilisateurPhone,
        };
      }
    }

    return { available: true };
  }


  /**
   * Récupère le profil par user_id (sub JWT), ou le crée en transaction.
   * Idempotent : pas de crash si l'utilisateur se reconnecte.
   */
  async getOrCreateProfile(user: RequestUser): Promise<ProfileResponse> {
    const existing = await this.prisma.profile.findUnique({
      where: { userId: user.sub },
    });

    if (existing) {
      const normalizedEmail = user.email ? this.normalizeEmail(user.email) : null;
      if (normalizedEmail && existing.email !== normalizedEmail) {
        await this.prisma.profile.update({
          where: { userId: user.sub },
          data: { email: normalizedEmail },
        });
        existing.email = normalizedEmail;
      }
      const flags = await this.getUtilisateurFlags(user.sub);
      this.assertAccountIsAllowed(flags);
      return this.toResponse(existing, flags);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const again = await tx.profile.findUnique({
        where: { userId: user.sub },
      });
      if (again) return again;
      return tx.profile.create({
        data: {
          userId: user.sub,
          email: user.email ? this.normalizeEmail(user.email) : null,
          phone: user.phone ? this.normalizePhone(user.phone) : null,
          role: DEFAULT_ROLE,
        },
      });
    });

    const flags = await this.getUtilisateurFlags(user.sub);
    this.assertAccountIsAllowed(flags);
    return this.toResponse(created, flags);
  }


  /**
   * Crée le profil métier (Utilisateur) si absent.
   * Utilise l'identité Supabase (userId) comme lien.
   */
  async completeProfile(
    user: RequestUser,
    dto: CompleteProfileDto,
  ): Promise<ProfileResponse> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }

    // S'assure que le Profile existe avant de créer Utilisateur (FK obligatoire).
    await this.getOrCreateProfile(user);

    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
    });
    if (existing) {
      const profile = await this.getOrCreateProfile(user);
      return profile;
    }

    const normalizedPhone = this.normalizePhone(dto.telephone);
    const normalizedEmail = this.normalizeEmail(user.email ?? `${user.sub}@autoloc.local`);

    const [phoneTaken, emailTaken] = await Promise.all([
      this.prisma.utilisateur.findFirst({
        where: { telephone: normalizedPhone },
        select: { id: true },
      }),
      this.prisma.utilisateur.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      }),
    ]);
    if (phoneTaken) {
      throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
    }
    if (emailTaken) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const createdUtilisateur = await this.prisma.utilisateur.create({
      data: {
        userId: user.sub,
        prenom: dto.prenom,
        nom: dto.nom,
        telephone: normalizedPhone,
        email: normalizedEmail,
        profileCompleted: true,
        phoneVerified: false,
        avatarUrl: dto.avatarUrl ?? null,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : null,
      },
    });

    await this.prisma.profile.update({
      where: { userId: user.sub },
      data: { phone: normalizedPhone },
    });

    this.notification.send({
      email: normalizedEmail,
      type: 'user.welcome',
      data: { prenom: dto.prenom },
    }).catch(() => { });

    const profile = await this.getOrCreateProfile(user);
    return {
      ...profile,
      hasUtilisateur: true,
      utilisateurId: createdUtilisateur.id,
    };
  }

  /**
   * Switch du rôle actif (Profile.role).
   * Pas de prérequis sur le nombre de véhicules : on peut devenir PROPRIETAIRE
   * avec 0 véhicule. Les vraies contraintes (KYC, phone) s'appliquent plus tard,
   * au moment de publier ou recevoir un paiement.
   */
  async switchRole(user: RequestUser, dto: SwitchRoleDto): Promise<{ role: RoleProfile }> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }

    const current = await this.prisma.profile.findUnique({
      where: { userId: user.sub },
      select: { role: true },
    });

    if (current?.role === RoleProfile.ADMIN || current?.role === RoleProfile.SUPPORT) {
      throw new ForbiddenException('Les comptes admin/support ne peuvent pas changer de rôle');
    }

    await this.prisma.profile.update({
      where: { userId: user.sub },
      data: { role: dto.role as RoleProfile },
    });

    return { role: dto.role as RoleProfile };
  }

  async requestPhoneOtp(user: RequestUser): Promise<{ expiresIn: number }> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }

    // Récupérer le téléphone de l'utilisateur
    let telephone: string | null = null;
    
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { telephone: true },
    });

    if (utilisateur?.telephone) {
      telephone = utilisateur.telephone;
    } else {
      // Fallback sur le Profile (cas des nouveaux comptes)
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.sub },
        select: { phone: true },
      });
      telephone = profile?.phone || null;
    }

    if (!telephone) {
      throw new BadRequestException('Aucun numéro de téléphone n’est enregistré sur ce compte.');
    }

    const cooldownKey = this.getOtpCooldownKey(user.sub);
    const granted = await this.redisService.setNX(cooldownKey, '1', OTP_COOLDOWN_SECONDS);
    if (!granted) {
      throw new BadRequestException('Un code a déjà été envoyé. Attendez 60 secondes avant de réessayer.');
    }

    const code = this.generateOtp();
    const key = this.getOtpKey(user.sub);
    await this.redisService.set(key, code, OTP_TTL_SECONDS);

    // Envoi OTP sur les deux canaux. Un accusé Twilio "accepted" n'est pas une livraison réelle.
    const otpMessage = `🔐 AutoLoc — Votre code de vérification est : ${code}\n\nCe code expire dans 5 minutes. Ne le partagez avec personne.`;
    let whatsappAccepted = false;
    let smsAccepted = false;

    try {
      await this.notification.sendWhatsApp({
        to: telephone,
        contentSid: 'HX7cc5a00ae1cb9c74e75f856743ac927b',
        contentVariables: { '1': code },
        body: otpMessage,
      });
      whatsappAccepted = true;
    } catch (error) {
      console.error('[Auth] WhatsApp OTP request failed', { userId: user.sub, error });
    }

    try {
      await this.notification.sendSms({
        to: telephone,
        body: `AutoLoc - Votre code de vérification : ${code} (expire dans 5 min)`,
      });
      smsAccepted = true;
    } catch (error) {
      console.error('[Auth] SMS OTP request failed', { userId: user.sub, error });
    }

    if (!whatsappAccepted && !smsAccepted) {
      await this.redisService.del(key);
      await this.redisService.del(cooldownKey);
      console.error('[Auth] OTP delivery failed for both WhatsApp and SMS', { userId: user.sub });
      throw new InternalServerErrorException('Impossible d’envoyer le code de vérification pour le moment. Réessayez plus tard.');
    }

    return { expiresIn: OTP_TTL_SECONDS };
  }

  /* ──────────────────────────────────────────────────────────────────────────
     PHONE LOGIN (unauthenticated) — envoie un OTP au numéro, vérifie le code
     et émet un JWT métier si le compte existe.
  ────────────────────────────────────────────────────────────────────────── */

  async requestPhoneLoginOtp(rawPhone: string): Promise<{ expiresIn: number }> {
    const phone = this.normalizePhone(rawPhone);

    // 1. Vérifier que le numéro existe dans notre base
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { telephone: phone },
      select: { userId: true, prenom: true, actif: true, bloqueJusqua: true },
    });

    if (!utilisateur) {
      throw new BadRequestException('Aucun compte n’est associé à ce numéro.');
    }

    // 2. Vérifier que le compte n'est pas bloqué/désactivé
    this.assertAccountIsAllowed({
      actif: utilisateur.actif,
      bloqueJusqua: utilisateur.bloqueJusqua ? utilisateur.bloqueJusqua.toISOString() : null,
    });

    // 3. Cooldown
    const cooldownKey = `${PHONE_LOGIN_COOLDOWN_PREFIX}${phone}`;
    const granted = await this.redisService.setNX(cooldownKey, '1', OTP_COOLDOWN_SECONDS);
    if (!granted) {
      throw new BadRequestException('Un code a déjà été envoyé. Attendez 60 secondes avant de réessayer.');
    }

    // 4. Générer et stocker le code
    const code = this.generateOtp();
    const key = `${PHONE_LOGIN_OTP_PREFIX}${phone}`;
    await this.redisService.set(key, code, OTP_TTL_SECONDS);

    // 5. Envoi OTP sur les deux canaux. Un accusé Twilio "accepted" n'est pas une livraison réelle.
    const otpMessage = `🔐 AutoLoc — Votre code de connexion est : ${code}\n\nCe code expire dans 5 minutes. Ne le partagez avec personne.`;
    let whatsappAccepted = false;
    let smsAccepted = false;

    try {
      await this.notification.sendWhatsApp({ 
        to: phone, 
        contentSid: 'HX7cc5a00ae1cb9c74e75f856743ac927b',
        contentVariables: { '1': code },
        body: otpMessage, 
      });
      whatsappAccepted = true;
      console.log(`[Auth] Phone login OTP accepted via WhatsApp (template) for ${phone}`);
    } catch (error) {
      console.error('[Auth] Phone login WhatsApp request failed', { phone, error });
    }

    try {
      await this.notification.sendSms({
        to: phone,
        body: `AutoLoc - Votre code de connexion : ${code} (expire dans 5 min)`,
      });
      smsAccepted = true;
      console.log(`[Auth] Phone login OTP accepted via SMS for ${phone}`);
    } catch (error) {
      console.error('[Auth] Phone login SMS request failed', { phone, error });
    }

    if (!whatsappAccepted && !smsAccepted) {
      await this.redisService.del(key);
      await this.redisService.del(cooldownKey);
      console.error(`[Auth] Phone login OTP delivery failed for ${phone}`);
      throw new InternalServerErrorException('Impossible d’envoyer le code de connexion pour le moment. Réessayez plus tard.');
    }

    return { expiresIn: OTP_TTL_SECONDS };
  }

  async verifyPhoneLoginOtp(
    rawPhone: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile; profile: ProfileResponse }> {
    const phone = this.normalizePhone(rawPhone);

    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('Le code doit contenir 6 chiffres.');
    }

    // 1. Vérifier le code OTP
    const key = `${PHONE_LOGIN_OTP_PREFIX}${phone}`;
    const stored = await this.redisService.get(key);

    if (!stored) {
      throw new BadRequestException('Ce code a expiré. Demandez-en un nouveau.');
    }

    const storedBuf = Buffer.from(stored);
    const incomingBuf = Buffer.from(code);
    if (storedBuf.length !== incomingBuf.length || !timingSafeEqual(storedBuf, incomingBuf)) {
      throw new BadRequestException('Le code saisi est incorrect.');
    }

    await this.redisService.del(key);

    // 2. Trouver l'utilisateur
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { telephone: phone },
      select: { userId: true, email: true, telephone: true, actif: true, bloqueJusqua: true, phoneVerified: true },
    });

    if (!utilisateur) {
      throw new BadRequestException('Ce compte est introuvable.');
    }

    this.assertAccountIsAllowed({
      actif: utilisateur.actif,
      bloqueJusqua: utilisateur.bloqueJusqua ? utilisateur.bloqueJusqua.toISOString() : null,
    });

    // 2.5 Marquer le numéro comme vérifié puisqu'on vient de valider l'OTP
    if (!utilisateur.phoneVerified) {
      await this.prisma.utilisateur.update({
        where: { userId: utilisateur.userId },
        data: { phoneVerified: true },
      });
    }

    // 3. Récupérer le profil et émettre les tokens
    const user: RequestUser = {
      sub: utilisateur.userId,
      email: utilisateur.email,
      phone: utilisateur.telephone,
    };

    const profile = await this.getOrCreateProfile(user);
    const flags = await this.getUtilisateurFlags(user.sub);
    this.assertAccountIsAllowed(flags);

    const accessToken = await this.signAccessToken({
      sub: user.sub,
      email: user.email,
      phone: user.phone,
      role: profile.role as RoleProfile,
    });
    const refreshToken = await this.signRefreshToken({
      sub: user.sub,
      email: user.email,
      phone: user.phone,
      role: profile.role as RoleProfile,
    });
    await this.storeRefreshSession(user.sub, refreshToken);

    console.log(`[Auth] Phone login successful for ${phone} (userId: ${user.sub})`);

    return {
      accessToken,
      refreshToken,
      activeRole: profile.role as RoleProfile,
      profile: this.toResponse(profile, flags),
    };
  }

  async updatePhone(user: RequestUser, telephone: string): Promise<ProfileResponse> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }
    const normalizedPhone = this.normalizePhone(telephone);

    const phoneTaken = await this.prisma.utilisateur.findFirst({
      where: { telephone: normalizedPhone, NOT: { userId: user.sub } },
      select: { id: true },
    });
    if (phoneTaken) {
      throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
    }

    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (existing) {
      const updated = await this.prisma.utilisateur.update({
        where: { userId: user.sub },
        data: {
          telephone: normalizedPhone,
          phoneVerified: false,
        },
      });

      await this.prisma.profile.update({
        where: { userId: user.sub },
        data: { phone: normalizedPhone },
      });

      const profile = await this.getOrCreateProfile(user);
      const res = this.toResponse(profile, {
        id: updated.id,
        phoneVerified: updated.phoneVerified,
        kycStatus: updated.statutKyc as ProfileResponse['kycStatus'],
      });
      // Déclencher l'envoi de l'OTP
      await this.requestPhoneOtp(user);
      return res;
    }

    const profile = await this.prisma.profile.update({
      where: { userId: user.sub },
      data: { phone: normalizedPhone },
    });

    // Déclencher l'envoi de l'OTP (cas nouveau compte)
    await this.requestPhoneOtp(user);

    return this.toResponse(profile, {});
  }

  async verifyPhoneOtp(user: RequestUser, code: string): Promise<ProfileResponse> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }
    await this.ensureUtilisateurExists(user.sub);

    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('Le code doit contenir 6 chiffres.');
    }

    const key = this.getOtpKey(user.sub);
    const stored = await this.redisService.get(key);

    if (!stored) {
      throw new BadRequestException('Ce code a expiré ou n’est plus valide.');
    }

    // Code Redis disponible : comparaison timing-safe stricte.
    const storedBuf = Buffer.from(stored);
    const incomingBuf = Buffer.from(code);
    const lengthMatch = storedBuf.length === incomingBuf.length;
    if (!lengthMatch || !timingSafeEqual(storedBuf, incomingBuf)) {
      throw new BadRequestException('Le code saisi est incorrect.');
    }
    await this.redisService.del(key);

    await this.prisma.utilisateur.update({
      where: { userId: user.sub },
      data: { phoneVerified: true },
    });

    const profile = await this.getOrCreateProfile(user);
    const flags = await this.getUtilisateurFlags(user.sub);
    return this.toResponse(profile, flags);
  }

  async submitKyc(
    user: RequestUser,
    documentFrontBuffer: Buffer,
    documentBackBuffer: Buffer,
  ): Promise<ProfileResponse> {
    if (!user.sub) throw new BadRequestException('Utilisateur invalide');
    await this.ensureUtilisateurExists(user.sub);

    try {
      await assertValidImageBuffer(documentFrontBuffer, ALLOWED_MIMES);
      await assertValidImageBuffer(documentBackBuffer, ALLOWED_MIMES);
    } catch {
      throw new BadRequestException('Format de fichier invalide. Formats acceptés : JPEG, PNG, WebP.');
    }

    const [frontResult, backResult] = await Promise.all([
      this.cloudinary.uploadKycDocument(documentFrontBuffer),
      this.cloudinary.uploadKycDocument(documentBackBuffer),
    ]);

    return this.applyKycUpdate(user, frontResult.url, backResult.url);
  }

  async submitKycLinks(
    user: RequestUser,
    body: { documentFrontUrl: string; documentBackUrl: string },
  ): Promise<ProfileResponse> {
    if (!user.sub) throw new BadRequestException('Utilisateur invalide');
    await this.ensureUtilisateurExists(user.sub);

    if (!body.documentFrontUrl || !body.documentBackUrl) {
      throw new BadRequestException('Les URLs des documents sont requises');
    }

    return this.applyKycUpdate(user, body.documentFrontUrl, body.documentBackUrl);
  }

  private async applyKycUpdate(
    user: RequestUser,
    frontUrl: string,
    backUrl: string,
  ): Promise<ProfileResponse> {
    const updated = await this.prisma.utilisateur.update({
      where: { userId: user.sub },
      data: {
        statutKyc: StatutKyc.EN_ATTENTE,
        kycDocumentUrl: frontUrl,
        kycSelfieUrl: backUrl,
        kycRejectionReason: null,
      },
    });

    const profile = await this.getOrCreateProfile(user);

    // Alerte admin Telegram — fire-and-forget
    const identity = updated.prenom
      ? `${updated.prenom}${updated.nom ? ' ' + updated.nom : ''}`
      : updated.email ?? updated.id;
    this.telegram.sendAdminAlert(
      `🆔 <b>Nouveau KYC soumis</b>\n` +
      `Utilisateur : ${identity}\n` +
      `Statut : EN_ATTENTE — <a href="https://autoloc.sn/dashboard/admin/users">Vérifier →</a>`,
    ).catch(() => { });

    return this.toResponse(profile, {
      id: updated.id,
      phoneVerified: updated.phoneVerified,
      kycStatus: updated.statutKyc as ProfileResponse['kycStatus'],
    });
  }

  async getKycUploadSignature() {
    return this.cloudinary.getUploadSignature('kyc-documents');
  }

  /**
   * Révoque la session de rafraîchissement dans Redis.
   * Appelé lors de la déconnexion pour invalider le refresh token côté serveur.
   */
  async logout(userId: string): Promise<void> {
    await this.redisService.del(this.getRefreshSessionKey(userId));
  }

  async uploadPermis(
    user: RequestUser,
    fileBuffer: Buffer,
  ): Promise<{ url: string }> {
    if (!user.sub) throw new BadRequestException('Utilisateur invalide');
    await this.ensureUtilisateurExists(user.sub);

    try {
      await assertValidImageBuffer(fileBuffer, ALLOWED_MIMES);
    } catch {
      throw new BadRequestException('Format de fichier invalide. Formats acceptés : JPEG, PNG, WebP.');
    }

    // Delete old permis if exists
    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { permisPublicId: true },
    });
    if (existing?.permisPublicId) {
      await this.cloudinary.deleteByPublicId(existing.permisPublicId).catch(() => { });
    }

    const upload = await this.cloudinary.uploadPermisDocument(fileBuffer, user.sub);

    return this.applyPermisUpdate(user.sub, upload.url, upload.publicId);
  }

  async linkPermis(
    user: RequestUser,
    body: { url: string; publicId: string },
  ): Promise<{ url: string }> {
    if (!user.sub) throw new BadRequestException('Utilisateur invalide');
    await this.ensureUtilisateurExists(user.sub);

    if (!body.url || !body.publicId) {
      throw new BadRequestException('URL et publicId requis');
    }

    // Delete old permis if exists
    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { permisPublicId: true },
    });
    if (existing?.permisPublicId && existing.permisPublicId !== body.publicId) {
      await this.cloudinary.deleteByPublicId(existing.permisPublicId).catch(() => { });
    }

    return this.applyPermisUpdate(user.sub, body.url, body.publicId);
  }

  private async applyPermisUpdate(
    userId: string,
    url: string,
    publicId: string,
  ): Promise<{ url: string }> {
    await this.prisma.utilisateur.update({
      where: { userId },
      data: { permisUrl: url, permisPublicId: publicId },
    });

    return { url };
  }

  /**
   * Échange un accessToken Supabase contre un JWT métier + refresh token.
   */
  async loginWithSupabase(
    supabaseAccessToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile; profile: ProfileResponse }> {

    try {
      if (!supabaseAccessToken?.trim()) {
        throw new BadRequestException('accessToken manquant');
      }

      let payload;
      try {
        payload = await this.jwksService.verify(supabaseAccessToken);
      } catch (err) {
        console.error('[loginWithSupabase] JWKS Verify failed:', err);
        throw new UnauthorizedException(`Token verification failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      const user: RequestUser = {
        sub: payload.sub,
        email: payload.email,
        phone: payload.phone,
      };
      const profile = await this.getOrCreateProfile(user);

      const accessToken = await this.signAccessToken({
        sub: user.sub,
        email: user.email,
        phone: user.phone,
        role: profile.role as RoleProfile,
      });
      const refreshToken = await this.signRefreshToken({
        sub: user.sub,
        email: user.email,
        phone: user.phone,
        role: profile.role as RoleProfile,
      });
      await this.storeRefreshSession(user.sub, refreshToken);

      return { accessToken, refreshToken, activeRole: profile.role as RoleProfile, profile };

    } catch (err) {
      console.error('[loginWithSupabase] FATAL ERROR:', err);
      if (err instanceof BadRequestException || err instanceof UnauthorizedException || err instanceof ForbiddenException) {
        throw err;
      }
      throw new BadRequestException(`Login failed: ${err instanceof Error ? err.message : String(err)} - Stack: ${err instanceof Error ? err.stack : ''}`);
    }
  }

  /**
   * Renouvelle un JWT métier à partir d'un refresh token.
   */
  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile; profile: ProfileResponse }> {

    if (!refreshToken?.trim()) {
      throw new BadRequestException('refreshToken manquant');
    }

    const secret = this.getJwtSecret();
    let decoded: {
      sub: string;
      email?: string;
      phone?: string;
      role?: RoleProfile;
      typ?: string;
    };

    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide');
    }

    if (decoded.typ !== 'refresh') {
      throw new UnauthorizedException('Type de jeton invalide');
    }

    await this.assertRefreshSession(decoded.sub, refreshToken);

    const user: RequestUser = {
      sub: decoded.sub,
      email: decoded.email,
      phone: decoded.phone,
    };

    const profile = await this.getOrCreateProfile(user);

    const newAccessToken = await this.signAccessToken({
      sub: user.sub,
      email: user.email,
      phone: user.phone,
      role: profile.role as RoleProfile,
    });
    const newRefreshToken = await this.signRefreshToken({
      sub: user.sub,
      email: user.email,
      phone: user.phone,
      role: profile.role as RoleProfile,
    });
    await this.storeRefreshSession(user.sub, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, activeRole: profile.role as RoleProfile, profile };

  }

  private async getUtilisateurFlags(userId: string): Promise<{
    id?: string;
    actif?: boolean;
    phoneVerified?: boolean;
    kycStatus?: ProfileResponse['kycStatus'];
    hasVehicles?: boolean;
    hasPermis?: boolean;
    prenom?: string | null;
    nom?: string | null;
    dateNaissance?: string | null;
    bloqueJusqua?: string | null;
  }> {
    const found = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: {
        id: true,
        actif: true,
        phoneVerified: true,
        statutKyc: true,
        permisUrl: true,
        dateNaissance: true,
        prenom: true,
        nom: true,
        bloqueJusqua: true,
        _count: { select: { vehicules: true } },
      },
    });
    if (!found) return {};
    return {
      id: found.id,
      actif: found.actif,
      phoneVerified: found.phoneVerified,
      kycStatus: found.statutKyc as ProfileResponse['kycStatus'],
      hasVehicles: found._count.vehicules > 0,
      hasPermis: !!found.permisUrl,
      prenom: found.prenom,
      nom: found.nom,
      dateNaissance: found.dateNaissance ? found.dateNaissance.toISOString() : null,
      bloqueJusqua: found.bloqueJusqua ? found.bloqueJusqua.toISOString() : null,
    };
  }

  private async ensureUtilisateurExists(userId: string): Promise<void> {
    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!existing) {
      throw new BadRequestException('Profil incomplet');
    }
  }

  private getOtpKey(userId: string): string {
    return `${OTP_KEY_PREFIX}${userId}`;
  }

  private getOtpCooldownKey(userId: string): string {
    return `${OTP_COOLDOWN_PREFIX}${userId}`;
  }

  private getRefreshSessionKey(userId: string): string {
    return `${REFRESH_SESSION_PREFIX}${userId}`;
  }

  private generateOtp(): string {
    const value = Math.floor(100000 + Math.random() * 900000);
    return String(value);
  }

  private normalizePhone(raw: string): string {
    const trimmed = raw.trim().replace(/[\s-]/g, '');
    if (trimmed.startsWith('+')) return trimmed;
    if (trimmed.startsWith('221')) return `+${trimmed}`;
    return `+221${trimmed}`;
  }

  private normalizeEmail(raw: string): string {
    return raw.trim().toLowerCase();
  }



  private toResponse(
    p: {
      id: string;
      userId: string;
      email: string | null;
      phone: string | null;
      role: string;
      createdAt: Date;
    },
    flags: {
      id?: string;
      actif?: boolean;
      phoneVerified?: boolean;
      kycStatus?: ProfileResponse['kycStatus'];
      hasVehicles?: boolean;
      hasPermis?: boolean;
      prenom?: string | null;
      nom?: string | null;
      dateNaissance?: string | null;
      bloqueJusqua?: string | null;
    } = {},
  ): ProfileResponse {
    return {
      id: p.id,
      userId: p.userId,
      email: p.email,
      phone: p.phone,
      role: p.role,
      createdAt: p.createdAt,
      hasUtilisateur: Boolean(flags.id),
      utilisateurId: flags.id,
      phoneVerified: flags.phoneVerified,
      kycStatus: flags.kycStatus,
      hasVehicles: flags.hasVehicles,
      hasPermis: flags.hasPermis,
      prenom: flags.prenom,
      nom: flags.nom,
      dateNaissance: flags.dateNaissance,
      bloqueJusqua: flags.bloqueJusqua,
    };
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required to sign internal tokens');
    }
    return secret;
  }

  private getAccessTokenTtl(): string {
    return this.configService.get<string>('JWT_ACCESS_TTL') ?? ACCESS_TOKEN_TTL_DEFAULT;
  }

  private getRefreshTokenTtl(): string {
    return this.configService.get<string>('JWT_REFRESH_TTL') ?? REFRESH_TOKEN_TTL_DEFAULT;
  }

  private async signAccessToken(input: {
    sub: string;
    email?: string;
    phone?: string;
    role: RoleProfile;
  }): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: input.sub,
        email: input.email,
        phone: input.phone,
        role: input.role,
        typ: 'access',
      },
      { secret: this.getJwtSecret(), expiresIn: this.getAccessTokenTtl() },
    );
  }

  private async signRefreshToken(input: {
    sub: string;
    email?: string;
    phone?: string;
    role: RoleProfile;
  }): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: input.sub,
        email: input.email,
        phone: input.phone,
        role: input.role,
        typ: 'refresh',
        jti: randomUUID(),
      },
      { secret: this.getJwtSecret(), expiresIn: this.getRefreshTokenTtl() },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private isSameHash(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) return false;
    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private async storeRefreshSession(userId: string, refreshToken: string): Promise<void> {
    const decoded = await this.jwtService.verifyAsync<{
      exp?: number;
    }>(refreshToken, { secret: this.getJwtSecret() });
    const ttlSeconds = decoded.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : this.parseDurationToSeconds(this.getRefreshTokenTtl());
    await this.redisService.set(
      this.getRefreshSessionKey(userId),
      this.hashToken(refreshToken),
      ttlSeconds,
    );
  }

  private async assertRefreshSession(userId: string, refreshToken: string): Promise<void> {
    const storedHash = await this.redisService.get(this.getRefreshSessionKey(userId));
    if (!storedHash) {
      throw new UnauthorizedException('Session de rafraîchissement expirée ou révoquée');
    }
    const incomingHash = this.hashToken(refreshToken);
    if (!this.isSameHash(storedHash, incomingHash)) {
      throw new UnauthorizedException('Jeton de rafraîchissement révoqué');
    }
  }

  private assertAccountIsAllowed(flags: {
    actif?: boolean;
    bloqueJusqua?: string | null;
  }): void {
    if (flags.actif === false) {
      throw new ForbiddenException('Votre compte a été désactivé. Veuillez contacter le support.');
    }
    if (flags.bloqueJusqua && new Date(flags.bloqueJusqua) > new Date()) {
      throw new ForbiddenException(
        `Votre compte est suspendu jusqu'au ${new Date(flags.bloqueJusqua).toLocaleDateString()}`,
      );
    }
  }

  private parseDurationToSeconds(value: string): number {
    const normalized = value.trim();
    const match = normalized.match(/^(\d+)([smhd])$/i);
    if (!match) {
      const raw = Number(normalized);
      return Number.isFinite(raw) && raw > 0 ? raw : 30 * 24 * 60 * 60;
    }
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 's') return amount;
    if (unit === 'm') return amount * 60;
    if (unit === 'h') return amount * 60 * 60;
    return amount * 24 * 60 * 60;
  }
}
