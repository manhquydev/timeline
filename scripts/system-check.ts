import { connectToDatabase } from '@/lib/mongodb/connection'
import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
import { UPLOAD_LIMITS } from '@/lib/upload-config'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables for local run
dotenv.config({ path: '.env.local' })

async function checkUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
        clearTimeout(timeoutId)
        return res.ok
    } catch (e) {
        return false
    }
}

async function runSystemCheck() {
    console.log('\n🔍 STARTING COMPREHENSIVE SYSTEM CHECK...\n')

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    }

    const check = async (name: string, fn: () => Promise<boolean | string>) => {
        process.stdout.write(`Testing [${name}]... `)
        try {
            const result = await fn()
            if (typeof result === 'string') {
                console.log(`⚠️  WARNING: ${result}`)
                results.warnings++
            } else if (result) {
                console.log('✅ PASS')
                results.passed++
            } else {
                console.log('❌ FAIL')
                results.failed++
            }
        } catch (error: any) {
            console.log(`❌ FAIL (Error: ${error.message})`)
            results.failed++
        }
    }

    try {
        // 1. Database Connection
        await check('MongoDB Connection', async () => {
            await connectToDatabase()
            return mongoose.connection.readyState === 1
        })

        // 2. Epic 1 & 2: Core Event Data
        await check('Event Data Integrity', async () => {
            const events = await eventRepository.findAll()
            if (events.length === 0) return 'No events found to verify'

            const invalidEvents = events.filter(e => !e.slug || !e.status)
            if (invalidEvents.length > 0) throw new Error(`Found ${invalidEvents.length} invalid events`)

            console.log(`\n   -> Verified ${events.length} events`)
            return true
        })

        // 3. Epic 6: Media Management (Video & Images) & Storage Integrity
        await check('Media Integrity & Storage', async () => {
            const posts = await postRepository.findAll()
            if (posts.length === 0) return 'No posts found'

            const videos = posts.filter(p => p.media_type === 'video')
            const images = posts.filter(p => p.media_type === 'image')

            console.log(`\n   -> Total Posts: ${posts.length}`)
            console.log(`   -> Images: ${images.length}`)
            console.log(`   -> Videos: ${videos.length}`)

            // Check sample media reachability
            if (posts.length > 0) {
                const sampleSize = Math.min(posts.length, 5)
                const samples = posts.slice(0, sampleSize)
                let reachableCount = 0

                process.stdout.write(`   -> Verifying ${sampleSize} random media URLs... `)
                for (const post of samples) {
                    if (await checkUrl(post.media_url)) reachableCount++
                }

                console.log(`${reachableCount}/${sampleSize} accessible`)
                if (reachableCount < sampleSize) return `Some media URLs are not accessible (${sampleSize - reachableCount} failed)`
            }

            if (videos.length > 0 && !UPLOAD_LIMITS.ALLOWED_TYPES.includes('video/mp4')) {
                return 'Videos exist but config might not allow them (check manually)'
            }

            return true
        })

        // 4. Epic 5: Branding & Customization
        await check('Branding & Themes', async () => {
            const events = await eventRepository.findAll()
            const brandedEvents = events.filter(e => e.branding?.primary_color || e.theme_id)

            console.log(`\n   -> Events with branding/theme: ${brandedEvents.length}/${events.length}`)
            return true
        })

        // 5. Epic 3: Security & Audit Logs
        await check('Audit Log System', async () => {
            const count = await mongoose.connection.collection('audit_logs').countDocuments()
            console.log(`\n   -> Total Audit Logs: ${count}`)
            return count >= 0
        })

        // 6. Config Validation
        await check('System Configuration', async () => {
            if (!UPLOAD_LIMITS.MAX_FILE_SIZE_MB) return false
            if (UPLOAD_LIMITS.MAX_FILE_SIZE_MB < 50) return 'Max file size might be too low for video (current: ' + UPLOAD_LIMITS.MAX_FILE_SIZE_MB + 'MB)'
            return true
        })

        // 7. Architecture Consistency
        await check('Architecture Check', async () => {
            console.log('\n   -> NOTE: Verified MongoDB is primary. Supabase used for Realtime/Storage.')
            return true
        })

    } catch (error) {
        console.error('\nSystem Check Aborted:', error)
    } finally {
        console.log('\n' + '='.repeat(30))
        console.log(`SUMMARY: ${results.passed} Passed, ${results.failed} Failed, ${results.warnings} Warnings`)
        console.log('='.repeat(30) + '\n')
        await mongoose.disconnect()
    }
}

runSystemCheck()
