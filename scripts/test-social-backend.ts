
import dotenv from 'dotenv'
import path from 'path'
import { connectToDatabase } from '../lib/mongodb/connection'
import {
    likeRepository,
    commentRepository,
    notificationRepository,
    postRepository
} from '../lib/mongodb/repositories'
import { NotificationType } from '../lib/mongodb/models'
import mongoose from 'mongoose'
import { User } from 'lucide-react'

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function runTest() {
    console.log('🧪 Starting Social Features Backend Test...')

    try {
        await connectToDatabase()
        console.log('✅ DB Connected')

        // 1. Setup Data
        console.log('\n--- Setup ---')
        const userIdA = new mongoose.Types.ObjectId().toString()
        const userIdB = new mongoose.Types.ObjectId().toString()
        const eventId = "test-event-" + Date.now()

        // Create a dummy post for User A
        // We need to bypass repository create if it expects file upload or just mock it? 
        // PostRepository doesn't have a simple 'create' that just takes an object? 
        // Let's check PostRepository. It likely has create(postData). 
        // If not, we might need to insert directly to generic collection or mock it.
        // Let's assume we can use mongoose model directly if repo is complex.
        const PostModel = mongoose.models.Post || mongoose.model('Post')
        const post = await PostModel.create({
            id: 'post-' + Date.now(),
            event_id: eventId,
            user_id: userIdA,
            user_name: 'User A',
            media_type: 'image',
            media_url: 'http://test/image.jpg',
            thumbnail_url: 'http://test/thumb.jpg',
            aspect_ratio: 1.5,
            status: 'approved',
            uploaded_at: new Date()
        })
        console.log(`✅ Created Test Post: ${post._id} for User A: ${userIdA}`)

        // 2. Test Like
        console.log('\n--- Test Like ---')
        const like = await likeRepository.addLike(userIdB, post._id.toString(), eventId)
        if (!like) throw new Error('Failed to create like')
        console.log('✅ User B liked Post')

        // Verify Like Count/State
        const hasLiked = await likeRepository.hasUserLiked(userIdB, post._id.toString())
        if (!hasLiked) throw new Error('Like state check failed')
        console.log('✅ hasUserLiked verified')

        const likeCount = await likeRepository.getLikeCount(post._id.toString())
        if (likeCount !== 1) throw new Error(`Like count wrong: ${likeCount}`)
        console.log(`✅ Like count is ${likeCount}`)

        // 3. Test Notification (Like)
        // Note: The API route usually creates the notification. 
        // Here we are testing repositories, so we must call notification repo explicitly 
        // to verify it CAN store and retrieve correctly.
        const notif = await notificationRepository.create({
            userId: userIdA,
            actorId: userIdB,
            type: NotificationType.POST_LIKE,
            title: 'New Like',
            message: 'User B liked your photo',
            postId: post._id.toString(),
            link: `/events/${eventId}`
        })
        console.log('✅ Created Notification for User A')

        const notifications = await notificationRepository.getNotifications(userIdA)
        const found = notifications.find(n => n.postId?.toString() === post._id.toString() && n.type === NotificationType.POST_LIKE)
        if (!found) throw new Error('Notification not found')
        console.log('✅ Notification retrieved successfully')

        // 4. Test Comment
        console.log('\n--- Test Comment ---')
        const comment = await commentRepository.createComment(
            userIdB,
            post._id.toString(),
            "This is a test comment",
            eventId
        )
        console.log(`✅ Comment created: ${comment._id}`)

        const comments = await commentRepository.getCommentsByPost(post._id.toString())
        if (comments.length !== 1) throw new Error('Comments length mismatch')
        if (comments[0].content !== "This is a test comment") throw new Error('Comment content mismatch')
        console.log('✅ Comment retrieval verified')

        // 5. Cleanup
        console.log('\n--- Cleanup ---')
        await PostModel.deleteOne({ _id: post._id })
        await likeRepository.removeLike(userIdB, post._id.toString())
        await mongoose.models.Comment.deleteOne({ _id: comment._id })
        await mongoose.models.Notification.deleteOne({ _id: notif._id })
        console.log('✅ Cleanup complete')

        console.log('\n✅✅✅ ALL TESTS PASSED ✅✅✅')

    } catch (err) {
        console.error('\n❌ TEST FAILED')
        console.error(err)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
    }
}

runTest()
