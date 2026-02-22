import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retourner TOUJOURS `response` (pas NextResponse.next() brut) pour que
  // les cookies de rafraîchissement Supabase soient propagés au navigateur.
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // getSession() rafraîchit le token si nécessaire et appelle set() avec
        // les nouveaux cookies → on les écrit sur la réponse pour qu'ils arrivent au navigateur.
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Fail-open : si Supabase est indisponible, on ne bloque jamais l'accès
  // aux pages publiques (login, register). Pour /dashboard, on redirige vers /login.
  let hasSession = false;
  try {
    const { data } = await supabase.auth.getSession();
    hasSession = Boolean(data.session?.access_token);
  } catch {
    // Supabase indisponible — pas de session résolue.
  }

  const isDashboard      = pathname.startsWith('/dashboard');

  // 1. /dashboard/* sans session → /login?next=<pathname>
  if (isDashboard && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. /login ou /register avec session active → marketplace
  //    Exception : ?from=oauth → on laisse passer pour que le useEffect de
  //    login-form.tsx puisse appeler redirectAfterAuth() et syncWithNestJS()
  //    avant de rediriger vers la bonne destination.
  // Ne jamais bloquer /login et /register, même si une session existe.

  return response;
}

export const config = {
  // /verify est inclus pour que Supabase puisse rafraîchir ses cookies
  // même sur la page de vérification OTP.
  matcher: ['/dashboard/:path*', '/login', '/register', '/verify'],
};
