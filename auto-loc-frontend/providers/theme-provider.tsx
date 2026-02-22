'use client';

/**
 * AUTO-LOC — ThemeProvider
 * Mode clair forcé
 * 1. Applique toujours le thème light
 * 2. Ignore la préférence système et le localStorage
 * 3. Conserve l'API useTheme() (toggle no-op vers light)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'autoloc-theme',
}: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((resolved: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  }, []);

  useEffect(() => {
    const resolved: ResolvedTheme = 'light';
    setThemeState('light');
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, [applyTheme]);

  const setTheme = useCallback(
    (_newTheme: Theme) => {
      const resolved: ResolvedTheme = 'light';
      setThemeState('light');
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
}
