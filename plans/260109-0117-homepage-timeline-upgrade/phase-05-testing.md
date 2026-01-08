# Phase 5: Testing & Polish

## Context
Final phase to validate the upgrade meets performance targets, accessibility requirements, and cross-browser compatibility. Focus on Core Web Vitals, WCAG 2.1 AA compliance, and edge cases.

## Overview
- Performance testing with Lighthouse/PageSpeed Insights
- Accessibility audit (screen reader, keyboard nav, contrast)
- Cross-browser testing (Chrome, Safari, Firefox, Edge)
- Mobile device testing (iOS Safari, Android Chrome)
- Final polish and bug fixes

## Key Insights
- Target: 80% mobile users = prioritize mobile Lighthouse scores
- CSS scroll-timeline unsupported in Safari/Firefox = verify JS fallback works
- Motion One should maintain 60fps = profile with Chrome DevTools
- Vietnamese diacritics need font fallback testing

## Requirements
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Lighthouse Performance score >= 90 (mobile)
- Lighthouse Accessibility score >= 95
- All animations respect `prefers-reduced-motion`
- Works in last 2 versions of major browsers

## Implementation Steps

### 1. Core Web Vitals Testing
Run Lighthouse audits on homepage:
```bash
# Local testing
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json

# Or use PageSpeed Insights API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=YOUR_URL&strategy=mobile"
```

**Metrics to track:**
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | < 2.5s | - | pending |
| FID | < 100ms | - | pending |
| CLS | < 0.1 | - | pending |
| TTI | < 3.8s | - | pending |
| TBT | < 200ms | - | pending |

### 2. Animation Performance Profiling
Use Chrome DevTools Performance tab:
```
1. Open DevTools > Performance
2. Enable "Screenshots" and "Web Vitals"
3. Start recording
4. Scroll through timeline
5. Stop recording
6. Check for:
   - Frame drops (red bars in FPS chart)
   - Long tasks (> 50ms)
   - Layout shifts
```

**Fix common issues:**
- If frame drops: reduce particle count, simplify transforms
- If long tasks: defer non-critical animations
- If layout shifts: add explicit dimensions to images

### 3. Accessibility Audit

#### Keyboard Navigation
```
Tab through page:
- [ ] All interactive elements focusable
- [ ] Focus order logical (hero → nav → timeline → cards)
- [ ] Focus visible (2px outline)
- [ ] Escape closes any modals
- [ ] Enter/Space activates buttons
```

#### Screen Reader Testing
```bash
# macOS: Enable VoiceOver
# Windows: Use NVDA (free)

Test:
- [ ] Headings hierarchy (h1 → h2 → h3)
- [ ] Timeline reads as ordered list
- [ ] Images have alt text
- [ ] Buttons have accessible names
- [ ] Status badges announced correctly
```

#### Color Contrast
```
Use WebAIM Contrast Checker or axe DevTools:
- [ ] Primary text on background: >= 4.5:1
- [ ] Large text (>= 18px bold): >= 3:1
- [ ] Interactive elements: >= 3:1
- [ ] Glass card text readable
```

#### Reduced Motion
```css
/* Verify in globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Test by enabling reduced motion:
- macOS: System Preferences > Accessibility > Display > Reduce motion
- Windows: Settings > Ease of Access > Display > Show animations

### 4. Cross-Browser Testing

| Browser | Version | Platform | Status |
|---------|---------|----------|--------|
| Chrome | 120+ | Desktop | pending |
| Safari | 17+ | Desktop | pending |
| Firefox | 120+ | Desktop | pending |
| Edge | 120+ | Desktop | pending |
| Chrome | 120+ | Android | pending |
| Safari | 17+ | iOS | pending |

**Browser-specific checks:**
- Safari: Verify JS scroll fallback (no CSS scroll-timeline)
- Firefox: Verify JS scroll fallback
- iOS Safari: Test touch interactions, verify no rubber-band issues
- Android Chrome: Test on mid-range device if possible

### 5. Mobile Device Testing

**Test devices (physical or emulator):**
- iPhone SE (375px) - smallest common
- iPhone 14 Pro (393px) - popular
- Samsung Galaxy S23 (360px) - Android flagship
- Pixel 6 (412px) - stock Android

**Mobile-specific checks:**
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Text readable without zoom
- [ ] FAB doesn't overlap content
- [ ] Bottom nav doesn't hide timeline
- [ ] Smooth scrolling

### 6. Edge Case Testing

```
Test scenarios:
- [ ] Empty state (no events)
- [ ] Single event
- [ ] Many events (20+)
- [ ] Event with no photos
- [ ] Event with no cover image
- [ ] Long event titles (truncation)
- [ ] Vietnamese diacritics display correctly
- [ ] OnThisDayWidget with no match (should hide)
- [ ] Slow network (3G throttling)
- [ ] Offline behavior
```

### 7. Final Polish Checklist

```
Code quality:
- [ ] No console errors/warnings
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Remove unused imports
- [ ] Remove debug code

Visual polish:
- [ ] Consistent spacing
- [ ] Smooth transitions
- [ ] No layout jumps
- [ ] Loading states for images
- [ ] Hover states on desktop

Performance:
- [ ] Images optimized (WebP)
- [ ] Fonts preloaded
- [ ] No render-blocking resources
- [ ] Bundle size reasonable
```

### 8. Optional: React Virtuoso Integration
If testing reveals performance issues with many events (>50):
```bash
npm install react-virtuoso
```

Then wrap timeline in Virtuoso:
```typescript
import { Virtuoso } from 'react-virtuoso'

<Virtuoso
  data={sortedEvents}
  itemContent={(index, { event, posts }) => (
    <TimelineItem event={event} posts={posts} index={index} />
  )}
/>
```

## Todo
- [ ] Run Lighthouse audit (mobile)
- [ ] Profile animations in Chrome DevTools
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Verify reduced motion
- [ ] Test Safari scroll fallback
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test edge cases (empty, many events)
- [ ] Fix any issues found
- [ ] Final ESLint/TypeScript check

## Success Criteria
- [ ] Lighthouse Performance >= 90 (mobile)
- [ ] Lighthouse Accessibility >= 95
- [ ] LCP < 2.5s, CLS < 0.1
- [ ] Animations 60fps on mid-range mobile
- [ ] All browsers render correctly
- [ ] Reduced motion respected
- [ ] No console errors

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LCP fails on slow networks | Medium | High | Optimize hero image, defer animations |
| Safari scroll issues | Medium | Medium | JS fallback tested |
| Accessibility gaps | Low | High | Use axe DevTools, test with screen reader |
| Mobile performance issues | Low | High | Profile early, reduce complexity |

## Files Modified
- Various bug fixes as discovered during testing
- Potential `globals.css` tweaks for contrast
- Potential component optimizations

## Dependencies
- Phase 1-4 completed
- Access to testing devices/browsers

## Testing Commands
```bash
# Build and test locally
npm run build && npm run start

# Run ESLint
npm run lint

# Check TypeScript
npx tsc --noEmit

# Lighthouse CLI
npx lighthouse http://localhost:3000 --view

# Bundle analysis
ANALYZE=true npm run build
```
