import { NextRequest } from 'next/server'
import { withAdmin, successResponse, errorResponse, ErrorCodes, type AdminContext } from '@/lib/api-utils'
import { teamMemberRepository } from '@/lib/mongodb/repositories'
import { adminLogger } from '@/lib/logger'

/**
 * POST /api/admin/team/reorder
 * Update team members order (Admin only)
 */
export const POST = withAdmin(async (request: NextRequest, { user }: AdminContext) => {
  try {
    const body = await request.json()
    const { orders } = body

    if (!orders || !Array.isArray(orders)) {
      return errorResponse(
        'Invalid orders format. Expected array of { id, order }',
        400,
        ErrorCodes.VALIDATION_ERROR
      )
    }

    // Validate orders structure
    for (const item of orders) {
      if (!item.id || typeof item.order !== 'number') {
        return errorResponse(
          'Each order item must have id and order number',
          400,
          ErrorCodes.VALIDATION_ERROR
        )
      }
    }

    const success = await teamMemberRepository.updateOrders(orders)

    if (!success) {
      return errorResponse('Failed to update orders', 500, ErrorCodes.INTERNAL_ERROR)
    }

    return successResponse({
      success: true,
      message: 'Team member orders updated successfully',
    })
  } catch (error: any) {
    adminLogger.error({ err: error }, 'Error updating team member orders')
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
})
