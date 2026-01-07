import { NextResponse } from 'next/server'
import { likeRepository } from '@/lib/mongodb/repositories'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    try {
        const likes = await likeRepository.getLikesByPost(postId, limit, offset)
        return NextResponse.json({ likes })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
