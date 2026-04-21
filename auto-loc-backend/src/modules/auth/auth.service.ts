import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
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
      if(!user.sub) {
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

    const cooldownKey = this.getOtpCooldownKey(user.sub);
    const granted = await this.redisService.setNX(cooldownKey, '1', OTP_COOLDOWN_SECONDS);
    if (!granted) {
      throw new BadRequestException('Code déjà envoyé. Merci de patienter 60s.');
    }

    const code = this.generateOtp();
    const key = this.getOtpKey(user.sub);
    await this.redisService.set(key, code, OTP_TTL_SECONDS);

    // TODO: envoyer SMS/WhatsApp via provider (Twilio, etc.)
    // eslint-disable-next-line no-console
    console.log('[Auth] phone OTP generated', { userId: user.sub, code });

    return { expiresIn: OTP_TTL_SECONDS };
  }

  async updatePhone(user: RequestUser, telephone: string): Promise<ProfileResponse> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }
    // eslint-disable-next-line no-console
    console.log('[Auth] updatePhone', { userId: user.sub, telephone });
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
      return this.toResponse(profile, {
        id: updated.id,
        phoneVerified: updated.phoneVerified,
        kycStatus: updated.statutKyc as ProfileResponse['kycStatus'],
      });
    }

    const profile = await this.prisma.profile.update({
      where: { userId: user.sub },
      data: { phone: normalizedPhone },
    });

    return this.toResponse(profile, {});
  }

  async verifyPhoneOtp(user: RequestUser, code: string): Promise<ProfileResponse> {
    if (!user.sub) {
      throw new BadRequestException('Utilisateur invalide');
    }
    await this.ensureUtilisateurExists(user.sub);

    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('Format de code invalide (6 chiffres attendus)');
    }

    const key = this.getOtpKey(user.sub);
    const stored = await this.redisService.get(key);

    if (!stored) {
      throw new BadRequestException('Code expiré ou introuvable');
    }

    // Code Redis disponible : comparaison timing-safe stricte.
    const storedBuf = Buffer.from(stored);
    const incomingBuf = Buffer.from(code);
    const lengthMatch = storedBuf.length === incomingBuf.length;
    if (!lengthMatch || !timingSafeEqual(storedBuf, incomingBuf)) {
      throw new BadRequestException('Code incorrect');
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
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile }> {
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

      return { accessToken, refreshToken, activeRole: profile.role as RoleProfile };
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
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile }> {
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

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, activeRole: profile.role as RoleProfile };
  }

  private async getUtilisateurFlags(userId: string): Promise<{
    id?: string;
    actif?: boolean;
    phoneVerified?: boolean;
    kycStatus?: ProfileResponse['kycStatus'];
    hasVehicles?: boolean;
    hasPermis?: boolean;
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
