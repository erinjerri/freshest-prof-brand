'use client'
import type { Theme } from '@/providers/Theme/types'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import canUseDOM from '@/utilities/canUseDOM'
import { useTheme } from '../Theme'

export interface ContextType {
  headerTheme?: Theme | null
  setHeaderTheme: (theme: Theme | null) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<Theme | undefined | null>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )
  const { theme } = useTheme()

  const setHeaderTheme = useCallback((themeToSet: Theme | null) => {
    setThemeState((prev) => (prev === themeToSet ? prev : themeToSet))
  }, [])

  // Initialize from global theme once if we don't have a header override yet
  useEffect(() => {
    if (headerTheme === undefined && theme) {
      setThemeState(theme)
    }
  }, [theme, headerTheme])

  const value = useMemo(() => ({ headerTheme, setHeaderTheme }), [headerTheme, setHeaderTheme])

  return <HeaderThemeContext.Provider value={value}>{children}</HeaderThemeContext.Provider>
}

export const useHeaderTheme = (): ContextType => useContext(HeaderThemeContext)
