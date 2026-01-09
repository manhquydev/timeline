# Phase 06: Mobile Navigation

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [Current Bottom Nav](../../components/layout/mobile-bottom-nav.tsx)
- [Footer System](../../docs/FOOTER_SYSTEM.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-09 |
| Priority | P1 - High |
| Status | Planning |
| Est. Effort | 2-3 days |

## Key Insights
- 80% mobile users - nav is critical UX
- Current glass effect works well, enhance depth
- FAB for upload increases discoverability
- Pull-to-refresh expected on timeline

## Requirements

### UI Requirements
- [ ] Enhanced glass morphism with subtle border glow
- [ ] FAB upload button (gradient, elevated above nav)
- [ ] Active state with pill background and scale
- [ ] Badge notifications with pulse animation
- [ ] Safe area handling for notched devices

### UX Requirements
- [ ] Haptic feedback on nav tap (where supported)
- [ ] Pull-to-refresh on scrollable pages
- [ ] Gesture hints for new users
- [ ] Smooth hide-on-scroll (optional setting)

### A11y Requirements
- [ ] Touch targets 48x48px minimum
- [ ] Labels visible (not icon-only)
- [ ] Focus ring visible on keyboard nav

## Architecture

### Enhanced Components
```
components/layout/
  mobile-bottom-nav.tsx    # Enhanced nav bar
  upload-fab.tsx           # Floating action button
  pull-to-refresh.tsx      # Refresh gesture handler
  nav-badge.tsx            # Notification indicator
```

### Integration Points
- Header hides when nav is visible on mobile
- FAB position accounts for nav height (64px + safe area)

## Implementation Steps
1. Enhance `mobile-bottom-nav.tsx` glass effect
2. Create `upload-fab.tsx` with gradient and shadow
3. Add haptic feedback using Vibration API
4. Implement `pull-to-refresh.tsx` with rubber-band effect
5. Build `nav-badge.tsx` with pulse animation
6. Add hide-on-scroll behavior (behind feature flag)
7. Test on iPhone (notch), Android (various), iPad

## Success Criteria
- [ ] Nav feels native to iOS/Android users
- [ ] FAB clearly indicates upload action
- [ ] No layout shift from safe area
- [ ] Gestures don't conflict with OS gestures

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| FAB blocks content | Medium | Position offset, opacity on scroll |
| Gesture conflicts | High | Bottom-edge detection, thresholds |
| Safe area inconsistency | Medium | env() fallbacks, device testing |
