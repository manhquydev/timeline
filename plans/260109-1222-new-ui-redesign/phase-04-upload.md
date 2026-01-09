# Phase 04: Upload Experience

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [Current Upload Zone](../../components/upload/upload-zone.tsx)
- [Upload Config](../../lib/upload-config.ts)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-09 |
| Priority | P1 - High |
| Status | Planning |
| Est. Effort | 3-4 days |

## Key Insights
- Current upload zone is functional but visually basic
- Mobile camera integration critical for event capture
- Batch upload with individual progress reduces anxiety
- Image editing (crop/filter) increases photo quality

## Requirements

### UI Requirements
- [ ] Redesigned drop zone with animated dashed border
- [ ] Camera button with gradient accent (mobile)
- [ ] Thumbnail grid with individual progress rings
- [ ] Crop/rotate editor modal (already exists, enhance UI)
- [ ] Success celebration animation (confetti burst)

### UX Requirements
- [ ] Drag feedback with scale and glow effect
- [ ] Per-file progress with estimated time
- [ ] Retry failed uploads without re-selecting
- [ ] Quick filter presets (warm, cool, B&W)

### A11y Requirements
- [ ] Announce upload progress to screen readers
- [ ] Keyboard-accessible file removal
- [ ] Focus management in editor modal

## Architecture

### Enhanced Components
```
components/upload/
  upload-zone.tsx          # Redesigned main component
  file-thumbnail.tsx       # Individual file preview
  progress-ring.tsx        # Circular progress indicator
  quick-filters.tsx        # Filter preset buttons
  celebration-effect.tsx   # Confetti on success
```

### State Management
- Use existing `loading-store.ts` for global progress
- Local state for individual file progress

## Implementation Steps
1. Redesign `upload-zone.tsx` drop area with animations
2. Create `progress-ring.tsx` SVG component
3. Build `file-thumbnail.tsx` with progress overlay
4. Add `quick-filters.tsx` with CSS filter presets
5. Implement `celebration-effect.tsx` confetti burst
6. Enhance image editor UI with better controls
7. Test upload flow end-to-end on mobile

## Success Criteria
- [ ] Upload perceived 30% faster (progress feedback)
- [ ] 95% of uploads complete without user intervention
- [ ] Editor works on low-end mobile devices
- [ ] Celebration animation delights users

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Editor perf on mobile | High | Limit canvas size, debounce |
| Filter processing time | Medium | Web Workers, low-res preview |
| Large file queue freeze | Medium | Chunked processing, queue limit |
