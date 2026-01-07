/**
 * Cleanup script for orphaned media files in Supabase Storage.
 * Identifying files in Storage that don't have a corresponding record in MongoDB.
 * 
 * Run with: npx ts-node scripts/cleanup-orphaned-media.ts
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { connectToDatabase } from '../lib/mongodb/connection'
import Post from '../lib/mongodb/models/Post'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Requires Service Role for listing all files
)

async function cleanupOrphanedMedia() {
    console.log('🧹 Starting orphaned media cleanup...')

    try {
        await connectToDatabase()

        // 1. Get all media URLs from MongoDB
        const posts = await Post.find({}, { media_url: 1, thumbnail_url: 1 }).lean()
        const dbUrls = new Set<string>()

        posts.forEach(post => {
            if (post.media_url) dbUrls.add(post.media_url)
            if (post.thumbnail_url) dbUrls.add(post.thumbnail_url)
        })

        console.log(`📊 Found ${dbUrls.size} unique media URLs in database.`)

        // 2. List files from Supabase Storage (assuming 'timeline-assets' bucket)
        const bucketName = 'timeline-assets'
        const { data: files, error } = await supabase.storage.from(bucketName).list('', {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        })

        if (error) throw error
        if (!files) return

        console.log(`📊 Found ${files.length} files in storage bucket '${bucketName}'.`)

        const orphanedFiles: string[] = []

        for (const file of files) {
            if (file.name === '.emptyFolderPlaceholder') continue

            // Construct the expected public URL to match against DB
            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file.name)

            if (!dbUrls.has(publicUrl)) {
                orphanedFiles.push(file.name)
            }
        }

        if (orphanedFiles.length === 0) {
            console.log('✨ No orphaned media found. Storage is clean!')
            return
        }

        console.log(`⚠️  Found ${orphanedFiles.length} orphaned files in storage.`)

        // Dry run or actual delete?
        if (process.argv.includes('--delete')) {
            console.log('🗑️  Deleting orphaned files...')
            const { error: deleteError } = await supabase.storage.from(bucketName).remove(orphanedFiles)
            if (deleteError) throw deleteError
            console.log('✅ Successfully deleted orphaned media.')
        } else {
            console.log('💡 Run with --delete to actually remove these files.')
            console.log('Orphaned filenames:', orphanedFiles)
        }

    } catch (error) {
        console.error('❌ Error during media cleanup:', error)
    } finally {
        process.exit(0)
    }
}

cleanupOrphanedMedia()
