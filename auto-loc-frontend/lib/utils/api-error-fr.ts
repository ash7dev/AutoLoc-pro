import { ApiError } from '@/lib/nestjs/api-client';

/* ════════════════════════════════════════════════════════════════
   Traduction centralisée des erreurs API → messages FR utilisateur
════════════════════════════════════════════════════════════════ */

/** Codes métier backend (BusinessRuleException.code) */
const CODE_MAP: Record<string, string> = {
  // Check-in
  CHECKIN_TOO_EARLY:               'Le check-in n\'est disponible qu\'à partir de la veille de la date de prise en charge.',
  CHECKIN_INVALID_STATUS:          'Le check-in n\'est possible que pour une réservation confirmée.',
  CHECKIN_ALREADY_FINALIZED:       'Le check-in a déjà été finalisé pour cette réservation.',
  CHECKIN_ALREADY_CONFIRMED_OWNER: 'Vous avez déjà confirmé le check-in en tant que propriétaire.',
  CHECKIN_ALREADY_CONFIRMED_TENANT:'Vous avez déjà confirmé le check-in en tant que locataire.',

  // Check-out
  CHECKOUT_TOO_EARLY:              'Le check-out n\'est disponible qu\'à partir de la date de restitution.',
  CHECKOUT_INVALID_STATUS:         'Le check-out n\'est possible que pour une réservation en cours.',
  CHECKOUT_ALREADY_FINALIZED:      'Le check-out a déjà été effectué.',

  // Réservation
  RESERVATION_NOT_FOUND:           'Réservation introuvable.',
  INVALID_STATUS_TRANSITION:       'Action impossible dans l\'état actuel de la réservation.',
  OVERLAP_CONFLICT:                'Ce véhicule n\'est pas disponible sur la période choisie.',

  // Wallet
  WALLET_ALREADY_CREDITED:         'Le portefeuille a déjà été crédité pour cette réservation.',
  INSUFFICIENT_BALANCE:            'Solde insuffisant.',

  // KYC
  KYC_NOT_VERIFIED:                'Votre identité n\'est pas encore vérifiée.',
  TENANT_KYC_NOT_VERIFIED:         'Le locataire n\'a pas encore été vérifié.',

  // Annulation
  CANCELLATION_INVALID_STATUS:     'L\'annulation n\'est plus possible à ce stade de la réservation.',
  CANCELLATION_BLOCKED:            'L\'annulation est bloquée selon la politique en vigueur.',

  // Litige
  DISPUTE_ALREADY_EXISTS:          'Un litige existe déjà pour cette réservation.',
  DISPUTE_WINDOW_EXPIRED:          'Le délai de 24h pour déclarer un litige est dépassé.',
  DISPUTE_INVALID_STATUS:          'Un litige ne peut être déclaré que pour une réservation en cours ou terminée.',
};

/** Correspondances exactes ou partielles sur le message texte */
const MESSAGE_MAP: Record<string, string> = {
  // NestJS ParsePipe
  'Validation failed (enum string is expected)': 'Paramètre invalide. Veuillez réessayer.',
  'Validation failed (uuid  is expected)':        'Identifiant invalide.',
  'Validation failed':                            'Données invalides.',
  'Bad Request Exception':                        'Requête incorrecte.',

  // Auth
  'Unauthorized':                                 'Session expirée. Veuillez vous reconnecter.',
  'Forbidden resource':                           'Vous n\'avez pas les droits pour cette action.',
  'Forbidden':                                    'Accès refusé.',

  // Not Found
  'Not Found':                                    'Ressource introuvable.',
  'Reservation not found':                        'Réservation introuvable.',

  // Réseau
  'Failed to fetch':                              'Impossible de joindre le serveur. Vérifiez votre connexion.',
  'Load failed':                                  'Impossible de joindre le serveur. Vérifiez votre connexion.',
  'Network request failed':                       'Erreur réseau. Vérifiez votre connexion.',
  'Délai d\'attente dépassé':                     'La requête a pris trop de temps. Vérifiez votre connexion.',

  // Serveur
  'Internal server error':                        'Erreur serveur. Veuillez réessayer.',
  'Internal Server Error':                        'Erreur serveur. Veuillez réessayer.',
};

/** Fallback par code HTTP */
const STATUS_MAP: Record<number, string> = {
  400: 'Données invalides. Vérifiez votre saisie.',
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  409: 'Conflit : cette action n\'est pas possible en ce moment.',
  422: 'Action impossible. Veuillez réessayer ou contacter le support.',
  429: 'Trop de requêtes. Veuillez patienter.',
  500: 'Erreur serveur. Veuillez réessayer.',
  502: 'Serveur momentanément indisponible.',
  503: 'Service temporairement indisponible.',
  504: 'Le serveur ne répond pas. Veuillez réessayer.',
};

/**
 * Traduit une erreur (ApiError ou Error générique) en message FR lisible.
 * Priorité : code métier → message exact → sous-chaîne → chars FR backend → code HTTP.
 */
export function translateError(err: unknown): string {
  if (err instanceof ApiError) {
    // 1. Code métier (BusinessRuleException.code) — source la plus précise
    const details = err.details as Record<string, unknown> | undefined;
    const code = typeof details?.code === 'string' ? details.code : null;
    if (code && CODE_MAP[code]) return CODE_MAP[code];

    // 2. Message exact
    if (err.message && MESSAGE_MAP[err.message]) return MESSAGE_MAP[err.message];

    // 3. Sous-chaîne du message
    if (err.message) {
      const lc = err.message.toLowerCase();
      for (const [key, value] of Object.entries(MESSAGE_MAP)) {
        if (lc.includes(key.toLowerCase())) return value;
      }
    }

    // 4. Message backend déjà en français → on le passe tel quel
    if (err.message && /[àâäéèêëîïôùûüç]/i.test(err.message)) return err.message;

    // 5. Fallback par code HTTP
    if (STATUS_MAP[err.status]) return STATUS_MAP[err.status];

    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  if (err instanceof Error) {
    if (MESSAGE_MAP[err.message]) return MESSAGE_MAP[err.message];
    if (/[àâäéèêëîïôùûüç]/i.test(err.message)) return err.message;
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}
