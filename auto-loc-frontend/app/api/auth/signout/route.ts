import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Efface les cookies NestJS lors de la déconnexion.
// Appelle d'abord le backend pour révoquer la session Redis,
// puis expire les cookies httpOnly.

const NEST_API = process.env.NEXT_PUBLIC_API_URL ?? '';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });

  // 1. Révoquer la session refresh dans Redis via le backend NestJS.
  //    On lit le cookie nest_access pour authentifier la requête.
  const nestAccess = request.cookies.get('nest_access')?.value;
  if (nestAccess && NEST_API) {
    await fetch(`${NEST_API}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nestAccess}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {});
  }

  // 2. Expirer les cookies httpOnly côté navigateur.
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

