
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { connectToDatabase } from '../lib/mongodb/connection'
import { eventRepository, postRepository } from '../lib/mongodb/repositories'

async function benchmarkHomepage() {
    console.log('🚀 Starting Homepage Data Benchmark...')
    const startTime = performance.now()

    try {
        await connectToDatabase()
        console.log('✅ Connected to MongoDB')

        // 1. Fetch Events
        const eventsStart = performance.now()
        const events = await eventRepository.findPublic()
        const eventsEnd = performance.now()
        console.log(`📋 Fetched ${events.length} public events in ${(eventsEnd - eventsStart).toFixed(2)}ms`)

        // 2. Fetch Posts (Optimized Way)
        console.log('🔄 Fetching posts for events (Simulating Homepage)...')
        const postsStart = performance.now()

        let totalPostsFetched = 0
        const results = await Promise.all(
            events.map(async (event) => {
                const { posts, total } = await postRepository.findWithPagination(event.id, 1, 6, 'approved')
                totalPostsFetched += posts.length
                return {
                    eventId: event.id,
                    slug: event.slug,
                    fetched: posts.length,
                    totalAvailable: total
                }
            })
        )

        const postsEnd = performance.now()

        // 3. Report
        console.log('\n--- Benchmark Results ---')
        console.log(`⏱️ Total Time: ${(postsEnd - startTime).toFixed(2)}ms`)
        console.log(`📦 Events Processed: ${events.length}`)
        console.log(`🖼️ Posts Fetched: ${totalPostsFetched}`)
        console.log(`⚡ Average Time per Event: ${((postsEnd - postsStart) / events.length).toFixed(2)}ms`)

        console.log('\n--- Detail per Event ---')
        results.slice(0, 5).forEach(r => {
            console.log(`Event: ${r.slug} | Fetched: ${r.fetched} | Total Available: ${r.totalAvailable}`)
        })
        if (results.length > 5) console.log(`...and ${results.length - 5} more events.`)

    } catch (error) {
        console.error('❌ Benchmark Failed:', error)
    } finally {
        process.exit(0)
    }
}

benchmarkHomepage()
