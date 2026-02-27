import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const NEST_API = process.env.NEXT_PUBLIC_API_URL ?? '';
const IS_PROD = process.env.NODE_ENV === 'production';

const NEST_COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(
      new URL('/callback/error?message=Code+manquant', origin),
    );
  }

  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('from', 'oauth');
  if (next && next !== '/') {
    loginUrl.searchParams.set('next', next);
  }
  const response = NextResponse.redirect(loginUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Logs détaillés pour debug en production
    console.error('[OAuth Callback] Error exchangeCodeForSession:', {
      error: error.message,
      code: code?.substring(0, 10) + '...',
      origin,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.redirect(
      new URL(
        `/callback/error?message=${encodeURIComponent('Connexion échouée')}`,
        origin,
      ),
    );
  }

  // Échange le token Supabase contre un JWT NestJS et pose les cookies httpOnly.
  // Cela permet aux RSC (layouts) de lire directement le cookie sans passer par
  // sessionStorage (inaccessible côté serveur).
  if (NEST_API) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const nestRes = await fetch(`${NEST_API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.access_token }),
        });

        if (!nestRes.ok) {
          console.error('[OAuth Callback] Backend login failed:', {
            status: nestRes.status,
            statusText: nestRes.statusText,
            api: NEST_API
          });
          // Continue anyway - fallback to Supabase token
        } else {
          const { accessToken, refreshToken } = await nestRes.json() as {
            accessToken: string;
            refreshToken: string;
          };

          response.cookies.set('nest_access', accessToken, {
            ...NEST_COOKIE_BASE,
            maxAge: 60 * 60 * 24, // 24h (à aligner avec JWT_ACCESS_TTL backend)
          });
          response.cookies.set('nest_refresh', refreshToken, {
            ...NEST_COOKIE_BASE,
            maxAge: 60 * 60 * 24 * 30, // 30 jours
          });
        }
      }
    } catch (error) {
      console.error('[OAuth Callback] Backend error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        api: NEST_API
      });
      // Non-bloquant : le fallback Supabase token reste valide dans les layouts.
    }
  }

  return response;
}
