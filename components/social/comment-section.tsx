'use client'

import { useState, useEffect } from 'react'
import { CommentItem } from './comment-item'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle, Send } from 'lucide-react'
import { useSocial } from '@/hooks/use-social'
import { IComment } from '@/lib/mongodb/models'
import { createBrowserClient } from '@supabase/ssr'

interface CommentSectionProps {
    postId: string
    userId?: string
    initialComments?: IComment[]
    initialTotal?: number
    className?: string
}

export function CommentSection({
    postId,
    userId,
    initialComments = [],
    initialTotal = 0,
    className
}: CommentSectionProps) {
    const { postComment, fetchComments } = useSocial(postId)
    const [comments, setComments] = useState(initialComments)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(initialTotal > initialComments.length)

    // Setup Realtime
    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const channel = supabase.channel('social-events')

        channel.on('broadcast', { event: 'comment:add' }, ({ payload }) => {
            if (payload.postId === postId) {
                // Add new comment to list if not already present
                setComments(prev => {
                    if (prev.find(c => (c as any)._id === payload.comment._id)) return prev
                    return [payload.comment, ...prev]
                })
            }
        }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [postId])

    const handleSubmit = async () => {
        if (!newComment.trim()) return

        setIsSubmitting(true)
        try {
            const comment = await postComment(newComment)
            setComments(prev => [comment, ...prev])
            setNewComment('')
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLoadMore = async () => {
        setIsLoading(true)
        try {
            const nextPage = page + 1
            const data = await fetchComments(nextPage)
            setComments(prev => [...prev, ...data.comments])
            setPage(nextPage)
            setHasMore(comments.length + data.comments.length < data.total)
        } finally {
            setIsLoading(false)
        }
    }

    // Handlers passed to CommentItem (using API routes defined in hooks normally, but implementing directly here/hook for simplicity)
    const handleReply = async (parentId: string, content: string) => {
        await postComment(content, parentId)
    }

    const handleEdit = async (commentId: string, content: string) => {
        const res = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        })
        if (res.ok) {
            const { comment } = await res.json()
            setComments(prev => prev.map(c => (c as any)._id === commentId ? comment : c))
        }
    }

    const handleDelete = async (commentId: string) => {
        const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
        if (res.ok) {
            setComments(prev => prev.filter(c => (c as any)._id !== commentId))
        }
    }

    // Flatten/Nest comments logic could go here if we fetch flat and nest client side
    // For now assuming we list them flat or handle nesting in future iteration
    // A simple filter for top-level vs replies
    const topLevelComments = comments.filter(c => !c.parentCommentId)
    const getReplies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId)

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Comments</h3>
            </div>

            {/* Input Area */}
            {userId ? (
                <div className="flex gap-3 mb-8">
                    <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newComment.trim()}
                        className="h-10 w-10 shrink-0 mt-1"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center mb-6 text-sm text-muted-foreground">
                    Please log in to comment
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-2">
                {topLevelComments.map((comment: any) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        currentUserId={userId}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        replies={getReplies(comment._id) as any}
                    />
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}

                {hasMore && (
                    <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Load more comments'}
                    </Button>
                )}
            </div>
        </div>
    )
}
