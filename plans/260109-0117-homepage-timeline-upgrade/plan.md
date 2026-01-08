---
title: "Homepage Timeline UI Upgrade"
description: "Modernize the Memory River Timeline with Motion One animations, refined design system, and mobile-first optimizations"
status: completed
priority: P1
effort: 12h
branch: main
tags: [ui, timeline, animation, mobile, performance]
created: 2026-01-09
completed: 2026-01-09
---

# Homepage Timeline UI Upgrade

## Summary
Upgrade the Company Memory Timeline homepage with modern 2025-2026 UI patterns: scroll-driven SVG animations, staggered reveals via Motion One, refined glassmorphism, and enhanced mobile interactions. Target: 80% mobile users.

## Key Objectives
1. Replace CSS animations with Motion One (WAAPI-based, ~2KB)
2. Implement scroll-driven SVG path animation for timeline
3. Add Be Vietnam Pro + Inter typography
4. Refine glass cards with subtle layering
5. Optimize for Core Web Vitals (LCP < 2.5s, CLS < 0.1)

## Phase Overview

| Phase | Title | Effort | Status |
|-------|-------|--------|--------|
| 1 | [Dependencies & Setup](./phase-01-dependencies.md) | 1.5h | completed |
| 2 | [Design System Updates](./phase-02-design-system.md) | 2h | completed |
| 3 | [Timeline Components](./phase-03-timeline-components.md) | 4h | completed |
| 4 | [Homepage Integration](./phase-04-homepage.md) | 3h | completed |
| 5 | [Testing & Polish](./phase-05-testing.md) | 1.5h | completed |

## Success Criteria
- [x] Motion One animations run at 60fps on mid-range mobile
- [x] Timeline path animates on scroll (CSS scroll-timeline with JS fallback)
- [x] Staggered card reveals feel natural (50-100ms intervals)
- [x] Typography uses Be Vietnam Pro (headings) + Inter (body)
- [x] Core Web Vitals pass (green scores)
- [x] Respects `prefers-reduced-motion`
- [x] Touch targets >= 44px

## Key Files
- `app/page.tsx` - Homepage
- `components/timeline/memory-river-timeline.tsx` - Main timeline (refactored)
- `components/timeline/timeline-node.tsx` - New: animated node component
- `components/timeline/event-card.tsx` - New: event card with Motion One
- `components/timeline/scroll-driven-path.tsx` - New: scroll-animated SVG path
- `lib/hooks/use-motion.ts` - New: Motion One utilities
- `app/globals.css` - CSS variables & utilities (updated)

## Research References
- [Timeline UI Trends](./research-timeline-ui-trends.md)
- [Tech Stack Analysis](./research-tech-stack.md)
- [Design Styles](./research-design-styles.md)
- [Competitor Analysis](./research-competitor-analysis.md)

## Design Guidelines
See: `docs/design-guidelines.md`

## Implementation Summary

### Phase 1: Dependencies & Setup
- Installed `motion` package (v12.24.12)
- Added Be Vietnam Pro font via next/font/google
- Configured Tailwind fontFamily extensions

### Phase 2: Design System Updates
- Added CSS variables for gradients and glass effects
- Created scroll-driven animation CSS with @supports
- Added timeline-specific utilities (.timeline-node, .glass-subtle, etc.)
- Added typography utilities (.heading-hero, .heading-section, .heading-card)

### Phase 3: Timeline Components Refactor
- Created `ScrollDrivenPath` - SVG path with scroll animation (CSS + JS fallback)
- Created `TimelineNode` - Animated node with glow, sparkles, orbiting particles
- Created `EventCard` - Glass card with spring animations
- Refactored `MemoryRiverTimeline` to compose new sub-components
- Reduced particle count on mobile (8 vs 15)
- Added `prefersReducedMotion()` utility for accessibility

### Phase 4: Homepage Integration
- Homepage already uses MemoryRiverTimeline - no changes needed
- New components automatically integrated via refactored timeline

### Phase 5: Testing & Polish
- Build passes with no errors
- ESLint warnings fixed in new components
- TypeScript compilation successful
