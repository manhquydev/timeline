import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGreeting {
  id: string
  authorId: string | null
  authorName: string
  message: string
  eventTag: string
  createdAt: Date
  isApproved: boolean
  isDeleted: boolean
}

export interface IGreetingDocument extends Omit<Document, 'id'>, IGreeting {}

const GreetingSchema = new Schema<IGreetingDocument>(
  {
    id: { type: String, required: true, unique: true },
    authorId: { type: String, default: null },
    authorName: { type: String, required: true, default: 'Ẩn danh' },
    message: { type: String, required: true, minlength: 1, maxlength: 280 },
    eventTag: { type: String, required: true, default: '8-3', index: true },
    isApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

GreetingSchema.index({ eventTag: 1, isApproved: 1, isDeleted: 1 })

type GreetingModel = Model<IGreetingDocument>

const Greeting: GreetingModel =
  (mongoose.models.Greeting as GreetingModel) ||
  mongoose.model<IGreetingDocument>('Greeting', GreetingSchema)

export default Greeting
