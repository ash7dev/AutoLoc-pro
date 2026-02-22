/**
 * AUTO-LOC — Design System
 * Point d'entrée unique : couleurs, tokens, typo, spacing, etc.
 */

export {
  palette,
  colors,
  themeVariablesLight,
  themeVariablesDark,
  getThemeCssBlock,
} from './colors';
export type { ColorToken } from './colors';

export {
  tokens,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  zIndex,
  screens,
  transitionDuration,
  transitionTimingFunction,
  componentTokens,
} from './tokens';
export type { Tokens } from './tokens';
