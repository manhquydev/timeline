import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { eventRepository } from '@/lib/mongodb/repositories'
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, ErrorCodes, validateBody, validateQuery } from '@/lib/api-utils'
import { createEventSchema, updateEventSchema, slugQuerySchema, idQuerySchema } from '@/lib/validations'

/**
 * GET /api/admin/events?slug=xxx
 * Get event by slug (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: params, error: queryError } = await validateQuery(request, slugQuerySchema)
    if (queryError) return queryError

    const event = await eventRepository.findBySlug(params.slug)

    if (!event) {
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        slug: event.slug,
        event_date: event.event_date.toISOString(),
        start_date: event.start_date.toISOString(),
        end_date: event.end_date?.toISOString() || null,
        status: event.status,
        allow_upload: event.allow_upload,
        allow_wishes: event.allow_wishes,
        cover_image_url: event.cover_image_url,
        branding: event.branding || {},
        theme_id: event.theme_id || null,
      },
    })
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * POST /api/admin/events
 * Create new event (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: body, error: bodyError } = await validateBody(request, createEventSchema)
    if (bodyError) return bodyError

    // Check if slug is available
    const slugAvailable = await eventRepository.isSlugAvailable(body.slug)
    if (!slugAvailable) {
      return errorResponse('Slug already exists', 400, ErrorCodes.VALIDATION_ERROR)
    }

    // Create event in MongoDB
    const event = await eventRepository.create({
      title: body.title,
      description: body.description || null,
      slug: body.slug,
      event_date: new Date(body.event_date),
      start_date: new Date(body.start_date),
      end_date: body.end_date ? new Date(body.end_date) : null,
      status: body.status || 'draft',
      allow_upload: body.allow_upload !== false,
      allow_wishes: body.allow_wishes !== false,
      cover_image_url: null,
      branding: body.branding || {
        logo_url: null,
        banner_url: null,
        primary_color: null,
        custom_domain: null,
      },
      theme_id: body.theme_id || null,
    })

    return successResponse({
      success: true,
      event: { id: event.id, slug: event.slug },
    })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * PATCH /api/admin/events
 * Update event (Admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: body, error: bodyError } = await validateBody(request, updateEventSchema)
    if (bodyError) return bodyError

    const { id, ...updateData } = body

    // If slug is being updated, check availability
    if (updateData.slug) {
      const currentEvent = await eventRepository.findById(id)
      if (currentEvent && updateData.slug !== currentEvent.slug) {
        const slugAvailable = await eventRepository.isSlugAvailable(updateData.slug)
        if (!slugAvailable) {
          return errorResponse('Slug already exists', 400, ErrorCodes.VALIDATION_ERROR)
        }
      }
    }

    // Convert date strings to Date objects
    const processedData: any = { ...updateData }
    if (updateData.event_date) processedData.event_date = new Date(updateData.event_date)
    if (updateData.start_date) processedData.start_date = new Date(updateData.start_date)
    if (updateData.end_date) processedData.end_date = updateData.end_date ? new Date(updateData.end_date) : null

    const event = await eventRepository.update(id, processedData)

    if (!event) {
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({
      success: true,
      event: { id: event.id, slug: event.slug },
    })
  } catch (error: any) {
    console.error('Error updating event:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * DELETE /api/admin/events?id=xxx
 * Delete event and all related posts (Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: params, error: queryError } = await validateQuery(request, idQuerySchema)
    if (queryError) return queryError

    // Get event to verify it exists
    const event = await eventRepository.findById(params.id)
    if (!event) {
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    // CASCADE DELETE: Delete all posts related to this event
    const postRepository = (await import('@/lib/mongodb/repositories')).postRepository
    const deletedPostsCount = await postRepository.deleteByEvent(params.id)

    console.log(`Cascade delete: Removed ${deletedPostsCount} posts for event ${params.id}`)

    // Delete the event
    const deleted = await eventRepository.delete(params.id)

    if (!deleted) {
      return errorResponse('Event could not be deleted', 500, ErrorCodes.INTERNAL_ERROR)
    }

    return successResponse({
      success: true,
      message: 'Event deleted successfully',
      deletedPostsCount,
    })
  } catch (error: any) {
    console.error('Error deleting event:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
