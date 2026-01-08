'use client'

/**
 * Infinite Posts Hook
 * Provides cursor-based pagination for posts with caching
 * Uses TanStack Query's useInfiniteQuery for efficient data fetching
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import type { Post } from '@/lib/types'

interface PostsResponse {
  posts: Post[]
  nextCursor: string | null
}

interface UseInfinitePostsOptions {
  eventId: string
  limit?: number
  enabled?: boolean
}

/**
 * Fetch posts with cursor-based pagination
 */
async function fetchPosts(
  eventId: string,
  cursor: string | undefined,
  limit: number
): Promise<PostsResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  })

  if (cursor) {
    params.set('cursor', cursor)
  }

  const response = await fetch(`/api/events/${eventId}/posts?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }

  return response.json()
}

/**
 * Hook for infinite scrolling posts
 *
 * @example
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts({
 *   eventId: 'event-123',
 *   limit: 20,
 * })
 *
 * // Flatten pages to get all posts
 * const allPosts = data?.pages.flatMap(page => page.posts) ?? []
 */
export function useInfinitePosts({
  eventId,
  limit = 20,
  enabled = true,
}: UseInfinitePostsOptions) {
  return useInfiniteQuery({
    queryKey: ['posts', eventId],
    queryFn: ({ pageParam }) => fetchPosts(eventId, pageParam, limit),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && !!eventId,
    // Keep previous data while fetching new
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook for fetching single event posts (non-paginated, for initial SSR data)
 */
export function useEventPosts(eventId: string, initialData?: Post[]) {
  return useInfiniteQuery({
    queryKey: ['posts', eventId],
    queryFn: ({ pageParam }) => fetchPosts(eventId, pageParam, 20),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!eventId,
    // Use SSR data as initial data for first page
    initialData: initialData
      ? {
          pages: [{ posts: initialData, nextCursor: null }],
          pageParams: [undefined],
        }
      : undefined,
  })
}
