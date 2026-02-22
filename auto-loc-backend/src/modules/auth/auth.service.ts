import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { ProfileResponse } from '../../common/types/auth.types';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { RoleProfile } from '@prisma/client';
import { JwksService } from '../../infrastructure/jwt/jwks.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const DEFAULT_ROLE = 'LOCATAIRE';
const ACCESS_TOKEN_TTL_DEFAULT = '15m';
const REFRESH_TOKEN_TTL_DEFAULT = '30d';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwksService: JwksService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      const utilisateurId = await this.getUtilisateurId(user.sub);
      return this.toResponse(existing, utilisateurId);
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

    const utilisateurId = await this.getUtilisateurId(user.sub);
    return this.toResponse(created, utilisateurId);
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
        avatarUrl: dto.avatarUrl ?? null,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : null,
      },
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

  private async getUtilisateurId(userId: string): Promise<string | undefined> {
    const found = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { id: true },
    });
    return found?.id;
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
    utilisateurId?: string,
  ): ProfileResponse {
    return {
      id: p.id,
      userId: p.userId,
      email: p.email,
      phone: p.phone,
      role: p.role,
      createdAt: p.createdAt,
      hasUtilisateur: Boolean(utilisateurId),
      utilisateurId,
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
