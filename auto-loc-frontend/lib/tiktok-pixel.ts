'use client';

/**
 * TikTok Pixel helper — typed wrapper around the global `ttq` object.
 *
 * Usage:
 *   import { ttqTrack, ttqIdentify } from '@/lib/tiktok-pixel';
 *   ttqTrack('ViewContent', { content_id: '123', content_type: 'product', value: 25000, currency: 'XOF' });
 */

// ── Global type augmentation ────────────────────────────────────────────────────

interface TtqInstance {
  page: () => void;
  track: (event: string, params?: Record<string, unknown>) => void;
  identify: (params: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    ttq?: TtqInstance;
  }
}

// ── Standard TikTok Events ──────────────────────────────────────────────────────

export type TikTokEvent =
  | 'ViewContent'       // Vue d'un véhicule
  | 'ClickButton'       // Clic sur "Réserver"
  | 'InitiateCheckout'  // Arrivée sur la page de paiement
  | 'AddPaymentInfo'    // Choix méthode (Wave/OM) + numéro entré
  | 'CompletePayment'   // Paiement confirmé
  | 'PlaceAnOrder'      // Réservation finalisée
  | 'Search'            // Recherche de véhicules
  | 'Contact'           // Contact WhatsApp
  | 'SubmitForm'        // Inscription / KYC
  | 'AddToWishlist';    // Favori (si implémenté)

export interface TikTokEventParams {
  content_id?: string;
  content_type?: string;      // 'product' for vehicles
  content_name?: string;
  value?: number;
  currency?: string;           // 'XOF' pour le FCFA
  quantity?: number;
  description?: string;
  query?: string;
  [key: string]: unknown;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

/**
 * Track a standard TikTok event.
 * Safe to call server-side or before the pixel loads — silently no-ops.
 */
export function ttqTrack(event: TikTokEvent, params?: TikTokEventParams): void {
  if (typeof window === 'undefined') return;
  try {
    window.ttq?.track(event, params);
  } catch (e) {
    console.warn('[TikTok Pixel] track error:', e);
  }
}

/**
 * Track a page view (called automatically by the pixel, but can be re-triggered on SPA nav).
 */
export function ttqPageView(): void {
  if (typeof window === 'undefined') return;
  try {
    window.ttq?.page();
  } catch (e) {
    console.warn('[TikTok Pixel] page error:', e);
  }
}

/**
 * Identify a user (e.g. after login).
 */
export function ttqIdentify(params: { email?: string; phone_number?: string; external_id?: string }): void {
  if (typeof window === 'undefined') return;
  try {
    window.ttq?.identify(params);
  } catch (e) {
    console.warn('[TikTok Pixel] identify error:', e);
  }
}
