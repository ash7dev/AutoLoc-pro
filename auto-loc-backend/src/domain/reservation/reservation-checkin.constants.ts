/** Fenêtre validation tacite locataire après check-in proprio (photos OK). */
export const TACIT_CHECKIN_MS = 24 * 60 * 60 * 1000;

/** Délai inspection proprio / clôture auto après fin de location (dateFin). */
export const CHECKOUT_INSPECTION_MS = 48 * 60 * 60 * 1000;

/** Minimum de photos d'état des lieux CHECKIN avant validation propriétaire. */
export const MIN_CHECKIN_ETAT_LIEU_PHOTOS = 1;

/** Fin du dernier jour de location (UTC) + délai inspection → exécution auto-close. */
export function getCheckoutAutoCloseAt(dateFin: Date): Date {
    const end = new Date(dateFin);
    end.setUTCHours(23, 59, 59, 999);
    return new Date(end.getTime() + CHECKOUT_INSPECTION_MS);
}

export function getCheckoutAutoCloseDelayMs(dateFin: Date): number {
    return Math.max(0, getCheckoutAutoCloseAt(dateFin).getTime() - Date.now());
}

/** Pour le cron : EN_COURS éligible si maintenant >= fin location + 48h. */
export function isPastCheckoutInspectionWindow(dateFin: Date, now: Date): boolean {
    return now.getTime() >= getCheckoutAutoCloseAt(dateFin).getTime();
}
