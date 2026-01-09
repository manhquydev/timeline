# Phase 03: Photo Gallery & Lightbox

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [Current Virtual Grid](../../components/photos/virtual-photo-grid.tsx)
- [Current Lightbox](../../components/photos/photo-lightbox.tsx)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-09 |
| Priority | P1 - High |
| Status | Planning |
| Est. Effort | 5-6 days |

## Key Insights
- Virtual scrolling essential for 1000+ photos
- Shared element transitions create premium feel
- Pinch-zoom is expected on mobile - must be smooth
- Action bar needs thumb-reachable placement

## Requirements

### UI Requirements
- [ ] Virtual scrolling grid (tanstack-virtual, already used)
- [ ] Shared element transition from grid to lightbox
- [ ] Full-screen lightbox with dark backdrop
- [ ] Action bar: download, share, like, comment
- [ ] Photo metadata overlay (author, date, caption)

### UX Requirements
- [ ] Swipe left/right to navigate photos
- [ ] Pinch-to-zoom with momentum
- [ ] Double-tap to zoom in/out
- [ ] Swipe down to close lightbox
- [ ] Keyboard arrows for desktop navigation

### A11y Requirements
- [ ] Focus trap in lightbox
- [ ] Escape key closes lightbox
- [ ] Screen reader announces photo index

## Architecture

### New Components
```
components/photos/
  shared-element-grid.tsx    # Grid with FLIP transitions
  immersive-lightbox.tsx     # Full-screen viewer
  gesture-handler.tsx        # Swipe, pinch, tap detection
  lightbox-controls.tsx      # Navigation and actions
```

### Dependencies
- `@tanstack/react-virtual` - already installed
- `use-gesture` - gesture handling
- `framer-motion` - shared element transitions

## Implementation Steps
1. Refactor `virtual-photo-grid.tsx` to expose item refs
2. Create `shared-element-grid.tsx` with FLIP animation
3. Build `immersive-lightbox.tsx` with backdrop blur
4. Implement `gesture-handler.tsx` for mobile gestures
5. Add `lightbox-controls.tsx` with thumb-zone placement
6. Connect download/share/like actions
7. Test gesture conflicts on various devices

## Success Criteria
- [ ] Transition from grid to lightbox < 300ms
- [ ] Pinch zoom renders at 60fps
- [ ] All gestures work without conflicts
- [ ] Works with 2000+ photos without memory issues

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Gesture conflicts | High | Dedicated gesture layer, pointer-events |
| Memory on large galleries | High | Image unloading, virtualization |
| Shared element glitches | Medium | Fallback to fade transition |
