import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  exportSPKI,
  JWTPayload,
} from 'jose';
import { RequestUser } from '../../../common/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const projectId = configService.get<string>('SUPABASE_PROJECT_ID');
    if (!projectId?.trim()) {
      throw new Error('SUPABASE_PROJECT_ID is required for JWT verification');
    }

    const jwksUrl = `https://${projectId}.supabase.co/auth/v1/.well-known/jwks.json`;
    const issuer = `https://${projectId}.supabase.co/auth/v1`;
    const audience =
      configService.get<string>('SUPABASE_JWT_AUDIENCE') ?? 'authenticated';

    const jwks = createRemoteJWKSet(new URL(jwksUrl));

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer,
      audience,
      secretOrKeyProvider: async (
        _req: unknown,
        token: string,
        done: (err: Error | null, key?: string | null) => void,
      ) => {
        try {
          const header = decodeProtectedHeader(token);
          const parts = token.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
          }
          const [protectedHeader, payload, signature] = parts;
          const key = await jwks(header, {
            protected: protectedHeader,
            payload,
            signature,
          });
          const pem = await exportSPKI(key as unknown as CryptoKey);
          done(null, pem);
        } catch (err) {
          done(err as Error, null);
        }
      },
    });
  }

  validate(payload: JWTPayload): RequestUser {
    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    return {
      sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      phone:
        typeof payload.phone === 'string'
          ? payload.phone
          : typeof (payload as Record<string, unknown>).phone_number === 'string'
            ? (payload as Record<string, unknown>).phone_number as string
            : undefined,
    };
  }
}
