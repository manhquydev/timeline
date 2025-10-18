import { ITheme } from '../mongodb/models/Theme'

/**
 * Predefined themes for the application
 * These can be seeded into the database
 */

export const THEME_20_10: Omit<ITheme, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'> = {
  name: '20-10',
  displayName: '🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸',
  description: 'Theme thanh lịch, lãng mạn với tông màu hồng rose gold và tím lavender, tôn vinh vẻ đẹp và sức mạnh của phụ nữ. Kèm hiệu ứng hoa rơi lung linh.',
  colors: {
    // Main colors - Elegant pink & purple palette with rose gold touch
    primary: 'hsl(340 90% 65%)',        // Vibrant rose pink (brighter)
    secondary: 'hsl(280 70% 88%)',      // Light lavender (softer)
    accent: 'hsl(350 85% 70%)',         // Coral pink (warmer)

    // Background & surfaces - Softer, more romantic
    background: 'hsl(330 30% 98%)',     // Very light pink-white (warmer)
    foreground: 'hsl(280 15% 20%)',     // Dark purple-gray

    // Muted elements
    muted: 'hsl(320 25% 95%)',          // Light pink-gray
    mutedForeground: 'hsl(280 10% 50%)', // Medium purple-gray

    // Borders & cards
    border: 'hsl(330 35% 90%)',         // Soft pink border
    card: 'hsl(330 40% 99%)',           // Very light pink card
    cardForeground: 'hsl(280 15% 20%)', // Dark purple-gray
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
