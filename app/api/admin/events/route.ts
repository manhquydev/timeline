import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { withAdmin, successResponse, errorResponse, ErrorCodes, validateBody, validateQuery, type AdminContext } from '@/lib/api-utils'
import { eventRepository, themeRepository } from '@/lib/mongodb/repositories'
import { createEventSchema, updateEventSchema, slugQuerySchema, idQuerySchema } from '@/lib/validations'
import { logEventCreation, logEventDeletion } from '@/lib/services/audit-service'
import { adminLogger } from '@/lib/logger'

/**
 * GET /api/admin/events?slug=xxx
 * Get event by slug (Admin only)
 */
export const GET = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
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
        enable_greeting_cards: event.enable_greeting_cards === true,
        greeting_tag: event.greeting_tag || null,
      },
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error fetching event')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * POST /api/admin/events
 * Create new event (Admin only)
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: body, error: bodyError } = await validateBody(request, createEventSchema)
    if (bodyError) return bodyError

    // Check if slug is available
    const slugAvailable = await eventRepository.isSlugAvailable(body.slug)
    if (!slugAvailable) {
      return errorResponse('Slug already exists', 400, ErrorCodes.VALIDATION_ERROR)
    }

    if (body.activate_theme && !body.theme_id) {
      return errorResponse('Theme is required when activate_theme is true', 400, ErrorCodes.VALIDATION_ERROR)
    }

    if (body.activate_theme && body.theme_id) {
      const theme = await themeRepository.findById(body.theme_id)
      if (!theme) {
        return errorResponse('Theme not found', 404, ErrorCodes.NOT_FOUND)
      }
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
      enable_greeting_cards: body.enable_greeting_cards === true,
      greeting_tag: body.greeting_tag || body.slug,
    })

    // Optionally activate linked theme immediately to keep event/theme in sync
    if (body.activate_theme && body.theme_id) {
      const activatedTheme = await themeRepository.setActive(body.theme_id)
      if (!activatedTheme) {
        return errorResponse('Theme not found', 404, ErrorCodes.NOT_FOUND)
      }
      revalidateTag('theme', 'max')
    }

    // Audit log the event creation
    await logEventCreation(request, { id: user.id, email: user.email! }, { id: event.id, title: event.title, slug: event.slug })

    return successResponse({
      success: true,
      event: { id: event.id, slug: event.slug },
      themeActivated: body.activate_theme === true,
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error creating event')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * PATCH /api/admin/events
 * Update event (Admin only)
 */
export const PATCH = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const { data: body, error: bodyError } = await validateBody(request, updateEventSchema)
    if (bodyError) return bodyError

    const { id, activate_theme, ...updateData } = body
    let currentEvent: Awaited<ReturnType<typeof eventRepository.findById>> | null = null
    let targetThemeId: string | null = null

    if (updateData.slug || activate_theme) {
      currentEvent = await eventRepository.findById(id)
    }

    if (activate_theme && !currentEvent) {
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    // If slug is being updated, check availability
    if (updateData.slug) {
      if (currentEvent && updateData.slug !== currentEvent.slug) {
        const slugAvailable = await eventRepository.isSlugAvailable(updateData.slug)
        if (!slugAvailable) {
          return errorResponse('Slug already exists', 400, ErrorCodes.VALIDATION_ERROR)
        }
      }
    }

    if (activate_theme) {
      targetThemeId = (updateData.theme_id ?? currentEvent?.theme_id) || null
      if (!targetThemeId) {
        return errorResponse('Theme is required when activate_theme is true', 400, ErrorCodes.VALIDATION_ERROR)
      }

      const theme = await themeRepository.findById(targetThemeId)
      if (!theme) {
        return errorResponse('Theme not found', 404, ErrorCodes.NOT_FOUND)
      }
    }

    // Convert date strings to Date objects
    const processedData: any = { ...updateData }
    if (updateData.event_date) processedData.event_date = new Date(updateData.event_date)
    if (updateData.start_date) processedData.start_date = new Date(updateData.start_date)
    if (updateData.end_date) processedData.end_date = updateData.end_date ? new Date(updateData.end_date) : null
    if (updateData.greeting_tag !== undefined) processedData.greeting_tag = updateData.greeting_tag || null

    const event = await eventRepository.update(id, processedData)

    if (!event) {
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    if (activate_theme) {
      const activatedTheme = await themeRepository.setActive(targetThemeId!)
      if (!activatedTheme) {
        return errorResponse('Theme not found', 404, ErrorCodes.NOT_FOUND)
      }
      revalidateTag('theme', 'max')
    }

    return successResponse({
      success: true,
      event: { id: event.id, slug: event.slug },
      themeActivated: activate_theme === true,
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error updating event')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * DELETE /api/admin/events?id=xxx
 * Delete event and all related posts (Admin only)
 */
export const DELETE = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  const requestId = request.headers.get('x-request-id') || request.headers.get('x-vercel-id') || crypto.randomUUID()
  try {
    const { data: params, error: queryError } = await validateQuery(request, idQuerySchema)
    if (queryError) {
      adminLogger.warn(
        {
          requestId,
          actorUserId: user.id,
          query: Object.fromEntries(request.nextUrl.searchParams.entries()),
        },
        'Delete event request rejected: invalid query parameters',
      )
      return queryError
    }

    adminLogger.info(
      { requestId, actorUserId: user.id, eventId: params.id },
      'Delete event request received',
    )

    // Get event to verify it exists
    const event = await eventRepository.findById(params.id)
    if (!event) {
      adminLogger.warn(
        { requestId, actorUserId: user.id, eventId: params.id },
        'Delete event request failed: event not found',
      )
      return errorResponse('Event not found', 404, ErrorCodes.NOT_FOUND)
    }

    // CASCADE DELETE: Delete all posts related to this event
    const postRepository = (await import('@/lib/mongodb/repositories')).postRepository
    const deletedPostsCount = await postRepository.deleteByEvent(params.id)

    adminLogger.info(
      { requestId, actorUserId: user.id, eventId: params.id, deletedPostsCount },
      'Cascade delete completed for event posts',
    )

    // Delete the event
    const deleted = await eventRepository.delete(params.id)

    if (!deleted) {
      adminLogger.error(
        { requestId, actorUserId: user.id, eventId: params.id },
        'Delete event failed: repository returned no deletion',
      )
      return errorResponse('Event could not be deleted', 500, ErrorCodes.INTERNAL_ERROR)
    }

    // Audit log the event deletion
    await logEventDeletion(request, { id: user.id, email: user.email! }, params.id, event.title)

    adminLogger.info(
      { requestId, actorUserId: user.id, eventId: params.id, eventTitle: event.title },
      'Delete event completed successfully',
    )

    return successResponse({
      success: true,
      message: 'Event deleted successfully',
      deletedPostsCount,
    })
  } catch (error: any) {
    adminLogger.error(
      {
        err: error,
        requestId,
        actorUserId: user.id,
        eventId: request.nextUrl.searchParams.get('id') || null,
      },
      'Error deleting event',
    )
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
