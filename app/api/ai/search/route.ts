import { NextRequest, NextResponse } from 'next/server'
import { postRepository } from '@/lib/mongodb/repositories'
import { zaiService } from '@/lib/ai/z-ai-service'
import { apiResponse } from '@/lib/api-utils'

/**
 * AI Search API
 * POST /api/ai/search
 * Payload: { query: string, eventId?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { query, eventId } = await request.json()

        if (!query) {
            return apiResponse.error('Query is required', 400)
        }

        // 1. Translate NL query to MongoDB filters using ZaiService
        console.log(`🔍 AI Searching for: "${query}"`)
        const filters = await zaiService.generateSearchFilters(query)

        // 2. Add eventId constraint if provided
        if (eventId) {
            filters.event_id = eventId
        }

        // 3. Ensure we only search in approved posts by default
        filters.status = 'approved'

        console.log('📝 Calculated filters:', JSON.stringify(filters))

        // 4. Execute search
        const posts = await postRepository.searchWithFilters(filters)

        return apiResponse.success({
            query,
            translated_filters: filters,
            count: posts.length,
            posts: posts.map(p => ({
                id: p.id,
                event_id: p.event_id,
                user_id: p.user_id,
                media_type: p.media_type,
                media_url: p.media_url,
                thumbnail_url: p.thumbnail_url,
                blurhash: p.blurhash || null,
                dimensions: p.dimensions || { width: null, height: null },
                file_size: p.file_size || null,
                wish_text: p.wish_text || null,
                uploaded_at: (p as any).uploaded_at ? new Date((p as any).uploaded_at).toISOString() : new Date().toISOString(),
                view_count: p.view_count || 0,
                status: p.status || 'approved',
                user_name: p.user_name,
                likes_count: p.likes_count || 0,
                comments_count: p.comments_count || 0,
                current_user_liked: (p as any).current_user_liked || false,
                created_at: (p as any).uploaded_at || (p as any).createdAt,
                ai_tags: (p as any).ai_tags,
                ai_description: (p as any).ai_description,
            }))
        })
    } catch (error: any) {
        console.error('AI Search Error:', error)
        return apiResponse.serverError('Search failed', error)
    }
}
