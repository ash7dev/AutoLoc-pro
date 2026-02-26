/**
 * AUTO-LOC — Design System Tokens v2
 * Source of truth. Tout le reste découle d'ici.
 *
 * Palette sémantique :
 *   brand     → Ambre saffran   : chaleur sénégalaise, premium, confiance
 *   slate     → Ardoise chaude  : dashboard, professionnel
 *   success   → Vert téranga    : argent, validation, graphes
 *   error     → Terracotta      : danger, annulation
 *   warning   → Ocre sahel      : attention, en attente
 *   info      → Bleu atlantique : neutre, informatif
 *   neutral   → Sable chaud     : backgrounds, textes
 *
 * Conventions :
 *   - palette.*  → valeurs brutes HEX, jamais dans les composants
 *   - colors.*   → tokens sémantiques, à utiliser dans les composants
 *   - hsl.*      → valeurs HSL nues pour shadcn/ui (opacité dynamique)
 */

// ─────────────────────────────────────────────────────────────────
// PALETTE BRUTE — Jamais utilisée directement dans les composants
// ─────────────────────────────────────────────────────────────────

export const palette = {
  amber: {
    50:  '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  green: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  red: {
    50:  '#fff5f5',
    100: '#ffe3e3',
    200: '#ffc9c9',
    300: '#ffa8a8',
    400: '#ff8787',
    500: '#fa5252',
    600: '#f03e3e',
    700: '#e03131',
    800: '#c92a2a',
    900: '#a61e1e',
    950: '#6b0f0f',
  },
  orange: {
    50:  '#fff8f1',
    100: '#ffecd2',
    200: '#ffd8a8',
    300: '#ffc078',
    400: '#ffa94d',
    500: '#ff922b',
    600: '#fd7e14',
    700: '#e8590c',
    800: '#d9480f',
    900: '#bf360e',
    950: '#7c1d06',
  },
  blue: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  violet: {
    50:  '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  sand: {
    50:  '#fafaf8',
    100: '#f5f4ef',
    200: '#eae9e0',
    300: '#d4d2c7',
    400: '#b3b1a3',
    500: '#8e8c7e',
    600: '#706e61',
    700: '#57554a',
    800: '#3c3a30',
    900: '#27261e',
    950: '#17160f',
  },
  slate: {
    50:  '#f8f7f4',
    100: '#efeee9',
    200: '#dedcd5',
    300: '#c5c2b8',
    400: '#a5a296',
    500: '#86836f',
    600: '#6b6858',
    700: '#555245',
    800: '#3b3930',
    900: '#28261f',
    950: '#191810',
  },
  // Neutres purs pour dark mode
  zinc: {
    50:  '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  white:       '#ffffff',
  black:       '#000000',
  transparent: 'transparent',
} as const;

// ─────────────────────────────────────────────────────────────────
// HSL NUES — Pour shadcn/ui CSS variables (opacité Tailwind)
// Format : "H S% L%" — sans hsl() wrapper
// ─────────────────────────────────────────────────────────────────

export const hsl = {
  light: {
    background:           '0 0% 100%',
    foreground:           '240 10% 4%',
    card:                 '0 0% 100%',
    'card-foreground':    '240 10% 4%',
    popover:              '0 0% 100%',
    'popover-foreground': '240 10% 4%',
    primary:              '240 10% 4%',       // noir — CTA principaux
    'primary-foreground': '0 0% 98%',
    secondary:            '240 5% 96%',
    'secondary-foreground':'240 6% 10%',
    muted:                '240 5% 96%',
    'muted-foreground':   '240 4% 46%',
    accent:               '142 76% 95%',      // vert très léger — hover états
    'accent-foreground':  '142 76% 28%',
    destructive:          '0 84% 60%',
    'destructive-foreground': '0 0% 98%',
    success:              '142 72% 40%',      // vert — graphes, statuts positifs
    'success-foreground': '0 0% 98%',
    warning:              '38 92% 50%',
    'warning-foreground': '240 10% 4%',
    border:               '240 6% 90%',
    input:                '240 6% 90%',
    ring:                 '240 10% 4%',
  },
  dark: {
    background:           '240 10% 4%',
    foreground:           '0 0% 98%',
    card:                 '240 10% 7%',
    'card-foreground':    '0 0% 98%',
    popover:              '240 10% 7%',
    'popover-foreground': '0 0% 98%',
    primary:              '0 0% 98%',
    'primary-foreground': '240 10% 4%',
    secondary:            '240 4% 16%',
    'secondary-foreground':'0 0% 98%',
    muted:                '240 4% 16%',
    'muted-foreground':   '240 5% 65%',
    accent:               '142 76% 10%',
    'accent-foreground':  '142 72% 75%',
    destructive:          '0 63% 51%',
    'destructive-foreground': '0 0% 98%',
    success:              '142 72% 35%',
    'success-foreground': '0 0% 98%',
    warning:              '38 92% 50%',
    'warning-foreground': '240 10% 4%',
    border:               '240 4% 16%',
    input:                '240 4% 16%',
    ring:                 '0 0% 84%',
  },
} as const;

// ─────────────────────────────────────────────────────────────────
// COULEURS SÉMANTIQUES — Tokens à utiliser dans les composants
// ─────────────────────────────────────────────────────────────────

export const colors = {
  // ── Brand (ambre saffran) ──────────────────────────────────────
  'brand-light':      palette.amber[400],
  brand:              palette.amber[600],
  'brand-dark':       palette.amber[700],
  'brand-subtle':     palette.amber[50],
  'brand-muted':      palette.amber[100],
  'brand-border':     palette.amber[200],
  'brand-text':       palette.amber[700],
  'brand-foreground': palette.white,

  // ── Surfaces (light) ──────────────────────────────────────────
  'bg-page':     palette.sand[50],
  'bg-elevated': palette.white,
  'bg-sunken':   palette.sand[100],
  'bg-overlay':  'rgba(23,22,15,0.55)',

  // ── Surfaces (dark) ───────────────────────────────────────────
  'bg-page-dark':     palette.zinc[950],
  'bg-elevated-dark': palette.zinc[900],
  'bg-sunken-dark':   palette.zinc[800],
  'bg-overlay-dark':  'rgba(0,0,0,0.7)',

  // ── Textes (light) ────────────────────────────────────────────
  'text-primary':   palette.sand[900],
  'text-secondary': palette.sand[600],
  'text-tertiary':  palette.sand[400],
  'text-disabled':  palette.sand[300],
  'text-inverse':   palette.white,
  'text-brand':     palette.amber[700],

  // ── Textes (dark) ─────────────────────────────────────────────
  'text-primary-dark':   palette.zinc[50],
  'text-secondary-dark': palette.zinc[400],
  'text-tertiary-dark':  palette.zinc[600],

  // ── Bordures (light) ──────────────────────────────────────────
  border:           palette.sand[200],
  'border-subtle':  palette.sand[100],
  'border-strong':  palette.sand[300],
  'border-brand':   palette.amber[300],
  'border-focus':   palette.amber[500],

  // ── Bordures (dark) ───────────────────────────────────────────
  'border-dark':        palette.zinc[700],
  'border-subtle-dark': palette.zinc[800],
  'border-strong-dark': palette.zinc[600],

  // ── États sémantiques ─────────────────────────────────────────
  success:          palette.green[600],
  'success-bg':     palette.green[50],
  'success-border': palette.green[200],
  'success-text':   palette.green[700],
  'success-dark':   palette.green[400],

  error:            palette.red[600],
  'error-bg':       palette.red[50],
  'error-border':   palette.red[200],
  'error-text':     palette.red[700],
  'error-dark':     palette.red[400],

  warning:          palette.orange[600],
  'warning-bg':     palette.orange[50],
  'warning-border': palette.orange[200],
  'warning-text':   palette.orange[700],
  'warning-dark':   palette.orange[400],

  info:             palette.blue[600],
  'info-bg':        palette.blue[50],
  'info-border':    palette.blue[200],
  'info-text':      palette.blue[700],
  'info-dark':      palette.blue[400],

  // ── Statuts réservations ──────────────────────────────────────
  'resa-pending':         palette.orange[500],
  'resa-pending-bg':      palette.orange[50],
  'resa-pending-border':  palette.orange[200],
  'resa-pending-text':    palette.orange[700],

  'resa-paid':            palette.blue[500],
  'resa-paid-bg':         palette.blue[50],
  'resa-paid-border':     palette.blue[200],
  'resa-paid-text':       palette.blue[700],

  'resa-confirmed':        palette.amber[500],
  'resa-confirmed-bg':     palette.amber[50],
  'resa-confirmed-border': palette.amber[200],
  'resa-confirmed-text':   palette.amber[700],

  'resa-active':           palette.green[500],
  'resa-active-bg':        palette.green[50],
  'resa-active-border':    palette.green[200],
  'resa-active-text':      palette.green[700],

  'resa-done':             palette.sand[500],
  'resa-done-bg':          palette.sand[100],
  'resa-done-border':      palette.sand[200],
  'resa-done-text':        palette.sand[600],

  'resa-cancelled':        palette.red[500],
  'resa-cancelled-bg':     palette.red[50],
  'resa-cancelled-border': palette.red[200],
  'resa-cancelled-text':   palette.red[700],

  'resa-dispute':          palette.violet[600],
  'resa-dispute-bg':       palette.violet[50],
  'resa-dispute-border':   palette.violet[200],
  'resa-dispute-text':     palette.violet[700],
} as const;

export type ColorToken = keyof typeof colors;

// ─────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    display: ['var(--font-display)', 'system-ui', 'sans-serif'],
    body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
    mono:    ['var(--font-mono)',    'monospace'],
  },
  fontSize: {
    '2xs': ['0.625rem',  { lineHeight: '1rem' }],
    xs:    ['0.75rem',   { lineHeight: '1.125rem' }],
    sm:    ['0.875rem',  { lineHeight: '1.375rem' }],
    base:  ['1rem',      { lineHeight: '1.5rem' }],
    lg:    ['1.125rem',  { lineHeight: '1.75rem' }],
    xl:    ['1.25rem',   { lineHeight: '1.875rem' }],
    '2xl': ['1.5rem',    { lineHeight: '2rem' }],
    '3xl': ['1.875rem',  { lineHeight: '2.375rem' }],
    '4xl': ['2.25rem',   { lineHeight: '2.75rem' }],
    '5xl': ['3rem',      { lineHeight: '3.75rem' }],
    '6xl': ['3.75rem',   { lineHeight: '4.5rem' }],
    '7xl': ['4.5rem',    { lineHeight: '5.25rem' }],
  },
  fontWeight: {
    light:     '300',
    normal:    '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    extrabold: '800',
    black:     '900',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight:   '-0.025em',
    normal:  '0em',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
} as const;

// ─────────────────────────────────────────────────────────────────
// SPACING — Échelle 4px base
// ─────────────────────────────────────────────────────────────────

export const spacing = {
  px:   '1px',
  0:    '0',
  0.5:  '0.125rem',
  1:    '0.25rem',
  1.5:  '0.375rem',
  2:    '0.5rem',
  2.5:  '0.625rem',
  3:    '0.75rem',
  3.5:  '0.875rem',
  4:    '1rem',
  5:    '1.25rem',
  6:    '1.5rem',
  7:    '1.75rem',
  8:    '2rem',
  9:    '2.25rem',
  10:   '2.5rem',
  11:   '2.75rem',
  12:   '3rem',
  14:   '3.5rem',
  16:   '4rem',
  20:   '5rem',
  24:   '6rem',
  28:   '7rem',
  32:   '8rem',
  36:   '9rem',
  40:   '10rem',
  44:   '11rem',
  48:   '12rem',
  52:   '13rem',
  56:   '14rem',
  60:   '15rem',
  64:   '16rem',
  72:   '18rem',
  80:   '20rem',
  96:   '24rem',
} as const;

// ─────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────

export const borderRadius = {
  none:  '0',
  sm:    '0.25rem',
  base:  '0.375rem',
  md:    '0.5rem',
  lg:    '0.75rem',   // --radius dans shadcn
  xl:    '1rem',
  '2xl': '1.25rem',
  '3xl': '1.5rem',
  full:  '9999px',
} as const;

// ─────────────────────────────────────────────────────────────────
// SHADOWS — Teintées sable pour cohérence palette
// ─────────────────────────────────────────────────────────────────

export const boxShadow = {
  none:  'none',
  xs:    '0 1px 2px 0 rgba(23,22,15,0.05)',
  sm:    '0 1px 3px 0 rgba(23,22,15,0.08), 0 1px 2px -1px rgba(23,22,15,0.05)',
  md:    '0 4px 6px -1px rgba(23,22,15,0.07), 0 2px 4px -2px rgba(23,22,15,0.05)',
  lg:    '0 10px 15px -3px rgba(23,22,15,0.07), 0 4px 6px -4px rgba(23,22,15,0.04)',
  xl:    '0 20px 25px -5px rgba(23,22,15,0.08), 0 8px 10px -6px rgba(23,22,15,0.04)',
  '2xl': '0 25px 50px -12px rgba(23,22,15,0.15)',
  inner: 'inset 0 2px 4px 0 rgba(23,22,15,0.05)',
  // Shadows colorées — usage sparingly
  brand:      '0 4px 14px 0 rgba(217,119,6,0.30)',
  'brand-lg': '0 8px 30px 0 rgba(217,119,6,0.25)',
  success:    '0 4px 14px 0 rgba(22,163,74,0.25)',
  error:      '0 4px 14px 0 rgba(240,62,62,0.25)',
  // Ombre dark mode (plus froide)
  'dark-sm':  '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.2)',
  'dark-md':  '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2)',
  'dark-lg':  '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.2)',
} as const;

// ─────────────────────────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────────────────────────

export const zIndex = {
  hide:     -1,
  base:      0,
  raised:    1,
  dropdown: 10,
  sticky:   20,
  overlay:  30,
  modal:    40,
  popover:  50,
  toast:    60,
  tooltip:  70,
} as const;

export type ZIndexToken = keyof typeof zIndex;

// ─────────────────────────────────────────────────────────────────
// BREAKPOINTS
// ─────────────────────────────────────────────────────────────────

export const screens = {
  sm:   '640px',
  md:   '768px',
  lg:   '1024px',
  xl:   '1280px',
  '2xl':'1536px',
} as const;

// ─────────────────────────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────────────────────────

export const transitionDuration = {
  instant: '0ms',
  fast:    '100ms',
  base:    '150ms',
  slow:    '300ms',
  slower:  '500ms',
} as const;

export const transitionTimingFunction = {
  linear:       'linear',
  ease:         'ease',
  'ease-in':    'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out':   'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out':'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:       'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'spring-soft':'cubic-bezier(0.25, 1.25, 0.5, 1)',
} as const;

// ─────────────────────────────────────────────────────────────────
// COMPONENT TOKENS — Tailles d'éléments UI récurrents
// ─────────────────────────────────────────────────────────────────

export const componentTokens = {
  // Hauteurs de composants interactifs
  height: {
    xs: '1.75rem',  // 28px — tags, chips compacts
    sm: '2.25rem',  // 36px — inputs sm
    md: '2.5rem',   // 40px — inputs md (défaut)
    lg: '2.75rem',  // 44px — inputs lg
    xl: '3rem',     // 48px — inputs xl, boutons hero
  },
  // Padding horizontal
  paddingX: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  // Tailles d'icônes
  iconSize: {
    xs: '0.875rem',  // 14px
    sm: '1rem',      // 16px
    md: '1.25rem',   // 20px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
  },
  // Avatars
  avatar: {
    xs:  '1.5rem',  // 24px
    sm:  '2rem',    // 32px
    md:  '2.5rem',  // 40px
    lg:  '3rem',    // 48px
    xl:  '4rem',    // 64px
    '2xl':'6rem',   // 96px
  },
  // Card padding — pour cohérence dashboard
  cardPadding: {
    sm: '1rem',    // p-4
    md: '1.5rem',  // p-6 — défaut
    lg: '2rem',    // p-8
  },
  // Sidebar
  sidebar: {
    collapsed: '4rem',   // 64px
    expanded:  '16rem',  // 256px
  },
} as const;

// ─────────────────────────────────────────────────────────────────
// DASHBOARD TOKENS — Tokens spécifiques au dashboard owner
// ─────────────────────────────────────────────────────────────────

export const dashboardTokens = {
  // KPI cards — couleurs d'accent par métrique
  kpi: {
    revenue:    { accent: palette.green[500],  bg: palette.green[50],   text: palette.green[700]  },
    bookings:   { accent: palette.blue[500],   bg: palette.blue[50],    text: palette.blue[700]   },
    occupancy:  { accent: palette.amber[500],  bg: palette.amber[50],   text: palette.amber[700]  },
    disputes:   { accent: palette.red[500],    bg: palette.red[50],     text: palette.red[700]    },
    wallet:     { accent: palette.violet[500], bg: palette.violet[50],  text: palette.violet[700] },
  },
  // Graphes — vert uniquement
  chart: {
    primary:   palette.green[500],
    secondary: palette.green[200],
    highlight: palette.green[600],
    grid:      palette.sand[100],
    axis:      palette.sand[300],
    tooltip:   palette.sand[900],
  },
  // Statuts pipeline — mappés aux couleurs resa
  pipeline: {
    PAYEE:     { dot: palette.blue[500],   badge: 'bg-blue-50 text-blue-700 border-blue-200'       },
    CONFIRMEE: { dot: palette.amber[500],  badge: 'bg-amber-50 text-amber-700 border-amber-200'    },
    EN_COURS:  { dot: palette.green[500],  badge: 'bg-green-50 text-green-700 border-green-200'    },
    TERMINEE:  { dot: palette.sand[400],   badge: 'bg-sand-100 text-sand-600 border-sand-200'      },
    ANNULEE:   { dot: palette.red[400],    badge: 'bg-red-50 text-red-700 border-red-200'          },
    LITIGE:    { dot: palette.violet[500], badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  },
} as const;

// ─────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────

export const tokens = {
  palette,
  hsl,
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  zIndex,
  screens,
  transitionDuration,
  transitionTimingFunction,
  componentTokens,
  dashboardTokens,
} as const;

export type Tokens = typeof tokens;

// ── Helpers ───────────────────────────────────────────────────────

/** Récupère une valeur de palette en HEX */
export function getPaletteColor<
  K extends keyof typeof palette,
  S extends keyof (typeof palette)[K]
>(key: K, shade: S): (typeof palette)[K][S] {
  return palette[key][shade];
}

/** Récupère un token sémantique */
export function getColor(token: ColorToken): string {
  return colors[token];
}