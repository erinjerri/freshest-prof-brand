'use client';
import type { Theme } from '@/providers/Theme/types';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import canUseDOM from '@/utilities/canUseDOM';
import { useTheme } from '../Theme';

export interface ContextType {
  headerTheme?: Theme | null;
  setHeaderTheme: (theme: Theme | null) => void;
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
};

const HeaderThemeContext = createContext(initialContext);

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<Theme | undefined | null>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  );
  const { theme } = useTheme(); // Sync with global theme

  const setHeaderTheme = useCallback((themeToSet: Theme | null) => {
    setThemeState(themeToSet);
  }, []);

  useEffect(() => {
    // Sync headerTheme with global theme on initial load or change
    if (theme && theme !== headerTheme) {
      setThemeState(theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, headerTheme]);

  return <HeaderThemeContext.Provider value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext.Provider>;
};

export const useHeaderTheme = (): ContextType => useContext(HeaderThemeContext);