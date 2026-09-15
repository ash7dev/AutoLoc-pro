import { TextStyle, Platform } from 'react-native';

/**
 * AUTO-LOC MOBILE — Design Tokens: Typography Architecture (Émeraude Klef / AutoLoc)
 *
 * Duo de polices :
 * 1. Fraunces (Display / Éditorial) : Titres H1 à H3, headers modales, titres du profil & réservation.
 *    ⚠️ Plafond de graisse : La graisse des titres Fraunces est plafonnée à 600 (SemiBold).
 * 2. Inter (Interface / Corps / Prix) : Libellés, boutons, prix FCFA (tabular-nums), badges, formulaires.
 * 3. System Mono : Données brutes, ID de réservation ou logs.
 */

export const fontFamily = {
  // Fraunces (Éditorial & Titres)
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',

  // Inter (UI & Montants)
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',

  // Mono (Technique)
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const fontSize = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  base: 16,
  md: 17,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 40,
  '6xl': 48,
};

export const lineHeight = {
  '2xs': 14,
  xs: 16,
  sm: 20,
  base: 24,
  md: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 42,
  '5xl': 48,
  '6xl': 56,
};

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
};

export const letterSpacing = {
  tighter: -1.2,   // Display / Hero headings
  tight: -0.8,     // H1-H2 headings
  snug: -0.4,      // H3-H4 headings
  normal: 0,       // Body text
  wide: 0.3,       // Button text
  wider: 0.8,      // Captions, labels
  widest: 1.5,     // Overlines, badges, tags
  ultra: 2.0,      // Micro-tags
};

// ─────────────────────────────────────────────
// Text Styles — Contrat typographique unifié
// ─────────────────────────────────────────────

export const textStyles = {
  // ── Display : Fraunces_600SemiBold (Plafond à 600) ──
  display1: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize['6xl'],
    lineHeight: lineHeight['6xl'],
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,
  display2: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize['5xl'],
    lineHeight: lineHeight['5xl'],
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  // ── Headings : Fraunces_600SemiBold (Plafond à 600) ──
  h1: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
    letterSpacing: -0.015,
  } as TextStyle,
  h2: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    letterSpacing: -0.015,
  } as TextStyle,
  h3: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    letterSpacing: -0.015,
  } as TextStyle,
  h4: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: letterSpacing.snug,
  } as TextStyle,

  // ── Subtitles : Inter Medium ──
  subtitle1: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
  subtitle2: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // ── Body : Inter Regular ──
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // ── Price FCFA : Inter Bold / ExtraBold + Tabular Nums ──
  price: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  priceLg: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  pricePeriod: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: '#5F6B59',
  } as TextStyle,

  // ── Caption : Inter Medium ──
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.wider,
  } as TextStyle,

  // ── Overline : Inter Bold (Uppercase) ──
  overline: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
  } as TextStyle,

  // ── Button : Inter Bold / ExtraBold ──
  button: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
  buttonLg: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
  buttonSm: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // ── Code / Mono ──
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    fontVariant: ['tabular-nums'],
  } as TextStyle,
};
