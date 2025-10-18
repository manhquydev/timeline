/**
 * Event Notification Popup State Management
 * Tracks which event popups have been shown to users
 */

import { create } from 'zustand'

interface EventPopupState {
  // Current popup state
  isOpen: boolean
  currentEventId: string | null
  isFlipped: boolean

  // Actions
  openPopup: (eventId: string) => void
  closePopup: () => void
  flipCard: () => void
  markAsSeen: (eventId: string) => void
  hasSeenPopup: (eventId: string) => boolean
  reset: () => void
}

// LocalStorage key prefix
const STORAGE_KEY_PREFIX = 'event_notification_seen_'

export const useEventPopupStore = create<EventPopupState>((set, get) => ({
  // Initial state
  isOpen: false,
  currentEventId: null,
  isFlipped: false,

  // Open popup for specific event
  openPopup: (eventId) => {
    const hasSeenPopup = get().hasSeenPopup(eventId)
    if (!hasSeenPopup) {
      set({
        isOpen: true,
        currentEventId: eventId,
        isFlipped: false,
      })
    }
  },

  // Close popup and mark as seen
  closePopup: () => {
    const { currentEventId } = get()
    if (currentEventId) {
      get().markAsSeen(currentEventId)
    }
    set({
      isOpen: false,
      currentEventId: null,
      isFlipped: false,
    })
  },

  // Flip the card (front to back)
  flipCard: () => {
    set({ isFlipped: true })
  },

  // Mark event popup as seen in localStorage
  markAsSeen: (eventId) => {
    if (typeof window !== 'undefined') {
      const key = `${STORAGE_KEY_PREFIX}${eventId}`
      localStorage.setItem(key, new Date().toISOString())
    }
  },

  // Check if user has seen this event's popup
  hasSeenPopup: (eventId) => {
    if (typeof window === 'undefined') return false
    const key = `${STORAGE_KEY_PREFIX}${eventId}`
    return localStorage.getItem(key) !== null
  },

  // Reset state
  reset: () => {
    set({
      isOpen: false,
      currentEventId: null,
      isFlipped: false,
    })
  },
}))
