'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FlipCardProps {
  isFlipped: boolean
  onFlip: () => void
  frontContent: ReactNode
  backContent: ReactNode
  className?: string
  gradient?: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4' | 'gradient-5'
}

/**
 * 3D Flip Card Component
 * Mobile-optimized with smooth animations and touch support
 */
export function FlipCard({
  isFlipped,
  onFlip,
  frontContent,
  backContent,
  className,
  gradient = 'gradient-5',
}: FlipCardProps) {
  return (
    <div
      className={cn(
        'flip-card-container w-full max-w-sm mx-auto',
        'perspective-1000',
        className
      )}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Card Inner - handles the flip rotation */}
      <div
        className={cn(
          'flip-card-inner relative w-full',
          'h-[480px] sm:h-[540px]', // ← OPTIMIZED: Tăng height để fit content
          'transition-transform duration-700 ease-out',
          'transform-gpu', // GPU acceleration
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Face */}
        <div
          className={cn(
            'flip-card-face flip-card-front',
            'absolute inset-0 w-full',
            'cursor-pointer touch-manipulation',
            'rounded-2xl overflow-hidden',
            'glass-gradient',
            gradient,
            'border-2 border-white/30',
            'shadow-xl hover:shadow-2xl',
            'transition-shadow duration-300',
            // Hide back face when flipped
            'backface-hidden'
          )}
          onClick={onFlip}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {frontContent}
        </div>

        {/* Back Face */}
        <div
          className={cn(
            'flip-card-face flip-card-back',
            'absolute inset-0 w-full',
            'rounded-2xl overflow-hidden',
            'glass-gradient',
            gradient,
            'border-2 border-white/30',
            'shadow-xl',
            // Pre-rotated for flip effect
            'rotate-y-180',
            // Hide back face when not flipped
            'backface-hidden'
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </div>
    </div>
  )
}

/**
 * Front Card Content Component
 * Modern minimalist design with elegant gradients (2025 trends)
 */
interface FlipCardFrontProps {
  title: string
  subtitle: string
  icon: string
  ctaText: string
}

export function FlipCardFront({ title, subtitle, icon, ctaText }: FlipCardFrontProps) {
  return (
    <div className="relative h-[480px] sm:h-[540px] flex flex-col items-center justify-center p-6 sm:p-8 overflow-hidden">
      {/* Modern gradient mesh background - 2025 trend */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-pink-400/30 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-tr from-rose-400/25 to-fuchsia-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-52 sm:h-52 bg-gradient-to-br from-violet-400/20 to-pink-500/15 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Elegant decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {/* Subtle sparkles */}
        <div className="absolute top-12 right-12 text-2xl animate-float twinkle">✨</div>
        <div className="absolute bottom-16 left-16 text-xl animate-float twinkle" style={{ animationDelay: '0.5s' }}>💫</div>
        <div className="absolute top-24 left-20 text-lg animate-float twinkle" style={{ animationDelay: '1s' }}>⭐</div>
      </div>

      {/* Content - Minimalist & Elegant */}
      <div className="relative z-10 text-center space-y-5 sm:space-y-6 animate-scale-in max-w-[280px] sm:max-w-sm mx-auto">
        {/* Icon with glow effect */}
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-2xl opacity-50 bg-white/40 rounded-full scale-150" />
          <div className="relative text-7xl sm:text-8xl animate-float filter drop-shadow-2xl">
            {icon}
          </div>
        </div>

        {/* Title - Bold & Modern */}
        <div className="space-y-2">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-xl tracking-tight">
            {title}
          </h3>
          {/* Elegant divider */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-white/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <div className="h-px w-8 bg-white/60" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/95 font-medium leading-relaxed">
          {subtitle}
        </p>

        {/* CTA Button - Modern & Touch-friendly */}
        <div className="pt-2 sm:pt-4">
          <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/95 hover:bg-white rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 touch-target overflow-hidden">
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
              {ctaText}
            </span>
            <span className="relative text-xl group-hover:translate-x-1 transition-transform">👉</span>
          </button>
        </div>

        {/* Tap hint - Subtle animation */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse" />
          <p className="text-xs sm:text-sm text-white/80 font-medium animate-pulse">
            Nhấn để mở thiệp
          </p>
          <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * Back Card Content Component
 * Beautiful floral greeting card with elegant typography (2025 trends)
 */
interface FlipCardBackProps {
  title: string
  message: string
  greeting: string
  decorations: string[]
}

export function FlipCardBack({ title, message, greeting, decorations }: FlipCardBackProps) {
  return (
    <div className="relative h-[480px] sm:h-[540px] flex flex-col items-center justify-center p-5 sm:p-6 text-center overflow-hidden">
      {/* Elegant floral background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient background - feminine colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-purple-100/15 to-violet-100/20" />

        {/* Corner decorative floral elements */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 opacity-25">
          <div className="absolute top-4 left-4 text-4xl sm:text-5xl rotate-[-15deg]">🌸</div>
          <div className="absolute top-8 left-12 text-3xl sm:text-4xl rotate-[10deg]">🌺</div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 opacity-25">
          <div className="absolute top-4 right-4 text-4xl sm:text-5xl rotate-[15deg]">🌷</div>
          <div className="absolute top-10 right-10 text-3xl sm:text-4xl rotate-[-10deg]">🌹</div>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 opacity-25">
          <div className="absolute bottom-6 left-6 text-3xl sm:text-4xl rotate-[20deg]">💐</div>
          <div className="absolute bottom-2 left-14 text-2xl sm:text-3xl rotate-[-15deg]">🌺</div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 opacity-25">
          <div className="absolute bottom-4 right-4 text-4xl sm:text-5xl rotate-[-20deg]">🌸</div>
          <div className="absolute bottom-10 right-12 text-2xl sm:text-3xl rotate-[15deg]">✨</div>
        </div>
      </div>

      {/* Floating decorative emojis - subtle animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {decorations.slice(0, 6).map((emoji, index) => (
          <div
            key={index}
            className="absolute text-xl sm:text-2xl animate-float opacity-20"
            style={{
              top: `${15 + index * 12}%`,
              left: index % 2 === 0 ? '8%' : 'auto',
              right: index % 2 === 1 ? '8%' : 'auto',
              animationDelay: `${index * 0.7}s`,
              animationDuration: `${7 + index * 0.3}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Content - Elegant & Readable */}
      <div className="relative z-10 space-y-3 sm:space-y-4 animate-fade-in max-w-[300px] sm:max-w-md mx-auto">
        {/* Title - Bold & Elegant with responsive sizing */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-2xl tracking-tight leading-tight break-words">
            {title}
          </h2>

          {/* Decorative floral divider */}
          <div className="flex items-center gap-2 sm:gap-3 justify-center">
            <div className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="flex gap-1.5">
              <span className="text-xl sm:text-2xl filter drop-shadow-lg">🌸</span>
              <span className="text-xl sm:text-2xl filter drop-shadow-lg">💐</span>
              <span className="text-xl sm:text-2xl filter drop-shadow-lg">🌺</span>
            </div>
            <div className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>

        {/* Message - Beautiful typography with better contrast */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-base sm:text-lg text-white leading-relaxed font-medium px-2 drop-shadow-lg">
            {message}
          </p>

          {/* Greeting box - Enhanced with gradient background */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-fuchsia-400/20 rounded-2xl blur-md group-hover:blur-lg transition-all" />
            {/* Main box with gradient */}
            <div className="relative bg-gradient-to-br from-white/90 via-pink-50/80 to-purple-50/80 backdrop-blur-md border-2 border-white/60 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 shadow-2xl">
              <p className="text-sm sm:text-base lg:text-lg font-bold leading-snug flex items-center justify-center gap-2 flex-wrap">
                {/* Text with gradient - loại bỏ emoji */}
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-sm">
                  {greeting.split(' ').filter(word => !word.match(/[\u{1F000}-\u{1F9FF}]/u)).join(' ')}
                </span>
                {/* Emoji giữ nguyên màu sắc tự nhiên */}
                <span className="text-2xl sm:text-3xl">
                  💐
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Signature - Handwritten style */}
        <div className="pt-2 sm:pt-3 space-y-1.5">
          <div className="h-px w-16 bg-white/40 mx-auto" />
          <p className="text-xs sm:text-sm text-white/85 font-handwriting italic">
            Từ đội ngũ Teky Hoàng Mai
          </p>
          <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg opacity-80">
            <span className="animate-pulse">💝</span>
            <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>✨</span>
            <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>💕</span>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-40">
        <div className="w-2 h-2 rounded-full bg-white/60" />
        <div className="w-16 h-px bg-white/50" />
        <div className="w-2 h-2 rounded-full bg-white/60" />
      </div>
    </div>
  )
}
