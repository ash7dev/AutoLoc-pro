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
  darkMode: 'class',
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
        amber: palette.amber,
        green: palette.green,
        red: palette.red,
        orange: palette.orange,
        blue: palette.blue,
        violet: palette.violet,
        sand: palette.sand,
        slate: palette.slate,
      },
      fontFamily: {
        display: typography.fontFamily.display,
        body: typography.fontFamily.body,
        mono: typography.fontFamily.mono,
        sans: typography.fontFamily.body,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      backgroundColor: {
        page: 'var(--bg-page)',
        elevated: 'var(--bg-elevated)',
        sunken: 'var(--bg-sunken)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        subtle: 'var(--border-subtle)',
        strong: 'var(--border-strong)',
      },
    },
  },
  plugins: [],
};

export default config;
