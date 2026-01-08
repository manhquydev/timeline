import dotenv from 'dotenv'
import { postRepository } from '@/lib/mongodb/repositories'
import { connectToDatabase } from '@/lib/mongodb/connection'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Mock enrichPostsWithDisplayNames to avoid Next.js server context issues
async function enrichPostsWithDisplayNames(posts: any[]) {
    // In a real script we might fetch from Supabase via REST or Admin client, 
    // but for pagination logic verification, we just pass through or add dummy names.
    return posts.map(p => ({
        ...p,
        user_name: p.user_name || 'Enriched User (Mock)'
    }))
}

async function verifyPaginationFlow() {
    console.log('🧪 Starting Pagination Flow Verification...')

    try {
        await connectToDatabase()
        console.log('✅ Connected to MongoDB')

        // 1. Get an existing event
        // FIX: Dynamic import handling for default export specific to this project structure
        const eventModule = await import('@/lib/mongodb/models/Event')
        const Event = eventModule.default || eventModule.Event

        // Additional check if Event is still undefined (rare but possible with some build configs)
        if (!Event) {
            throw new Error('Could not import Event model. generic import failed.')
        }

        const event = await Event.findOne({ status: 'open' }).sort({ created_at: -1 })

        if (!event) {
            console.warn('⚠️ No open events found. Skipping test.')
            return
        }
        console.log(`Testing with event: ${event.title} (${event.id})`)

        // 2. Fetch first page (simulate API / route)
        console.log('Testing First Page Fetch...')
        const limit = 5
        const { posts: mongoPosts, nextCursor } = await postRepository.findWithCursor(
            event.id,
            limit,
            undefined,
            'approved'
        )

        console.log(`Fetched ${mongoPosts.length} posts. Next cursor: ${nextCursor}`)

        // 3. Simulate API Transformation
        const postsWithStoredNames = mongoPosts.map(p => ({
            id: p.id,
            event_id: p.event_id,
            user_id: p.user_id || null,
            media_type: p.media_type,
            media_url: p.media_url,
            thumbnail_url: p.thumbnail_url || null,
            blurhash: p.blurhash || null,
            dimensions: {
                width: p.dimensions?.width || null,
                height: p.dimensions?.height || null,
            },
            file_size: p.file_size || null,
            wish_text: p.wish_text || null,
            uploaded_at: p.uploaded_at.toISOString(),
            view_count: p.view_count,
            status: p.status,
            user_name: p.user_name || null,
            likes_count: p.likes_count || 0,
            comments_count: p.comments_count || 0,
            current_user_liked: false
        }))

        const finalPosts = await enrichPostsWithDisplayNames(postsWithStoredNames)

        // 4. Verify Structure
        if (finalPosts.length > 0) {
            const p = finalPosts[0]
            if (typeof p.id !== 'string') throw new Error('Invalid ID')
            if (typeof p.media_url !== 'string') throw new Error('Invalid Media URL')
            if (p.user_name) console.log(`UserName: ${p.user_name}`)
        }

        // 5. Fetch Next Page if cursor exists
        if (nextCursor) {
            console.log('Testing Next Page Fetch...')
            const { posts: page2, nextCursor: cursor2 } = await postRepository.findWithCursor(
                event.id,
                limit,
                nextCursor,
                'approved'
            )
            console.log(`Fetched ${page2.length} posts on page 2. Next cursor: ${cursor2}`)

            if (page2.length > 0 && page2[0].id === mongoPosts[0].id) {
                throw new Error('❌ Duplicate posts found between pages! formatting failed.')
            }
        }

        console.log('✅ Pagination Logic Verified Successfully')
        process.exit(0)
    } catch (error) {
        console.error('❌ Verification Failed:', error)
        process.exit(1)
    }
}

verifyPaginationFlow()
