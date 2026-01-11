/**
 * Upload Flow Reducer
 * Pure reducer function for upload state management
 */

import type {
  UploadFlowState,
  UploadFlowAction,
  UploadStep,
} from '../types'

// Initial state
export const initialUploadState: UploadFlowState = {
  step: 'event',
  selectedEvent: null,
  files: [],
  wishText: '',
  uploadProgress: 0,
  fileProgress: [],
  error: null,
  isUploading: false,
}

// Step order for navigation
export const STEP_ORDER: UploadStep[] = ['event', 'media', 'preview', 'uploading', 'success']

// Reducer for state management
export function uploadFlowReducer(state: UploadFlowState, action: UploadFlowAction): UploadFlowState {
  switch (action.type) {
    case 'SELECT_EVENT':
      return { ...state, selectedEvent: action.event, step: 'media', error: null }

    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.files], error: null }

    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.fileId),
        error: null,
      }

    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map((f) => (f.id === action.fileId ? action.file : f)),
      }

    case 'CLEAR_FILES':
      return { ...state, files: [], error: null }

    case 'SET_WISH_TEXT':
      return { ...state, wishText: action.text }

    case 'SET_STEP':
      return { ...state, step: action.step, error: null }

    case 'START_UPLOAD':
      return { ...state, isUploading: true, step: 'uploading', error: null }

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        uploadProgress: action.progress,
        fileProgress: action.fileProgress,
      }

    case 'UPLOAD_SUCCESS':
      return { ...state, isUploading: false, step: 'success' }

    case 'UPLOAD_ERROR':
      return { ...state, isUploading: false, error: action.error }

    case 'RESET':
      return { ...initialUploadState }

    case 'GO_BACK': {
      const currentIndex = STEP_ORDER.indexOf(state.step)
      if (currentIndex > 0 && state.step !== 'uploading') {
        return { ...state, step: STEP_ORDER[currentIndex - 1], error: null }
      }
      return state
    }

    default:
      return state
  }
}
