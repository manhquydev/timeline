'use client'

import { useRef, useEffect } from 'react'
import { animate } from 'motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Camera, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/hooks/use-motion'

interface HeroSectionProps {
  isAdmin: boolean
  hasEvents: boolean
}

/**
 * HeroSection - Enhanced hero with kinetic typography and animations
 * Features:
 * - Animated gradient background with floating blobs
 * - Kinetic typography for title
 * - Scroll indicator
 * - Glass morphism CTA buttons
 */
export function HeroSection({ isAdmin, hasEvents }: HeroSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    // Staggered entrance animations
    const elements = [iconRef, titleRef, subtitleRef, ctaRef]
    elements.forEach((ref, index) => {
      if (ref.current) {
        animate(
          ref.current,
          {
            opacity: [0, 1],
            transform: ['translateY(30px)', 'translateY(0)']
          },
          {
            duration: 0.8,
            delay: index * 0.15,
            ease: [0.34, 1.56, 0.64, 1]
          }
        )
      }
    })
  }, [])

  return (
    <div className="relative min-h-[90vh] flex items-center gradient-animated overflow-hidden">
      {/* Animated Blob Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-[10%] w-[500px] h-[500px] bg-white/15 rounded-full blur-[100px] animate-blob"
        />
        <div
          className="absolute bottom-[20%] right-[5%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] animate-blob"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] animate-blob"
          style={{ animationDelay: '6s' }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/50 rounded-full animate-float"
            style={{
              left: `${(i * 8 + 5) % 100}%`,
              top: `${(i * 13 + 10) % 100}%`,
              animationDelay: `${(i * 0.5) % 6}s`,
              animationDuration: `${5 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-20 z-10">
        <div className="text-center text-white max-w-5xl mx-auto">
          {/* Animated icon */}
          <div
            ref={iconRef}
            className="inline-flex items-center justify-center w-28 h-28 mb-10 rounded-[2rem] glass-gradient shadow-2xl opacity-0"
          >
            <Camera className="w-14 h-14 text-primary drop-shadow-lg" />
          </div>

          {/* Kinetic Typography Title */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.1] opacity-0"
          >
            <span className="inline-block bg-gradient-to-r from-white via-white/95 to-white/85 bg-clip-text text-transparent drop-shadow-2xl">
              <span className="block mb-2">Timeline</span>
              <span className="block text-4xl md:text-5xl lg:text-6xl font-bold opacity-95">
                Teky Hoàng Mai
              </span>
            </span>
          </h1>

          {/* Subtitle with gradient underline */}
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg opacity-0"
          >
            Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ
            <span className="block mt-2 text-white/70 text-lg">
              của đại gia đình Teky Hoàng Mai
            </span>
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-wrap items-center justify-center gap-5 opacity-0"
          >
            {isAdmin && (
              <Button
                asChild
                size="lg"
                className={cn(
                  'glass-gradient text-primary font-bold shadow-2xl',
                  'text-lg px-10 py-7 rounded-2xl',
                  'border-2 border-white/50',
                  'hover:-translate-y-1 hover:shadow-white/30 transition-all duration-300'
                )}
              >
                <Link href="/admin/events/create">
                  <Plus className="h-6 w-6 mr-2" />
                  Tạo Sự Kiện Mới
                </Link>
              </Button>
            )}

            {hasEvents && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className={cn(
                  'glass text-primary border-2 border-primary/30',
                  'hover:border-primary/50 hover:bg-primary/5',
                  'font-bold text-lg px-10 py-7 rounded-2xl',
                  'backdrop-blur-xl shadow-lg',
                  'hover:-translate-y-1 transition-all duration-300'
                )}
              >
                <Link href="#events">
                  <Sparkles className="h-6 w-6 mr-2" />
                  Khám Phá Ngay
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {hasEvents && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Link
            href="#stats"
            className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium tracking-wide">Cuộn xuống</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </Link>
        </div>
      )}

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 text-background">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  )
}
