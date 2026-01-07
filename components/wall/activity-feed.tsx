'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Zap, UserPlus, Image as ImageIcon, Sparkles, Heart } from 'lucide-react'
import type { Activity } from '@/hooks/use-realtime-collaboration'

interface ActivityFeedProps {
    activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-6 border-b">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Hoạt động gần đây
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Theo dõi các cập nhật mới nhất từ wall này.
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 text-sm animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="relative shrink-0">
                            <Avatar className="w-10 h-10 border-2 border-background ring-1 ring-border shadow-sm">
                                {activity.avatar_url && <AvatarImage src={activity.avatar_url} alt={activity.user_name} />}
                                <AvatarFallback className="bg-muted text-[10px] font-bold">
                                    {activity.user_name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm ring-1 ring-border">
                                {activity.type === 'join' && <UserPlus className="w-3 h-3 text-emerald-500" />}
                                {activity.type === 'post' && <ImageIcon className="w-3 h-3 text-blue-500" />}
                                {activity.type === 'like' && <Heart className="w-3 h-3 text-red-500 fill-red-500" />}
                                {activity.type === 'system' && <Zap className="w-3 h-3 text-amber-500" />}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold hover:text-primary transition-colors cursor-default truncate">
                                        {activity.user_name}
                                    </span>
                                    <time className="text-[10px] text-muted-foreground/60 font-medium shrink-0">
                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: vi })}
                                    </time>
                                </div>
                                <p className="text-muted-foreground text-[13px] mt-0.5 leading-relaxed">
                                    {activity.type === 'join' && 'vừa bước vào wall này'}
                                    {activity.type === 'leave' && 'đã tạm biệt wall'}
                                    {activity.type === 'post' && (
                                        <>
                                            đã chia sẻ <span className="font-semibold text-foreground">{activity.metadata?.count || 1}</span> khoảnh khắc mới
                                        </>
                                    )}
                                    {activity.type === 'like' && 'vừa yêu thích một khoảnh khắc'}
                                    {activity.type === 'system' && activity.metadata?.message}
                                </p>
                            </div>
                            {activity.type === 'post' && activity.metadata?.thumbnail && (
                                <div className="mt-3 rounded-xl overflow-hidden border bg-muted aspect-video relative group shadow-sm ring-1 ring-black/5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activity.metadata.thumbnail}
                                        alt="New post thumbnail"
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                            <Zap className="w-8 h-8 text-muted-foreground/30 stroke-1" />
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">Chưa có hoạt động nào</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                            Các cập nhật mới từ wall sẽ xuất hiện tại đây.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
