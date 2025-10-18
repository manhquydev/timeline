# Loading System - Quick Start Guide

Hướng dẫn nhanh sử dụng hệ thống loading mới được implement.

## 🎯 Sử Dụng Cơ Bản

### 1. Skeleton Loaders

```tsx
import { EventCardSkeleton, PhotoGridSkeleton } from '@/components/ui/loading-skeleton'

function MyPage() {
  if (loading) return <EventCardSkeleton />
  return <EventCard data={data} />
}
```

### 2. Progress Bar

```tsx
import { ProgressBar } from '@/components/ui/progress-bar'

<ProgressBar
  progress={uploadProgress}
  message="Đang tải lên..."
  showPercentage
/>
```

### 3. Global Loading State

```tsx
import { useLoadingStore } from '@/lib/stores/loading-store'

function MyComponent() {
  const { setLoading } = useLoadingStore()

  const handleAction = async () => {
    setLoading(true, 'Đang xử lý...')
    try {
      await action()
    } finally {
      setLoading(false)
    }
  }
}
```

### 4. Optimized Images

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src={imageUrl}
  alt="Description"
  blurhash={blurhash}
  priority={isAboveFold}
/>
```

### 5. Button Loading States

```tsx
import { InlineSpinner } from '@/components/ui/loading-skeleton'

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <InlineSpinner size="sm" className="mr-2" />
      Đang xử lý...
    </>
  ) : (
    'Xác nhận'
  )}
</Button>
```

## 📦 Available Components

### Skeleton Loaders
- `<Skeleton />` - Base
- `<EventCardSkeleton />`
- `<TimelineEventSkeleton />`
- `<PhotoGridSkeleton count={12} />`
- `<UserCardSkeleton />`
- `<StatsCardSkeleton />`
- `<PageLoader message="Loading..." />`
- `<InlineSpinner size="sm|md|lg" />`

### Progress Components
- `<GlobalProgressBar />` - Auto route transitions
- `<ProgressBar progress={0-100} message="..." showPercentage />`

### Image Components
- `<OptimizedImage />` - With blurhash
- `<OptimizedBackgroundImage />` - Background variant

## 🎨 Styling Tips

```tsx
// Custom skeleton with specific dimensions
<Skeleton className="h-64 w-full rounded-xl" />

// Staggered loading animation
<div className="space-y-4">
  {items.map((_, i) => (
    <Skeleton
      key={i}
      className="h-12"
      style={{ animationDelay: `${i * 100}ms` }}
    />
  ))}
</div>
```

## ⚡ Performance Tips

1. **Limit initial data load** - Only fetch what's visible
2. **Use parallel queries** - `Promise.all([...])`
3. **Add priority to above-fold images** - `priority={true}`
4. **Debounce search inputs** - Use `debounce()` from utils
5. **Lazy load heavy components** - `dynamic(() => import(...))`

## 🐛 Common Issues

**Progress bar không hiển thị?**
→ Check `<GlobalProgressBar />` trong `app/layout.tsx`

**Skeleton flash?**
→ Add min-height to container

**Images load chậm?**
→ Verify blurhash exists, add `priority` prop

**Mobile lag?**
→ Check animations, reduce decorative elements

## 📚 Full Documentation

Xem chi tiết: [`docs/PERFORMANCE_OPTIMIZATION.md`](./PERFORMANCE_OPTIMIZATION.md)
