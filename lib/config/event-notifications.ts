/**
 * Event Notification Configuration
 * Define special event popups with timing, content, and styling
 */

export interface EventNotificationConfig {
  id: string
  enabled: boolean
  startDate: Date
  endDate: Date
  delayMs: number // Delay before showing popup after page load
  content: {
    front: {
      title: string
      subtitle: string
      icon: string // Emoji or icon
      ctaText: string
    }
    back: {
      title: string
      message: string
      greeting: string
      decorations: string[] // Array of emojis for decoration
    }
  }
  theme: {
    gradient: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4' | 'gradient-5'
    accentColor: string
  }
}

/**
 * Women's Day 20/10 Notification Config
 */
export const womensDay2025Config: EventNotificationConfig = {
  id: 'womens-day-2025',
  enabled: true,
  // Show from Oct 15 to Oct 21, 2025
  startDate: new Date('2025-10-15T00:00:00'),
  endDate: new Date('2025-10-21T23:59:59'),
  delayMs: 2000, // Show after 2 seconds

  content: {
    front: {
      title: '🎉 Sự kiện đặc biệt',
      subtitle: 'Nhấn để khám phá',
      icon: '🎁',
      ctaText: 'Mở thiệp',
    },
    back: {
      title: 'Chúc mừng 20/10! 🌸',
      message: 'Chúc các chị, các cô, các bạn nữ luôn xinh đẹp, tràn đầy năng lượng và thành công rực rỡ!',
      greeting: 'Kính chúc ngày Phụ Nữ Việt Nam 20/10 vui vẻ và hạnh phúc! 💐',
      decorations: ['🌸', '🌺', '💐', '🌷', '🌹', '💝', '✨', '🎀'],
    },
  },

  theme: {
    gradient: 'gradient-5', // Pink/Magenta gradient
    accentColor: 'hsl(var(--gradient-5-start))',
  },
}

/**
 * Get active event notification config
 * Returns null if no active event
 */
export function getActiveEventNotification(): EventNotificationConfig | null {
  const now = new Date()

  // Check Women's Day 2025
  if (
    womensDay2025Config.enabled &&
    now >= womensDay2025Config.startDate &&
    now <= womensDay2025Config.endDate
  ) {
    return womensDay2025Config
  }

  // Add more event configs here in the future
  // Example:
  // if (tetConfig.enabled && now >= tetConfig.startDate && now <= tetConfig.endDate) {
  //   return tetConfig
  // }

  return null
}

/**
 * Check if an event notification should be shown
 */
export function shouldShowEventNotification(eventId: string): boolean {
  const config = getActiveEventNotification()
  if (!config || config.id !== eventId) return false

  // Check if already seen (will be checked again in the component)
  if (typeof window !== 'undefined') {
    const key = `event_notification_seen_${eventId}`
    return localStorage.getItem(key) === null
  }

  return true
}
