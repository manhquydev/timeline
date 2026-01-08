// @ts-nocheck - Supabase types strict mode bypass for dynamic update
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, ErrorCodes, validateBody } from '@/lib/api-utils'
import { updateProfileSchema } from '@/lib/validations'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 401, ErrorCodes.UNAUTHORIZED)
    }

    const { data: body, error: bodyError } = await validateBody(request, updateProfileSchema)
    if (bodyError) return bodyError

    const { display_name, full_name, avatar_url } = body

    // Build update object (only include fields that are provided)
    const updateData: Record<string, string | null> = {}
    if (display_name !== undefined) updateData.display_name = display_name?.trim() || null
    if (full_name !== undefined) updateData.full_name = full_name?.trim() || null
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return errorResponse('Failed to update profile', 500, ErrorCodes.INTERNAL_ERROR)
    }

    return successResponse({
      message: 'Profile updated successfully',
      profile: data,
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return errorResponse(error.message || 'Internal server error', 500, ErrorCodes.INTERNAL_ERROR)
  }
}
