'use client'

import { useEffect, useState } from 'react'
import type { Event, Post } from '@/lib/types'
import { EventCard } from './event-card'

interface EventCardWithPhotosProps {
  event: Event
  gradientIndex?: number
}

export function EventCardWithPhotos({ event, gradientIndex }: EventCardWithPhotosProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only fetch if event has photos
    if (event.total_photos > 0) {
      setIsLoading(true)

      // Fetch approved posts for this event
      fetch(`/api/events/${event.id}/posts?status=approved&limit=9`)
        .then((res) => res.json())
        .then((data) => {
          if (data.posts) {
            setPosts(data.posts)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch posts:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [event.id, event.total_photos])

  return <EventCard event={event} gradientIndex={gradientIndex} posts={posts} />
}
