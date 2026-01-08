import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { commentRepository } from '@/lib/mongodb/repositories'
import { apiResponse } from '@/lib/api-utils'
import { updateCommentSchema } from '@/lib/validations'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const { commentId } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return apiResponse.unauthorized()
    }

    try {
        const body = await request.json()

        // Validate request body
        const validation = updateCommentSchema.safeParse({ ...body, commentId })
        if (!validation.success) {
            return apiResponse.validationError(
                validation.error.issues.map(i => i.message).join(', ')
            )
        }

        const { content } = body
        const updatedComment = await commentRepository.updateComment(commentId, content, user.id)

        if (!updatedComment) {
            return apiResponse.notFound('Comment not found or unauthorized')
        }

        return apiResponse.success({ comment: updatedComment })
    } catch (error: any) {
        return apiResponse.serverError(error)
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const { commentId } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return apiResponse.unauthorized()
    }

    try {
        const success = await commentRepository.deleteComment(commentId, user.id)

        if (!success) {
            return apiResponse.notFound('Comment not found or unauthorized')
        }

        return apiResponse.success({ success: true })
    } catch (error: any) {
        return apiResponse.serverError(error)
    }
}
