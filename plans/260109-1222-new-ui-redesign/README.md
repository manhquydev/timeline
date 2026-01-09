# UI Redesign Plan - Company Memory Timeline

## Overview
Comprehensive UI/UX redesign for mobile-first photo sharing platform.

| Field | Value |
|-------|-------|
| Created | 2026-01-09 |
| Total Phases | 6 |
| Est. Duration | 3-4 weeks |
| Target Users | 80% mobile, Vietnamese language |

## Phase Summary

| Phase | Name | Priority | Effort | Dependencies |
|-------|------|----------|--------|--------------|
| 01 | [Homepage](./phase-01-homepage.md) | P0 | 3-4d | None |
| 02 | [Event Pages](./phase-02-event-pages.md) | P0 | 4-5d | Phase 01 |
| 03 | [Photo Gallery](./phase-03-photo-gallery.md) | P1 | 5-6d | Phase 02 |
| 04 | [Upload](./phase-04-upload.md) | P1 | 3-4d | None |
| 05 | [Admin](./phase-05-admin.md) | P2 | 4-5d | None |
| 06 | [Mobile Nav](./phase-06-mobile-nav.md) | P1 | 2-3d | None |

## Recommended Order
1. Phase 06 (Mobile Nav) - Foundation for all pages
2. Phase 01 (Homepage) - First impression
3. Phase 02 (Event Pages) - Core content
4. Phase 04 (Upload) - User contribution
5. Phase 03 (Photo Gallery) - Enhanced viewing
6. Phase 05 (Admin) - Management tools

## Design Principles
- Mobile-first, desktop-enhanced
- Glassmorphism with purple/coral palette
- Vietnamese typography (Be Vietnam Pro)
- 60fps animations, reduced-motion fallbacks
- WCAG 2.1 AA accessibility

## Tech Stack
- Next.js 15 App Router
- Tailwind CSS + shadcn/ui
- Framer Motion / motion
- @tanstack/react-virtual

## Key Files
- Design tokens: `docs/design-guidelines.md`
- Theme system: `docs/THEME_SYSTEM.md`
- Performance: `docs/PERFORMANCE_OPTIMIZATION_V2.md`
