/**
 * Story Mode State Management
 * Controls visibility of MobileBottomNav when story view is active
 */

import { create } from 'zustand'

interface StoryModeState {
  isStoryMode: boolean
  setStoryMode: (active: boolean) => void
}

export const useStoryModeStore = create<StoryModeState>((set) => ({
  isStoryMode: false,
  setStoryMode: (active) => set({ isStoryMode: active }),
}))
