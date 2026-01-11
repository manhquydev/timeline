# Phase 2: Photo Navigation Within Event

## Context

Current `story-reel-timeline.tsx` (292 lines) only displays first photo per event. Need to add Instagram-style tap navigation between photos.

## Overview

Add photo index tracking per event, tap zones for navigation, per-photo progress bar, and photo transition animations.

## Requirements

1. Track current photo index for each event
2. Tap zones: left 30% = prev photo, right 30% = next photo
3. Progress bar: one segment per photo (not per event)
4. Fade transition between photos
5. At last photo of event, right tap goes to next event

## Implementation Steps

### Step 1: Add Photo Index State

```typescript
// Add after currentIndex state (line 27)
const [photoIndexMap, setPhotoIndexMap] = useState<Record<number, number>>({})

// Helper to get current photo index for an event
const getPhotoIndex = (eventIdx: number) => photoIndexMap[eventIdx] ?? 0

// Current photo for display
const currentPhotoIndex = getPhotoIndex(currentIndex)
const currentPhotos = currentEvent?.posts ?? []
const currentPhoto = currentPhotos[currentPhotoIndex]
```

### Step 2: Photo Navigation Functions

```typescript
const goToPhoto = useCallback((photoIdx: number) => {
  const maxIdx = currentPhotos.length - 1

  if (photoIdx < 0) {
    // At first photo, go to previous event
    if (currentIndex > 0) {
      goPrev()
    }
    return
  }

  if (photoIdx > maxIdx) {
    // At last photo, go to next event
    if (currentIndex < sortedEvents.length - 1) {
      goNext()
    }
    return
  }

  setPhotoIndexMap(prev => ({ ...prev, [currentIndex]: photoIdx }))
}, [currentPhotos.length, currentIndex, goNext, goPrev, sortedEvents.length])

const goNextPhoto = useCallback(() => goToPhoto(currentPhotoIndex + 1), [currentPhotoIndex, goToPhoto])
const goPrevPhoto = useCallback(() => goToPhoto(currentPhotoIndex - 1), [currentPhotoIndex, goToPhoto])
```

### Step 3: Update Tap Zones (Replace lines 280-288)

```tsx
{/* Photo navigation tap zones */}
<div
  className="absolute top-20 bottom-40 left-0 w-[30%] z-10 cursor-pointer"
  onClick={(e) => {
    e.stopPropagation()
    goPrevPhoto()
  }}
/>
<div
  className="absolute top-20 bottom-40 right-0 w-[30%] z-10 cursor-pointer"
  onClick={(e) => {
    e.stopPropagation()
    goNextPhoto()
  }}
/>
```

### Step 4: Per-Photo Progress Bar (Replace lines 119-135)

```tsx
{/* Per-photo progress indicators */}
<div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-3 pt-safe">
  {currentPhotos.map((_, idx) => (
    <button
      key={idx}
      onClick={() => goToPhoto(idx)}
      className="flex-1 h-1 rounded-full overflow-hidden bg-white/30"
    >
      <motion.div
        className="h-full bg-white"
        initial={{ width: 0 }}
        animate={{
          width: idx === currentPhotoIndex ? '100%' : idx < currentPhotoIndex ? '100%' : '0%'
        }}
        transition={{ duration: idx === currentPhotoIndex ? 5 : 0.3 }}
      />
    </button>
  ))}
</div>
```

### Step 5: Update Image Display (Replace lines 172-188)

```tsx
{/* Photo display with transition */}
<AnimatePresence mode="wait">
  <motion.div
    key={`${currentIndex}-${currentPhotoIndex}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="absolute inset-0"
  >
    {currentPhoto?.media_url ? (
      <>
        <Image
          src={currentPhoto.media_url}
          alt={currentEvent.event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      </>
    ) : coverImage ? (
      <>
        <Image
          src={coverImage}
          alt={currentEvent.event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      </>
    ) : (
      <div className={cn('absolute inset-0 bg-gradient-to-br to-black', gradientClass)} />
    )}
  </motion.div>
</AnimatePresence>
```

### Step 6: Update Photo Count Indicator (lines 190-206)

Replace static indicator with current photo position:
```tsx
{currentPhotos.length > 1 && (
  <div className="absolute top-20 right-4 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
    <span className="text-white text-sm font-medium">
      {currentPhotoIndex + 1} / {currentPhotos.length}
    </span>
  </div>
)}
```

### Step 7: Keyboard Navigation Update

Add left/right arrow keys:
```typescript
// In useEffect for keyboard (line 63-71)
if (e.key === 'ArrowLeft' || e.key === 'h') goPrevPhoto()
if (e.key === 'ArrowRight' || e.key === 'l') goNextPhoto()
```

## Success Criteria

- [ ] Tap left side navigates to previous photo
- [ ] Tap right side navigates to next photo
- [ ] At last photo, right tap goes to next event
- [ ] At first photo, left tap goes to previous event
- [ ] Progress bar shows per-photo segments
- [ ] Current photo segment animates (5s fill)
- [ ] Photo counter shows "X / Y"
- [ ] Smooth fade transitions between photos

## Risk Assessment

**Medium risk** - Core UX change. Potential issues:
- Gesture conflicts with vertical swipe (mitigated by tap zones, not drag)
- Performance with many photos (mitigated by single photo display)
- State sync when changing events (reset handled via photoIndexMap key)

## Effort

2 hours

## Dependencies

- Phase 1 (story-mode-store) can be done in parallel
