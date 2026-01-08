'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'
import { ITheme } from '@/lib/mongodb/models/Theme'

interface ThemeContextType {
  theme: ITheme | null
  isLoading: boolean
  refreshTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  initialTheme
}: {
  children: React.ReactNode
  initialTheme?: ITheme | null
}) {
  const [theme, setTheme] = useState<ITheme | null>(initialTheme || null)
  const [isLoading, setIsLoading] = useState(false)
  const { resolvedTheme } = useNextTheme()

  const refreshTheme = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/theme/active')
      if (response.ok) {
        const data = await response.json()
        setTheme(data.theme)
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Re-apply theme when dark mode changes
  useEffect(() => {
    if (theme) {
      applyThemeToDOM(theme, resolvedTheme === 'dark')
    }
  }, [theme, resolvedTheme])

  // Listen for custom theme-change event
  useEffect(() => {
    const handleThemeChange = () => {
      refreshTheme()
    }

    window.addEventListener('theme-changed', handleThemeChange)
    return () => window.removeEventListener('theme-changed', handleThemeChange)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Apply theme variables to the document root
 * When isDark is true, skip applying background/foreground colors to let dark mode CSS work
 */
function applyThemeToDOM(theme: ITheme | null, isDark: boolean = false) {
  if (!theme) return

  const root = document.documentElement

  // Colors to skip when dark mode is active (let CSS .dark class handle these)
  const darkModeProtectedVars = isDark ? [
    'background', 'foreground', 'card', 'card-foreground',
    'popover', 'popover-foreground', 'muted', 'muted-foreground',
    'accent', 'accent-foreground', 'border', 'input'
  ] : []

  // Apply Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()

    // Skip protected variables in dark mode
    if (darkModeProtectedVars.includes(cssVar)) {
      return
    }

    // Check if value is already a variable reference or raw hex/hsl
    if (value.startsWith('hsl(')) {
      const hslContent = value.replace(/hsl\((.*)\)/, '$1')
      root.style.setProperty(`--${cssVar}`, hslContent)
    } else {
      root.style.setProperty(`--${cssVar}`, value)
    }
  })

  // Apply Typography
  if (theme.typography) {
    root.style.setProperty('--font-sans', theme.typography.fontSans)
    root.style.setProperty('--font-header', theme.typography.fontHeader)
    root.style.setProperty('--radius', theme.typography.borderRadius)
  }

  // Apply Gradients
  const setGradient = (name: string, colors: string[]) => {
    if (colors && colors.length > 0) {
      root.style.setProperty(`--gradient-${name}`, colors.join(', '))
    }
  }

  setGradient('hero', theme.gradients.hero)
  setGradient('card', theme.gradients.card)
  setGradient('button', theme.gradients.button)
  setGradient('accent', theme.gradients.accent)

  // Apply Effects
  if (theme.effects) {
    root.style.setProperty('--particle-color', theme.effects.particleColor)
    root.setAttribute('data-particles', theme.effects.enableParticles ? 'true' : 'false')
    root.setAttribute('data-gradient-animation', theme.effects.enableGradientAnimation ? 'true' : 'false')
    root.setAttribute('data-glass-effect', theme.effects.enableGlassEffect ? 'true' : 'false')
  }
}
