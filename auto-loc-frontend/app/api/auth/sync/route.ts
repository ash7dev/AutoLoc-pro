import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Appelé côté client (OTP / email flow) après que Supabase a authentifié l'user.
// Échange le token Supabase contre un JWT NestJS et pose les cookies httpOnly,
// rendant le token disponible pour les RSC (layouts dashboard).
// Retourne aussi les tokens dans le body pour alimenter le Zustand store.

const NEST_API = process.env.NEXT_PUBLIC_API_URL ?? '';
const IS_PROD = process.env.NODE_ENV === 'production';

const NEST_COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(request: NextRequest) {
  const body = await request.json() as { supabaseToken?: string };
  const { supabaseToken } = body;

  if (!supabaseToken) {
    return NextResponse.json({ error: 'supabaseToken requis' }, { status: 400 });
  }

  if (!NEST_API) {
    return NextResponse.json({ error: 'API URL non configurée' }, { status: 500 });
  }

  const nestRes = await fetch(`${NEST_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: supabaseToken }),
  });

  if (!nestRes.ok) {
    const err = await nestRes.text();
    return NextResponse.json(
      { error: 'Échec login NestJS', detail: err },
      { status: nestRes.status },
    );
  }

  const session = await nestRes.json() as {
    accessToken: string;
    refreshToken: string;
    activeRole: string;
  };

  const response = NextResponse.json({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    activeRole: session.activeRole,
  });

  response.cookies.set('nest_access', session.accessToken, {
    ...NEST_COOKIE_BASE,
    maxAge: 60 * 60 * 24,
  });
  response.cookies.set('nest_refresh', session.refreshToken, {
    ...NEST_COOKIE_BASE,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
