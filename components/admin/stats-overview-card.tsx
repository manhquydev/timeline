'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatsOverviewCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: 'up' | 'down'
  trendValue?: number
  gradient?: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4'
  delay?: number
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number, animationFrame: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * value))
      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{count.toLocaleString('vi-VN')}</span>
}

export function StatsOverviewCard({
  title, value, icon: Icon, trend, trendValue, gradient = 'gradient-1', delay = 0,
}: StatsOverviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-white/60 backdrop-blur-xl
        border border-white/20 shadow-[0_8px_32px_hsl(270_50%_20%/0.1)]
        hover:shadow-[0_12px_48px_hsl(270_50%_20%/0.15)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`absolute -top-12 -right-12 w-32 h-32 ${gradient} opacity-20 rounded-full blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            <AnimatedCounter value={value} />
          </h3>
          {trend && trendValue !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}%</span>
              <span className="text-muted-foreground font-normal text-xs">vs tuần trước</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
