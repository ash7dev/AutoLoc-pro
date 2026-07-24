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
  next?: NextFetchRequestConfig;
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

  // En mode serveur ou si passé explicitement par le client (ex: switch-role avec Supabase token),
  // on transmet le token dans Authorization.
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const url = `${BASE_URL}${path}`;
  const method = options.method ?? 'GET';
  const maxRetries = options.maxRetries ?? 1;
  const timeoutMs = options.timeoutMs ?? 25_000;

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
        ...(options.next ? { next: options.next } : {}),
      });
    } catch (err) {
      clearTimeout(timeout);
      const isTimeout = (err as { name?: string }).name === 'AbortError';
      lastError = isTimeout ? new ApiError('Délai d\'attente dépassé', 408) : err;

      // Retry uniquement les méthodes idempotentes (GET, PUT, DELETE, HEAD).
      // Un POST/PATCH peut avoir été traité côté serveur même si la réponse
      // n'est pas revenue (timeout, coupure réseau) → retry = doublon.
      if (attempt < maxRetries && SAFE_METHODS.has(method)) {
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
        : formatFriendlyErrorMessage(payload);
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

/**
 * Traduit et formate les messages d'erreur techniques du backend NestJS
 * (notamment les validations de classe class-validator en anglais)
 * en messages professionnels, clairs et conviviaux en français pour les clients.
 */
function formatFriendlyErrorMessage(payload: any): string {
  if (!payload || typeof payload !== 'object') {
    return 'Une erreur réseau ou serveur s\'est produite.';
  }

  // Si c'est un tableau de messages de validation NestJS (class-validator)
  if (Array.isArray(payload.message)) {
    const cleanList = payload.message.map((msg: string) => {
      const lower = msg.toLowerCase();
      
      // Traduction des règles class-validator communes
      let ruleTranslation = msg;
      if (lower.includes('must be an integer') || lower.includes('must be an int')) {
        ruleTranslation = 'doit être un nombre entier';
      } else if (lower.includes('must be a number')) {
        ruleTranslation = 'doit être un nombre valide';
      } else if (lower.includes('should not be empty') || lower.includes('must not be empty') || lower.includes('is required')) {
        ruleTranslation = 'est obligatoire';
      } else if (lower.includes('must be a string')) {
        ruleTranslation = 'doit être une chaîne de caractères';
      } else if (lower.includes('must be a valid email') || lower.includes('email must be an email')) {
        ruleTranslation = 'doit être une adresse e-mail valide';
      } else if (lower.includes('must be a boolean') || lower.includes('must be a bool')) {
        ruleTranslation = 'doit être un booléen (oui/non)';
      } else if (lower.includes('must conform to the specified constraints')) {
        ruleTranslation = 'est invalide ou non conforme';
      } else if (lower.includes('must be a valid enum value')) {
        ruleTranslation = 'contient une valeur non autorisée';
      } else if (lower.includes('must be a positive number')) {
        ruleTranslation = 'doit être un nombre positif';
      } else if (lower.includes('must not be less than')) {
        const matches = lower.match(/less than (\d+)/);
        const limit = matches ? matches[1] : '';
        ruleTranslation = `doit être supérieur ou égal à ${limit}`;
      } else if (lower.includes('must not be greater than')) {
        const matches = lower.match(/greater than (\d+)/);
        const limit = matches ? matches[1] : '';
        ruleTranslation = `doit être inférieur ou égal à ${limit}`;
      }

      // Extraction et traduction des noms de propriétés pour le français
      const firstWord = msg.split(' ')[0];
      const fieldTranslations: Record<string, string> = {
        marque: 'La marque',
        modele: 'Le modèle',
        annee: 'L\'année',
        immatriculation: 'L\'immatriculation',
        type: 'Le type de véhicule',
        nombreplaces: 'Le nombre de places',
        carburant: 'Le carburant',
        transmission: 'La transmission',
        ville: 'La ville',
        adresse: 'L\'adresse',
        prixparjour: 'Le prix par jour',
        joursminimum: 'La durée minimale',
        ageminimum: 'L\'âge minimum',
        zoneconduite: 'La zone de conduite',
        assurance: 'L\'assurance',
        carburantcondition: 'La condition de carburant',
        reglesspecifiques: 'Les règles spécifiques',
        fraislivraison: 'Les frais de livraison',
        autorisehorsdakar: 'L\'autorisation hors Dakar',
        supplementhorsdakarparjour: 'Le supplément hors Dakar',
        equipements: 'Les équipements',
        telephone: 'Le numéro de téléphone',
        phone: 'Le numéro de téléphone',
        code: 'Le code de validation',
        url: 'Le lien du fichier',
        publicid: 'L\'identifiant du fichier',
        documentfronturl: 'Le document (recto)',
        documentbackurl: 'Le document (verso)',
        selfieurl: 'La photo selfie',
        motif: 'Le motif',
        commentaire: 'Le commentaire',
        raison: 'La raison',
        heuredebut: 'L\'heure de début',
      };

      const translatedField = fieldTranslations[firstWord.toLowerCase()];
      if (translatedField) {
        // Si la règle a été traduite séparément, on combine proprement.
        // Sinon, on retourne juste le message traduit sans le premier mot technique.
        if (ruleTranslation !== msg) {
          return `${translatedField} ${ruleTranslation}`;
        }
        const restOfMsg = msg.substring(firstWord.length).trim();
        return `${translatedField} ${restOfMsg}`;
      }

      return ruleTranslation;
    });

    return `Erreur de validation :\n- ${cleanList.join('\n- ')}`;
  }

  // Si c'est un message texte simple
  if (payload.message && typeof payload.message === 'string') {
    const msg = payload.message;
    // Traduction de quelques erreurs globales courantes
    if (msg.includes('Unauthorized') || msg.includes('unauthorized') || msg.includes('Credentials')) {
      return 'Accès non autorisé ou session expirée. Veuillez vous reconnecter.';
    }
    if (msg.includes('Forbidden') || msg.includes('forbidden')) {
      return 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
    }
    if (msg.includes('Not Found') || msg.includes('not found')) {
      return 'La ressource demandée est introuvable.';
    }
    if (msg.includes('Internal Server Error')) {
      return 'Une erreur interne du serveur s\'est produite. Veuillez réessayer plus tard.';
    }
    
    // Traduction française de messages métiers connus du backend :
    const businessTranslations: Record<string, string> = {
      'vehicle with this registration already exists': 'Un véhicule avec cette immatriculation existe déjà.',
      'user has pending kyc': 'Votre dossier de vérification d\'identité est déjà en cours d\'examen.',
      'phone number already in use': 'Ce numéro de téléphone est déjà utilisé par un autre compte.',
      'email already in use': 'Cette adresse e-mail est déjà utilisée par un autre compte.',
      'invalid otp code': 'Le code de vérification est incorrect ou a expiré.',
      'reservation conflict': 'Ce véhicule n\'est pas disponible aux dates sélectionnées.',
      'invalid transition': 'Cette action n\'est pas autorisée dans l\'état actuel.',
    };

    const lowerMsg = msg.toLowerCase();
    for (const [english, french] of Object.entries(businessTranslations)) {
      if (lowerMsg.includes(english)) {
        return french;
      }
    }

    return msg;
  }

  return payload.error || 'Une erreur inconnue s\'est produite.';
}

