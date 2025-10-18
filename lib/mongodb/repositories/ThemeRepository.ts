import Theme, { ITheme, IThemeDocument } from '../models/Theme'
import { nanoid } from 'nanoid'

export class ThemeRepository {
  /**
   * Find the currently active theme
   */
  async findActive(): Promise<IThemeDocument | null> {
    return await Theme.findOne({ isActive: true })
  }

  /**
   * Find all themes
   */
  async findAll(): Promise<IThemeDocument[]> {
    return await Theme.find().sort({ createdAt: -1 })
  }

  /**
   * Find theme by ID
   */
  async findById(id: string): Promise<IThemeDocument | null> {
    return await Theme.findOne({ id })
  }

  /**
   * Find theme by name
   */
  async findByName(name: string): Promise<IThemeDocument | null> {
    return await Theme.findOne({ name })
  }

  /**
   * Create a new theme
   */
  async create(themeData: Omit<ITheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<IThemeDocument> {
    const theme = new Theme({
      ...themeData,
      id: nanoid(),
    })
    return await theme.save()
  }

  /**
   * Update a theme
   */
  async update(id: string, updates: Partial<ITheme>): Promise<IThemeDocument | null> {
    return await Theme.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    )
  }

  /**
   * Set a theme as active (automatically deactivates others)
   */
  async setActive(id: string): Promise<IThemeDocument | null> {
    // First, deactivate all themes
    await Theme.updateMany(
      {},
      { $set: { isActive: false } }
    )

    // Then activate the requested theme
    return await Theme.findOneAndUpdate(
      { id },
      { $set: { isActive: true } },
      { new: true }
    )
  }

  /**
   * Delete a theme
   */
  async delete(id: string): Promise<boolean> {
    const theme = await Theme.findOne({ id })
    if (!theme) return false

    // Prevent deleting active theme
    if (theme.isActive) {
      throw new Error('Cannot delete active theme. Please activate another theme first.')
    }

    await Theme.deleteOne({ id })
    return true
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
        secondary: 'hsl(220 14.3% 95.9%)',
        accent: 'hsl(220 14.3% 95.9%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(224 71.4% 4.1%)',
        muted: 'hsl(220 14.3% 95.9%)',
        mutedForeground: 'hsl(220 8.9% 46.1%)',
        border: 'hsl(220 13% 91%)',
        card: 'hsl(0 0% 100%)',
        cardForeground: 'hsl(224 71.4% 4.1%)',
      },
      gradients: {
        hero: ['#667eea', '#764ba2', '#f093fb'],
        card: ['#667eea', '#764ba2'],
        button: ['#667eea', '#764ba2'],
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
