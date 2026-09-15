/**
 * AUTO-LOC MOBILE — Design System (Premium Edition)
 * Point d'entrée unique. Les composants importent UNIQUEMENT depuis ce fichier
 * (jamais directement colors.ts / typography.ts), pour garder un seul contrat.
 */
import { colorThemes, gradients, primitives } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles } from './typography';
import { spacing, radius, buttonRadius, elevation, motion } from './spacing';

export type ThemeMode = 'light' | 'dark';

function buildTheme(mode: ThemeMode) {
  return {
    mode,
    colors: colorThemes[mode],
    gradients,
    primitives,
    typography: { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles },
    spacing,
    radius,
    buttonRadius,
    elevation,
    motion,
  };
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
export const theme = lightTheme;
export type Theme = typeof lightTheme;

// ─────────────────────────────────────────────
// Exemple d'intégration avec un ThemeProvider (React Context)
// À adapter selon ta stack (tu utilises déjà Zustand pour l'état global —
// un store dédié au thème évite de re-render tout l'arbre à chaque toggle).
// ─────────────────────────────────────────────
/*
import { create } from 'zustand';

type ThemeStore = {
  mode: ThemeMode;
  theme: Theme;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'light',
  theme: lightTheme,
  toggle: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: next, theme: next === 'light' ? lightTheme : darkTheme });
  },
  setMode: (mode) => set({ mode, theme: mode === 'light' ? lightTheme : darkTheme }),
}));

// Usage dans un composant :
// const { theme } = useThemeStore();
// <View style={{ backgroundColor: theme.colors.surface.page, padding: theme.spacing[4] }}>
//   <Text style={{ ...theme.typography.textStyles.h2, color: theme.colors.text.primary }}>
//     Réservation confirmée
//   </Text>
// </View>
*/

export * from './colors';
export * from './typography';
export * from './spacing';