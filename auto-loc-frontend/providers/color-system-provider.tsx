'use client';

/**
 * AUTO-LOC — ColorSystemProvider
 * Injecte les variables CSS du design system (--bg-page, --text-primary, etc.)
 * selon le thème actif. Doit être utilisé à l'intérieur de ThemeProvider.
 */

import { useEffect, type ReactNode } from 'react';
import { themeVariablesLight } from '../lib/design-system/colors';
import { useTheme } from './theme-provider';

function applyVariables(): void {
  const root = document.documentElement;
  Object.entries(themeVariablesLight).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

interface ColorSystemProviderProps {
  children: ReactNode;
}

/**
 * À placer à l'intérieur de ThemeProvider. Applique les couleurs
 * plateforme (tokens) en variables CSS sur :root à chaque changement de thème.
 */
export function ColorSystemProvider({ children }: ColorSystemProviderProps): React.ReactElement {
  const { mounted } = useTheme();

  useEffect(() => {
    if (!mounted) return;
    applyVariables();
  }, [mounted]);

  return <>{children}</>;
}
