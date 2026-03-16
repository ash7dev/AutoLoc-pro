export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Serveur (RSC, layouts, API routes Next.js) → appel direct à NestJS avec token Bearer explicite.
// Browser (Client Components) → proxy Next.js /api/nest/* qui gère l'auth via cookie httpOnly.
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? '')
    : '/api/nest';

// Méthodes idempotentes : on peut rejouer un 5xx sans risque de double effet de bord.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'PUT', 'DELETE']);

// Statuts HTTP qui méritent un retry (rate-limit ou erreur serveur transitoire).
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function backoffMs(attempt: number, retryAfterHeader?: string | null): number {
  if (retryAfterHeader) {
    const secs = Number(retryAfterHeader);
    if (!Number.isNaN(secs) && secs > 0) return Math.min(secs * 1000, 10_000);
  }
  // Backoff exponentiel avec jitter : ~300 ms, ~650 ms, ~1350 ms…
  const base = 300 * 2 ** attempt;
  const jitter = Math.random() * 150;
  return Math.min(base + jitter, 8_000);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ApiFetchOptions<TBody> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: TBody;
  accessToken?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  cache?: RequestCache;
  /** Nombre max de tentatives supplémentaires après la première. Défaut : 2. */
  maxRetries?: number;
}

export async function apiFetch<TResponse, TBody = undefined>(
  path: string,
  options: ApiFetchOptions<TBody> = {},
): Promise<TResponse> {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  // En mode serveur, on passe le token explicitement dans Authorization.
  // En mode browser, le proxy /api/nest/* l'injecte depuis le cookie httpOnly — inutile ici.
  if (typeof window === 'undefined' && options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const url = `${BASE_URL}${path}`;
  const method = options.method ?? 'GET';
  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeoutMs ?? 12_000;

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[API]', method, url);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    // Nouveau controller à chaque tentative (un AbortController annulé ne se réinitialise pas).
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response | undefined;
    try {
      res = await fetch(url, {
        method,
        headers:
          options.body instanceof FormData
            ? headers
            : { 'Content-Type': 'application/json', ...headers },
        body:
          options.body instanceof FormData
            ? options.body
            : options.body
              ? JSON.stringify(options.body)
              : undefined,
        signal: controller.signal,
        ...(options.cache ? { cache: options.cache } : {}),
      });
    } catch (err) {
      clearTimeout(timeout);
      const isTimeout = (err as { name?: string }).name === 'AbortError';
      lastError = isTimeout ? new ApiError('Délai d\'attente dépassé', 408) : err;

      // Erreur réseau (serveur jamais atteint) : on retry sur toutes les méthodes.
      if (attempt < maxRetries) {
        await wait(backoffMs(attempt));
        continue;
      }
      throw lastError;
    }

    clearTimeout(timeout);

    // Réponse reçue — décoder le corps.
    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json() : await res.text();

    if (res.ok) return payload as TResponse;

    const message =
      typeof payload === 'string'
        ? payload
        : (payload?.message as string) || 'Erreur réseau';
    const apiErr = new ApiError(message, res.status, payload);

    // Décider si on retry :
    // – 429 (rate-limit) : toujours, en respectant Retry-After.
    // – 5xx transitoires : uniquement sur méthodes idempotentes (pas de double POST).
    const shouldRetry =
      attempt < maxRetries &&
      RETRYABLE_STATUSES.has(res.status) &&
      (res.status === 429 || SAFE_METHODS.has(method));

    if (shouldRetry) {
      lastError = apiErr;
      await wait(backoffMs(attempt, res.headers.get('retry-after')));
      continue;
    }

    throw apiErr;
  }

  // Ne devrait pas être atteint, mais TypeScript l'exige.
  throw lastError;
}
