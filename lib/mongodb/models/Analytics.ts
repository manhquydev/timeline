import mongoose, { Schema, Model, Document } from 'mongoose'

/**
 * Analytics Event Types
 */
export type AnalyticsEventType = 
  | 'page_view' 
  | 'click' 
  | 'upload' 
  | 'download' 
  | 'session_start' 
  | 'session_end'
  | 'error'

/**
 * Analytics Interface for TypeScript
 */
export interface IAnalytics {
  event_id?: string | null
  user_id?: string | null
  type: AnalyticsEventType | string
  page: string
  timestamp: Date
  source?: string | null
  device?: 'mobile' | 'tablet' | 'desktop' | string
  browser?: string | null
  os?: string | null
  metadata: Record<string, any>
  metrics: {
    duration?: number // in milliseconds
    value?: number    // numeric value (e.g., upload size in bytes)
    count?: number
  }
}

export interface IAnalyticsDocument extends Document, IAnalytics {}

const AnalyticsSchema = new Schema<IAnalyticsDocument>(
  {
    event_id: {
      type: String,
      default: null,
      index: true,
    },
    user_id: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    page: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      default: 'direct',
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: null,
    },
    os: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metrics: {
      duration: {
        type: Number,
        default: 0,
      },
      value: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 1,
      },
    }
  },
  {
    timestamps: false,
    collection: 'analytics_events',
  }
)

// Compound indexes for common queries
AnalyticsSchema.index({ timestamp: -1, type: 1 })
AnalyticsSchema.index({ event_id: 1, type: 1, timestamp: -1 })
AnalyticsSchema.index({ type: 1, page: 1, timestamp: -1 })

// Prevent model recompilation in development
const Analytics: Model<IAnalyticsDocument> =
  mongoose.models.Analytics || mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema)

export default Analytics
