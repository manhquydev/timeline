import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="min-h-screen">
            {/* Header Skeleton */}
            <div className="border-b bg-background">
                <div className="container mx-auto px-4 py-6 md:py-8">
                    {/* Logo Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-12 w-48" />
                    </div>

                    {/* Cover Image Skeleton */}
                    <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden mb-6">
                        <Skeleton className="w-full h-full" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                            {/* Title & Badge */}
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-3/4 max-w-md" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>

                            {/* Description */}
                            <Skeleton className="h-4 w-full max-w-2xl" />
                            <Skeleton className="h-4 w-2/3 max-w-xl" />

                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>

                        {/* Upload Button Placeholder */}
                        <Skeleton className="h-11 w-32 rounded-md hidden md:block" />
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
