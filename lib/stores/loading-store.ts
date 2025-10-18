/**
 * Global Loading State Management
 * Centralized loading state for better UX feedback
 */

import { create } from 'zustand'

interface LoadingState {
  // Global loading state
  isLoading: boolean
  loadingMessage: string | null

  // Route transition loading
  isNavigating: boolean

  // Specific action loading states
  uploadingFiles: boolean
  uploadProgress: number
  deletingItem: string | null // ID of item being deleted
  approvingPost: string | null // ID of post being approved
  updatingProfile: boolean

  // Actions
  setLoading: (loading: boolean, message?: string) => void
  setNavigating: (navigating: boolean) => void
  setUploading: (uploading: boolean, progress?: number) => void
  setDeleting: (itemId: string | null) => void
  setApproving: (postId: string | null) => void
  setUpdatingProfile: (updating: boolean) => void
  reset: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  // Initial state
  isLoading: false,
  loadingMessage: null,
  isNavigating: false,
  uploadingFiles: false,
  uploadProgress: 0,
  deletingItem: null,
  approvingPost: null,
  updatingProfile: false,

  // Actions
  setLoading: (loading, message) =>
    set({ isLoading: loading, loadingMessage: message || null }),

  setNavigating: (navigating) =>
    set({ isNavigating: navigating }),

  setUploading: (uploading, progress = 0) =>
    set({ uploadingFiles: uploading, uploadProgress: progress }),

  setDeleting: (itemId) =>
    set({ deletingItem: itemId }),

  setApproving: (postId) =>
    set({ approvingPost: postId }),

  setUpdatingProfile: (updating) =>
    set({ updatingProfile: updating }),

  reset: () =>
    set({
      isLoading: false,
      loadingMessage: null,
      isNavigating: false,
      uploadingFiles: false,
      uploadProgress: 0,
      deletingItem: null,
      approvingPost: null,
      updatingProfile: false,
    }),
}))
