import { decodeJwt } from 'jose';

export type NestRole = 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';

export interface NestJwtPayload {
  sub?: string;
  role?: NestRole;
  typ?: string;
  exp?: number;
}

export function decodeValidNestJwt(token: string | undefined | null): NestJwtPayload | null {
  if (!token) return null;

  try {
    const payload = decodeJwt(token) as NestJwtPayload;
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
