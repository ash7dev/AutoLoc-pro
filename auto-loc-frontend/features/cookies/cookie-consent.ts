/**
 * Cookie Consent — utilitaire partagé
 * Centralise la lecture/écriture du consentement pour toute l'application.
 */

export type CookieConsent = 'accepted' | 'refused' | null;

const STORAGE_KEY = 'autoloc_cookie_consent_v1';

export function getConsent(): CookieConsent {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'accepted' || v === 'refused') return v;
  return null;
}

export function setConsent(value: 'accepted' | 'refused'): void {
  localStorage.setItem(STORAGE_KEY, value);
  // Dispatch un événement custom pour que d'autres parties de l'app réagissent
  window.dispatchEvent(new CustomEvent('autoloc:consent-changed', { detail: { value } }));
}

/** Retourne true uniquement si l'utilisateur a explicitement accepté */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}
