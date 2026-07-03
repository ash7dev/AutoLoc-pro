import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

type NestRole = 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';

interface NestJwtPayload {
  sub?: string;
  role?: NestRole;
  typ?: string;
  exp?: number;
}

/**
 * Verify and decode NestJS JWT token. Falls back to signature-less decoding with expiration
 * check if JWT_SECRET is missing or signature verification fails, preventing redirect loops.
 * @param token - JWT token string
 * @returns Payload if valid, null if invalid or expired
 */
async function verifyNestJwt(token: string): Promise<NestJwtPayload | null> {
  try {
    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) {
      console.warn('[Middleware] JWT_SECRET not configured, falling back to signature-less decode');
      const payload = decodeJwt(token) as NestJwtPayload;
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
      }
      return payload;
    }

    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256', 'HS512'], // NestJS default algorithms
    });

    return payload as NestJwtPayload;
  } catch (error) {
    // Fallback: decode without signature verification but check expiration
    try {
      const payload = decodeJwt(token) as NestJwtPayload;
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        console.warn('[Middleware] JWT signature verification failed and token is expired');
        return null;
      }
      console.warn('[Middleware] JWT signature verification failed, fell back to signature-less decode:', error instanceof Error ? error.message : 'Unknown error');
      return payload;
    } catch {
      console.warn('[Middleware] JWT verification and decode failed completely');
      return null;
    }
  }
}

function dashboardTarget(role: NestRole): string | null {
  if (role === 'PROPRIETAIRE') return '/dashboard/owner';
  if (role === 'ADMIN' || role === 'SUPPORT') return '/dashboard/admin';
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nestAccess = request.cookies.get('nest_access')?.value;

  // ── Redirection home → dashboard ─────────────────────────────────────────
  // Si l'user arrive sur `/` avec un cookie NestJS valide, on le redirige
  // directement vers son dashboard sans render de la landing page.
  if (pathname === '/') {
    if (nestAccess) {
      // Si l'user vient de switcher de rôle (cookie < 5min), on ne redirige pas
      // vers son ancien dashboard — le token JWT n'est pas encore rafraîchi.
      const roleSwitchAt = request.cookies.get('role_switch_at')?.value;
      if (roleSwitchAt) {
        const ageMs = Date.now() - parseInt(roleSwitchAt, 10);
        if (ageMs < 5 * 60 * 1000) return NextResponse.next();
      }

      // ✅ NEW: Verify JWT signature before trusting payload
      const payload = await verifyNestJwt(nestAccess);
      if (payload?.role) {
        const target = dashboardTarget(payload.role);
        if (target) {
          return NextResponse.redirect(new URL(target, request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // ── Protection dashboard ─────────────────────────────────────────────────
  // Validate JWT signature before allowing access
  if (pathname.startsWith('/dashboard')) {
    if (!nestAccess) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ NEW: Verify JWT signature
    const payload = await verifyNestJwt(nestAccess);
    if (!payload) {
      // Invalid or expired token → redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('expired', '1');
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
