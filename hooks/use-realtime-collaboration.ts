'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface PresenceState {
    [key: string]: {
        user_id: string
        user_name: string
        avatar_url?: string
        online_at: string
    }[]
}

export interface RealtimeMessage {
    type: string
    payload: any
    sender_id?: string
}

export interface Activity {
    id: string
    type: 'join' | 'leave' | 'post' | 'system'
    user_name: string
    avatar_url?: string
    timestamp: number
    metadata?: any
}

export function useRealtimeCollaboration(eventId: string, userName?: string, userId?: string, avatarUrl?: string) {
    const [presence, setPresence] = useState<PresenceState>({})
    const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [activities, setActivities] = useState<Activity[]>([])
    const channelRef = useRef<RealtimeChannel | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!eventId) return

        // Initialize channel
        const channelName = `event-${eventId}`
        const channel = supabase.channel(channelName, {
            config: {
                presence: {
                    key: userId || 'anonymous',
                },
            },
        })

        channelRef.current = channel

        // 1. Handle Presence
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState<any>()
                setPresence(state)
                console.log('Realtime presence synced:', state)
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                const user = newPresences[0]
                if (user && user.user_id !== userId) {
                    setActivities(prev => [{
                        id: Math.random().toString(36).substring(2, 9),
                        type: 'join' as const,
                        user_name: user.user_name || 'Khách',
                        avatar_url: user.avatar_url,
                        timestamp: Date.now()
                    }, ...prev].slice(0, 50))
                }
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                const user = leftPresences[0]
                if (user && user.user_id !== userId) {
                    setActivities(prev => [{
                        id: Math.random().toString(36).substring(2, 9),
                        type: 'leave' as const,
                        user_name: user.user_name || 'Khách',
                        avatar_url: user.avatar_url,
                        timestamp: Date.now()
                    }, ...prev].slice(0, 50))
                }
            })

        // 2. Handle Broadcasts (Custom Events)
        channel.on('broadcast', { event: 'message' }, ({ payload }) => {
            setLastMessage(payload)
            console.log('Realtime message received:', payload)

            if (payload.type === 'new_posts') {
                const posts = payload.posts
                if (posts && posts.length > 0) {
                    setActivities(prev => [{
                        id: Math.random().toString(36).substring(2, 9),
                        type: 'post' as const,
                        user_name: posts[0].user_name || 'Ai đó',
                        avatar_url: posts[0].avatar_url,
                        timestamp: Date.now(),
                        metadata: {
                            count: posts.length,
                            thumbnail: posts[0].thumbnail_url
                        }
                    }, ...prev].slice(0, 50))
                }
            } else if (payload.type === 'upload_started') {
                setActivities(prev => [{
                    id: Math.random().toString(36).substring(2, 9),
                    type: 'system' as const,
                    user_name: payload.user_name || 'Khách',
                    avatar_url: payload.avatar_url,
                    timestamp: Date.now(),
                    metadata: {
                        message: `đang tải lên ${payload.count || ''} ảnh...`
                    }
                }, ...prev].slice(0, 50))
            }
        })

        // Subscribe to the channel
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true)
                console.log(`Successfully subscribed to ${channelName}`)

                // Track presence once subscribed
                await channel.track({
                    user_id: userId || 'anonymous',
                    user_name: userName || 'Khách',
                    avatar_url: avatarUrl,
                    online_at: new Date().toISOString(),
                })
            } else {
                setIsConnected(false)
            }
        })

        return () => {
            if (channelRef.current) {
                console.log(`Unsubscribing from ${channelName}`)
                channelRef.current.unsubscribe()
            }
        }
    }, [eventId, userName, userId, supabase])

    const broadcastMessage = useCallback(async (type: string, payload: any) => {
        if (channelRef.current && isConnected) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'message',
                payload: {
                    type,
                    payload,
                    sender_id: userId,
                },
            })
        } else {
            console.error('Cannot broadcast: channel not connected')
        }
    }, [isConnected, userId])

    return {
        presence,
        lastMessage,
        isConnected,
        broadcastMessage,
        onlineUsersCount: Object.keys(presence).length,
        activities,
    }
}
