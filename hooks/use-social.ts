'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useSocial(postId: string) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const toggleLike = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) throw new Error('Failed to toggle like')

            const data = await res.json()
            router.refresh()
            return data
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const postComment = async (content: string, parentCommentId?: string) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, parentCommentId })
            })

            if (!res.ok) throw new Error('Failed to post comment')

            const data = await res.json()
            return data.comment
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    // Simple fetcher for SWR or React Query if user wants to use it
    const fetchLikes = async () => {
        const res = await fetch(`/api/posts/${postId}/likes`)
        if (!res.ok) throw new Error('Failed to fetch likes')
        return res.json()
    }

    const fetchComments = async (page = 1) => {
        const res = await fetch(`/api/posts/${postId}/comments?page=${page}`)
        if (!res.ok) throw new Error('Failed to fetch comments')
        return res.json()
    }

    return {
        toggleLike,
        postComment,
        fetchLikes,
        fetchComments,
        isSubmitting
    }
}
