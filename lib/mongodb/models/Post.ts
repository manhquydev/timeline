import mongoose, { Schema, Model, Document } from 'mongoose'

// Post media type enum
export type MediaType = 'image' | 'video'

// Post status enum
export type PostStatus = 'pending' | 'approved' | 'rejected'

// Post interface for TypeScript
export interface IPost {
  id: string
  event_id: string
  user_id?: string | null
  media_type: MediaType
  media_url: string
  thumbnail_url?: string | null
  blurhash?: string | null
  dimensions: {
    width?: number | null
    height?: number | null
  }
  file_size?: number | null
  wish_text?: string | null
  uploaded_at: Date
  view_count: number
  status: PostStatus
  user_name?: string | null
  likes_count?: number
  comments_count?: number
}

// Document interface (includes MongoDB _id)
export interface IPostDocument extends Omit<Document, 'id'>, IPost { }

// Post Schema
const PostSchema = new Schema<IPostDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    event_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      default: null,
    },
    media_type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    media_url: {
      type: String,
      required: true,
    },
    thumbnail_url: {
      type: String,
      default: null,
    },
    blurhash: {
      type: String,
      default: null,
    },
    dimensions: {
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },
    file_size: {
      type: Number,
      default: null,
    },
    wish_text: {
      type: String,
      trim: true,
      default: null,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
    view_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    user_name: {
      type: String,
      default: null,
    },
    likes_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: false,
    collection: 'posts',
  }
)

// Compound indexes for better query performance
PostSchema.index({ event_id: 1, uploaded_at: -1 })
PostSchema.index({ event_id: 1, status: 1, uploaded_at: -1 })
PostSchema.index({ user_id: 1, uploaded_at: -1 })
PostSchema.index({ status: 1, uploaded_at: -1 })

// Instance methods
PostSchema.methods.incrementViewCount = async function () {
  this.view_count += 1
  return this.save()
}

PostSchema.methods.approve = async function () {
  this.status = 'approved'
  return this.save()
}

PostSchema.methods.reject = async function () {
  this.status = 'rejected'
  return this.save()
}

// Static methods
PostSchema.statics.findByEvent = function (eventId: string, status?: PostStatus) {
  const query: any = { event_id: eventId }
  if (status) {
    query.status = status
  }
  return this.find(query).sort({ uploaded_at: -1 })
}

PostSchema.statics.findByUser = function (userId: string) {
  return this.find({ user_id: userId }).sort({ uploaded_at: -1 })
}

PostSchema.statics.findApproved = function (eventId?: string) {
  const query: any = { status: 'approved' }
  if (eventId) {
    query.event_id = eventId
  }
  return this.find(query).sort({ uploaded_at: -1 })
}

PostSchema.statics.countByEvent = function (eventId: string) {
  return this.countDocuments({ event_id: eventId })
}

PostSchema.statics.countByMediaType = function (eventId: string, mediaType: MediaType) {
  return this.countDocuments({ event_id: eventId, media_type: mediaType })
}

// Prevent model recompilation in development
const Post: Model<IPostDocument> =
  mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema)

export default Post
