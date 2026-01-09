# Implementation Plan: Homepage Timeline Upgrade

Based on the competitor research of Google Photos, Apple Photos, and Instagram, this plan outlines the technical steps to upgrade the Company Memory Timeline homepage.

## 1. "On This Day" Engagement Widget
**Goal**: Surface nostalgia by showing events that happened on the same calendar day in previous years.

### Technical Tasks
- [ ] **Repository**: Add `findOnThisDay()` to `EventRepository.ts`.
  - Logic: Use MongoDB `$expr` with `$month` and `$dayOfMonth` on `event_date`.
- [ ] **API**: Create `GET /api/events/on-this-day` (Public).
- [ ] **Component**: Create `components/home/on-this-day-widget.tsx`.
  - UI: Small glass-morphism card with "1 năm trước: [Tên Sự Kiện]".
- [ ] **Integration**: Add to `app/page.tsx` sidebar or top of timeline.

## 2. "Magazine-Style" Hero Recap
**Goal**: Replace the static hero with a high-impact "Featured Recap" of the most recent major event.

### Technical Tasks
- [ ] **Component**: Refactor Hero section in `app/page.tsx` into `components/home/recap-hero.tsx`.
- [ ] **Design**:
  - Full-bleed background using the latest event's `cover_image_url`.
  - Use `text-fluid-5xl` for bold, overlapping typography.
  - Add "Magazine" metadata: "Phát hành bởi [Team Name] • [Tháng/Năm]".
- [ ] **Animation**: Implement subtle Ken Burns (pan-zoom) effect on the background image.

## 3. "Story Mode" (Interactive Slideshow)
**Goal**: Allow users to "watch" an event like an Instagram Story or Apple Memory.

### Technical Tasks
- [ ] **Component**: Create `components/events/event-story-overlay.tsx`.
  - Logic: Full-screen modal, auto-advancing (5s per slide), progress bars at top.
  - Effect: Smooth cross-fade and pan/zoom on photos.
- [ ] **Integration**: Add "Xem Story" button to `MemoryRiverTimeline` cards.
- [ ] **Performance**: Preload the first 3 images in the background when the button is hovered.

## 4. Themed Highlights (Horizontal View)
**Goal**: Group events by category (e.g., "Team Building", "Học Tập") for easier discovery.

### Technical Tasks
- [ ] **Repository**: Enhance `EventRepository.findPublic()` to support grouping or filtering by tags.
- [ ] **Component**: Create `components/home/highlight-carousel.tsx`.
  - UI: Horizontal scrolling circles (Instagram style) with custom covers.
- [ ] **Integration**: Place above the `MemoryRiverTimeline` to provide an alternative navigation path.

## 5. Timeline UX Polish
- [ ] **Scrolling**: Add "Scroll to Top" with progress indicator.
- [ ] **Depth**: Enhance `MemoryRiverTimeline` with `framer-motion` for smoother entrance animations.
- [ ] **Haptics**: (Mobile) Add subtle vibration on "Like" or "Open Story" (if supported).

---

## Technical Considerations
- **Data Fetching**: Use Next.js 15 `request Snapping` (parallel fetching) in `page.tsx`.
- **Image Optimization**: Use `OptimizedImage` with blurhash for all new components.
- **State Management**: Use `useLoadingStore` for transition states between Story Mode and Grid View.

## Success Metrics
- Increase in "Revisit" rate (tracked via Analytics).
- Higher interaction with "Old" events via On This Day.
- Increased average session duration on homepage.
