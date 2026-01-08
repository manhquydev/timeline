# Phase 1: Dependencies & Setup

## Context
The current timeline uses CSS animations (keyframes in `globals.css`) and IntersectionObserver for reveals. To achieve smoother, more performant animations on mobile (80% of users), we'll adopt Motion One (WAAPI-based, ~2KB gzipped) instead of heavier alternatives like Framer Motion (~30KB).

## Overview
- Install Motion One for lightweight, compositor-thread animations
- Add Be Vietnam Pro + Inter fonts via next/font
- Evaluate react-virtuoso need (defer if <100 posts typical)
- Update package.json and verify build

## Key Insights
- Motion One runs on compositor thread via WAAPI, avoiding main thread jank
- Be Vietnam Pro is optimized for Vietnamese diacritics
- Virtualization likely unnecessary for typical 10-50 events; defer to Phase 5 if needed

## Requirements
- Node.js 18+, Next.js 15.1+, React 19
- No breaking changes to existing components
- Bundle size increase < 5KB gzipped

## Implementation Steps

### 1. Install Motion One
```bash
npm install motion
```

### 2. Add Fonts via next/font (app/layout.tsx)
```typescript
import { Be_Vietnam_Pro, Inter } from 'next/font/google'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

// In <html>:
<html className={`${beVietnamPro.variable} ${inter.variable}`}>
```

### 3. Update Tailwind Config (tailwind.config.ts)
```typescript
theme: {
  extend: {
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
    },
  },
}
```

### 4. Verify Build
```bash
npm run build
npm run start
# Check for font loading, no console errors
```

### 5. Create Motion Utility Hook (lib/hooks/use-motion.ts)
```typescript
'use client'
import { animate, spring } from 'motion'
import { useCallback } from 'react'

export function useMotion() {
  const fadeIn = useCallback((element: Element, delay = 0) => {
    return animate(
      element,
      { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
      { duration: 0.5, delay, easing: spring({ stiffness: 300, damping: 24 }) }
    )
  }, [])

  const scaleIn = useCallback((element: Element, delay = 0) => {
    return animate(
      element,
      { opacity: [0, 1], transform: ['scale(0.9)', 'scale(1)'] },
      { duration: 0.4, delay, easing: spring({ stiffness: 400, damping: 28 }) }
    )
  }, [])

  return { fadeIn, scaleIn }
}
```

## Todo
- [ ] Run `npm install motion`
- [ ] Add fonts to `app/layout.tsx`
- [ ] Update `tailwind.config.ts` with font families
- [ ] Create `lib/hooks/use-motion.ts`
- [ ] Verify build passes
- [ ] Check bundle size delta

## Success Criteria
- [ ] `motion` package installed and importable
- [ ] Fonts load without FOUT (display: swap)
- [ ] Tailwind `font-heading` and `font-body` classes work
- [ ] Build passes with no errors
- [ ] Bundle size increase < 5KB gzipped

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Font loading delay | Low | Medium | Use `display: swap`, preload critical weights |
| Motion API changes | Low | Low | Pin version in package.json |
| Bundle bloat | Low | Medium | Monitor with `next build --analyze` |

## Files Modified
- `package.json`
- `app/layout.tsx`
- `tailwind.config.ts`
- `lib/hooks/use-motion.ts` (new)
