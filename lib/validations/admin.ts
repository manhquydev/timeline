import { z } from 'zod'
import { idSchema, postStatusSchema, emailSchema, shortTextSchema, urlSchema } from './common'

// User role schema
export const userRoleSchema = z.enum(['user', 'moderator', 'admin', 'super_admin'])

// Update user role schema
export const updateUserRoleSchema = z.object({
  userId: idSchema,
  role: userRoleSchema,
})

// Delete user schema
export const deleteUserSchema = z.object({
  userId: idSchema,
})

// User ID query schema (for DELETE /api/admin/users?userId=xxx)
export const userIdQuerySchema = z.object({
  userId: idSchema,
})

// Batch moderate posts schema
export const batchModeratePostsSchema = z.object({
  postIds: z.array(idSchema).min(1).max(100),
  status: postStatusSchema,
  reason: z.string().max(500).optional(),
})

// Team member schemas
export const createTeamMemberSchema = z.object({
  name: shortTextSchema,
  role: shortTextSchema,
  bio: z.string().max(500).optional(),
  avatar_url: urlSchema.optional().nullable(),
  order: z.number().int().min(0).optional(),
})

export const updateTeamMemberSchema = z.object({
  id: idSchema,
  name: shortTextSchema.optional(),
  role: shortTextSchema.optional(),
  bio: z.string().max(500).optional(),
  avatar_url: urlSchema.optional().nullable(),
  order: z.number().int().min(0).optional(),
})

export const reorderTeamMembersSchema = z.object({
  members: z.array(z.object({
    id: idSchema,
    order: z.number().int().min(0),
  })).min(1),
})

// Theme schemas
export const activateThemeSchema = z.object({
  themeId: idSchema,
})

export const updateThemeSchema = z.object({
  themeId: idSchema,
  displayName: shortTextSchema.optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
})

// Analytics export schema
export const analyticsExportSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['json', 'csv']).default('json'),
})

// Theme create schema
export const createThemeSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: shortTextSchema,
  description: z.string().max(500).optional(),
  colors: z.record(z.string()),
  gradients: z.record(z.array(z.string())).optional(),
  effects: z.object({
    enableParticles: z.boolean().optional(),
    particleColor: z.string().optional(),
    enableGradientAnimation: z.boolean().optional(),
    enableGlassEffect: z.boolean().optional(),
  }).optional(),
  coverImage: urlSchema.optional().nullable(),
  icon: z.string().max(10).optional(),
})

// Theme update schema
export const updateThemeSchemaBody = z.object({
  id: idSchema,
  action: z.enum(['activate', 'update']).optional(),
  displayName: shortTextSchema.optional(),
  description: z.string().max(500).optional(),
  colors: z.record(z.string()).optional(),
  gradients: z.record(z.array(z.string())).optional(),
  effects: z.object({
    enableParticles: z.boolean().optional(),
    particleColor: z.string().optional(),
    enableGradientAnimation: z.boolean().optional(),
    enableGlassEffect: z.boolean().optional(),
  }).optional(),
})

// Cleanup schema
export const cleanupSchema = z.object({
  type: z.enum(['orphaned_posts', 'expired_sessions', 'old_analytics']),
  dryRun: z.boolean().default(true),
})

// Type exports
export type UserRole = z.infer<typeof userRoleSchema>
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>
export type CreateTeamMember = z.infer<typeof createTeamMemberSchema>
export type UpdateTeamMember = z.infer<typeof updateTeamMemberSchema>
export type ActivateTheme = z.infer<typeof activateThemeSchema>
export type AnalyticsExport = z.infer<typeof analyticsExportSchema>
