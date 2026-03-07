import { ITheme } from '../mongodb/models/Theme'

/**
 * Predefined themes for the application
 * These can be seeded into the database
 */

export const THEME_20_10: Omit<ITheme, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'> = {
  name: '20-10',
  displayName: '🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸',
  description: 'Theme chào mừng Ngày Phụ Nữ Việt Nam với hiệu ứng hoa rơi lung linh',
  colors: {
    // Main colors - Elegant pink & purple palette with rose gold touch
    primary: 'hsl(340 90% 65%)',        // Vibrant rose pink (brighter)
    primaryForeground: '#ffffff',
    secondary: 'hsl(280 70% 88%)',      // Light lavender (softer)
    secondaryForeground: 'hsl(280 15% 20%)',
    accent: 'hsl(350 85% 70%)',         // Coral pink (warmer)
    accentForeground: '#ffffff',

    // Background & surfaces - Softer, more romantic
    background: 'hsl(330 30% 98%)',     // Very light pink-white (warmer)
    foreground: 'hsl(280 15% 20%)',     // Dark purple-gray

    // Muted elements
    muted: 'hsl(320 25% 95%)',          // Light pink-gray
    mutedForeground: 'hsl(280 10% 50%)', // Medium purple-gray

    // Borders & cards
    border: 'hsl(330 35% 90%)',         // Soft pink border
    input: 'hsl(330 35% 90%)',          // Match border
    ring: 'hsl(340 90% 65%)',           // Match primary
    card: 'hsl(330 40% 99%)',           // Very light pink card
    cardForeground: 'hsl(280 15% 20%)', // Dark purple-gray
    popover: 'hsl(330 40% 99%)',        // Match card
    popoverForeground: 'hsl(280 15% 20%)', // Match card foreground
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
  },
  gradients: {
    // Hero gradient - Romantic pink to purple with rose gold
    hero: [
      'hsl(340 90% 65%)',  // Vibrant rose pink
      'hsl(330 85% 68%)',  // Rose gold pink
      'hsl(310 80% 72%)',  // Medium orchid
      'hsl(280 75% 75%)',  // Lavender
    ],
    // Card gradients - Soft romantic gradient
    card: [
      'hsl(350 85% 70%)',  // Coral pink
      'hsl(330 85% 68%)',  // Rose gold
      'hsl(310 80% 72%)',  // Light orchid
    ],
    // Button gradients - Vibrant but elegant with rose gold
    button: [
      'hsl(340 90% 65%)',  // Vibrant rose pink
      'hsl(320 85% 68%)',  // Rose gold
      'hsl(300 80% 70%)',  // Orchid
    ],
    // Accent gradients - Warm complementary colors
    accent: [
      'hsl(350 90% 72%)',  // Light coral pink
      'hsl(340 85% 68%)',  // Warm rose
      'hsl(330 80% 70%)',  // Rose gold
    ],
  },
  typography: {
    fontSans: 'Inter, sans-serif',
    fontHeader: 'Inter, sans-serif',
    baseSize: '16px',
    borderRadius: '0.5rem',
  },
  effects: {
    enableParticles: true,
    particleColor: '#FFB6D9',  // Light pink particles (rose)
    enableGradientAnimation: true,
    enableGlassEffect: true,
  },
  coverImage: undefined,
  icon: undefined,
}

export const THEME_DEFAULT: Omit<ITheme, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'> = {
  name: 'default',
  displayName: 'Mặc Định',
  description: 'Theme mặc định của hệ thống với tông màu xanh tím chuyên nghiệp',
  colors: {
    primary: 'hsl(262.1 83.3% 57.8%)',
    primaryForeground: 'hsl(210 40% 98%)',
    secondary: 'hsl(220 14.3% 95.9%)',
    secondaryForeground: 'hsl(222.2 47.4% 11.2%)',
    accent: 'hsl(220 14.3% 95.9%)',
    accentForeground: 'hsl(222.2 47.4% 11.2%)',
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
  gradients: {
    hero: ['#667eea', '#764ba2', '#f093fb'],
    card: ['#667eea', '#764ba2'],
    button: ['#667eea', '#764ba2'],
    accent: ['#f093fb', '#f5576c'],
  },
  typography: {
    fontSans: 'Inter, sans-serif',
    fontHeader: 'Inter, sans-serif',
    baseSize: '16px',
    borderRadius: '0.5rem',
  },
  effects: {
    enableParticles: true,
    particleColor: '#ffffff',
    enableGradientAnimation: true,
    enableGlassEffect: true,
  },
  coverImage: undefined,
  icon: undefined,
}

export const THEME_8_3: Omit<ITheme, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'> = {
  name: '8-3',
  displayName: '🌹 Ngày Quốc Tế Phụ Nữ 8/3 🌹',
  description: 'Theme chào mừng Ngày Quốc Tế Phụ Nữ với sắc đỏ hồng tươi thắm và vàng rực rỡ',
  colors: {
    // Bold crimson-rose + warm gold — distinctly different from the soft 20/10 pastel palette
    primary: 'hsl(350 85% 52%)',          // Deep crimson rose
    primaryForeground: '#ffffff',
    secondary: 'hsl(38 95% 60%)',         // Warm golden amber
    secondaryForeground: 'hsl(20 30% 15%)',
    accent: 'hsl(330 80% 60%)',           // Hot magenta-rose
    accentForeground: '#ffffff',

    background: 'hsl(350 25% 98%)',       // Warm white with rose tint
    foreground: 'hsl(340 20% 15%)',       // Deep rose-black

    muted: 'hsl(350 20% 94%)',            // Very light rose-gray
    mutedForeground: 'hsl(340 12% 48%)',  // Medium rose-gray

    border: 'hsl(350 30% 88%)',           // Soft rose border
    input: 'hsl(350 30% 88%)',
    ring: 'hsl(350 85% 52%)',
    card: 'hsl(350 30% 99%)',             // Near-white with warm tint
    cardForeground: 'hsl(340 20% 15%)',
    popover: 'hsl(350 30% 99%)',
    popoverForeground: 'hsl(340 20% 15%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
  },
  gradients: {
    // Hero: rich red → rose → magenta → violet — bold & celebratory
    hero: [
      'hsl(350 90% 50%)',   // Deep crimson
      'hsl(340 85% 55%)',   // Rose red
      'hsl(320 80% 58%)',   // Magenta rose
      'hsl(300 70% 60%)',   // Vibrant violet
    ],
    // Card: warm red-gold duo
    card: [
      'hsl(350 85% 55%)',   // Rose red
      'hsl(30 90% 58%)',    // Golden orange
    ],
    // Button: red → hot rose
    button: [
      'hsl(350 90% 50%)',
      'hsl(330 85% 55%)',
      'hsl(310 75% 60%)',
    ],
    // Accent: gold → amber
    accent: [
      'hsl(45 95% 60%)',
      'hsl(38 90% 58%)',
      'hsl(28 85% 55%)',
    ],
  },
  typography: {
    fontSans: 'Inter, sans-serif',
    fontHeader: 'Inter, sans-serif',
    baseSize: '16px',
    borderRadius: '0.5rem',
  },
  effects: {
    enableParticles: true,
    particleColor: '#FF4D6D',   // Vivid rose-red petals
    enableGradientAnimation: true,
    enableGlassEffect: true,
  },
  coverImage: undefined,
  icon: undefined,
}

export const PREDEFINED_THEMES = [
  THEME_DEFAULT,
  THEME_20_10,
  THEME_8_3,
]

/**
 * Helper function to convert HSL to hex for CSS
 */
export function hslToHex(hsl: string): string {
  // Extract h, s, l values from hsl string
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/)
  if (!match) return hsl

  const h = parseFloat(match[1])
  const s = parseFloat(match[2]) / 100
  const l = parseFloat(match[3]) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
