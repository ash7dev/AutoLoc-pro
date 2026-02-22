import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { SupabaseJwtPayload } from '../../common/types/auth.types';

@Injectable()
export class JwksService {
  private readonly jwksUrl: string;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('SUPABASE_PROJECT_ID');
    if (!projectId?.trim()) {
      throw new Error('SUPABASE_PROJECT_ID is required for JWT verification');
    }
    this.jwksUrl = `https://${projectId}.supabase.co/auth/v1/.well-known/jwks.json`;
    // Vérifie que le token vient bien de TON projet Supabase.
    this.issuer = `https://${projectId}.supabase.co/auth/v1`;
    this.audience =
      this.configService.get<string>('SUPABASE_JWT_AUDIENCE') ?? 'authenticated';
  }

  /**
   * Vérifie le JWT : signature (JWKS), expiration, audience.
   * Retourne le payload typé ou lance si invalide.
   */
  async verify(token: string): Promise<SupabaseJwtPayload> {
    const JWKS = createRemoteJWKSet(new URL(this.jwksUrl));
    const { payload } = await jwtVerify(token, JWKS, {
      audience: this.audience,
      issuer: this.issuer,
    });

    const sub = (payload as JWTPayload).sub;
    if (typeof sub !== 'string' || !sub) {
      throw new Error('Invalid subject');
    }

    return {
      sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      phone:
        typeof payload.phone === 'string'
          ? payload.phone
          : typeof (payload as Record<string, unknown>).phone_number === 'string'
            ? (payload as Record<string, unknown>).phone_number as string
            : undefined,
      aud: payload.aud,
      exp: payload.exp ?? 0,
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
      ...payload,
    };
  }
}
