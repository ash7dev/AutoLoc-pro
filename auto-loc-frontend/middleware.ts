import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware synchrone — aucun appel réseau.
// La vérification de token (fetchMe) est déléguée aux sous-layouts
// qui en ont besoin et qui utilisent unstable_cache.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /dashboard/* sans cookie nest_access → /login?next=<pathname>
  if (pathname.startsWith('/dashboard') && !request.cookies.has('nest_access')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
