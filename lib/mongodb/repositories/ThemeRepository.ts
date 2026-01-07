import Theme, { ITheme, IThemeDocument } from '../models/Theme'
import { BaseRepository } from './BaseRepository'

export class ThemeRepository extends BaseRepository<IThemeDocument, ITheme> {
  constructor() {
    super(Theme)
  }

  /**
   * Find the currently active theme
   */
  async findActive(): Promise<IThemeDocument | null> {
    return this.findOne({ isActive: true })
  }

  /**
   * Set a theme as active (automatically deactivates others)
   */
  async setActive(id: string): Promise<IThemeDocument | null> {
    // First, deactivate all themes
    await this.updateMany({}, { isActive: false })

    // Then activate the requested theme
    return this.update(id, { isActive: true })
  }

  /**
   * Delete a theme
   */
  async delete(id: string): Promise<boolean> {
    const theme = await this.findById(id)
    if (!theme) return false

    // Prevent deleting active theme
    if (theme.isActive) {
      throw new Error('Cannot delete active theme. Please activate another theme first.')
    }

    return super.delete(id)
  }

  /**
   * Get default theme (fallback when no theme is active)
   */
  getDefaultTheme(): Omit<ITheme, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {
    return {
      name: 'default',
      displayName: 'Mặc Định',
      description: 'Theme mặc định của hệ thống',
      isActive: false,
      colors: {
        primary: 'hsl(262.1 83.3% 57.8%)',
        primaryForeground: 'hsl(210 40% 98%)',
        secondary: 'hsl(220 14.3% 95.9%)',
        secondaryForeground: 'hsl(224 71.4% 4.1%)',
        accent: 'hsl(220 14.3% 95.9%)',
        accentForeground: 'hsl(224 71.4% 4.1%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(224 71.4% 4.1%)',
        muted: 'hsl(220 14.3% 95.9%)',
        mutedForeground: 'hsl(220 8.9% 46.1%)',
        border: 'hsl(220 13% 91%)',
        input: 'hsl(220 13% 91%)',
        ring: 'hsl(262.1 83.3% 57.8%)',
        card: 'hsl(0 0% 100%)',
        cardForeground: 'hsl(224 71.4% 4.1%)',
        popover: 'hsl(0 0% 100%)',
        popoverForeground: 'hsl(224 71.4% 4.1%)',
        destructive: 'hsl(0 84.2% 60.2%)',
        destructiveForeground: 'hsl(210 40% 98%)',
      },
      typography: {
        fontSans: 'Inter, sans-serif',
        fontHeader: 'Inter, sans-serif',
        baseSize: '16px',
        borderRadius: '0.5rem',
      },
      gradients: {
        hero: ['hsl(262.1 83.3% 57.8%)', 'hsl(263.4 70% 50.4%)'],
        card: ['#f8f9fa', '#e9ecef'],
        button: ['hsl(262.1 83.3% 57.8%)', 'hsl(263.4 70% 50.4%)'],
        accent: ['#f093fb', '#f5576c'],
      },
      effects: {
        enableParticles: true,
        particleColor: '#ffffff',
        enableGradientAnimation: true,
        enableGlassEffect: true,
      },
    }
  }
}

export const themeRepository = new ThemeRepository()
