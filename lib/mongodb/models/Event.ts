import mongoose, { Schema, Model, Document } from 'mongoose'

// Event status enum
export type EventStatus = 'draft' | 'open' | 'closed' | 'archived'

// Event interface for TypeScript
export interface IEvent {
  id: string
  title: string
  description?: string | null
  slug: string
  event_date: Date
  start_date: Date
  end_date?: Date | null
  status: EventStatus
  allow_upload: boolean
  allow_wishes: boolean
  cover_image_url?: string | null
  stats: {
    total_photos: number
    total_videos: number
    total_contributors: number
  }
  branding: {
    logo_url?: string | null
    banner_url?: string | null
    primary_color?: string | null
    custom_domain?: string | null
  }
  theme_id?: string | null
  created_at: Date
  updated_at: Date
}

// Document interface (includes MongoDB _id)
export interface IEventDocument extends Omit<Document, 'id'>, IEvent { }

// Event Schema
const EventSchema = new Schema<IEventDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    event_date: {
      type: Date,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'archived'],
      default: 'draft',
    },
    allow_upload: {
      type: Boolean,
      default: true,
    },
    allow_wishes: {
      type: Boolean,
      default: true,
    },
    cover_image_url: {
      type: String,
      default: null,
    },
    stats: {
      total_photos: { type: Number, default: 0, min: 0 },
      total_videos: { type: Number, default: 0, min: 0 },
      total_contributors: { type: Number, default: 0, min: 0 },
    },
    branding: {
      logo_url: { type: String, default: null },
      banner_url: { type: String, default: null },
      primary_color: { type: String, default: null },
      custom_domain: { type: String, default: null },
    },
    theme_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'events',
  }
)

// Indexes for better query performance
EventSchema.index({ status: 1, event_date: -1 })
EventSchema.index({ created_at: -1 })
EventSchema.index({ event_date: -1 })
EventSchema.index({ title: 1 })

// Virtual for URL
EventSchema.virtual('url').get(function () {
  return `/events/${this.slug}`
})

// Instance methods
EventSchema.methods.incrementPhotoCount = async function (count = 1) {
  this.stats.total_photos += count
  return this.save()
}

EventSchema.methods.incrementVideoCount = async function (count = 1) {
  this.stats.total_videos += count
  return this.save()
}

EventSchema.methods.incrementContributorCount = async function (count = 1) {
  this.stats.total_contributors += count
  return this.save()
}

// Static methods
EventSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug })
}

EventSchema.statics.findPublic = function () {
  return this.find({ status: { $in: ['open', 'closed'] } }).sort({ event_date: -1 })
}

EventSchema.statics.findByStatus = function (status: EventStatus) {
  return this.find({ status }).sort({ event_date: -1 })
}

// Prevent model recompilation in development
const Event: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema)

export default Event
