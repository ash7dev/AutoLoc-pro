import { PendingIntent, PendingIntentAction } from '../../types/user';
import { useUserStore } from '../store/useUserStore';

const STORAGE_KEY = 'autoloc_pending_intent';

export class IntentEngine {
  /**
   * Intercepte une action nécessitant une authentification ou un KYC valide.
   * Si l'utilisateur a toutes les autorisations, retourne `true` immédiatement.
   * Sinon, sauvegarde l'intention et ouvre la modale d'authentification invité.
   */
  public static guardAction(
    action: PendingIntentAction,
    options?: {
      vehicleId?: string;
      payload?: Record<string, any>;
      redirectToUrl?: string;
      reasonMessage?: string;
    }
  ): boolean {
    const { capabilities, openGuestModal, setPendingIntent } = useUserStore.getState();

    // 1. Vérification des droits selon l'action
    let isAllowed = false;
    switch (action) {
      case 'BOOK_VEHICLE':
        isAllowed = capabilities.canBookVehicle;
        break;
      case 'ADD_VEHICLE':
        isAllowed = capabilities.canPublishListing;
        break;
      case 'WITHDRAW_PAYOUT':
        isAllowed = capabilities.canWithdrawPayout;
        break;
      case 'ADD_FAVORITE':
      case 'VIEW_PROFILE':
      case 'VIEW_BOOKINGS':
      case 'CONTACT_HOST':
        isAllowed = capabilities.isAuthenticated;
        break;
      default:
        isAllowed = capabilities.isAuthenticated;
    }

    if (isAllowed) {
      return true;
    }

    // 2. Si non autorisé, construction de l'intention
    const intent: PendingIntent = {
      action,
      vehicleId: options?.vehicleId,
      payload: options?.payload,
      redirectToUrl: options?.redirectToUrl,
    };

    // 3. Sauvegarde dans le store et dans sessionStorage pour persister le reload
    setPendingIntent(intent);
    this.persistIntentToStorage(intent);

    // 4. Déclenchement de la modale invité avec la raison appropriée
    const defaultReason = options?.reasonMessage || this.getDefaultReasonForAction(action);
    openGuestModal(defaultReason, intent);

    return false;
  }

  /**
   * Rejoue l'intention stockée après une connexion ou validation KYC réussie
   */
  public static consumePendingIntent(): PendingIntent | null {
    const { pendingIntent, clearPendingIntent } = useUserStore.getState();
    const stored = pendingIntent || this.getIntentFromStorage();

    if (stored) {
      this.clearStorage();
      clearPendingIntent();
      return stored;
    }

    return null;
  }

  private static persistIntentToStorage(intent: PendingIntent): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
    } catch (e) {
      console.warn('[IntentEngine] Failed to save intent to sessionStorage:', e);
    }
  }

  private static getIntentFromStorage(): PendingIntent | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private static clearStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silent catch
    }
  }

  private static getDefaultReasonForAction(action: PendingIntentAction): string {
    switch (action) {
      case 'BOOK_VEHICLE':
        return 'Veuillez vous connecter et vérifier votre pièce d’identité pour réserver ce véhicule.';
      case 'ADD_VEHICLE':
        return 'Veuillez vous connecter en tant que propriétaire certifié pour publier un véhicule.';
      case 'ADD_FAVORITE':
        return 'Connectez-vous pour sauvegarder ce véhicule dans vos favoris.';
      case 'CONTACT_HOST':
        return 'Connectez-vous pour échanger directement avec l’hôte.';
      case 'WITHDRAW_PAYOUT':
        return 'Votre compte doit être validé (KYC) pour effectuer des retraits d’argent.';
      default:
        return 'Veuillez vous connecter pour accéder à cette fonctionnalité.';
    }
  }
}
