// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { display_name, full_name, avatar_url } = body

    // Validate display_name if provided
    if (display_name !== undefined && display_name !== null) {
      const trimmedName = display_name.trim()
      if (trimmedName.length > 50) {
        return NextResponse.json(
          { error: 'Display name must be 50 characters or less' },
          { status: 400 }
        )
      }
      if (trimmedName.length > 0 && trimmedName.length < 2) {
        return NextResponse.json(
          { error: 'Display name must be at least 2 characters' },
          { status: 400 }
        )
      }
    }

    // Build update object (only include fields that are provided)
    type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
    const updateData: UserProfileUpdate = {}
    if (display_name !== undefined) updateData.display_name = display_name?.trim() || null
    if (full_name !== undefined) updateData.full_name = full_name?.trim() || null
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: data,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
