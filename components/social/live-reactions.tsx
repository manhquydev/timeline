'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Reaction {
    id: string
    x: number
    color: string
    type: string
}

export function LiveReactions({ eventId }: { eventId?: string }) {
    const [reactions, setReactions] = useState<Reaction[]>([])

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Listen for likes on any post within this event, or global if no eventId
        const channelName = eventId ? `event-${eventId}` : 'social-events'
        const channel = supabase.channel(channelName)
            .on('broadcast', { event: 'message' }, ({ payload }) => {
                if (payload.type === 'post:like' || payload.type === 'post:reaction') {
                    addReaction(payload.type)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId])

    const addReaction = (type: string) => {
        const id = Math.random().toString(36).substring(7)
        const x = Math.random() * 80 + 10 // 10% to 90% width
        const colors = ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6', '#3b82f6']
        const color = colors[Math.floor(Math.random() * colors.length)]

        setReactions(prev => [...prev, { id, x, color, type }])

        // Remove reaction after animation
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id))
        }, 4000)
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {reactions.map((reaction) => (
                    <motion.div
                        key={reaction.id}
                        initial={{ y: '100vh', x: `${reaction.x}vw`, scale: 0, opacity: 0 }}
                        animate={{
                            y: '-10vh',
                            x: `${reaction.x + (Math.random() * 10 - 5)}vw`,
                            scale: [0, 1.5, 1],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{ duration: 4, ease: "easeOut" }}
                        className="absolute bottom-0"
                    >
                        <Heart
                            className="w-8 h-8 fill-current"
                            style={{ color: reaction.color, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))' }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
