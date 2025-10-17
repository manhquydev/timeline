import mongoose, { Schema, Document, Model } from 'mongoose'

// Theme color configuration
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  card: string
  cardForeground: string
}

// Theme gradients configuration
export interface ThemeGradients {
  hero: string[]
  card: string[]
  button: string[]
  accent: string[]
}

// Theme animations and effects
export interface ThemeEffects {
  enableParticles: boolean
  particleColor: string
  enableGradientAnimation: boolean
  enableGlassEffect: boolean
}

// Full theme configuration
export interface ITheme {
  id: string
  name: string
  displayName: string
  description: string
  colors: ThemeColors
  gradients: ThemeGradients
  effects: ThemeEffects
  coverImage?: string
  icon?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface IThemeDocument extends Omit<Document, 'id'>, ITheme {}

const ThemeSchema = new Schema<IThemeDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    colors: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      accent: { type: String, required: true },
      background: { type: String, required: true },
      foreground: { type: String, required: true },
      muted: { type: String, required: true },
      mutedForeground: { type: String, required: true },
      border: { type: String, required: true },
      card: { type: String, required: true },
      cardForeground: { type: String, required: true },
    },
    gradients: {
      hero: [{ type: String }],
      card: [{ type: String }],
      button: [{ type: String }],
      accent: [{ type: String }],
    },
    effects: {
      enableParticles: { type: Boolean, default: true },
      particleColor: { type: String, default: '#ffffff' },
      enableGradientAnimation: { type: Boolean, default: true },
      enableGlassEffect: { type: Boolean, default: true },
    },
    coverImage: String,
    icon: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure only one theme is active at a time
ThemeSchema.pre('save', async function (next) {
  if (this.isActive) {
    await this.model('Theme').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    )
  }
  next()
})

// Indexes
// Note: 'name' already has unique index from schema definition
// Only add compound indexes if needed for query optimization
ThemeSchema.index({ isActive: 1 })

let ThemeModel: Model<IThemeDocument>

try {
  // Try to get existing model
  ThemeModel = mongoose.model<IThemeDocument>('Theme')
} catch {
  // Create new model if it doesn't exist
  ThemeModel = mongoose.model<IThemeDocument>('Theme', ThemeSchema)
}

export default ThemeModel
