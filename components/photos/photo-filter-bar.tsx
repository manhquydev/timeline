'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, User, SortAsc, Filter, Check, Sparkles, Clock, TrendingUp, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PhotoFilterType = 'all' | 'today' | 'week' | 'month' | 'mine'
export type PhotoSortType = 'newest' | 'oldest' | 'popular' | 'random'

interface PhotoFilterBarProps {
  activeFilter: PhotoFilterType
  activeSort: PhotoSortType
  onFilterChange: (filter: PhotoFilterType) => void
  onSortChange: (sort: PhotoSortType) => void
  totalPhotos?: number
  userId?: string
  className?: string
}

const filters: { value: PhotoFilterType; label: string; icon: typeof Calendar }[] = [
  { value: 'all', label: 'Tất cả', icon: Sparkles },
  { value: 'today', label: 'Hôm nay', icon: Clock },
  { value: 'week', label: 'Tuần này', icon: Calendar },
  { value: 'month', label: 'Tháng này', icon: Calendar },
  { value: 'mine', label: 'Ảnh của tôi', icon: User },
]

const sorts: { value: PhotoSortType; label: string; icon: typeof SortAsc }[] = [
  { value: 'newest', label: 'Mới nhất', icon: Clock },
  { value: 'oldest', label: 'Cũ nhất', icon: Clock },
  { value: 'popular', label: 'Phổ biến', icon: TrendingUp },
  { value: 'random', label: 'Ngẫu nhiên', icon: Shuffle },
]

export function PhotoFilterBar({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
  totalPhotos,
  userId,
  className,
}: PhotoFilterBarProps) {
  // Filter out "mine" option if user is not logged in
  const availableFilters = userId
    ? filters
    : filters.filter((f) => f.value !== 'mine')

  return (
    <div className={cn('flex flex-wrap items-center gap-2 md:gap-3', className)}>
      {/* Filter chips - scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1 min-w-0">
        {availableFilters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.value

          return (
            <Button
              key={filter.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(filter.value)}
              className={cn(
                'shrink-0 gap-1.5 rounded-full transition-all',
                isActive
                  ? 'gradient-1 text-white shadow-lg'
                  : 'hover:bg-primary/10 hover:border-primary/50'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{filter.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-full">
            <SortAsc className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {sorts.find((s) => s.value === activeSort)?.label}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sorts.map((sort) => {
            const Icon = sort.icon
            const isActive = activeSort === sort.value

            return (
              <DropdownMenuItem
                key={sort.value}
                onClick={() => onSortChange(sort.value)}
                className={cn(isActive && 'bg-primary/10')}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="flex-1">{sort.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Photo count badge */}
      {totalPhotos !== undefined && (
        <Badge variant="secondary" className="shrink-0 hidden md:inline-flex">
          {totalPhotos} ảnh
        </Badge>
      )}
    </div>
  )
}
