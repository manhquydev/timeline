import mongoose, { Schema, Model, Document } from 'mongoose'

// Social links interface
export interface SocialLinks {
  github?: string | null
  linkedin?: string | null
  email?: string | null
  facebook?: string | null
}

// TeamMember interface for TypeScript
export interface ITeamMember {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  description?: string | null
  bio?: string | null
  order: number
  social_links?: SocialLinks
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Document interface (includes MongoDB _id)
export interface ITeamMemberDocument extends Omit<Document, 'id'>, ITeamMember {}

// Model interface (includes static methods)
export interface ITeamMemberModel extends Model<ITeamMemberDocument> {
  findActive(): Promise<ITeamMemberDocument[]>
  findAll(): Promise<ITeamMemberDocument[]>
  getNextOrder(): Promise<number>
}

// TeamMember Schema
const TeamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    social_links: {
      github: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
      facebook: {
        type: String,
        default: null,
      },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'team_members',
  }
)

// Indexes for better query performance
TeamMemberSchema.index({ order: 1 })
TeamMemberSchema.index({ is_active: 1, order: 1 })
TeamMemberSchema.index({ created_at: -1 })

// Instance methods
TeamMemberSchema.methods.activate = async function () {
  this.is_active = true
  return this.save()
}

TeamMemberSchema.methods.deactivate = async function () {
  this.is_active = false
  return this.save()
}

// Static methods
TeamMemberSchema.statics.findActive = function () {
  return this.find({ is_active: true }).sort({ order: 1 })
}

TeamMemberSchema.statics.findAll = function () {
  return this.find().sort({ order: 1 })
}

TeamMemberSchema.statics.getNextOrder = async function () {
  const lastMember = await this.findOne().sort({ order: -1 })
  return lastMember ? lastMember.order + 1 : 0
}

// Prevent model recompilation in development
const TeamMember: ITeamMemberModel =
  (mongoose.models.TeamMember as ITeamMemberModel) || mongoose.model<ITeamMemberDocument, ITeamMemberModel>('TeamMember', TeamMemberSchema)

export default TeamMember
