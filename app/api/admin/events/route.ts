import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { eventRepository } from '@/lib/mongodb/repositories'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

/**
 * GET /api/admin/events?slug=xxx
 * Get event by slug (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const event = await eventRepository.findBySlug(slug)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
      },
    })
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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

    // Check admin permission
    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      slug,
      event_date,
      start_date,
      end_date,
      status,
      allow_upload,
      allow_wishes,
    } = body

    // Validate required fields
    if (!title || !slug || !event_date || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug is available
    const slugAvailable = await eventRepository.isSlugAvailable(slug)
    if (!slugAvailable) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Create event in MongoDB
    const event = await eventRepository.create({
      title,
      description: description || null,
      slug,
      event_date: new Date(event_date),
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : null,
      status: status || 'draft',
      allow_upload: allow_upload !== false,
      allow_wishes: allow_wishes !== false,
      cover_image_url: null,
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
      },
    })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // If slug is being updated, check availability
    if (updateData.slug) {
      const currentEvent = await eventRepository.findById(id)
      if (currentEvent && updateData.slug !== currentEvent.slug) {
        const slugAvailable = await eventRepository.isSlugAvailable(updateData.slug)
        if (!slugAvailable) {
          return NextResponse.json(
            { error: 'Slug already exists' },
            { status: 400 }
          )
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
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
      },
    })
  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/events?id=xxx
 * Delete event (Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const deleted = await eventRepository.delete(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Event not found or could not be deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

