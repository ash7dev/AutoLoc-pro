/**
 * AUTO-LOC MOBILE — Theme Colors Architecture (Émeraude Klef / AutoLoc)
 * 
 * Alignement direct avec le système Klef adapté pour AutoLoc :
 * - Forest 950 / 900 / 800 (#041912, #072A20, #0B3D2E) : Surfaces sombres & titres
 * - Forest 600 / 500 (#14654C, #22805D) : Boutons structurants secondaires
 * - Émeraude Action (#16A34A / #22C55E / #4ADE80) : CTA conversion & badges
 * - Émeraude d'Eau (#86EFAC / #A8D5C1) : Totaux & réductions sur fond sombre
 * - Neutres (#F8FBF4, #FFFFFF, #22271F, #5F6B59, #E4EBDB)
 */

export const primitives = {
  forest: {
    50: '#F1F6EA',
    100: '#E4EBDB',
    200: '#A8D5C1',
    300: '#4DA788',
    400: '#22805D', // forest-500
    500: '#14654C', // forest-600 (Bouton primary)
    600: '#0B3D2E', // forest-800 (#0A3D2E brand main)
    700: '#072A20', // forest-900 (Surface sombre récapitulatif)
    800: '#041912', // forest-950 (Brand Dark / Titres)
    900: '#020F0B',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Émeraude principal Web (#10B981)
    600: '#059669', // Émeraude CTA principal Web (#059669)
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  gold: {
    50: '#FBF6E9',
    100: '#F5EBCE',
    200: '#F1DFB6', // Champagne Gold (#F1DFB6)
    300: '#E6CA8B', // Dark Champagne (#E6CA8B)
    400: '#D4AF37', // Gold Accent (#D4AF37)
    500: '#B89320',
  },
  champagne: {
    DEFAULT: '#F1DFB6',
    light: '#FBF6E9',
    dark: '#E6CA8B',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  red: {
    50: '#fff5f5',
    100: '#ffe3e3',
    200: '#ffc9c9',
    500: '#fa5252',
    600: '#f03e3e',
  },
  neutral: {
    0: '#ffffff',
    50: '#F8FBF4', // Blanc cassé neutre
    100: '#F1F6EA',
    200: '#E4EBDB', // Bordure neutre
    300: '#D4DCD0',
    400: '#9CA3AF',
    500: '#7D8975', // Sous-titres & labels
    600: '#5F6B59', // Libellés de période (FCFA / jour)
    700: '#3D4638',
    800: '#041912', // Texte sombre principal (#041912)
    900: '#171717',
    950: '#041912',
  },
} as const;

export type SemanticColors = {
  primary: typeof primitives.forest;
  emerald: typeof primitives.emerald;
  gold: typeof primitives.gold;
  champagne: typeof primitives.champagne;
  amber: typeof primitives.amber;
  forest: typeof primitives.forest;
  brand: {
    subtle: string; muted: string; border: string; light: string;
    main: string; dark: string; text: string; action: string; actionText: string;
    champagne: string; emerald: string;
  };
  accent: {
    subtle: string; muted: string; main: string; text: string; gold: string;
  };
  surface: {
    canvas: string; page: string; elevated: string; elevatedHover: string;
    card: string; subtle: string; inverse: string; overlay: string; glass: string; disabled: string;
    darkForest: string;
  };
  text: {
    primary: string; secondary: string; tertiary: string;
    disabled: string; inverse: string; brand: string; accent: string;
    inverseDisplay: string; periodLabel: string; champagne: string;
  };
  border: {
    subtle: string; light: string; default: string; strong: string;
    brand: string; disabled: string; focus: string; actionEdge: string; champagne: string;
  };
  status: {
    success: string; successBg: string; successBorder: string;
    warning: string; warningBg: string; warningBorder: string;
    error: string; errorBg: string; errorBorder: string;
    info: string; infoBg: string; infoBorder: string;
  };
  reservation: Record<
    'pending' | 'paid' | 'confirmed' | 'active' | 'done' | 'cancelled' | 'dispute',
    { bg: string; border: string; text: string; main: string }
  >;
};

const lightColors: SemanticColors = {
  primary: primitives.forest,
  emerald: primitives.emerald,
  gold: primitives.gold,
  champagne: primitives.champagne,
  amber: primitives.amber,
  forest: primitives.forest,
  brand: {
    subtle: primitives.emerald[50],
    muted: primitives.emerald[100],
    border: primitives.emerald[200],
    light: primitives.emerald[400],
    main: '#0A3D2E', // Brand main identique Web Premium (#0A3D2E)
    dark: '#041912', // Brand dark identique Web Premium (#041912)
    text: '#041912',
    action: primitives.emerald[500], // #10B981 Émeraude Action
    actionText: '#FFFFFF',
    champagne: primitives.gold[200], // #F1DFB6
    emerald: primitives.emerald[500], // #10B981
  },
  accent: {
    subtle: primitives.gold[50],
    muted: primitives.gold[100],
    main: primitives.gold[200],
    text: primitives.gold[500],
    gold: primitives.gold[200],
  },
  surface: {
    canvas: primitives.neutral[50],
    page: primitives.neutral[0],
    elevated: primitives.neutral[0],
    elevatedHover: primitives.neutral[100],
    card: primitives.neutral[0],
    subtle: primitives.neutral[100],
    inverse: '#041912',
    darkForest: '#072A20',
    overlay: 'rgba(4, 25, 18, 0.65)',
    glass: 'rgba(255, 255, 255, 0.85)',
    disabled: primitives.neutral[200],
  },
  text: {
    primary: '#041912', // Identique Web Premium
    secondary: primitives.neutral[600],
    tertiary: primitives.neutral[500],
    disabled: primitives.neutral[300],
    inverse: primitives.neutral[0],
    brand: '#0A3D2E',
    accent: primitives.gold[500],
    champagne: primitives.gold[200],
    inverseDisplay: '#F8FBF4',
    periodLabel: '#5F6B59',
  },
  border: {
    subtle: primitives.neutral[50],
    light: primitives.neutral[100],
    default: primitives.neutral[200],
    strong: primitives.neutral[400],
    brand: primitives.emerald[200],
    disabled: primitives.neutral[200],
    focus: primitives.emerald[500],
    actionEdge: 'rgba(16, 185, 129, 0.30)',
    champagne: primitives.gold[200],
  },
  status: {
    success: primitives.emerald[500],
    successBg: primitives.emerald[50],
    successBorder: primitives.emerald[200],
    warning: primitives.amber[500],
    warningBg: primitives.amber[50],
    warningBorder: primitives.amber[200],
    error: primitives.red[600],
    errorBg: primitives.red[50],
    errorBorder: primitives.red[200],
    info: primitives.emerald[500],
    infoBg: primitives.emerald[50],
    infoBorder: primitives.emerald[200],
  },
  reservation: {
    pending: { bg: primitives.amber[50], border: primitives.amber[200], text: primitives.amber[700], main: primitives.amber[500] },
    paid: { bg: primitives.emerald[50], border: primitives.emerald[200], text: primitives.emerald[700], main: primitives.emerald[500] },
    confirmed: { bg: primitives.emerald[50], border: primitives.emerald[200], text: primitives.emerald[700], main: primitives.emerald[600] },
    active: { bg: primitives.emerald[50], border: primitives.emerald[200], text: primitives.emerald[700], main: primitives.emerald[500] },
    done: { bg: primitives.neutral[100], border: primitives.neutral[200], text: primitives.neutral[600], main: primitives.neutral[400] },
    cancelled: { bg: primitives.red[50], border: primitives.red[200], text: primitives.red[600], main: primitives.red[500] },
    dispute: { bg: primitives.amber[50], border: primitives.amber[200], text: primitives.amber[700], main: primitives.amber[500] },
  },
};

const darkColors: SemanticColors = { ...lightColors };

export const gradients = {
  emeraldPrimary: [primitives.emerald[600], primitives.emerald[700]] as const,
  emeraldAction: [primitives.emerald[500], primitives.emerald[600]] as const,
  forestNight: [primitives.forest[800], primitives.forest[700]] as const,
  darkVIP: [primitives.forest[800], primitives.forest[700]] as const,
  lightCard: [primitives.neutral[0], primitives.neutral[50]] as const,
};

export const colors = lightColors;
export const colorThemes = { light: lightColors, dark: darkColors };