# Researcher Report: Homepage Timeline UI Upgrade Strategy
Date: 2026-01-09
Project: Company Memory Timeline

## 1. Technological Synthesis
The current implementation of `MemoryRiverTimeline` relies on `IntersectionObserver` for "pop-in" effects and standard CSS keyframes. While functional, it lacks the fluidity of scroll-synced animations required for a premium "Memory River" experience. The `VirtualPhotoGrid` uses `@tanstack/react-virtual`, which is excellent for fixed grids but struggles with dynamic aspect ratios in a masonry-like timeline without significant boilerplate.

### Recommended Stack
- **Animation**: `motion` (Motion One) for micro-interactions; CSS `scroll-timeline` for path-based scroll syncing.
- **Virtualization**: `react-virtuoso` for dynamic height support and simpler "infinite scroll" integration.
- **Rendering**: Continue using Next.js 16 server components for initial load, hydrating only interactive timeline nodes.

## 2. Comprehensive Plan: Homepage Timeline Upgrade

### Phase 1: Dependency & Core Optimization
- Install `motion` (Motion One) and `react-virtuoso`.
- Implement a `ScrollProgress` hook using `useScroll` from `motion` for cross-component scroll state.

### Phase 2: Memory River Enhancement
- **Wavy Path Syncing**: Use CSS `scroll-timeline` to animate the `stroke-dashoffset` of the timeline SVG path as the user scrolls.
- **Node Interactions**: Implement `motion` hover and tap states for timeline nodes to provide tactile feedback on mobile.
- **Depth Effects**: Use GPU-accelerated `translateZ` and `rotateY` via `motion` for a subtle 3D parallax effect on timeline cards.

### Phase 3: High-Performance Gallery
- **Virtuoso Integration**: Replace the current grid in `EventPhotos` with `VirtuosoGrid` to handle dynamic item heights without jank.
- **Lazy Loading 2.0**: Implement "Priority Groups" for images—loading the next 10 images with `loading="eager"` once the user reaches a scroll threshold.

### Phase 4: Mobile-Specific Refinements
- **Touch Gestures**: Add swipe-to-navigate between events in the mobile view.
- **Low-Power Mode**: Detect low-end devices and automatically disable complex particles in the background.

## 3. Performance Implications
- **Bundle Size**: Adding `motion` (2KB) and `react-virtuoso` (7KB) is offset by removing legacy CSS and manual `IntersectionObserver` logic.
- **Main Thread**: Shifting scroll animations to CSS `scroll-timeline` frees the main thread for image decoding and JS hydration.

## 4. File Structure
- `lib/animations/scroll-path.ts`: Logic for SVG path generation and scroll mapping.
- `components/timeline/modern-memory-river.tsx`: The upgraded timeline component.
- `components/photos/virtuoso-gallery.tsx`: The new virtualized gallery.

## 5. Unresolved Questions
- Should we support "Time-scrubbing" (a sidebar scrollbar with years/months)?
- Are we maintaining support for browsers without CSS `scroll-timeline` (Safari < 17)? (Proposed: CSS fallback to standard static layout).

---
**Report Location**: D:\project\timeline\plans\reports\researcher-260109-0107-timeline-ui-upgrade.md
**Plan Directory**: D:\project\timeline\plans\260109-0107-timeline-ui-upgrade/
