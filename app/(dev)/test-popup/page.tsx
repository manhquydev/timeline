'use client'

import { EventNotificationPopupPreview } from '@/components/event-notifications'
import { Button } from '@/components/ui/button'
import { useEventPopupStore } from '@/lib/stores/event-popup-store'

/**
 * Test/Preview Page for Event Notification Popup
 * Access at /test-popup to preview the popup design
 *
 * IMPORTANT: Remove this page or protect it in production!
 */
export default function TestPopupPage() {
  const { openPopup, reset } = useEventPopupStore()

  const handleOpenPopup = () => {
    // Clear localStorage to allow reopening
    localStorage.removeItem('event_notification_seen_womens-day-2025')
    reset()
    openPopup('womens-day-2025')
  }

  const handleClearStorage = () => {
    localStorage.removeItem('event_notification_seen_womens-day-2025')
    reset()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full glass rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Event Popup Test Page 🎉
          </h1>
          <p className="text-gray-600">
            Preview thiết kế popup thông báo sự kiện
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/50 rounded-xl p-6 space-y-3">
            <h2 className="font-bold text-lg text-gray-900">
              Hướng dẫn test:
            </h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✅ Nhấn &quot;Mở Popup&quot; để xem thiết kế</li>
              <li>✅ Click vào card để xem hiệu ứng flip</li>
              <li>✅ Test trên mobile để kiểm tra responsive</li>
              <li>✅ Popup chỉ hiện 1 lần - dùng &quot;Reset&quot; để xem lại</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleOpenPopup}
              size="lg"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold"
            >
              🎁 Mở Popup
            </Button>

            <Button
              onClick={handleClearStorage}
              size="lg"
              variant="outline"
              className="flex-1"
            >
              🔄 Reset Storage
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Chú ý:</strong> Trang này chỉ dùng để test. Hãy xóa hoặc bảo vệ route này trước khi deploy production!
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-blue-900 font-semibold">
              📅 Thời gian hiển thị popup:
            </p>
            <p className="text-sm text-blue-700">
              Từ <strong>15/10/2025</strong> đến <strong>21/10/2025</strong>
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Popup sẽ tự động hiển thị trong khoảng thời gian này. Ngoài thời gian này, popup sẽ không hiển thị trên production.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-purple-600 transition-colors">
              📝 Cấu hình sự kiện
            </summary>
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-purple-300">
              <p><strong>Event ID:</strong> womens-day-2025</p>
              <p><strong>Gradient:</strong> gradient-5 (Pink/Magenta)</p>
              <p><strong>Delay:</strong> 2 seconds sau khi load page</p>
              <p><strong>Storage:</strong> localStorage key <code className="bg-gray-100 px-2 py-0.5 rounded">event_notification_seen_womens-day-2025</code></p>
            </div>
          </details>
        </div>
      </div>

      {/* Preview component - will show popup */}
      <EventNotificationPopupPreview eventId="womens-day-2025" />
    </div>
  )
}
