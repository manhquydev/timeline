# Brainstorm Report: Story View Improvements

**Date:** 2026-01-11
**Status:** Approved

## Problem Statement

1. **Incomplete Story Experience**: Story view only shows first image of each event, no horizontal navigation between photos within same event
2. **Mobile Nav Overlap**: "Xem Sự Kiện" button hidden behind MobileBottomNav (64px height, z-50)

## Current Implementation Analysis

### story-reel-timeline.tsx (292 lines)
- Vertical swipe between events ✓
- Progress indicators for events ✓
- Photo count indicator (visual only, not functional)
- Only displays `cover_image_url` or `posts[0].media_url`
- No horizontal swipe for photos within event

### mobile-bottom-nav.tsx
- Fixed bottom nav, z-50, h-16 (64px)
- Always visible except on /login page
- Conflicts with Story fullscreen (also z-50)

## Agreed Solution

### 1. Instagram-Style Story Navigation
- **Horizontal swipe/tap**: Navigate between photos within same event
- **Vertical swipe**: Navigate between different events
- **Progress bar per photo**: Show individual progress for each photo in event

### 2. Hide MobileBottomNav in Story Mode
- Add global state or context to track "story mode"
- MobileBottomNav checks state and returns null when story active

## Implementation Approach

### Option A: Refactor story-reel-timeline.tsx
Add nested photo navigation:
```
Events (vertical) → Photos within event (horizontal)
```

**Changes needed:**
1. Add `currentPhotoIndex` state per event
2. Add horizontal gesture detection (tap left/right or swipe)
3. Update progress indicators to show photo progress within event
4. Add photo transition animations

### Option B: Use existing lightbox
Leverage `yet-another-react-lightbox` already installed for photo gallery within story.

**Trade-offs:**
- Less custom control
- May break immersive story feel
- Faster implementation

### Recommended: Option A (Custom Implementation)

**Rationale:**
- Full control over UX matching Instagram Stories
- Consistent with existing swipe gestures
- Better mobile performance (no additional library overhead)

## Technical Implementation Plan

### Phase 1: Photo Navigation Within Event
1. Add `photoIndexMap: Record<number, number>` to track current photo per event
2. Implement tap zones: left 30% = prev photo, right 30% = next photo
3. Update progress bar: segment per photo, animate current
4. Add horizontal swipe detection with `PanInfo.offset.x`

### Phase 2: Hide MobileBottomNav
1. Create `useStoryMode` hook with Zustand store
2. Update `MobileBottomNav` to check `isStoryMode`
3. Call `setStoryMode(true)` when Story opens, `false` on close

### Phase 3: Polish
1. Photo transition animations (fade or slide)
2. Auto-advance timer (optional, 5s per photo)
3. Pause on long press
4. Preload next photo for smooth transitions

## Success Metrics
- [ ] Can swipe/tap horizontally to view all photos in event
- [ ] Progress bar shows photo-level progress
- [ ] MobileBottomNav hidden when viewing Story
- [ ] "Xem Sự Kiện" button fully visible and tappable
- [ ] Smooth 60fps animations on mobile

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance on events with many photos | Lazy load, limit to 20 photos max |
| Complex gesture conflicts | Clear gesture boundaries, debounce |
| State sync issues | Single source of truth with Zustand |

## Dependencies
- Existing: framer-motion, zustand
- No new dependencies needed

## Estimated Complexity
- **Medium** - Requires careful gesture handling and state management
- ~4-6 hours implementation time

## Next Steps
User approved implementation plan creation.
