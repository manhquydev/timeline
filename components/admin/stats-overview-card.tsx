'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Calendar, Image, Users, Activity } from 'lucide-react'

const iconMap = {
  calendar: Calendar,
  image: Image,
  users: Users,
  activity: Activity,
  'trending-up': TrendingUp,
} as const

type IconName = keyof typeof iconMap

interface StatsOverviewCardProps {
  title: string
  value: number
  iconName: IconName
  trend?: 'up' | 'down'
  trendValue?: number
  gradient?: string // kept for API compatibility, unused
  delay?: number    // kept for API compatibility, unused
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
  title, value, iconName, trend, trendValue,
}: StatsOverviewCardProps) {
  const Icon = iconMap[iconName]

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
            <AnimatedCounter value={value} />
          </h3>
          {trend && trendValue !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}%</span>
              <span className="text-slate-400 font-normal text-xs">vs tuần trước</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
      </div>
    </div>
  )
}
