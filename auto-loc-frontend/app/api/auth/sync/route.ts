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
  try {
    const body = await request.json() as { supabaseToken?: string };
    const { supabaseToken } = body;

    if (!supabaseToken) {
      return NextResponse.json({ error: 'supabaseToken requis' }, { status: 400 });
    }

    // Si le backend n'est pas configuré, on retourne succès sans synchronisation
    if (!NEST_API) {
      console.warn('[Auth Sync] Backend API non configuré, synchronisation ignorée');
      return NextResponse.json({ activeRole: 'LOCATAIRE', synced: false });
    }

    const nestRes = await fetch(`${NEST_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: supabaseToken }),
    });

    if (!nestRes.ok) {
      const err = await nestRes.text();
      console.error('[Auth Sync] Backend login failed:', { status: nestRes.status, error: err });
      return NextResponse.json({ error: 'Backend login failed', details: err }, { status: 502 });
    }

    const session = await nestRes.json() as {
      accessToken: string;
      refreshToken: string;
      activeRole: string;
      profile: any;
    };

    const response = NextResponse.json({
      activeRole: session.activeRole,
      profile: session.profile,
      synced: true,
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
    } catch (error) {
      console.error('[Auth Sync] Backend error:', error);
      return NextResponse.json({ error: 'Backend connection error' }, { status: 502 });
    }
}
