import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { themeRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'

/**
 * PATCH /api/admin/themes/[id]
 * Update a specific theme
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !(await isCurrentUserAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = params.id
        const updates = await request.json()

        await connectToDatabase()

        // Remove metadata fields that shouldn't be manually updated via this route
        const { id: _, _id, createdAt, updatedAt, ...cleanUpdates } = updates

        const updatedTheme = await themeRepository.update(id, cleanUpdates)

        if (!updatedTheme) {
            return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, theme: updatedTheme })
    } catch (error: any) {
        console.error('Error updating theme:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update theme' },
            { status: 500 }
        )
    }
}
