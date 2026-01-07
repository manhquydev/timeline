'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PresenceState } from '@/hooks/use-realtime-collaboration'

interface PresenceAvatarGroupProps {
    presence: PresenceState
    maxDisplay?: number
}

export function PresenceAvatarGroup({ presence, maxDisplay = 5 }: PresenceAvatarGroupProps) {
    // Flatten presence state into a list of unique users
    const onlineUsers = Object.entries(presence).map(([key, presences]) => {
        return {
            id: key,
            name: presences[0]?.user_name || 'Khách',
            avatar: presences[0]?.avatar_url,
        }
    })

    const displayUsers = onlineUsers.slice(0, maxDisplay)
    const remainingCount = Math.max(0, onlineUsers.length - maxDisplay)

    if (onlineUsers.length === 0) return null

    return (
        <TooltipProvider>
            <div className="flex -space-x-2 overflow-hidden">
                {displayUsers.map((user) => (
                    <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                            <Avatar className="inline-block border-2 border-background ring-2 ring-primary/10 transition-transform hover:scale-110 hover:z-10">
                                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-[10px] font-bold">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs font-semibold">{user.name}</p>
                            <p className="text-[10px] opacity-70">Đang xem</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {remainingCount > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-[10px] font-bold text-muted-foreground z-0">
                        +{remainingCount}
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}
