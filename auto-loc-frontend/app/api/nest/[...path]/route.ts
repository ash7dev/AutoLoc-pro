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

function buildHeaders(accessToken: string | null, contentType: string | null): Record<string, string> {
  const h: Record<string, string> = {};
  if (contentType) h['Content-Type'] = contentType;
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  return h;
}

async function toNextResponse(res: Response): Promise<NextResponse> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  }
  const buffer = await res.arrayBuffer();
  const headers = new Headers();
  if (contentType) headers.set('Content-Type', contentType);
  const contentDisposition = res.headers.get('content-disposition');
  if (contentDisposition) headers.set('Content-Disposition', contentDisposition);
  const cacheControl = res.headers.get('cache-control');
  if (cacheControl) headers.set('Cache-Control', cacheControl);
  return new NextResponse(Buffer.from(buffer), {
    status: res.status,
    headers,
  });
}

function isRedirectStatus(status: number) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function toRedirectResponse(res: Response): NextResponse | null {
  if (!isRedirectStatus(res.status)) return null;
  const location = res.headers.get('location');
  if (!location) return null;
  return NextResponse.redirect(location, res.status as 301 | 302 | 303 | 307 | 308);
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

  const contentType = request.headers.get('content-type');
  // Lire le body une seule fois (stream ne peut être consommé qu'une fois).
  const bodyBuffer =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

  // ── Première tentative ──────────────────────────────────────────
  let res = await fetch(url, {
    method: request.method,
    headers: buildHeaders(accessToken, contentType),
    body: bodyBuffer ? Buffer.from(bodyBuffer) : undefined,
    redirect: 'manual',
  });

  // ── Refresh silencieux sur 401 ──────────────────────────────────
  const redirectRes = toRedirectResponse(res);
  if (redirectRes) return redirectRes;

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
          headers: buildHeaders(accessToken, contentType),
          body: bodyBuffer ? Buffer.from(bodyBuffer) : undefined,
          redirect: 'manual',
        });

        const retryRedirect = toRedirectResponse(res);
        if (retryRedirect) {
          const nextRes = retryRedirect;
          setCookies(nextRes, session);
          return nextRes;
        }

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
