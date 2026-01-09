import mongoose, { Document, Model, Types } from 'mongoose'
import { nanoid } from 'nanoid'

/**
 * Workflow Types
 */
export type WorkflowType = 'auto-archive' | 'media-cleanup' | 'security-scan' | 'custom'
export type WorkflowStatus = 'active' | 'disabled'

/**
 * Workflow Interface (without id to avoid Document conflict)
 */
export interface IWorkflowBase {
  type: WorkflowType
  name: string
  description: string
  status: WorkflowStatus
  // Schedule config (cron expression or interval)
  schedule?: {
    enabled: boolean
    cron?: string  // e.g., '0 0 * * *' (daily at midnight)
    intervalHours?: number
  }
  // Last execution info
  lastRun?: Date
  lastRunResult?: 'success' | 'failed' | 'partial'
  lastRunMessage?: string
  // Execution stats
  runCount: number
  successCount: number
  failedCount: number
  // Config for custom workflows
  config?: Record<string, unknown>
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Full interface with id for client-side use
export interface IWorkflow extends IWorkflowBase {
  id: string
}

export interface IWorkflowDocument extends IWorkflowBase, Document {
  id: string  // Override Document's id with string type
}

export interface IWorkflowModel extends Model<IWorkflowDocument> {
  findByType(type: WorkflowType): Promise<IWorkflowDocument | null>
}

/**
 * Predefined workflow templates
 */
export const WORKFLOW_TEMPLATES: Omit<IWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'failedCount'>[] = [
  {
    type: 'auto-archive',
    name: 'Tự động lưu trữ sự kiện',
    description: 'Tự động chuyển trạng thái sự kiện sang "archived" sau khi qua ngày kết thúc',
    status: 'active',
    schedule: {
      enabled: true,
      cron: '0 2 * * *',  // Run at 2 AM daily
    },
  },
  {
    type: 'media-cleanup',
    name: 'Dọn dẹp media',
    description: 'Xác định và xóa các file media không còn liên kết với bài đăng nào',
    status: 'active',
    schedule: {
      enabled: true,
      intervalHours: 168, // Weekly
    },
  },
  {
    type: 'security-scan',
    name: 'Quét bảo mật',
    description: 'Quét audit logs để phát hiện các hoạt động đăng nhập đáng ngờ',
    status: 'disabled',
    schedule: {
      enabled: false,
    },
  },
]

/**
 * Workflow Schema
 */
const workflowSchema = new mongoose.Schema<IWorkflowDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(),
    },
    type: {
      type: String,
      required: true,
      enum: ['auto-archive', 'media-cleanup', 'security-scan', 'custom'],
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'disabled'],
      default: 'disabled',
    },
    schedule: {
      enabled: { type: Boolean, default: false },
      cron: { type: String },
      intervalHours: { type: Number },
    },
    lastRun: { type: Date },
    lastRunResult: {
      type: String,
      enum: ['success', 'failed', 'partial'],
    },
    lastRunMessage: { type: String },
    runCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    config: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
)

// Static method to find by type
workflowSchema.statics.findByType = function (type: WorkflowType) {
  return this.findOne({ type })
}

/**
 * Get Workflow Model (handles hot reload in development)
 */
export function getWorkflowModel(): IWorkflowModel {
  return (mongoose.models.Workflow as IWorkflowModel) ||
    mongoose.model<IWorkflowDocument, IWorkflowModel>('Workflow', workflowSchema)
}

export default getWorkflowModel
