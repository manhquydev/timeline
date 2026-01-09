# UI Redesign Plan - Company Memory Timeline

**Date:** 2026-01-09
**Status:** In Progress
**Priority:** High
**Est. Duration:** 3-4 weeks

## Overview

Complete UI redesign for mobile-first photo sharing platform. Focus on "Liquid Glass" aesthetics, gesture-first navigation, and immersive photo experiences.

## Phases

| # | Phase | Priority | Effort | Status | Link |
|---|-------|----------|--------|--------|------|
| 1 | Homepage Redesign | P0 | 3-4d | Pending | [phase-01-homepage.md](./phase-01-homepage.md) |
| 2 | Event Pages | P0 | 4-5d | Pending | [phase-02-event-pages.md](./phase-02-event-pages.md) |
| 3 | Photo Gallery & Lightbox | P1 | 5-6d | Pending | [phase-03-photo-gallery.md](./phase-03-photo-gallery.md) |
| 4 | Upload Experience | P1 | 3-4d | Pending | [phase-04-upload.md](./phase-04-upload.md) |
| 5 | Admin Dashboard | P2 | 4-5d | Pending | [phase-05-admin.md](./phase-05-admin.md) |
| 6 | Mobile Navigation | P1 | 2-3d | Pending | [phase-06-mobile-nav.md](./phase-06-mobile-nav.md) |

## Recommended Implementation Order

1. **Phase 06** - Mobile Nav (foundation for all pages)
2. **Phase 01** - Homepage (first impression)
3. **Phase 02** - Event Pages (core content)
4. **Phase 04** - Upload (user contribution)
5. **Phase 03** - Photo Gallery (enhanced viewing)
6. **Phase 05** - Admin (management tools)

## Design Principles

1. **Mobile-First**: 80% users on mobile
2. **Gesture-First**: Swipe, pinch, long-press
3. **Liquid Glass**: Translucent, layered, immersive
4. **Performance**: <2.5s LCP, skeleton loaders
5. **Accessibility**: WCAG 2.1 AA minimum

## Key Components

| Component | Phase | Type |
|-----------|-------|------|
| Gradient Mesh Background | 01 | New |
| Kinetic Typography | 01 | New |
| Event Bento Grid | 01, 02 | Enhanced |
| Masonry Photo Grid | 02, 03 | New |
| Immersive Lightbox | 03 | New |
| Shared Element Transitions | 03 | New |
| Progress Ring | 04 | New |
| Quick Filters | 04 | New |
| Stats Overview Cards | 05 | Enhanced |
| Upload FAB | 06 | New |
| Pull-to-Refresh | 06 | New |

## Dependencies

### External Packages
- `use-gesture` - gesture handling (pinch, swipe)
- `framer-motion` or `motion` - shared element transitions

### Internal
- Phase 02 depends on Phase 01 (shared bento grid)
- Phase 03 depends on Phase 02 (photo grid base)

## Design Guidelines

See [docs/design-guidelines.md](../../docs/design-guidelines.md)

## Success Criteria

- [ ] LCP < 2.5s on mobile 3G
- [ ] CLS < 0.1
- [ ] 60fps scroll and animations
- [ ] Touch targets 44px minimum
- [ ] WCAG 2.1 AA compliance
- [ ] Vietnamese typography correct (Be Vietnam Pro)
- [ ] All animations respect prefers-reduced-motion
