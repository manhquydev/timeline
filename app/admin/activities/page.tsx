import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { ActivitiesClient } from './activities-client'

export const metadata = {
  title: 'Hoạt Động | Quản Trị',
  description: 'Xem tất cả hoạt động gần đây trong hệ thống',
}

export default function ActivitiesPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6 admin-content-mobile">
        {/* Header */}
        <div>
          <h1 className="admin-header-mobile font-bold mb-2 flex items-center gap-3">
            <Activity className="w-7 h-7 text-purple-600" />
            Hoạt Động Gần Đây
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Theo dõi tất cả hoạt động trong hệ thống
          </p>
        </div>

        {/* Activities List */}
        <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base">Tất Cả Hoạt Động</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ActivitiesLoadingSkeleton />}>
              <ActivitiesClient />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function ActivitiesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
