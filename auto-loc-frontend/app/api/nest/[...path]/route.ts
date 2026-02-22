// Proxy universel Next.js → NestJS
//
// Tous les appels browser vers /api/nest/<chemin> sont transférés à NestJS.
// Le proxy :
//  1. Lit le cookie `nest_access` (httpOnly) et l'injecte dans Authorization.
//  2. En cas de 401, tente un refresh silencieux via `nest_refresh`, pose
//     les nouveaux cookies et relance la requête initiale.
//  3. Met à jour les cookies automatiquement sur /auth/login et /auth/refresh.
//
// Avantages vs appel direct browser → NestJS :
//  - Aucun CORS cross-origin à gérer.
//  - Les cookies restent first-party (domaine Next.js).
//  - NestJS ne change pas (garde son guard Bearer uniquement).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const NEST_API = process.env.NEXT_PUBLIC_API_URL ?? '';
const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

interface NestSession {
  accessToken: string;
  refreshToken: string;
  activeRole?: string;
}

function setCookies(response: NextResponse, session: NestSession) {
  response.cookies.set('nest_access', session.accessToken, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 24, // 24h — aligner avec JWT_ACCESS_TTL backend
  });
  response.cookies.set('nest_refresh', session.refreshToken, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

function buildHeaders(accessToken: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  return h;
}

async function toNextResponse(res: Response): Promise<NextResponse> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  }
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': contentType || 'text/plain' },
  });
}

async function proxy(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (!NEST_API) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_API_URL non configuré' },
      { status: 500 },
    );
  }

  const cookieStore = cookies();
  let accessToken = cookieStore.get('nest_access')?.value ?? null;

  const path = '/' + params.path.join('/');
  const search = request.nextUrl.search;
  const url = `${NEST_API}${path}${search}`;

  // Lire le body une seule fois (stream ne peut être consommé qu'une fois).
  const bodyText =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text()
      : undefined;

  // ── Première tentative ──────────────────────────────────────────
  let res = await fetch(url, {
    method: request.method,
    headers: buildHeaders(accessToken),
    body: bodyText,
  });

  // ── Refresh silencieux sur 401 ──────────────────────────────────
  if (res.status === 401) {
    const refreshToken = cookieStore.get('nest_refresh')?.value ?? null;

    if (refreshToken) {
      const refreshRes = await fetch(`${NEST_API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const session = await refreshRes.json() as NestSession;
        accessToken = session.accessToken;

        // Retry avec le nouveau token
        res = await fetch(url, {
          method: request.method,
          headers: buildHeaders(accessToken),
          body: bodyText,
        });

        const nextRes = await toNextResponse(res);
        setCookies(nextRes, session);
        return nextRes;
      }
    }

    // Refresh échoué ou absent → renvoyer le 401 au client
    return toNextResponse(res);
  }

  // ── Mise à jour automatique des cookies sur les endpoints auth ──
  // Quand le client appelle /auth/login ou /auth/refresh via le proxy,
  // on synchronise les cookies avec la nouvelle session retournée.
  if (
    res.ok &&
    request.method === 'POST' &&
    (path === '/auth/login' || path === '/auth/refresh')
  ) {
    const session = await res.json() as NestSession;
    const nextRes = NextResponse.json(session, { status: res.status });
    setCookies(nextRes, session);
    return nextRes;
  }

  return toNextResponse(res);
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
