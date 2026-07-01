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
import crypto from 'crypto';

const NEST_API = process.env.NEXT_PUBLIC_API_URL ?? '';
const IS_PROD = process.env.NODE_ENV === 'production';

// ✅ NEW: Cacheable paths (GET requests only)
const CACHEABLE_PATHS = [
  '/auth/me',
  '/users/',
  '/vehicles/',
];

/**
 * Generate ETag from response body
 */
function generateETag(body: string): string {
  return `"${crypto.createHash('md5').update(body).digest('hex')}"`;
}

/**
 * Check if path should be cached
 */
function isCacheable(path: string, method: string): boolean {
  if (method !== 'GET') return false;
  return CACHEABLE_PATHS.some(prefix => path.startsWith(prefix));
}

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

function toClientSession(session: NestSession) {
  return { activeRole: session.activeRole ?? null };
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

function buildHeaders(accessToken: string | null, contentType: string | null, path: string): Record<string, string> {
  const h: Record<string, string> = {};
  if (contentType) h['Content-Type'] = contentType;
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  // TODO(wave-integration): Supprimer ce bloc une fois le webhook Wave en place.
  // En prod avec Wave : le webhook appelle le backend directement (pas via ce proxy).
  // Pour l'instant : le proxy injecte la clé interne pour simuler la confirmation de paiement.
  if (path.endsWith('/confirm-payment') && process.env.INTERNAL_API_KEY) {
    h['x-internal-key'] = process.env.INTERNAL_API_KEY;
  }
  return h;
}

async function toNextResponse(
  res: Response,
  options?: { path?: string; method?: string; clientETag?: string | null }
): Promise<NextResponse> {
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    // ✅ NEW: ETag support for cacheable GET requests
    if (options?.path && options?.method && isCacheable(options.path, options.method)) {
      const etag = generateETag(text);

      // If client sent If-None-Match and ETag matches → 304 Not Modified
      if (options.clientETag === etag) {
        console.log(`[Proxy] Cache HIT for ${options.path} (ETag: ${etag})`);
        return new NextResponse(null, {
          status: 304,
          headers: {
            'ETag': etag,
            'Cache-Control': 'private, max-age=60', // 1 minute cache
          },
        });
      }

      // Return with ETag header for client caching
      console.log(`[Proxy] Cache MISS for ${options.path} (ETag: ${etag})`);
      return NextResponse.json(json, {
        status: res.status,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=60',
        },
      });
    }

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

  // ✅ NEW: Extract If-None-Match header for ETag support
  const clientETag = request.headers.get('if-none-match');

  const contentType = request.headers.get('content-type');
  // Lire le body une seule fois (stream ne peut être consommé qu'une fois).
  const bodyBuffer =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

  // ── Première tentative ──────────────────────────────────────────
  let res = await fetch(url, {
    method: request.method,
    headers: buildHeaders(accessToken, contentType, path),
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
          headers: buildHeaders(accessToken, contentType, path),
          body: bodyBuffer ? Buffer.from(bodyBuffer) : undefined,
          redirect: 'manual',
        });

        const retryRedirect = toRedirectResponse(res);
        if (retryRedirect) {
          const nextRes = retryRedirect;
          setCookies(nextRes, session);
          return nextRes;
        }

        const nextRes = await toNextResponse(res, {
          path,
          method: request.method,
          clientETag,
        });
        setCookies(nextRes, session);
        return nextRes;
      }
    }

    // Refresh échoué ou absent → renvoyer le 401 au client
    return toNextResponse(res, { path, method: request.method, clientETag });
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
    const nextRes = NextResponse.json(toClientSession(session), { status: res.status });
    setCookies(nextRes, session);
    return nextRes;
  }

  return toNextResponse(res, { path, method: request.method, clientETag });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
