# Phase 4: Polish & UX

## Context

After core functionality works, add polish features from Instagram Stories: auto-advance timer, long-press pause, preloading.

## Overview

1. Auto-advance timer (5s per photo)
2. Long-press to pause timer and hide UI
3. Preload next photo for smooth transitions
4. Accessibility: respect prefers-reduced-motion

## Requirements

1. Auto-advance after 5 seconds (configurable)
2. Long press pauses timer, hides overlay UI
3. Release resumes timer, shows UI
4. Preload current+1 photo
5. No auto-advance if user has reduced-motion preference

## Implementation Steps

### Step 1: Auto-Advance Timer

```typescript
// Add state
const [isPaused, setIsPaused] = useState(false)
const [autoAdvance, setAutoAdvance] = useState(true)
const timerRef = useRef<NodeJS.Timeout | null>(null)

// Timer effect
useEffect(() => {
  if (!autoAdvance || isPaused) return

  timerRef.current = setTimeout(() => {
    goNextPhoto()
  }, 5000)

  return () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [currentIndex, currentPhotoIndex, isPaused, autoAdvance, goNextPhoto])

// Reset timer on photo change (handled by dependencies)
```

### Step 2: Long Press to Pause

```typescript
// Add handlers
const handlePressStart = useCallback(() => {
  setIsPaused(true)
}, [])

const handlePressEnd = useCallback(() => {
  setIsPaused(false)
}, [])

// Add to motion.div (main content area)
<motion.div
  className="absolute inset-0"
  onTouchStart={handlePressStart}
  onTouchEnd={handlePressEnd}
  onMouseDown={handlePressStart}
  onMouseUp={handlePressEnd}
  onMouseLeave={handlePressEnd}
  // ... existing props
>
```

### Step 3: Hide UI When Paused

```typescript
// Wrap overlay elements in AnimatePresence
<AnimatePresence>
  {!isPaused && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-safe"
    >
      {/* Event info overlay content */}
    </motion.div>
  )}
</AnimatePresence>

// Also hide close button, event counter when paused
```

### Step 4: Preload Next Photo

```typescript
// Add preload effect
useEffect(() => {
  const nextPhotoIdx = currentPhotoIndex + 1
  const nextPhoto = currentPhotos[nextPhotoIdx]

  if (nextPhoto?.media_url) {
    const img = new Image()
    img.src = nextPhoto.media_url
  }

  // Also preload first photo of next event
  const nextEvent = sortedEvents[currentIndex + 1]
  if (nextEvent?.posts[0]?.media_url) {
    const img = new Image()
    img.src = nextEvent.posts[0].media_url
  }
}, [currentPhotoIndex, currentPhotos, currentIndex, sortedEvents])
```

### Step 5: Respect Reduced Motion

```typescript
// Add at component start
const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Disable auto-advance if reduced motion
useEffect(() => {
  if (prefersReducedMotion) {
    setAutoAdvance(false)
  }
}, [prefersReducedMotion])

// Simplify transitions if reduced motion
const fadeTransition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.2 }
```

### Step 6: Update Progress Bar Animation

```typescript
// Pause progress animation when paused
<motion.div
  className="h-full bg-white"
  initial={{ width: 0 }}
  animate={{
    width: idx === currentPhotoIndex
      ? (isPaused ? `${(Date.now() % 5000) / 50}%` : '100%') // Pause at current progress
      : idx < currentPhotoIndex ? '100%' : '0%'
  }}
  transition={{
    duration: idx === currentPhotoIndex && !isPaused ? 5 : 0.3
  }}
/>
```

Alternative simpler approach - just pause/resume animation:
```typescript
// Use CSS animation-play-state
<div
  className={cn(
    "h-full bg-white transition-all",
    isPaused ? "pause-animation" : ""
  )}
  style={{
    width: idx <= currentPhotoIndex ? '100%' : '0%',
    animationDuration: idx === currentPhotoIndex ? '5s' : '0.3s'
  }}
/>
```

## Success Criteria

- [ ] Photos auto-advance after 5 seconds
- [ ] Long press pauses timer
- [ ] Long press hides overlay UI
- [ ] Release resumes timer and shows UI
- [ ] Next photo preloaded for instant display
- [ ] Reduced motion: no auto-advance, instant transitions
- [ ] 60fps animations on mobile

## Risk Assessment

**Medium risk** - Multiple interacting features:
- Timer state management complexity
- Touch event handling conflicts with tap zones
- Progress bar animation sync with timer

Mitigation: Test on real mobile devices, use simpler progress approach if needed.

## Effort

1 hour

## Dependencies

- Phase 2 (photo navigation must work first)
- Phase 3 (nav hidden for proper testing)
