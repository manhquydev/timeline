import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { teamMemberRepository } from '@/lib/mongodb/repositories'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/team
 * Get all team members (Admin only)
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
    const activeOnly = searchParams.get('active') === 'true'

    const members = activeOnly
      ? await teamMemberRepository.findActive()
      : await teamMemberRepository.findAll()

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      role,
      avatar_url,
      description,
      bio,
      order,
      social_links,
      is_active,
    } = body

    // Validate required fields
    if (!name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role' },
        { status: 400 }
      )
    }

    // Create team member in MongoDB
    const member = await teamMemberRepository.create({
      name,
      role,
      avatar_url: avatar_url || null,
      description: description || null,
      bio: bio || null,
      order: order !== undefined ? order : await teamMemberRepository.getNextOrder(),
      social_links: social_links || {},
      is_active: is_active !== false,
    })

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const member = await teamMemberRepository.update(id, updateData)

    if (!member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
      },
    })
  } catch (error: any) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const deleted = await teamMemberRepository.delete(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
