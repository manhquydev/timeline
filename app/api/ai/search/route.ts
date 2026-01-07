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
                media_url: p.media_url,
                thumbnail_url: p.thumbnail_url,
                user_name: p.user_name,
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
