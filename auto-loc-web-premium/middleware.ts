import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('autoloc_token')?.value;
  const rawRole = request.cookies.get('autoloc_role')?.value;

  const { pathname } = request.nextUrl;

  // Normalisation basique du rôle dans l'Edge runtime
  const role = rawRole ? rawRole.toUpperCase() : null;
  const isOwner = role === 'OWNER' || role === 'PROPRIETAIRE';
  const isAdmin = role === 'ADMIN';

  // 1. Redirection pour les utilisateurs DÉJÀ connectés visitant /login ou /register
  if (token && (pathname === '/login' || pathname === '/register')) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (isOwner) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Protection des routes Administrateur (/admin)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Redirection si l'utilisateur n'est pas Admin
      const fallbackUrl = isOwner ? '/dashboard' : '/';
      return NextResponse.redirect(new URL(fallbackUrl, request.url));
    }
  }

  // 3. Protection du Dashboard Propriétaire (/dashboard)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Si c'est un administrateur qui accède à /dashboard, le diriger plutôt vers /admin
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/admin', '/admin/:path*', '/login', '/register'],
};
