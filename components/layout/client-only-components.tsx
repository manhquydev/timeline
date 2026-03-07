/**
 * Client-only components wrapper for lazy loading
 * Used in layout to avoid SSR issues
 */

'use client'

import dynamic from 'next/dynamic'

// Lazy load heavy animation components (client-side only)
export const EventNotificationPopup = dynamic(
  () => import("@/components/event-notifications").then(mod => ({ default: mod.EventNotificationPopup })),
  { ssr: false }
)

export const FallingPetals = dynamic(
  () => import("@/components/theme/falling-petals").then(mod => ({ default: mod.FallingPetals })),
  { ssr: false }
)

export const ThemeAwareEffects = dynamic(
  () => import("@/components/theme/theme-aware-effects").then(mod => ({ default: mod.ThemeAwareEffects })),
  { ssr: false }
)

export const AppUpdatePrompt = dynamic(
  () => import("@/components/layout/app-update-prompt").then(mod => ({ default: mod.AppUpdatePrompt })),
  { ssr: false }
)
