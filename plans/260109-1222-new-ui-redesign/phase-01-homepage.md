# Phase 01: Homepage Redesign

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [Current Hero](../../components/home/hero-section.tsx)
- [Current Stats](../../components/home/bento-stats-grid.tsx)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-09 |
| Priority | P0 - Critical |
| Status | Planning |
| Est. Effort | 3-4 days |

## Key Insights
- 80% mobile users - hero must load fast, be thumb-friendly
- Current gradient mesh works well - enhance with WebGL for desktop
- Bento grid pattern proven effective for stats display
- Vietnamese typography needs Be Vietnam Pro for proper diacritics

## Requirements

### UI Requirements
- [ ] Animated gradient mesh background (CSS on mobile, WebGL on desktop)
- [ ] Kinetic typography with staggered letter animations
- [ ] Bento grid for event cards (2 cols mobile, 4 cols desktop)
- [ ] Animated counters with spring easing
- [ ] Timeline navigation dots with scroll-sync

### UX Requirements
- [ ] Hero CTA visible above fold on all devices
- [ ] Scroll indicator with bounce animation
- [ ] Skeleton loaders for event cards
- [ ] Pull-to-refresh gesture support

### A11y Requirements
- [ ] Reduced motion fallbacks for all animations
- [ ] 4.5:1 contrast on hero text over gradient
- [ ] Focus-visible states on all interactive elements

## Architecture

### New Components
```
components/home/
  gradient-mesh-bg.tsx     # WebGL mesh with CSS fallback
  kinetic-title.tsx        # Letter-by-letter animation
  event-bento-grid.tsx     # Asymmetric event card layout
  timeline-dots.tsx        # Scroll-synced navigation
```

### Dependencies
- `motion` (already installed) - animations
- `@react-three/fiber` - optional WebGL mesh

## Implementation Steps
1. Create `gradient-mesh-bg.tsx` with CSS-only mobile version
2. Build `kinetic-title.tsx` with staggered letter reveals
3. Refactor `bento-stats-grid.tsx` to support event cards
4. Add `timeline-dots.tsx` with IntersectionObserver sync
5. Integrate components into homepage layout
6. Test on iPhone SE, Pixel 5, iPad, Desktop
7. Performance audit (LCP < 2.5s target)

## Success Criteria
- [ ] LCP < 2.5s on 3G mobile
- [ ] CLS < 0.1
- [ ] All animations respect prefers-reduced-motion
- [ ] Vietnamese text renders correctly with diacritics

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| WebGL perf on low-end | High | CSS fallback, feature detection |
| Font loading delay | Medium | Font preload, fallback stack |
| Gradient contrast issues | Medium | Add subtle dark overlay on text |
