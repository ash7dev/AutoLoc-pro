import { useUserStore } from '../store/useUserStore';

class KycRevalidatorEngine {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;

  /**
   * Démarrage du polling adaptatif si le KYC est en attente
   * @param intervalMs Fréquence de sondage (défaut: 20 000ms)
   */
  public startKycWatcher(intervalMs = 20000): void {
    if (typeof window === 'undefined') return;
    if (this.isPolling) return;

    const { user } = useUserStore.getState();
    if (!user || user.statutKyc !== 'EN_ATTENTE') {
      return;
    }

    this.isPolling = true;
    console.log('[KycRevalidator] Background watcher started for EN_ATTENTE KYC');

    this.timerId = setInterval(async () => {
      const currentState = useUserStore.getState();
      if (!currentState.isAuthenticated || currentState.user?.statutKyc !== 'EN_ATTENTE') {
        this.stopKycWatcher();
        return;
      }

      const updatedUser = await currentState.refreshProfileSilently();
      if (updatedUser && updatedUser.statutKyc !== 'EN_ATTENTE') {
        console.log(`[KycRevalidator] KYC status changed to ${updatedUser.statutKyc}`);
        this.stopKycWatcher();
      }
    }, intervalMs);
  }

  /**
   * Arrêt du sondage
   */
  public stopKycWatcher(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPolling = false;
    console.log('[KycRevalidator] Background watcher stopped');
  }
}

export const kycRevalidator = new KycRevalidatorEngine();
