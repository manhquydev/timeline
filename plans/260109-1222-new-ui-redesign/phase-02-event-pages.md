# Phase 02: Event Detail Pages

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [Current Event Card](../../components/events/event-card.tsx)
- [Photo Mosaic](../../components/events/event-photo-mosaic.tsx)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-09 |
| Priority | P0 - Critical |
| Status | Planning |
| Est. Effort | 4-5 days |

## Key Insights
- Event pages are primary content consumption point
- Cover image is key emotional hook - needs hero treatment
- Masonry better than grid for varied photo ratios
- Sticky upload button increases contribution rates

## Requirements

### UI Requirements
- [ ] Full-width cover image with parallax scroll effect
- [ ] Event title overlay with gradient scrim
- [ ] Masonry photo grid (CSS columns, not JS)
- [ ] Sticky FAB for upload (bottom-right, above nav)
- [ ] Social reaction bar (likes, comments count)

### UX Requirements
- [ ] Smooth scroll-to-top on cover tap
- [ ] Photo count badge on cover
- [ ] Infinite scroll with skeleton placeholders
- [ ] Share sheet integration (Web Share API)

### A11y Requirements
- [ ] Alt text for cover and all photos
- [ ] Keyboard navigation through photo grid
- [ ] Screen reader announces photo counts

## Architecture

### New Components
```
components/events/
  event-hero-cover.tsx     # Parallax cover with metadata
  masonry-photo-grid.tsx   # CSS columns masonry
  sticky-upload-fab.tsx    # Fixed position upload button
  event-social-bar.tsx     # Reactions and comments summary
```

### Data Flow
```
EventPage -> eventRepository.findById()
          -> postRepository.findByEvent()
          -> Render with streaming
```

## Implementation Steps
1. Create `event-hero-cover.tsx` with parallax transform
2. Build `masonry-photo-grid.tsx` using CSS columns
3. Add `sticky-upload-fab.tsx` with safe-area padding
4. Implement `event-social-bar.tsx` with real-time updates
5. Integrate infinite scroll with `react-intersection-observer`
6. Add Web Share API for native sharing
7. Test scroll performance on low-end devices

## Success Criteria
- [ ] 60fps scroll on iPhone 8 and newer
- [ ] Photos lazy-load with blurhash placeholders
- [ ] Upload FAB always visible but not obstructing
- [ ] Share works on mobile browsers

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Masonry CLS | High | Reserve height, skeleton loaders |
| Parallax jank | Medium | Use transform only, will-change |
| FAB overlap with nav | Medium | Bottom offset calculation |
