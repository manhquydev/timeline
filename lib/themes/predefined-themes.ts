import { ITheme } from '../mongodb/models/Theme'

/**
 * Predefined themes for the application
 * These can be seeded into the database
 */

export const THEME_20_10: Omit<ITheme, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'> = {
  name: '20-10',
  displayName: 'Ngày Phụ Nữ Việt Nam 20/10',
  description: 'Theme thanh lịch, chuyên nghiệp với tông màu hồng pastel và tím lavender, tôn vinh vẻ đẹp và sức mạnh của phụ nữ',
  colors: {
    // Main colors - Elegant pink & purple palette
    primary: 'hsl(330 81% 60%)',        // Rose pink
    secondary: 'hsl(280 70% 90%)',      // Light lavender
    accent: 'hsl(340 82% 65%)',         // Vibrant pink

    // Background & surfaces
    background: 'hsl(300 20% 98%)',     // Very light purple-white
    foreground: 'hsl(280 15% 25%)',     // Dark purple-gray

    // Muted elements
    muted: 'hsl(290 20% 94%)',          // Light purple-gray
    mutedForeground: 'hsl(280 10% 45%)', // Medium purple-gray

    // Borders & cards
    border: 'hsl(290 30% 88%)',         // Soft purple border
    card: 'hsl(0 0% 100%)',             // Pure white
    cardForeground: 'hsl(280 15% 25%)', // Dark purple-gray
  },
  gradients: {
    // Hero gradient - Elegant pink to purple
    hero: [
      'hsl(330 81% 60%)',  // Rose pink
      'hsl(310 70% 65%)',  // Medium orchid
      'hsl(280 70% 70%)',  // Lavender
    ],
    // Card gradients - Soft and professional
    card: [
      'hsl(330 81% 60%)',  // Rose pink
      'hsl(310 70% 65%)',  // Medium orchid
    ],
    // Button gradients - Vibrant but elegant
    button: [
      'hsl(340 82% 65%)',  // Vibrant pink
      'hsl(320 75% 60%)',  // Hot pink
    ],
    // Accent gradients - Complementary colors
    accent: [
      'hsl(350 85% 70%)',  // Light coral pink
      'hsl(330 80% 65%)',  // Rose
    ],
  },
  effects: {
    enableParticles: true,
    particleColor: 'hsl(330 81% 80%)',  // Light pink particles
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
  coverImage: undefined,
  icon: undefined,
}

export const PREDEFINED_THEMES = [
  THEME_DEFAULT,
  THEME_20_10,
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
