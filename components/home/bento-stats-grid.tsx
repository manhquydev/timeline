'use client'

import { useRef, useEffect, useState } from 'react'
import { animate } from 'motion'
import { Calendar, Image as ImageIcon, Users, TrendingUp, Heart, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { prefersReducedMotion } from '@/lib/hooks/use-motion'

interface StatsGridProps {
  totalEvents: number
  totalPhotos: number
  totalContributors: number
}

/**
 * BentoStatsGrid - Modern asymmetric stats grid with animated counters
 * Inspired by Apple's Bento grid design pattern
 * Features:
 * - Asymmetric grid layout (2x2 with varied sizes)
 * - Glass morphism cards
 * - Animated counters
 * - Staggered reveal animations
 */
export function BentoStatsGrid({ totalEvents, totalPhotos, totalContributors }: StatsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!gridRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!gridRef.current || !isVisible || prefersReducedMotion()) return

    const cards = gridRef.current.querySelectorAll('.bento-card')
    cards.forEach((card, index) => {
      animate(
        card as HTMLElement,
        {
          opacity: [0, 1],
          transform: ['translateY(30px) scale(0.95)', 'translateY(0) scale(1)']
        },
        {
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.34, 1.56, 0.64, 1]
        }
      )
    })
  }, [isVisible])

  return (
    <section id="stats" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="heading-section text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            Kỷ niệm của chúng ta
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Những con số kể câu chuyện về hành trình của Teky Hoàng Mai
          </p>
        </div>

        {/* Bento Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {/* Main stat - Events (spans 2 cols) */}
          <div
            className={cn(
              'bento-card col-span-2 row-span-1',
              'relative overflow-hidden rounded-3xl p-8 md:p-10',
              'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
              'backdrop-blur-xl border border-primary/20',
              'shadow-2xl hover:shadow-primary/20',
              'hover:-translate-y-2 transition-all duration-500',
              'group',
              !isVisible && 'opacity-0'
            )}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-1 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <AnimatedCounter
                  end={totalEvents}
                  duration={2}
                  delay={0.2}
                  className="text-5xl md:text-6xl font-black text-primary"
                />
                <div className="text-base md:text-lg font-semibold text-muted-foreground mt-1">
                  Sự kiện
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Photos stat */}
          <div
            className={cn(
              'bento-card col-span-1 row-span-2',
              'relative overflow-hidden rounded-3xl p-6 md:p-8',
              'bg-gradient-to-b from-secondary/10 via-secondary/5 to-transparent',
              'backdrop-blur-xl border border-secondary/20',
              'shadow-2xl hover:shadow-secondary/20',
              'hover:-translate-y-2 transition-all duration-500',
              'group flex flex-col justify-between',
              !isVisible && 'opacity-0'
            )}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <ImageIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>

            <div className="mt-auto">
              <AnimatedCounter
                end={totalPhotos}
                duration={2.5}
                delay={0.4}
                className="text-4xl md:text-5xl font-black text-secondary"
              />
              <div className="text-sm md:text-base font-semibold text-muted-foreground mt-1">
                Khoảnh khắc
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--secondary)/0.1),transparent_70%)]" />
          </div>

          {/* Contributors stat */}
          <div
            className={cn(
              'bento-card col-span-1 row-span-2',
              'relative overflow-hidden rounded-3xl p-6 md:p-8',
              'bg-gradient-to-b from-tertiary/10 via-tertiary/5 to-transparent',
              'backdrop-blur-xl border border-tertiary/20',
              'shadow-2xl hover:shadow-tertiary/20',
              'hover:-translate-y-2 transition-all duration-500',
              'group flex flex-col justify-between',
              !isVisible && 'opacity-0'
            )}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>

            <div className="mt-auto">
              <AnimatedCounter
                end={totalContributors}
                duration={2.5}
                delay={0.6}
                className="text-4xl md:text-5xl font-black text-foreground"
                suffix="+"
              />
              <div className="text-sm md:text-base font-semibold text-muted-foreground mt-1">
                Người đóng góp
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--tertiary)/0.1),transparent_70%)]" />
          </div>

          {/* Love/engagement stat (spans 2 cols) */}
          <div
            className={cn(
              'bento-card col-span-2 row-span-1',
              'relative overflow-hidden rounded-3xl p-6 md:p-8',
              'bg-gradient-to-r from-pink-50 via-rose-50/50 to-orange-50/30 dark:from-pink-950/20 dark:via-rose-950/10 dark:to-orange-950/10',
              'backdrop-blur-xl border border-pink-200/30 dark:border-pink-800/20',
              'shadow-2xl hover:shadow-pink-500/20',
              'hover:-translate-y-2 transition-all duration-500',
              'group',
              !isVisible && 'opacity-0'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl gradient-5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold text-foreground">
                    Yêu thương và Kỷ niệm
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mỗi khoảnh khắc đều đáng nhớ
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-pink-500">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold">Đang phát triển</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
