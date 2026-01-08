import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { teamMemberRepository } from '@/lib/mongodb/repositories'
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, ErrorCodes, validateBody, validateQuery } from '@/lib/api-utils'
import { createTeamMemberSchema, updateTeamMemberSchema, idQuerySchema } from '@/lib/validations'

/**
 * GET /api/admin/team
 * Get all team members (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const members = activeOnly
      ? await teamMemberRepository.findActive()
      : await teamMemberRepository.findAll()

    return successResponse({
      members: members.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar_url: member.avatar_url,
        description: member.description,
        bio: member.bio,
        order: member.order,
        social_links: member.social_links,
        is_active: member.is_active,
        created_at: member.created_at.toISOString(),
        updated_at: member.updated_at.toISOString(),
      })),
      total: members.length,
    })
  } catch (error: any) {
    console.error('Error fetching team members:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * POST /api/admin/team
 * Create new team member (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: body, error: bodyError } = await validateBody(request, createTeamMemberSchema)
    if (bodyError) return bodyError

    const {
      name,
      role,
      avatar_url,
      bio,
      order,
    } = body

    // Create team member in MongoDB
    const member = await teamMemberRepository.create({
      name,
      role,
      avatar_url: avatar_url || null,
      description: null,
      bio: bio || null,
      order: order !== undefined ? order : await teamMemberRepository.getNextOrder(),
      social_links: {},
      is_active: true,
    })

    return successResponse({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
        order: member.order,
      },
    })
  } catch (error: any) {
    console.error('Error creating team member:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * PATCH /api/admin/team
 * Update team member (Admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isCurrentUserAdmin())) {
      return errorResponse('Unauthorized: Admin access required', 403, ErrorCodes.FORBIDDEN)
    }

    const { data: body, error: bodyError } = await validateBody(request, updateTeamMemberSchema)
    if (bodyError) return bodyError

    const { id, ...updateData } = body

    const member = await teamMemberRepository.update(id, updateData)

    if (!member) {
      return errorResponse('Team member not found', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
      },
    })
  } catch (error: any) {
    console.error('Error updating team member:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}

/**
 * DELETE /api/admin/team?id=xxx
 * Delete team member (Admin only)
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

    const deleted = await teamMemberRepository.delete(params.id)

    if (!deleted) {
      return errorResponse('Team member not found', 404, ErrorCodes.NOT_FOUND)
    }

    return successResponse({
      success: true,
      message: 'Team member deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting team member:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
