'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { Calendar, Image as ImageIcon, Users, ChevronRight, Sparkles, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventPhotoMosaic } from '../events/event-photo-mosaic'

interface MemoryRiverTimelineProps {
  events: { event: Event; posts: Post[] }[]
}

export function MemoryRiverTimeline({ events }: MemoryRiverTimelineProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only render particles on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Track mouse position for magnetic effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Track scroll progress for animations
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height))
        setScrollProgress(progress)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.15, rootMargin: '50px' }
    )

    return () => observerRef.current?.disconnect()
  }, [])

  const gradientClasses = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5']

  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-700 border-gray-300',
    open: 'bg-green-500/10 text-green-700 border-green-300',
    closed: 'bg-blue-500/10 text-blue-700 border-blue-300',
    archived: 'bg-gray-400/10 text-gray-600 border-gray-300',
  }

  const statusLabels = {
    draft: 'Nháp',
    open: 'Đang Mở',
    closed: 'Đã Đóng',
    archived: 'Lưu Trữ'
  }

  if (events.length === 0) {
    return null
  }

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
  )

  return (
    <div ref={containerRef} className="relative py-20 overflow-hidden">
      {/* Animated background particles - only render on client */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Curved Wave Timeline Path */}
      <svg
        className="absolute left-8 md:left-1/2 top-0 h-full w-auto pointer-events-none"
        style={{
          transform: 'translateX(-50%)',
          opacity: 0.6,
        }}
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Wavy path using sine wave */}
        <path
          d={`M 50 0 Q 20 200 50 400 T 50 800 L 50 1000`}
          stroke="url(#timeline-gradient)"
          strokeWidth="4"
          fill="none"
          filter="url(#glow)"
          strokeDasharray="10 5"
          className="animate-pulse-slow"
        />
      </svg>

      <div className="space-y-24 md:space-y-32 relative">
        {sortedEvents.map(({ event, posts }, index) => {
          const gradientClass = gradientClasses[index % gradientClasses.length]
          const isEven = index % 2 === 0
          const isVisible = visibleItems.has(index)
          const delay = index * 0.15

          // Calculate distance for magnetic effect (simplified - would need actual card position)
          const magneticIntensity = 0.5

          return (
            <div
              key={event.id}
              data-index={index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el)
                }
              }}
              className={cn(
                'relative transition-all duration-1000',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              )}
              style={{
                transitionDelay: `${delay}s`,
              }}
            >
              {/* Expanded Timeline Node with Particles */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-20">
                <div className="relative group">
                  {/* Outer glow ring */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full blur-xl transition-all duration-700',
                      gradientClass,
                      isVisible ? 'scale-150 opacity-60' : 'scale-0 opacity-0'
                    )}
                    style={{ transitionDelay: `${delay + 0.3}s` }}
                  />

                  {/* Rotating gradient border */}
                  <div
                    className={cn(
                      'absolute inset-0 w-20 h-20 rounded-full p-[3px] transition-all duration-700',
                      isVisible && 'animate-spin-slow'
                    )}
                    style={{
                      background: `conic-gradient(from 0deg, hsl(var(--gradient-${(index % 5) + 1}-start)), hsl(var(--gradient-${(index % 5) + 1}-mid)), hsl(var(--gradient-${(index % 5) + 1}-end)), hsl(var(--gradient-${(index % 5) + 1}-start)))`,
                      animationDuration: '4s',
                      transitionDelay: `${delay + 0.2}s`,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-background" />
                  </div>

                  {/* Main node */}
                  <div className={cn(
                    'relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-125',
                    gradientClass,
                    isVisible && 'scale-100 rotate-0',
                    !isVisible && 'scale-0 rotate-180'
                  )}
                    style={{ transitionDelay: `${delay + 0.1}s` }}
                  >
                    <Calendar className="w-9 h-9 text-white drop-shadow-lg" />

                    {/* Sparkle effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[...Array(4)].map((_, i) => (
                        <Sparkles
                          key={i}
                          className="absolute w-3 h-3 text-white animate-ping"
                          style={{
                            top: ['0%', '100%', '50%', '50%'][i],
                            left: ['50%', '50%', '0%', '100%'][i],
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Orbiting particles */}
                  {isVisible && [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={cn('absolute w-2 h-2 rounded-full', gradientClass)}
                      style={{
                        top: '50%',
                        left: '50%',
                        animation: `orbit 3s linear infinite`,
                        animationDelay: `${i * 1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Content card with 3D depth */}
              <Link href={`/events/${event.slug}`}>
                <div className={cn(
                  'ml-32 md:ml-0 md:w-[calc(50%-5rem)]',
                  isEven ? 'md:mr-auto md:pr-20' : 'md:ml-auto md:pl-20'
                )}>
                  <div
                    className={cn(
                      'group relative rounded-3xl border-2 shadow-2xl transition-all duration-700 overflow-hidden',
                      'hover:-translate-y-2 hover:shadow-[0_20px_80px_rgba(0,0,0,0.2)]',
                      'transform-gpu perspective-1000',
                      isVisible ? 'scale-100 rotate-0' : isEven ? 'scale-90 -rotate-6' : 'scale-90 rotate-6'
                    )}
                    style={{
                      transitionDelay: `${delay + 0.2}s`,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                      backdropFilter: 'blur(20px)',
                      borderColor: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {/* Animated gradient border overlay */}
                    <div
                      className={cn(
                        'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                        'pointer-events-none'
                      )}
                      style={{
                        background: `linear-gradient(135deg, hsl(var(--gradient-${(index % 5) + 1}-start)) 0%, hsl(var(--gradient-${(index % 5) + 1}-mid)) 50%, hsl(var(--gradient-${(index % 5) + 1}-end)) 100%)`,
                        padding: '2px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />

                    {/* Date badge floating */}
                    <div className="absolute top-6 right-6 z-10 animate-float">
                      <Badge className={cn(
                        'text-sm font-bold border-2 px-4 py-2 shadow-xl',
                        statusColors[event.status],
                        'glass-gradient backdrop-blur-xl'
                      )}>
                        {statusLabels[event.status]}
                      </Badge>
                    </div>

                    {/* Cover image with enhanced effects */}
                    {event.cover_image_url ? (
                      <div className="relative h-64 overflow-hidden rounded-t-3xl">
                        <Image
                          src={event.cover_image_url}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Floating gradient overlay */}
                        <div className={cn(
                          'absolute inset-0 opacity-0 group-hover:opacity-40 transition-all duration-700 mix-blend-overlay',
                          gradientClass
                        )} />
                      </div>
                    ) : (
                      <div className={cn(
                        'relative h-64 flex items-center justify-center rounded-t-3xl overflow-hidden',
                        gradientClass
                      )}>
                        {/* Show photo mosaic if posts available, otherwise show gradient mesh */}
                        {posts && posts.length > 0 ? (
                          <EventPhotoMosaic posts={posts} maxPhotos={9} />
                        ) : (
                          <>
                            <div className="absolute inset-0 gradient-mesh opacity-40" />
                            <ImageIcon className="w-20 h-20 text-white/90 drop-shadow-2xl relative z-10 group-hover:scale-125 transition-transform duration-700" />
                          </>
                        )}
                      </div>
                    )}

                    {/* Content with kinetic typography */}
                    <div className="p-8 space-y-5 relative">
                      {/* Title with gradient on hover */}
                      <h3 className={cn(
                        'text-3xl font-black mb-3 transition-all duration-500 leading-tight',
                        'group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-secondary group-hover:to-tertiary',
                        'group-hover:bg-clip-text group-hover:text-transparent'
                      )}>
                        {event.title}
                      </h3>

                      {/* Description */}
                      {event.description && (
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed text-base">
                          {event.description}
                        </p>
                      )}

                      {/* Date with icon */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className={cn('p-3 rounded-xl shadow-lg', gradientClass)}>
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatDateRange(event.start_date, event.end_date)}
                        </span>
                      </div>

                      {/* Stats with glass morphism */}
                      <div className="flex items-center gap-4 pt-6 border-t-2 border-border/50">
                        <div className="flex-1 p-4 rounded-2xl glass-gradient hover:glass transition-all group-hover:shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-xl shadow-md', gradientClass)}>
                              <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {event.total_photos}
                              </div>
                              <div className="text-xs text-muted-foreground font-semibold">ảnh</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 p-4 rounded-2xl glass-gradient hover:glass transition-all group-hover:shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-xl shadow-md', gradientClass)}>
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {event.total_contributors}
                              </div>
                              <div className="text-xs text-muted-foreground font-semibold">người</div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-auto group-hover:translate-x-2 transition-transform duration-300">
                          <ChevronRight className="w-8 h-8 text-primary drop-shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {/* 3D depth effect shadow */}
                    <div
                      className={cn(
                        'absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10',
                        gradientClass
                      )}
                    />
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* End of timeline indicator */}
      <div className="flex flex-col items-center justify-center mt-32 animate-float">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-primary/50 rounded-full" />
          <Heart className="w-16 h-16 text-primary relative z-10 drop-shadow-2xl" />
        </div>
        <p className="mt-6 text-muted-foreground font-semibold text-lg">
          Hết dòng thời gian
        </p>
      </div>

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(40px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(40px) rotate(-360deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
