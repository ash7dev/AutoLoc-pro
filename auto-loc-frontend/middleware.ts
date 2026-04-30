import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type NestRole = 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';

interface NestJwtPayload {
  sub?: string;
  role?: NestRole;
  typ?: string;
  exp?: number;
}

function decodeNestJwt(token: string): NestJwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // JWT utilise base64url — on convertit en base64 standard
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as NestJwtPayload;
  } catch {
    return null;
  }
}

function dashboardTarget(role: NestRole): string | null {
  if (role === 'PROPRIETAIRE') return '/dashboard/owner';
  if (role === 'ADMIN' || role === 'SUPPORT') return '/dashboard/admin';
  return null;
}

export function middleware(request: NextRequest) {
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
      const payload = decodeNestJwt(nestAccess);
      if (payload?.role) {
        const target = dashboardTarget(payload.role);
        if (target) {
          return NextResponse.redirect(new URL(target, request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // ── Protection dashboard ─────────────────────────────��────────────────────
  // Pas de cookie nest_access → redirect login.
  // La validation réelle du JWT (expiry, signature) est faite côté serveur
  // dans les sous-layouts dashboard via fetchMe.
  if (pathname.startsWith('/dashboard')) {
    if (!nestAccess) {
      const loginUrl = new URL('/login', request.url);
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
