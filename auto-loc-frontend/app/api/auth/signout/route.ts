import { NextResponse } from 'next/server';

// Efface les cookies NestJS lors de la déconnexion.
// Appelé par use-signout.ts avant supabase.auth.signOut().

const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  const expireOpts = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('nest_access', '', expireOpts);
  response.cookies.set('nest_refresh', '', expireOpts);

  return response;
}
