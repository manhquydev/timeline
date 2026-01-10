import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, validateBody, validateQuery, type AdminContext } from '@/lib/api-utils'
import { teamMemberRepository } from '@/lib/mongodb/repositories'
import { createTeamMemberSchema, updateTeamMemberSchema, idQuerySchema } from '@/lib/validations'
import { adminLogger } from '@/lib/logger'

/**
 * GET /api/admin/team
 * Get all team members (Admin only)
 */
export const GET = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
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
    adminLogger.error({ err: error }, 'Error fetching team members')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * POST /api/admin/team
 * Create new team member (Admin only)
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
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
    adminLogger.error({ err: error }, 'Error creating team member')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * PATCH /api/admin/team
 * Update team member (Admin only)
 */
export const PATCH = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
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
    adminLogger.error({ err: error }, 'Error updating team member')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})

/**
 * DELETE /api/admin/team?id=xxx
 * Delete team member (Admin only)
 */
export const DELETE = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
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
    adminLogger.error({ err: error }, 'Error deleting team member')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
