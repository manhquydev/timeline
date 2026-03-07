import { GreetingManagementList } from '@/components/admin/greeting-management-list'
import { greetingRepository } from '@/lib/mongodb/repositories'

export const metadata = {
  title: 'Quản Lý Lời Chúc | Timeline Teky Hoàng Mai',
}

export const dynamic = 'force-dynamic'

export default async function AdminGreetingsPage() {
  let pendingCount = 0
  try {
    pendingCount = await greetingRepository.countPending()
  } catch {
    // Non-blocking
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💌 Quản Lý Lời Chúc</h1>
        <p className="text-sm text-gray-500 mt-1">
          Duyệt lời chúc từ người dùng để hiển thị trên thiệp 8/3
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
              {pendingCount} chờ duyệt
            </span>
          )}
        </p>
      </div>
      <GreetingManagementList />
    </div>
  )
}
