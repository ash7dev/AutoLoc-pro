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

interface ApiFetchOptions<TBody> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: TBody;
  accessToken?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  cache?: RequestCache;
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
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[API]', options.method ?? 'GET', url);
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 12_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
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
    if ((err as { name?: string }).name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : (payload?.message as string) || 'Request failed';
    throw new ApiError(message, res.status, payload);
  }

  return payload as TResponse;
}
