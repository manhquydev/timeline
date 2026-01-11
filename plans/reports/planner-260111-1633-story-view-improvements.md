# Planner Report: Story View Improvements

**Date:** 2026-01-11
**Status:** Complete
**Plan Location:** `plans/260111-1633-story-view-improvements/`

## Summary

Created comprehensive implementation plan for Instagram-style story view improvements. Plan addresses two core problems:
1. Story view only shows first photo per event (no navigation)
2. MobileBottomNav overlaps "Xem Su Kien" button

## Plan Structure

```
plans/260111-1633-story-view-improvements/
├── plan.md                          # Overview with YAML frontmatter
├── phase-01-story-mode-store.md     # Zustand store (30min)
├── phase-02-photo-navigation.md     # Core photo nav logic (2h)
├── phase-03-hide-mobile-nav.md      # Hide nav in story (30min)
└── phase-04-polish-ux.md            # Auto-advance, pause (1h)
```

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Tap zones over horizontal drag | No gesture conflicts with vertical swipe |
| Per-event photoIndexMap | Track photo position independently per event |
| Zustand store for story mode | Consistent with existing loading-store pattern |
| Fade transitions (not slide) | Simpler, matches Instagram, less CPU |

## Files to Modify

1. **New:** `lib/stores/story-mode-store.ts`
2. **Modify:** `components/timeline/story-reel-timeline.tsx` (292 lines)
3. **Modify:** `components/layout/mobile-bottom-nav.tsx` (136 lines)

## Total Effort

4 hours across 4 phases:
- Phase 1: 30min (store)
- Phase 2: 2h (photo navigation)
- Phase 3: 30min (hide nav)
- Phase 4: 1h (polish)

## Research Applied

From Instagram Stories research:
- Tap zones: left 20-25%, right 75-80% (we use 30%/30% for larger touch targets)
- Progress bar: segmented per photo, current animates
- Auto-advance: 5s photos
- Long press: pause + hide UI

From Framer Motion research:
- Use tap zones instead of horizontal drag
- Parent handles Y-axis, child handles taps
- useMotionValue for 60fps animations
- Preload current + next photo

## Risk Summary

| Risk | Level | Mitigation |
|------|-------|------------|
| Gesture conflicts | Medium | Tap zones, no horizontal drag |
| Performance (many photos) | Low | Single photo display, preload 1 |
| State sync | Low | Single Zustand store |
| Timer complexity | Medium | Simple setTimeout, test on mobile |

## Next Steps

1. Implement Phase 1 (story-mode-store)
2. Implement Phase 2 (photo navigation) - can parallel with Phase 1
3. Implement Phase 3 (hide nav)
4. Implement Phase 4 (polish)
5. Test on real mobile devices

## Unresolved Questions

None - research covered all technical questions. Implementation should proceed.
