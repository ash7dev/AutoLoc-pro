import type { Config } from 'tailwindcss';
import {
  colors,
  palette,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  screens,
  transitionDuration,
  transitionTimingFunction,
} from './lib/design-system/tokens';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  theme: {
    screens,
    spacing,
    borderRadius,
    boxShadow,
    transitionDuration,
    transitionTimingFunction,
    extend: {
      colors: {
        ...colors,

        // Extended palette
        amber:  palette.amber,
        green:  palette.green,
        red:    palette.red,
        orange: palette.orange,
        blue:   palette.blue,
        violet: palette.violet,
        sand:   palette.sand,
        slate:  palette.slate,

        // ─── shadcn/ui semantic tokens ───────────────────────────────
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',

        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT:    'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT:    'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',

        // ─── Design-system semantic surface tokens ────────────────────
        surface: {
          page:     'var(--bg-page)',
          elevated: 'var(--bg-elevated)',
          sunken:   'var(--bg-sunken)',
        },
      },

      fontFamily: {
        display: [...typography.fontFamily.display],
        body: [...typography.fontFamily.body],
        mono: [...typography.fontFamily.mono],
        sans: [...typography.fontFamily.body],
      },
      fontSize: Object.fromEntries(
        Object.entries(typography.fontSize).map(([key, [size, config]]) => [
          key,
          [size, { ...config }]
        ])
      ),
      fontWeight:     typography.fontWeight,
      letterSpacing:  typography.letterSpacing,

      // ─── Semantic text colors ─────────────────────────────────────
      textColor: {
        primary:   'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary:  'var(--text-tertiary)',
      },

      // ─── Semantic border colors ───────────────────────────────────
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
        subtle:  'var(--border-subtle)',
        strong:  'var(--border-strong)',
        focus:   'var(--border-focus)',
        brand:   'var(--border-brand)',
      },

      // ─── Background colors ────────────────────────────────────────
      backgroundColor: {
        page:     'var(--bg-page)',
        elevated: 'var(--bg-elevated)',
        sunken:   'var(--bg-sunken)',
      },

      // ─── Animations ───────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.2s ease-out',
        'fade-in-up':    'fade-in-up 0.3s ease-out',
        'fade-in-down':  'fade-in-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right':'slide-in-right 0.3s ease-out',
        'accordion-down':'accordion-down 0.2s ease-out',
        'accordion-up':  'accordion-up 0.2s ease-out',
        'shimmer':       'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;