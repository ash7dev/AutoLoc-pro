/**
 * AUTO-LOC MOBILE — Design Tokens: Spacing, Radius, Elevation (Audit Klef & AutoLoc)
 * Échelle base 4px — compatible avec toute grille 8pt classique.
 */

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  base: 10,
  md: 14,
  lg: 18,
  card: 20, // Rounded Card universel (radius-card: 20px) pour conteneurs, modales, sheets
  xl: 20,
  '2xl': 24,
  full: 9999, // Pilule universelle (radius-pill: 9999px) pour boutons, chips, badges
};

// Radius spécifiques pour les boutons — Rayon Pilule Universel (9999px)
export const buttonRadius = {
  sm: 9999,
  md: 9999,
  lg: 9999,
};

// Elevation — iOS (shadow*) et Android (elevation) définis ensemble
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 10,
  },

  // Élévation "brand" — halo émeraude action CTA (shadow-action: 0 6px 20px rgba(22, 163, 74, 0.30))
  brandGlow: {
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 8,
  },

  // Élévation "brand" subtile — pour boutons secondaires, petits CTA
  brandGlowSm: {
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  // Élévation carte premium
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export const motion = {
  duration: { fast: 120, base: 220, slow: 380, slower: 500 },
  easing: {
    standard: [0.4, 0.0, 0.2, 1] as const,
    decelerate: [0.0, 0.0, 0.2, 1] as const,
    accelerate: [0.4, 0.0, 1, 1] as const,
  },
  spring: {
    button: { friction: 8, tension: 100 },
    modal: { friction: 7, tension: 40 },
    card: { friction: 9, tension: 60 },
  },
};