'use client'

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HeartButtonProps {
    isLiked: boolean
    likeCount: number
    onToggle: () => Promise<void>
    className?: string
    showCount?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function HeartButton({
    isLiked: initialIsLiked,
    likeCount: initialLikeCount,
    onToggle,
    className,
    showCount = true,
    size = 'md'
}: HeartButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLiked(initialIsLiked)
        setLikeCount(initialLikeCount)
    }, [initialIsLiked, initialLikeCount])

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLoading) return

        // Optimistic update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1)

        if (newIsLiked) {
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), 1000)
        }

        setIsLoading(true)
        try {
            await onToggle()
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1)
            console.error('Failed to toggle like:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const sizeClasses = {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3',
        lg: 'h-12 px-4 text-lg'
    }

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={cn(
                "group relative transition-all duration-300 hover:bg-red-50 hover:text-red-500",
                sizeClasses[size],
                className
            )}
            disabled={isLoading}
        >
            <div className="relative flex items-center gap-1.5">
                <Heart
                    className={cn(
                        "transition-all duration-300",
                        iconSizes[size],
                        isLiked ? "fill-red-500 text-red-500 scale-110" : "text-gray-500 group-hover:scale-110",
                        isAnimating && "animate-ping"
                    )}
                />

                {/* Foreground heart for animation stability */}
                {isLiked && (
                    <Heart
                        className={cn(
                            "absolute top-0 left-0 transition-all duration-300",
                            iconSizes[size],
                            "fill-red-500 text-red-500 scale-110"
                        )}
                    />
                )}

                {showCount && (
                    <span className={cn(
                        "font-medium tabular-nums transition-colors",
                        isLiked ? "text-red-600" : "text-gray-600"
                    )}>
                        {likeCount}
                    </span>
                )}
            </div>
        </Button>
    )
}
