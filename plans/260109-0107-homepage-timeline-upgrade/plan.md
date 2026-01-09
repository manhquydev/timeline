# Implementation Plan: Homepage & Timeline Design Upgrade (2025-2026)

**ID:** 260109-0107-homepage-timeline-upgrade
**Status:** Ready for implementation
**Date:** 2026-01-09

## 1. Overview
Upgrade the homepage and memory timeline from standard glassmorphism to a "Layered Minimalism" and "Bento Grid 2.0" aesthetic. Key improvements include Vietnamese-optimized typography (Be Vietnam Pro), a warmer nostalgia-centric color palette, and spatial UI interactions (card tilting, pulse-point timeline).

## 2. Phase 1: Global Foundation
### 2.1 Typography Update
- **File:** `D:/project/timeline/app/layout.tsx`
- **Change:** Import `Be_Vietnam_Pro` from `next/font/google`.
- **Action:** Configure as a variable `--font-be-vietnam` and apply to the root.

### 2.2 Design System Extension (HSL Tokens)
- **File:** `D:/project/timeline/app/globals.css`
- **Change:** Add new color tokens for "Nostalgia Warm" and "Solace Blue".
- **Tokens:**
  ```css
  --nostalgia-warm: 20 15% 70%;
  --calm-blue: 210 30% 75%;
  --luminous-border: 270 70% 90% / 0.3;
  ```

## 3. Phase 2: Component Refactoring
### 3.1 EventCard (Bento Layout)
- **File:** `D:/project/timeline/components/events/event-card.tsx`
- **Change:**
  - Update card to support variable aspect ratios (for bento grid).
  - Replace heavy blurs with 1px luminous borders.
  - Implement a `hover-tilt` class (magnetic effect).

### 3.2 Timeline Line (Pulse Points)
- **File:** `D:/project/timeline/components/timeline/memory-river-timeline.tsx`
- **Change:**
  - Replace the solid/dashed SVG path with a series of "Pulse Point" components.
  - Use `framer-motion` to animate points as they enter the viewport.

## 4. Phase 3: Homepage Layout
### 4.1 Bento Grid Implementation
- **File:** `D:/project/timeline/app/page.tsx`
- **Change:**
  - Refactor the events display into a responsive Bento Grid (asymmetrical tiles).
  - Priority-based rendering for hero events (larger tiles).

## 5. Phase 4: Motion & Micro-interactions
### 5.1 Spatial UI (Tilt/Parallax)
- **File:** `D:/project/timeline/lib/animations/index.ts` (or equivalent)
- **Change:** Add a reusable hook or utility for device-orientation-aware tilting for mobile users.

## 6. Verification Plan
- [ ] Verify Vietnamese diacritics rendering with Be Vietnam Pro font.
- [ ] Test Bento Grid responsiveness (Mobile: 1 col, Tablet: 2 col, Desktop: Asymmetrical).
- [ ] Check color contrast (WCAG 2.1 AA) for new palette tokens.
- [ ] Performance audit: Ensure FPS stays > 60 on mobile during timeline scroll.

## 7. Key Files to Modify
- `D:/project/timeline/app/layout.tsx`
- `D:/project/timeline/app/globals.css`
- `D:/project/timeline/app/page.tsx`
- `D:/project/timeline/components/events/event-card.tsx`
- `D:/project/timeline/components/timeline/memory-river-timeline.tsx`
