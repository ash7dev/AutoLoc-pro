import { ApiError } from '@/lib/nestjs/api-client';

/* ════════════════════════════════════════════════════════════════
   Traduction centralisée des erreurs API → messages FR utilisateur
════════════════════════════════════════════════════════════════ */

/** Correspondances exactes sur le message backend (anglais / technique) */
const MESSAGE_MAP: Record<string, string> = {
  // NestJS validation / ParsePipe
  'Validation failed (enum string is expected)': 'Paramètre invalide. Veuillez réessayer.',
  'Validation failed (uuid  is expected)':       'Identifiant de ressource invalide.',
  'Validation failed':                           'Données invalides. Vérifiez votre saisie.',
  'Bad Request Exception':                       'Requête incorrecte. Vérifiez votre saisie.',

  // Auth
  'Unauthorized':                                'Session expirée. Veuillez vous reconnecter.',
  'Forbidden resource':                          'Vous n\'avez pas les droits pour cette action.',
  'Forbidden':                                   'Accès refusé.',

  // Not Found
  'Not Found':                                   'Ressource introuvable.',
  'Reservation not found':                       'Réservation introuvable.',
  'Vehicle not found':                           'Véhicule introuvable.',
  'User not found':                              'Utilisateur introuvable.',

  // Reservation business rules
  'Invalid status transition':                   'Action impossible dans l\'état actuel de la réservation.',
  'Reservation is not in CONFIRMEE status':      'La réservation doit être confirmée pour démarrer le check-in.',
  'Reservation is not in EN_COURS status':       'La réservation doit être en cours pour effectuer le check-out.',
  'Reservation is not in PAYEE status':          'La réservation doit être payée pour être confirmée.',
  'Already checked in':                          'Le check-in a déjà été effectué.',
  'Already checked out':                         'Le check-out a déjà été effectué.',
  'Checkin already confirmed by this role':      'Vous avez déjà confirmé le check-in.',
  'Checkout already confirmed by this role':     'Vous avez déjà confirmé le check-out.',

  // KYC
  'KYC not verified':                            'Votre identité n\'a pas encore été vérifiée.',
  'Tenant KYC not verified':                     'Le locataire n\'a pas encore été vérifié.',

  // Payment
  'Payment not confirmed':                       'Le paiement n\'a pas été confirmé.',
  'Insufficient funds':                          'Solde insuffisant.',

  // Réseau / timeout
  'Délai d\'attente dépassé':                    'La requête a pris trop de temps. Vérifiez votre connexion.',
  'Failed to fetch':                             'Impossible de joindre le serveur. Vérifiez votre connexion.',
  'Load failed':                                 'Impossible de joindre le serveur. Vérifiez votre connexion.',
  'Network request failed':                      'Erreur réseau. Vérifiez votre connexion.',

  // Générique NestJS
  'Internal server error':                       'Erreur serveur. Veuillez réessayer dans un instant.',
  'Internal Server Error':                       'Erreur serveur. Veuillez réessayer dans un instant.',
};

/** Correspondances par code HTTP (fallback si le message n'est pas mappé) */
const STATUS_MAP: Record<number, string> = {
  400: 'Données invalides. Vérifiez votre saisie.',
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  409: 'Conflit : cette action n\'est pas possible en ce moment.',
  422: 'Données non traitables. Vérifiez votre saisie.',
  429: 'Trop de requêtes. Veuillez patienter.',
  500: 'Erreur serveur. Veuillez réessayer dans un instant.',
  502: 'Serveur momentanément indisponible.',
  503: 'Service temporairement indisponible.',
  504: 'Le serveur ne répond pas. Veuillez réessayer.',
};

/**
 * Traduit une erreur (ApiError ou Error générique) en message FR lisible.
 * À utiliser partout où une erreur est affichée à l'utilisateur.
 */
export function translateError(err: unknown): string {
  if (err instanceof ApiError) {
    // 1. Cherche d'abord par message exact
    const byMsg = MESSAGE_MAP[err.message];
    if (byMsg) return byMsg;

    // 2. Cherche un message partiel (sous-chaîne)
    for (const [key, value] of Object.entries(MESSAGE_MAP)) {
      if (err.message?.toLowerCase().includes(key.toLowerCase())) return value;
    }

    // 3. Fallback par code HTTP
    const byStatus = STATUS_MAP[err.status];
    if (byStatus) return byStatus;

    // 4. Si le message backend est déjà en français, on le garde
    if (err.message && /[àâäéèêëîïôùûüç]/i.test(err.message)) return err.message;

    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  if (err instanceof Error) {
    const byMsg = MESSAGE_MAP[err.message];
    if (byMsg) return byMsg;
    if (err.message && /[àâäéèêëîïôùûüç]/i.test(err.message)) return err.message;
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}
