---
title: "Story View Improvements"
description: "Instagram-style photo navigation within events, hide MobileBottomNav in story mode"
status: completed
priority: P2
effort: 4h
branch: main
tags: [story, mobile, ux, framer-motion]
created: 2026-01-11
---

# Story View Improvements

## Problem Statement

1. **Incomplete Story Experience**: Story view only shows first image per event, no navigation between photos
2. **Mobile Nav Overlap**: "Xem Su Kien" button hidden behind MobileBottomNav (64px, z-50)

## Solution Overview

Implement Instagram-style story navigation:
- **Tap zones** for photo navigation within event (left 30% = prev, right 30% = next)
- **Vertical swipe** for event navigation (existing)
- **Hide MobileBottomNav** when story mode active
- **Per-photo progress bar** with auto-advance

## Architecture

```
StoryReelTimeline (vertical swipe between events)
├── EventSlide (current event)
│   ├── PhotoDisplay (current photo with fade transitions)
│   ├── TapZoneLeft (30% width - previous photo)
│   ├── TapZoneRight (30% width - next photo)
│   └── ProgressBar (per-photo segments)
└── story-mode-store (global state for nav visibility)
```

## Phases

| Phase | Description | Effort |
|-------|-------------|--------|
| 1 | Story Mode Store (Zustand) | 30min |
| 2 | Photo Navigation in Event | 2h |
| 3 | Hide MobileBottomNav | 30min |
| 4 | Polish & UX (auto-advance, pause) | 1h |

## Key Files to Modify

- `lib/stores/story-mode-store.ts` (new)
- `components/timeline/story-reel-timeline.tsx`
- `components/layout/mobile-bottom-nav.tsx`

## Success Criteria

- [ ] Tap left/right to navigate photos within event
- [ ] Progress bar shows per-photo segments
- [ ] MobileBottomNav hidden in story mode
- [ ] "Xem Su Kien" button fully visible and tappable
- [ ] Smooth 60fps animations on mobile
- [ ] Auto-advance (5s) with long-press pause

## Dependencies

- Existing: framer-motion, zustand
- No new dependencies

## Risks

| Risk | Mitigation |
|------|------------|
| Gesture conflicts (tap vs drag) | Use tap zones, not horizontal drag |
| Performance with many photos | Lazy load, limit preload to current+1 |
| State sync issues | Single Zustand store |

## Phase Details

- [Phase 1: Story Mode Store](./phase-01-story-mode-store.md)
- [Phase 2: Photo Navigation](./phase-02-photo-navigation.md)
- [Phase 3: Hide Mobile Nav](./phase-03-hide-mobile-nav.md)
- [Phase 4: Polish & UX](./phase-04-polish-ux.md)
