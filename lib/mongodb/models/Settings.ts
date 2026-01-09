import mongoose from 'mongoose'

/**
 * Settings Interface
 * Used for type-safe settings access across the application
 */
export interface SiteSettings {
  name: string
  description: string
  maintenanceMode: boolean
}

export interface UploadSettings {
  maxFileSize: number // MB
  allowedTypes: string[]
  autoApprove: boolean
  compressionQuality: number // 0-100
}

export interface NotificationSettings {
  emailOnNewPost: boolean
  emailOnNewUser: boolean
  emailOnPendingReview: boolean
}

export interface GlobalSettings {
  site: SiteSettings
  upload: UploadSettings
  notifications: NotificationSettings
}

export interface ISettings {
  key: string
  value: GlobalSettings
  updatedAt: Date
  updatedBy?: string
}

/**
 * Default settings structure
 */
export const DEFAULT_SETTINGS: GlobalSettings = {
  site: {
    name: 'Timeline Teky Hoàng Mai',
    description: 'Lưu giữ kỷ niệm công ty qua từng sự kiện',
    maintenanceMode: false,
  },
  upload: {
    maxFileSize: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    autoApprove: false,
    compressionQuality: 80,
  },
  notifications: {
    emailOnNewPost: true,
    emailOnNewUser: true,
    emailOnPendingReview: true,
  },
}

/**
 * Settings Schema
 */
const settingsSchema = new mongoose.Schema<ISettings>({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String },
})

/**
 * Get Settings Model (handles hot reload in development)
 * Always use this function instead of direct model access to avoid
 * "Cannot overwrite model once compiled" errors
 */
export function getSettingsModel() {
  return mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema)
}
