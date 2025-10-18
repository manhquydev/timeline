'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/themes/theme-provider'

/**
 * ThemeBanner - Hiển thị banner thông báo khi có theme đặc biệt được kích hoạt
 *
 * Component này sẽ tự động hiển thị khi:
 * 1. Theme 20/10 được kích hoạt
 * 2. User chưa đóng banner trong session hiện tại
 *
 * Features:
 * - Animation mượt mà khi xuất hiện/ẩn
 * - Gradient động theo theme
 * - Có thể đóng và lưu trạng thái vào localStorage
 * - Mobile responsive
 */

export function ThemeBanner() {
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Kiểm tra xem banner có nên hiển thị không
  useEffect(() => {
    if (!theme) return

    // Chỉ hiển thị cho theme đặc biệt (không phải default)
    const isSpecialTheme = theme.name !== 'default'

    // Kiểm tra localStorage xem user đã đóng banner chưa
    const storageKey = `theme-banner-closed-${theme.name}`
    const wasClosed = localStorage.getItem(storageKey) === 'true'

    // Hiển thị nếu là theme đặc biệt và chưa bị đóng
    if (isSpecialTheme && !wasClosed) {
      // Delay một chút để animation mượt hơn
      setTimeout(() => setIsVisible(true), 300)
    } else {
      setIsVisible(false)
    }
  }, [theme])

  const handleClose = () => {
    if (!theme) return

    setIsClosing(true)

    // Lưu trạng thái đã đóng vào localStorage
    const storageKey = `theme-banner-closed-${theme.name}`
    localStorage.setItem(storageKey, 'true')

    // Ẩn banner sau khi animation kết thúc
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 300)
  }

  // Không render nếu không visible hoặc không có theme
  if (!isVisible || !theme) return null

  // Lấy gradient từ theme
  const gradientColors = theme.gradients.hero.join(', ')

  return (
    <div
      className={`
        relative overflow-hidden
        transition-all duration-300 ease-out
        ${isClosing ? 'opacity-0 translate-y-[-100%]' : 'opacity-100 translate-y-0'}
      `}
      style={{
        background: `linear-gradient(135deg, ${gradientColors})`,
      }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon & Message */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse-slow">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-white drop-shadow-lg">
                {theme.displayName}
              </h2>
            </div>
          </div>

          {/* Right: Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-white/20 text-white hover:text-white transition-all hover:scale-110 touch-target-sm"
            aria-label="Đóng banner"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  )
}
