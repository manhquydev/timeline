'use client'

import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Post } from '@/lib/types'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PinboardUserGrid } from '@/components/photos/pinboard-user-grid'
import { Calendar, User } from 'lucide-react'

interface SmartAlbumViewProps {
    posts: Post[]
}

export function SmartAlbumView({ posts }: SmartAlbumViewProps) {
    const [activeTab, setActiveTab] = useState('date')

    // Group by Date
    const postsByDate = useMemo(() => {
        const groups: { [key: string]: Post[] } = {}

        posts.forEach(post => {
            const date = post.uploaded_at ? format(parseISO(post.uploaded_at), 'yyyy-MM-dd') : 'unknown'
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(post)
        })

        // Sort dates descending
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
    }, [posts])

    return (
        <div className="space-y-6">
            <Tabs defaultValue="date" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Theo Ngày
                        </TabsTrigger>
                        <TabsTrigger value="people" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Người Đăng
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="date" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                    {postsByDate.length > 0 ? (
                        postsByDate.map(([date, datePosts]) => (
                            <div key={date} className="space-y-4">
                                <div className="flex items-center gap-3 sticky top-0 z-10 bg-background/80 backdrop-blur-md p-3 rounded-lg border shadow-sm">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold capitalize">
                                            {date === 'unknown'
                                                ? 'Chưa xác định'
                                                : format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: vi })}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {datePosts.length} khoảnh khắc
                                        </p>
                                    </div>
                                </div>

                                <div className="pl-4 border-l-2 border-primary/20 ml-4">
                                    <PhotoGrid posts={datePosts} showUserInfo={true} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            Chưa có ảnh nào để hiển thị.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="people" className="mt-0 animate-in fade-in-50 duration-500">
                    <PinboardUserGrid posts={posts} showUserInfo={true} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
