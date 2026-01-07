import * as dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { postRepository } from '../lib/mongodb/repositories/PostRepository'
import { likeRepository } from '../lib/mongodb/repositories/LikeRepository'
import { commentRepository } from '../lib/mongodb/repositories/CommentRepository'
import { nanoid } from 'nanoid'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function runRepositoryTests() {
    console.log('🧪 Starting Repository Test Suite...')

    try {
        // 1. Setup Test Data
        const testEventId = `test_event_${nanoid(6)}`
        const testUserId = `test_user_test`

        console.log(`\n1️⃣ Testing Post Creation in Event: ${testEventId}...`)
        const post = await postRepository.create({
            event_id: testEventId,
            user_id: testUserId,
            user_name: 'Test Tester',
            media_url: 'https://example.com/test.jpg',
            media_type: 'image',
            wish_text: 'Test post',
            status: 'approved',
            likes_count: 0,
            comments_count: 0,
            blurhash: 'L6PZfS_NbHso00xtofWB00bcVst7',
            dimensions: { width: 800, height: 600 }
        })

        console.log(`✅ Post created with ID: ${post.id}`)

        // 2. Test Like Counter Synchronization
        console.log('\n2️⃣ Testing Like Counter Synchronization...')
        const initialPost = await postRepository.findById(post.id)
        console.log(`Initial likes: ${initialPost?.likes_count}`)

        await likeRepository.addLike(testUserId, post.id, testEventId)
        let updatedPost = await postRepository.findById(post.id)
        console.log(`Likes after 1st like: ${updatedPost?.likes_count}`)

        if (updatedPost?.likes_count !== 1) {
            throw new Error(`Expected likes_count to be 1, got ${updatedPost?.likes_count}`)
        }

        // Double like (should fail/ignored)
        await likeRepository.addLike(testUserId, post.id, testEventId)
        updatedPost = await postRepository.findById(post.id)
        console.log(`Likes after double like: ${updatedPost?.likes_count}`)
        if (updatedPost?.likes_count !== 1) {
            throw new Error(`Expected likes_count to remain 1, got ${updatedPost?.likes_count}`)
        }

        await likeRepository.removeLike(testUserId, post.id)
        updatedPost = await postRepository.findById(post.id)
        console.log(`Likes after unlike: ${updatedPost?.likes_count}`)
        if (updatedPost?.likes_count !== 0) {
            throw new Error(`Expected likes_count to be 0, got ${updatedPost?.likes_count}`)
        }
        console.log('✅ Like synchronization verified.')

        // 3. Test Comment Counter Synchronization
        console.log('\n3️⃣ Testing Comment Counter Synchronization...')
        const comment = await commentRepository.createComment(testUserId, post.id, 'Nice photo!', testEventId)
        updatedPost = await postRepository.findById(post.id)
        console.log(`Comments after 1st comment: ${updatedPost?.comments_count}`)
        if (updatedPost?.comments_count !== 1) {
            throw new Error(`Expected comments_count to be 1, got ${updatedPost?.comments_count}`)
        }

        await commentRepository.deleteComment((comment as any)._id.toString(), testUserId)
        updatedPost = await postRepository.findById(post.id)
        console.log(`Comments after deletion: ${updatedPost?.comments_count}`)
        if (updatedPost?.comments_count !== 0) {
            throw new Error(`Expected comments_count to be 0, got ${updatedPost?.comments_count}`)
        }
        console.log('✅ Comment synchronization verified.')

        // 4. Test Pagination logic
        console.log('\n4️⃣ Testing Pagination Logic...')
        // Create 5 more posts
        for (let i = 0; i < 5; i++) {
            await postRepository.create({
                event_id: testEventId,
                user_id: testUserId,
                user_name: 'Test Tester',
                media_url: `https://example.com/test-${i}.jpg`,
                media_type: 'image',
                wish_text: `Test post ${i}`,
                status: 'approved',
                likes_count: 0,
                comments_count: 0,
                dimensions: { width: 800, height: 600 }
            })
        }

        const page1 = await postRepository.findWithPagination(testEventId, 1, 3)
        console.log(`Page 1: ${page1.posts.length} posts, total: ${page1.total}, hasMore: ${page1.hasMore}`)
        if (page1.posts.length !== 3 || page1.total !== 6 || !page1.hasMore) {
            throw new Error('Pagination logic failed for Page 1')
        }

        const page2 = await postRepository.findWithPagination(testEventId, 2, 3)
        console.log(`Page 2: ${page2.posts.length} posts, total: ${page2.total}, hasMore: ${page2.hasMore}`)
        if (page2.posts.length !== 3 || page2.hasMore) {
            throw new Error('Pagination logic failed for Page 2')
        }
        console.log('✅ Pagination logic verified.')

        // Cleanup
        console.log('\n🧹 Cleaning up test data...')
        await postRepository.updateMany({ event_id: testEventId }, { status: 'rejected' }) // Status reject to hide
        // We could deleteMany here but keeping for audit if needed, but let's delete for clean test
        await mongoose.connection.collection('posts').deleteMany({ event_id: testEventId })
        await mongoose.connection.collection('likes').deleteMany({ eventId: testEventId })
        await mongoose.connection.collection('comments').deleteMany({ eventId: testEventId })

        console.log('\n🏁 Suite Completed Successfully!')

    } catch (error) {
        console.error(`\n❌ Test Suite Failed: ${error}`)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
    }
}

runRepositoryTests()
