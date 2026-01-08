import { z } from 'zod'
import { idSchema, postStatusSchema, wishTextSchema, cursorPaginationSchema } from './common'

// Create post schema
export const createPostSchema = z.object({
  eventId: idSchema,
  wishText: wishTextSchema,
})

// Update post schema
export const updatePostSchema = z.object({
  postId: idSchema,
  wishText: wishTextSchema,
})

// Delete post schema
export const deletePostSchema = z.object({
  postId: idSchema,
})

// Get posts by event schema
export const getPostsByEventSchema = z.object({
  eventId: idSchema,
  status: postStatusSchema.optional(),
}).merge(cursorPaginationSchema)

// Like post schema
export const likePostSchema = z.object({
  postId: idSchema,
})

// Comment schemas
export const createCommentSchema = z.object({
  postId: idSchema,
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  parentCommentId: idSchema.optional().nullable(),
})

export const updateCommentSchema = z.object({
  commentId: idSchema,
  content: z.string().min(1).max(1000),
})

export const deleteCommentSchema = z.object({
  commentId: idSchema,
})

// Admin post moderation
export const moderatePostSchema = z.object({
  postId: idSchema,
  status: postStatusSchema,
  reason: z.string().max(500).optional(),
})

// Post action schema (for approve/reject/delete)
export const postActionSchema = z.object({
  postId: idSchema,
  action: z.enum(['approve', 'reject', 'delete']),
})

// Type exports
export type CreatePost = z.infer<typeof createPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
export type LikePost = z.infer<typeof likePostSchema>
export type CreateComment = z.infer<typeof createCommentSchema>
export type ModeratePost = z.infer<typeof moderatePostSchema>
