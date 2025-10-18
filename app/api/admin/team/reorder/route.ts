import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { teamMemberRepository } from '@/lib/mongodb/repositories'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/team/reorder
 * Update team members order (Admin only)
 */
export async function POST(request: NextRequest) {
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
    const { orders } = body

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { error: 'Invalid orders format. Expected array of { id, order }' },
        { status: 400 }
      )
    }

    // Validate orders structure
    for (const item of orders) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: 'Each order item must have id and order number' },
          { status: 400 }
        )
      }
    }

    const success = await teamMemberRepository.updateOrders(orders)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team member orders updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating team member orders:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
