'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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

  const refreshTheme = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/theme/active')
      if (response.ok) {
        const data = await response.json()
        setTheme(data.theme)
        applyThemeToDOM(data.theme)
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (theme) {
      applyThemeToDOM(theme)
    }
  }, [theme])

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
 * Apply theme colors to CSS variables
 */
function applyThemeToDOM(theme: ITheme | null) {
  if (!theme) return

  const root = document.documentElement

  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    // Extract HSL values (remove "hsl(" and ")")
    const hslValue = value.replace(/hsl\((.*)\)/, '$1')
    root.style.setProperty(`--${cssVar}`, hslValue)
  })

  // Apply gradient CSS variables
  if (theme.gradients.hero.length > 0) {
    root.style.setProperty('--gradient-hero', theme.gradients.hero.join(', '))
  }
  if (theme.gradients.card.length > 0) {
    root.style.setProperty('--gradient-card', theme.gradients.card.join(', '))
  }
  if (theme.gradients.button.length > 0) {
    root.style.setProperty('--gradient-button', theme.gradients.button.join(', '))
  }
  if (theme.gradients.accent.length > 0) {
    root.style.setProperty('--gradient-accent', theme.gradients.accent.join(', '))
  }

  // Apply effects
  root.style.setProperty('--particle-color', theme.effects.particleColor)
  root.setAttribute('data-particles', theme.effects.enableParticles ? 'true' : 'false')
  root.setAttribute('data-gradient-animation', theme.effects.enableGradientAnimation ? 'true' : 'false')
  root.setAttribute('data-glass-effect', theme.effects.enableGlassEffect ? 'true' : 'false')
}
