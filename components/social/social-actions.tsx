'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeartButton } from './heart-button'
import { createBrowserClient } from '@supabase/ssr'
import { cn } from '@/lib/utils'
import { Post } from '@/lib/types'

interface SocialActionsProps {
    post: Post
    userId?: string
    showCounts?: boolean
    className?: string
    onCommentClick?: () => void
}

export function SocialActions({
    post,
    userId,
    showCounts = true,
    className,
    onCommentClick
}: SocialActionsProps) {
    const [liked, setLiked] = useState(!!post.current_user_liked)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
    const [isSharing, setIsSharing] = useState(false)

    useEffect(() => {
        // Listen for real-time updates to this specific post
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const channel = supabase.channel(`post-${post.id}`)
            .on('broadcast', { event: 'post:like' }, ({ payload }) => {
                if (payload.postId === post.id) {
                    setLikesCount(prev => prev + 1)
                }
            })
            .on('broadcast', { event: 'post:unlike' }, ({ payload }) => {
                if (payload.postId === post.id) {
                    setLikesCount(prev => Math.max(0, prev - 1))
                }
            })
            .on('broadcast', { event: 'comment:add' }, ({ payload }) => {
                if (payload.postId === post.id) {
                    setCommentsCount(prev => prev + 1)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [post.id])

    const handleLike = async () => {
        // Optimistic update
        const newLiked = !liked
        setLiked(newLiked)
        setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to toggle like')
            // The actual state will be synced via real-time or if we want to be safe,
            // we can parse the response: const data = await res.json(); setLiked(data.liked);
        } catch (error) {
            // Revert optimistic update on error
            setLiked(!newLiked)
            setLikesCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1))
            console.error(error)
        }
    }

    const handleShare = async () => {
        if (typeof navigator === 'undefined' || !navigator.share) {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${window.location.origin}/events/${post.event_id}?postId=${post.id}`)
                // Show toast (ideally we have a global toast)
                setIsSharing(true)
                setTimeout(() => setIsSharing(false), 2000)
            } catch (err) {
                console.error('Failed to copy', err)
            }
            return
        }

        try {
            await navigator.share({
                title: 'Check out this memory!',
                text: post.wish_text || 'A memory shared on Company Timeline',
                url: `${window.location.origin}/events/${post.event_id}?postId=${post.id}`
            })
        } catch (error) {
            console.error('Error sharing', error)
        }
    }

    return (
        <div className={cn("flex items-center gap-4", className)}>
            <div className="flex flex-col items-center gap-1">
                <HeartButton
                    isLiked={liked}
                    likeCount={likesCount}
                    onToggle={handleLike}
                    className="p-2 transition-transform hover:scale-110 active:scale-95"
                    showCount={false} // We show count below or handled by SocialActions
                />
                {showCounts && (
                    <span className="text-[10px] font-semibold text-white/80 tabular-nums">
                        {likesCount}
                    </span>
                )}
            </div>

            <div className="flex flex-col items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95 backdrop-blur-sm transition-all"
                    onClick={onCommentClick}
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
                {showCounts && (
                    <span className="text-[10px] font-semibold text-white/80 tabular-nums">
                        {commentsCount}
                    </span>
                )}
            </div>

            <div className="flex flex-col items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95 backdrop-blur-sm transition-all"
                    onClick={handleShare}
                >
                    {isSharing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
                </Button>
                {showCounts && (
                    <span className="text-[10px] font-semibold text-white/80">
                        Share
                    </span>
                )}
            </div>
        </div>
    )
}
