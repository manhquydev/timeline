'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/lib/stores/notification-store'

interface NotificationBellProps {
    userId?: string
}

interface Notification {
    _id: string
    title: string
    message: string
    type: string
    read: boolean
    link?: string
    createdAt: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const supabase = createClient()

    // Use global store for unread count (shared with mobile nav)
    const { unreadCount, setUnreadCount } = useNotificationStore()
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (err) {
            console.error('Error fetching notifications:', err)
        }
    }, [setUnreadCount])

    useEffect(() => {
        fetchNotifications()

        // Subscribe to real-time notifications
        const channel = supabase
            .channel('social-events')
            .on('broadcast', { event: 'notification:new' }, (payload) => {
                if (payload.payload.recipientId === userId) {
                    fetchNotifications()
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id })
            })
            fetchNotifications()
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true })
            })
            fetchNotifications()
        } catch (err) {
            console.error('Error marking all as read:', err)
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] animate-in zoom-in"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <DropdownMenuLabel className="font-bold text-base">Thông báo</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-8 text-primary hover:text-primary/80"
                        >
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`p-4 transition-colors cursor-pointer hover:bg-muted/30 ${!notif.read ? 'bg-primary/5' : ''}`}
                                    onClick={() => !notif.read && markAsRead(notif._id)}
                                >
                                    <div className="flex justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className={`text-sm font-bold ${!notif.read ? 'text-primary' : ''}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    {notif.link && (
                                        <Link
                                            href={notif.link}
                                            className="mt-2 flex items-center gap-1 text-[10px] text-primary font-bold hover:underline"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Xem chi tiết <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-60 flex flex-col items-center justify-center text-muted-foreground">
                            <Bell className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">Chưa có thông báo nào</p>
                        </div>
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <Button variant="ghost" className="w-full text-xs font-bold" asChild onClick={() => setIsOpen(false)}>
                        <Link href="/settings/security">Xem tất cả hoạt động</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
