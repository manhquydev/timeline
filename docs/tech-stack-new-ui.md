# Tech Stack - New UI System

Version 1.0.0 | 2026-01-09

## Overview

Mobile-first photo sharing platform. 80% mobile users, Vietnamese language support required.

## 1. Frontend Framework

**Keep: Next.js 15 App Router**
- Server Components for initial load performance
- App Router with streaming/Suspense
- Image optimization via `next/image`

## 2. Styling

**Keep: Tailwind CSS 3.4 + CSS Variables**

Design tokens already configured in `tailwind.config.js`:
- HSL-based color system via CSS variables
- Custom `--font-heading` and `--font-inter` families
- `tailwindcss-animate` for base animations

**Add to globals.css:**
```css
:root {
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 400ms;
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## 3. Component Library

**Keep: shadcn/ui (Radix + Tailwind)**

Already installed: Dialog, Toast, Tabs, Avatar, Dropdown, etc.

**Enhancements:**
- Extend Button with loading states and haptic feedback
- Add glass morphism variants to Card component
- Create `motion-safe:` utility classes for reduced-motion support

## 4. Animation Library

**Keep: Framer Motion 12.x** (already installed)

Usage patterns:
```tsx
// Stagger children
<motion.div variants={staggerContainer} initial="hidden" animate="show">
  {items.map((item, i) => (
    <motion.div key={i} variants={fadeInUp} />
  ))}
</motion.div>

// Gesture feedback
<motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} />
```

**Performance rules:**
- Use `layoutId` for shared element transitions
- Prefer `transform` and `opacity` only
- Set `reduced-motion` variants

## 5. Typography

**Fonts (Vietnamese support):**
| Role | Font | Weights | Source |
|------|------|---------|--------|
| Headings | Be Vietnam Pro | 500, 700 | Google Fonts |
| Body | Inter | 400, 500, 600 | Google Fonts |

**Implementation (app/layout.tsx):**
```tsx
import { Be_Vietnam_Pro, Inter } from 'next/font/google'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '700'],
  variable: '--font-heading'
})

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter'
})
```

## 6. Icon Library

**Keep: Lucide React** (already installed)

Pros: Tree-shakeable, consistent 24px grid, active maintenance.

Usage:
```tsx
import { Camera, Heart, Share2 } from 'lucide-react'
<Camera className="size-5" strokeWidth={2} />
```

## 7. Image Optimization

**Current stack:**
- `sharp` for server-side processing
- `blurhash` for placeholders
- `browser-image-compression` for client uploads
- `next/image` with blur placeholder

**Optimization checklist:**
- [ ] WebP format preference (already via Sharp)
- [ ] Responsive srcset: 640, 750, 1080, 1200
- [ ] Priority loading for above-fold images
- [ ] Lazy load below-fold with IntersectionObserver

## 8. Performance Considerations

**Already implemented:**
- React Query for data caching
- Virtual lists (`react-virtuoso`, `@tanstack/react-virtual`)
- Zustand for lightweight state
- Bundle analyzer (`@next/bundle-analyzer`)

**Recommendations:**
| Area | Action |
|------|--------|
| Animations | Use `will-change` sparingly, prefer CSS |
| Fonts | Preload critical fonts, use `font-display: swap` |
| Images | Set explicit `width`/`height` to prevent CLS |
| JS | Dynamic imports for heavy components (lightbox, cropper) |

## 9. Summary: What to Add

| Category | Package | Status |
|----------|---------|--------|
| Framer Motion | `framer-motion` | Installed |
| Lucide Icons | `lucide-react` | Installed |
| Fonts | Be Vietnam Pro + Inter | Configure in layout |
| Gestures | `hammerjs` | Installed |

**No new dependencies needed.** Focus on:
1. Configure Vietnamese font subsets
2. Create motion component wrappers
3. Add glass morphism CSS utilities
4. Implement gesture-first interactions for mobile
