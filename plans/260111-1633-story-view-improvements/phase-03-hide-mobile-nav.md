# Phase 3: Hide MobileBottomNav in Story Mode

## Context

MobileBottomNav (z-50, h-16) overlaps with story view, hiding "Xem Su Kien" button. Need to hide nav when story is active.

## Overview

1. Import story-mode-store in mobile-bottom-nav.tsx
2. Return null when isStoryMode is true
3. Call setStoryMode(true) when story opens
4. Call setStoryMode(false) when story closes

## Requirements

1. MobileBottomNav hides instantly when story opens
2. MobileBottomNav shows instantly when story closes
3. No layout shift or flicker
4. Works with existing login page check

## Implementation Steps

### Step 1: Update MobileBottomNav

```typescript
// mobile-bottom-nav.tsx - Add import
import { useStoryModeStore } from '@/lib/stores/story-mode-store'

// Inside component, after pathname
const { isStoryMode } = useStoryModeStore()

// Update early return (after line 26)
if (pathname === '/login' || isStoryMode) {
  return null
}
```

### Step 2: Update StoryReelTimeline to Set Mode

```typescript
// story-reel-timeline.tsx - Add import
import { useStoryModeStore } from '@/lib/stores/story-mode-store'

// Inside component, after refs
const { setStoryMode } = useStoryModeStore()

// Add useEffect to manage story mode
useEffect(() => {
  setStoryMode(true)
  return () => setStoryMode(false)
}, [setStoryMode])
```

### Step 3: Handle Close Button

The existing onClose callback + useEffect cleanup handles this automatically. When story unmounts, cleanup runs `setStoryMode(false)`.

## Success Criteria

- [ ] MobileBottomNav hidden when story view opens
- [ ] MobileBottomNav visible when story view closes
- [ ] "Xem Su Kien" button fully visible and tappable
- [ ] No flicker or layout shift
- [ ] Still hidden on /login page

## Risk Assessment

**Low risk** - Simple conditional rendering. The useEffect cleanup ensures nav returns even if component crashes.

## Effort

30 minutes

## Dependencies

- Phase 1 (story-mode-store must exist)
