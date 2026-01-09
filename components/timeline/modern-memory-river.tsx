'use client'

import { useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import type { Event, Post } from '@/lib/types'
import { formatDateRange } from '@/lib/date-utils'
import { Badge } from '@/components/ui/badge'
import { Calendar, Image as ImageIcon, Users, ChevronRight, Sparkles, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventPhotoMosaic } from '../events/event-photo-mosaic'

interface ModernMemoryRiverProps {
  events: { event: Event; posts: Post[] }[]
}

export function ModernMemoryRiver({ events }: ModernMemoryRiverProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // High-performance scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Smooth out the scroll progress for visual elements
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Animate path dashoffset based on scroll
  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1])

  const sortedEvents = useMemo(() =>
    [...events].sort((a, b) =>
      new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime()
    ), [events])

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

  if (events.length === 0) return null

  return (
    <div ref={containerRef} className="relative py-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[100px] bg-primary"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1 + (i * 0.05),
            }}
          />
        ))}
      </div>

      {/* Advanced SVG Path with Scroll Sync */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 md:w-px transform md:-translate-x-1/2 z-0">
        <svg
          className="h-full w-24 overflow-visible"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="river-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
            <filter id="neon-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Static Background Path */}
          <path
            d="M 50 0 C 10 200, 90 400, 50 600 S 10 800, 50 1000"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeOpacity="0.1"
            className="md:block hidden"
          />

          {/* Animated Progress Path */}
          <motion.path
            d="M 50 0 C 10 200, 90 400, 50 600 S 10 800, 50 1000"
            stroke="url(#river-gradient)"
            strokeWidth="4"
            fill="none"
            filter="url(#neon-glow)"
            style={{ pathLength }}
            className="md:block hidden"
          />

          {/* Mobile Straight Path */}
          <motion.line
            x1="50" y1="0" x2="50" y2="1000"
            stroke="url(#river-gradient)"
            strokeWidth="4"
            style={{ pathLength }}
            className="md:hidden"
          />
        </svg>
      </div>

      <div className="space-y-32 md:space-y-48 relative z-10">
        {sortedEvents.map(({ event, posts }, index) => {
          const isEven = index % 2 === 0
          const gradientClass = gradientClasses[index % gradientClasses.length]

          return (
            <div key={event.id} className="relative flex flex-col md:block">
              {/* Timeline Node */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-20">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className={cn(
                    "relative w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl",
                    gradientClass
                  )}
                >
                  <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />

                  {/* Pulse Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/30"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              {/* Event Card */}
              <div className={cn(
                "w-full px-4 md:px-0 md:w-[calc(50%-4rem)]",
                isEven ? "md:mr-auto md:pr-12 lg:pr-20 ml-20 md:ml-0" : "md:ml-auto md:pl-12 lg:pl-20 ml-20 md:ml-0"
              )}>
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Link href={`/events/${event.slug}`} className="group block">
                    <div className="relative rounded-[2rem] border border-white/40 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20">

                      {/* Interactive Light Leak */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      {/* Status Badge */}
                      <div className="absolute top-6 right-6 z-20">
                        <Badge className={cn(
                          'text-xs font-bold border-2 px-3 py-1.5 shadow-lg backdrop-blur-md',
                          statusColors[event.status]
                        )}>
                          {statusLabels[event.status]}
                        </Badge>
                      </div>

                      {/* Image / Mosaic Section */}
                      <div className="relative h-60 md:h-72 overflow-hidden">
                        {event.cover_image_url ? (
                          <Image
                            src={event.cover_image_url}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        ) : (
                          <div className={cn("w-full h-full", gradientClass)}>
                            {posts.length > 0 ? (
                              <EventPhotoMosaic posts={posts} maxPhotos={9} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-16 h-16 text-white/50" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      {/* Content Section */}
                      <div className="p-6 md:p-8 space-y-4">
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-muted-foreground line-clamp-2 text-sm md:text-base leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <div className={cn("p-2 rounded-lg", gradientClass)}>
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          {formatDateRange(event.start_date, event.end_date)}
                        </div>

                        <div className="flex items-center gap-6 pt-6 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <span className="font-bold">{event.total_photos}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">ảnh</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-secondary" />
                            <span className="font-bold">{event.total_contributors}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">người</span>
                          </div>
                          <div className="ml-auto transform group-hover:translate-x-2 transition-transform duration-300">
                            <ChevronRight className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mt-32 relative z-10"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">
          Hết dòng thời gian
        </p>
      </motion.div>
    </div>
  )
}
