import { z } from 'zod'
import { idSchema, eventStatusSchema, shortTextSchema, longTextSchema, urlSchema, cursorPaginationSchema, slugSchema } from './common'

// Create event schema (matches admin events route)
export const createEventSchema = z.object({
  title: shortTextSchema,
  description: longTextSchema.optional().nullable(),
  slug: slugSchema,
  event_date: z.string(),
  start_date: z.string(),
  end_date: z.string().optional().nullable(),
  status: eventStatusSchema.optional(),
  allow_upload: z.boolean().optional(),
  allow_wishes: z.boolean().optional(),
  branding: z.object({
    logo_url: urlSchema.optional().nullable(),
    banner_url: urlSchema.optional().nullable(),
    primary_color: z.string().optional().nullable(),
    custom_domain: z.string().optional().nullable(),
  }).optional(),
  theme_id: idSchema.optional().nullable(),
})

// Update event schema
export const updateEventSchema = z.object({
  id: idSchema,
  title: shortTextSchema.optional(),
  description: longTextSchema.optional().nullable(),
  slug: slugSchema.optional(),
  event_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  status: eventStatusSchema.optional(),
  allow_upload: z.boolean().optional(),
  allow_wishes: z.boolean().optional(),
  branding: z.object({
    logo_url: urlSchema.optional().nullable(),
    banner_url: urlSchema.optional().nullable(),
    primary_color: z.string().optional().nullable(),
    custom_domain: z.string().optional().nullable(),
  }).optional(),
  theme_id: idSchema.optional().nullable(),
})

// Delete event schema
export const deleteEventSchema = z.object({
  eventId: idSchema,
})

// Get event schema
export const getEventSchema = z.object({
  eventId: idSchema,
})

// List events schema
export const listEventsSchema = z.object({
  status: eventStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
}).merge(cursorPaginationSchema)

// Type exports
export type CreateEvent = z.infer<typeof createEventSchema>
export type UpdateEvent = z.infer<typeof updateEventSchema>
export type GetEvent = z.infer<typeof getEventSchema>
export type ListEvents = z.infer<typeof listEventsSchema>
