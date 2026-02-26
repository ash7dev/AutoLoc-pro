import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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

const DEFAULT_ROLE = 'LOCATAIRE';
const ACCESS_TOKEN_TTL_DEFAULT = '15m';
const REFRESH_TOKEN_TTL_DEFAULT = '30d';
const OTP_TTL_SECONDS = 5 * 60;
const OTP_KEY_PREFIX = 'auth:phone-otp:';
const OTP_COOLDOWN_SECONDS = 60;
const OTP_COOLDOWN_PREFIX = 'auth:phone-otp:cooldown:';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwksService: JwksService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Récupère le profil par user_id (sub JWT), ou le crée en transaction.
   * Idempotent : pas de crash si l'utilisateur se reconnecte.
   */
  async getOrCreateProfile(user: RequestUser): Promise<ProfileResponse> {
    const existing = await this.prisma.profile.findUnique({
      where: { userId: user.sub },
    });
    if (existing) {
      const flags = await this.getUtilisateurFlags(user.sub);
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
          email: user.email ?? null,
          phone: user.phone ?? null,
          role: DEFAULT_ROLE,
        },
      });
    });

    const flags = await this.getUtilisateurFlags(user.sub);
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
      throw new BadRequestException('Invalid user');
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

    const phoneTaken = await this.prisma.utilisateur.findFirst({
      where: { telephone: normalizedPhone },
      select: { id: true },
    });
    if (phoneTaken) {
      throw new BadRequestException('Telephone already in use');
    }

    const emailToCheck = user.email ?? `${user.sub}@autoloc.local`;
    const emailTaken = await this.prisma.utilisateur.findFirst({
      where: { email: emailToCheck },
      select: { id: true },
    });
    if (emailTaken) {
      throw new BadRequestException('Email already in use');
    }

    const createdUtilisateur = await this.prisma.utilisateur.create({
      data: {
        userId: user.sub,
        prenom: dto.prenom,
        nom: dto.nom,
        telephone: normalizedPhone,
        email: emailToCheck,
        profileCompleted: true,
        phoneVerified: true,
        avatarUrl: dto.avatarUrl ?? null,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : null,
      },
    });

    await this.prisma.profile.update({
      where: { userId: user.sub },
      data: { phone: normalizedPhone },
    });

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
      throw new BadRequestException('Invalid user');
    }

    await this.prisma.profile.update({
      where: { userId: user.sub },
      data: { role: dto.role as RoleProfile },
    });

    return { role: dto.role as RoleProfile };
  }

  async requestPhoneOtp(user: RequestUser): Promise<{ expiresIn: number }> {
    if (!user.sub) {
      throw new BadRequestException('Invalid user');
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
      throw new BadRequestException('Invalid user');
    }
    // eslint-disable-next-line no-console
    console.log('[Auth] updatePhone', { userId: user.sub, telephone });
    const normalizedPhone = this.normalizePhone(telephone);

    const phoneTaken = await this.prisma.utilisateur.findFirst({
      where: { telephone: normalizedPhone, NOT: { userId: user.sub } },
      select: { id: true },
    });
    if (phoneTaken) {
      throw new BadRequestException('Telephone already in use');
    }

    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (existing) {
      // Simulation mode (pas de provider OTP) : phoneVerified → true directement.
      const updated = await this.prisma.utilisateur.update({
        where: { userId: user.sub },
        data: {
          telephone: normalizedPhone,
          phoneVerified: true,
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
      throw new BadRequestException('Invalid user');
    }
    await this.ensureUtilisateurExists(user.sub);

    const key = this.getOtpKey(user.sub);
    const stored = await this.redisService.get(key);
    // Simulation mode: accept any 6-digit code (provider not configured yet).
    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (stored) {
      await this.redisService.del(key);
    }

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
    if (!user.sub) throw new BadRequestException('Invalid user');
    await this.ensureUtilisateurExists(user.sub);

    try {
      await assertValidImageBuffer(documentFrontBuffer, ALLOWED_MIMES);
      await assertValidImageBuffer(documentBackBuffer, ALLOWED_MIMES);
    } catch {
      throw new BadRequestException('Invalid file format. Allowed: JPEG, PNG, WebP.');
    }

    const [frontResult, backResult] = await Promise.all([
      this.cloudinary.uploadKycDocument(documentFrontBuffer),
      this.cloudinary.uploadKycDocument(documentBackBuffer),
    ]);

    const updated = await this.prisma.utilisateur.update({
      where: { userId: user.sub },
      data: {
        statutKyc: StatutKyc.EN_ATTENTE,
        kycDocumentUrl: frontResult.url,
        kycSelfieUrl: backResult.url,
        kycRejectionReason: null,
      },
    });

    const profile = await this.getOrCreateProfile(user);
    return this.toResponse(profile, {
      id: updated.id,
      phoneVerified: updated.phoneVerified,
      kycStatus: updated.statutKyc as ProfileResponse['kycStatus'],
    });
  }

  /**
   * Échange un accessToken Supabase contre un JWT métier + refresh token.
   */
  async loginWithSupabase(
    supabaseAccessToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile }> {
    if (!supabaseAccessToken?.trim()) {
      throw new BadRequestException('Missing accessToken');
    }

    const payload = await this.jwksService.verify(supabaseAccessToken);
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

    return { accessToken, refreshToken, activeRole: profile.role as RoleProfile };
  }

  /**
   * Renouvelle un JWT métier à partir d'un refresh token.
   */
  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile }> {
    if (!refreshToken?.trim()) {
      throw new BadRequestException('Missing refreshToken');
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
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (decoded.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

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

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, activeRole: profile.role as RoleProfile };
  }

  private async getUtilisateurFlags(userId: string): Promise<{
    id?: string;
    phoneVerified?: boolean;
    kycStatus?: ProfileResponse['kycStatus'];
    hasVehicles?: boolean;
  }> {
    const found = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: {
        id: true,
        phoneVerified: true,
        statutKyc: true,
        _count: { select: { vehicules: true } },
      },
    });
    if (!found) return {};
    return {
      id: found.id,
      phoneVerified: found.phoneVerified,
      kycStatus: found.statutKyc as ProfileResponse['kycStatus'],
      hasVehicles: found._count.vehicules > 0,
    };
  }

  private async ensureUtilisateurExists(userId: string): Promise<void> {
    const existing = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!existing) {
      throw new BadRequestException('Profile not completed');
    }
  }

  private getOtpKey(userId: string): string {
    return `${OTP_KEY_PREFIX}${userId}`;
  }

  private getOtpCooldownKey(userId: string): string {
    return `${OTP_COOLDOWN_PREFIX}${userId}`;
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
      phoneVerified?: boolean;
      kycStatus?: ProfileResponse['kycStatus'];
      hasVehicles?: boolean;
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
      },
      { secret: this.getJwtSecret(), expiresIn: this.getRefreshTokenTtl() },
    );
  }
}
