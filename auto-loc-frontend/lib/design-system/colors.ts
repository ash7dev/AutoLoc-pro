/**
 * AUTO-LOC — Couleurs plateforme
 * Point d'entrée unique pour toutes les couleurs. Utilisé par le ColorSystemProvider
 * pour injecter les variables CSS (--bg-page, --text-primary, etc.).
 */

import { colors, palette } from './tokens';

export { palette, colors };
export type { ColorToken } from './tokens';

/** Noms des variables CSS utilisées par Tailwind et les composants */
const cssVarKeys = [
  'bg-page',
  'bg-elevated',
  'bg-sunken',
  'border',
  'border-subtle',
  'border-strong',
  'border-focus',
  'border-brand',
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'color-brand',
] as const;

type CssVarKey = (typeof cssVarKeys)[number];

/** Mapping token → variable CSS (sans le préfixe --) */
const tokenToVar: Record<CssVarKey, keyof typeof colors> = {
  'bg-page': 'bg-page',
  'bg-elevated': 'bg-elevated',
  'bg-sunken': 'bg-sunken',
  border: 'border',
  'border-subtle': 'border-subtle',
  'border-strong': 'border-strong',
  'border-focus': 'border-focus',
  'border-brand': 'border-brand',
  'text-primary': 'text-primary',
  'text-secondary': 'text-secondary',
  'text-tertiary': 'text-tertiary',
  'color-brand': 'brand',
};

/** Tokens à utiliser en mode dark (suffix -dark si présent) */
const darkOverrides: Partial<Record<CssVarKey, keyof typeof colors>> = {
  'bg-page': 'bg-page-dark',
  'bg-elevated': 'bg-elevated-dark',
  'bg-sunken': 'bg-sunken-dark',
  border: 'border-dark',
  'border-subtle': 'border-subtle-dark',
  'text-primary': 'text-primary-dark',
  'text-secondary': 'text-secondary-dark',
  'text-tertiary': 'text-tertiary-dark',
};

function buildCssVarMap(mode: 'light' | 'dark'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of cssVarKeys) {
    const tokenKey = mode === 'dark' && darkOverrides[key] ? darkOverrides[key] : tokenToVar[key];
    const value = colors[tokenKey];
    if (typeof value === 'string') {
      out[`--${key}`] = value;
    }
  }
  return out;
}

/** Variables CSS pour le thème clair — à injecter sur :root.light */
export const themeVariablesLight = buildCssVarMap('light');

/** Variables CSS pour le thème sombre — à injecter sur :root.dark */
export const themeVariablesDark = buildCssVarMap('dark');

/** Génère le bloc CSS pour un thème (pour injection dans le DOM) */
export function getThemeCssBlock(mode: 'light' | 'dark'): string {
  const map = mode === 'light' ? themeVariablesLight : themeVariablesDark;
  const declarations = Object.entries(map)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `.${mode}{${declarations}}`;
}
