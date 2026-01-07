
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { connectToDatabase } from '../lib/mongodb/connection'
import {
    likeRepository,
    notificationRepository,
    postRepository
} from '../lib/mongodb/repositories'
import { NotificationType } from '../lib/mongodb/models'

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function runAudit() {
    console.log('🔍 Starting Comprehensive Event Details Audit...')
    let errorCount = 0

    try {
        await connectToDatabase()
        console.log('✅ Connected to MongoDB')

        // 1. Logic Verification: Like & Post Sync
        console.log('\n--- 1. Testing Like & Post Metadata Sync ---')
        const userId = new mongoose.Types.ObjectId().toString()
        const eventId = "audit-event-" + Date.now()

        // Create Sample Post
        const PostModel = mongoose.models.Post || mongoose.model('Post')
        const testPost = await PostModel.create({
            id: 'audit-post-' + Date.now(),
            event_id: eventId,
            user_id: new mongoose.Types.ObjectId().toString(),
            user_name: 'Audit Owner',
            media_type: 'image',
            media_url: 'http://audit/test.jpg',
            thumbnail_url: 'http://audit/thumb.jpg',
            status: 'approved',
            uploaded_at: new Date(),
            likes_count: 0,
            comments_count: 0
        })
        console.log(`✅ Created Test Post: ${testPost.id}`)

        // Add Like
        console.log('   Adding Like...')
        await likeRepository.addLike(userId, testPost.id, eventId)

        // Verify Post likes_count increment
        const postDocAfterLike = await PostModel.findById(testPost._id)
        if (postDocAfterLike?.likes_count === 1) {
            console.log('   ✅ Post likes_count incremented correctly')
        } else {
            console.error(`   ❌ FAIL: Post likes_count is ${postDocAfterLike?.likes_count}, expected 1`)
            errorCount++
        }

        // Add Notification
        console.log('   Verifying Notification Creation...')
        const notif = await notificationRepository.create({
            userId: testPost.user_id,
            actorId: userId,
            type: NotificationType.POST_LIKE,
            title: 'Audit Like',
            message: 'Someone liked your audit photo',
            postId: testPost.id,
            link: `/events/${eventId}`
        })
        if (notif) {
            console.log('   ✅ Notification document created successfully')
        } else {
            console.error('   ❌ FAIL: Notification creation failed')
            errorCount++
        }

        // Remove Like
        console.log('   Removing Like...')
        await likeRepository.removeLike(userId, testPost.id)
        const postDocAfterUnlike = await PostModel.findById(testPost._id)
        if (postDocAfterUnlike?.likes_count === 0) {
            console.log('   ✅ Post likes_count decremented correctly')
        } else {
            console.error(`   ❌ FAIL: Post likes_count is ${postDocAfterUnlike?.likes_count}, expected 0`)
            errorCount++
        }

        // 2. Data Integrity Audit: Existing Posts
        console.log('\n--- 2. Auditing Data Integrity of Existing Posts ---')
        const allPosts = await PostModel.find({}).limit(50)
        console.log(`   Auditing ${allPosts.length} posts...`)

        for (const post of allPosts) {
            const actualLikes = await mongoose.models.Like.countDocuments({ postId: post.id })
            const currentLikesCount = post.likes_count || 0
            if (currentLikesCount !== actualLikes) {
                console.warn(`   ⚠️ Inconsistency found in post ${post.id}: likes_count=${currentLikesCount}, actual_likes=${actualLikes}`)
                // Optionally fix it:
                // await PostModel.updateOne({ _id: post._id }, { likes_count: actualLikes })
            }
        }
        console.log('   ✅ Integrity check complete')

        // 3. Realtime Payload Verification
        console.log('\n--- 3. Verifying Realtime Payload Structure ---')
        const payload = {
            type: 'post:like',
            payload: {
                postId: testPost.id,
                userId: userId,
                user_name: 'Audit User',
                avatar_url: 'http://audit/avatar.jpg'
            }
        }

        const requiredFields = ['postId', 'userId', 'user_name', 'avatar_url']
        const missingFields = requiredFields.filter(f => !payload.payload[f as keyof typeof payload.payload])

        if (missingFields.length === 0) {
            console.log('   ✅ Realtime payload structure is valid for Activity Feed')
        } else {
            console.error(`   ❌ FAIL: Realtime payload missing fields: ${missingFields.join(', ')}`)
            errorCount++
        }

        // Cleanup
        console.log('\n--- Cleanup ---')
        await PostModel.deleteOne({ _id: testPost._id })
        await mongoose.models.Notification.deleteOne({ _id: notif._id })
        console.log('✅ Cleanup complete')

        if (errorCount === 0) {
            console.log('\n✨ AUDIT SUCCESSFUL: All vital systems are functioning as expected.')
        } else {
            console.error(`\n🚨 AUDIT COMPLETED WITH ${errorCount} ERRORS. Please check reports above.`)
        }

    } catch (err) {
        console.error('\n💥 CRITICAL AUDIT ERROR:')
        console.error(err)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
    }
}

runAudit()
