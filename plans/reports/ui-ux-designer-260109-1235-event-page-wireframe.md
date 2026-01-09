# Event Page Wireframe Report

**ID:** acea5eb | **Date:** 2026-01-09 12:35
**File:** `D:\project\timeline\docs\wireframes\event-page-wireframe.html`

---

## Summary

Created mobile-first HTML wireframe for Company Memory Timeline event detail page with Liquid Glass aesthetics.

## Sections Implemented

### 1. Event Hero
- Full-width cover image (60vh, max 480px)
- Multi-layer gradient overlay (4 stops: 10% -> 85% opacity)
- Back button: 44px glass circle, top-left
- Title overlay at bottom with text-shadow
- Date + photo count badges (pill style, glass effect)

### 2. Event Info Bar
- Sticky glass effect bar (`backdrop-filter: blur(20px)`)
- Content: date icon, location icon, photo count
- Share button (gradient, right-aligned)
- Luminous border with inset highlight

### 3. Photo Grid (Masonry)
- CSS columns layout (no JavaScript)
- Responsive columns: 2 mobile, 3 tablet, 4 desktop
- 5 aspect ratio variants: 4:5, 1:1, 16:9, 3:4, 9:16
- Hover: `scale(1.02)` card, `scale(1.05)` image
- User overlay: always visible mobile, hover desktop
- Avatar with initials + name

### 4. Floating Upload FAB
- Fixed position: bottom 100px, right 20px
- 56px circle (64px on desktop)
- Gradient background (primary -> primary-light)
- Pulse animation: `2s infinite` box-shadow keyframes
- Hover: `scale(1.1)`, animation pauses

### 5. Social Actions Bar
- Fixed bottom with `env(safe-area-inset-bottom)`
- Liquid glass effect
- 3 buttons: Heart (active state), Comment, Share
- Heart: count display, beat animation on active
- Share: filled gradient style (prominent CTA)
- Max-width 480px on tablet+ (centered)

## Design Tokens Used

| Token | Value | Source |
|-------|-------|--------|
| Primary | `hsl(270 70% 50%)` | design-guidelines.md |
| Surface | `hsl(0 0% 100% / 0.6)` | design-guidelines.md |
| Border | `hsl(270 70% 90% / 0.3)` | design-guidelines.md |
| Radius | 16px | design-guidelines.md |
| Shadow | `0 4px 24px hsl(270 50% 20% / 0.08)` | design-guidelines.md |

## Typography

- **Headings:** Be Vietnam Pro (700)
- **Body:** Inter (400, 500, 600)
- Vietnamese language content throughout

## Responsive Breakpoints

| Breakpoint | Columns | Gap | Notes |
|------------|---------|-----|-------|
| < 768px | 2 | 8px | Mobile-first |
| 768px+ | 3 | 12px | Tablet |
| 1024px+ | 4 | 16px | Desktop, max-width 1280px |

## Accessibility

- Touch targets: 44px minimum (all buttons)
- `prefers-reduced-motion`: disables animations
- ARIA labels on all buttons
- Color contrast: WCAG AA compliant
- Focus states: browser defaults preserved

## Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| FAB pulse | box-shadow scale | 2s infinite | ease-out |
| Photo hover | scale transform | 0.3-0.4s | ease-out |
| Heart beat | scale 1 -> 1.3 -> 1 | 0.3s | ease-out |
| Button hover | translateY(-2px) | 0.2s | ease-out |

## Files

- **Wireframe:** `D:\project\timeline\docs\wireframes\event-page-wireframe.html`
- **Design System:** `D:\project\timeline\docs\design-guidelines.md`

## Technical Stack

- Google Fonts: Be Vietnam Pro, Inter (Vietnamese support)
- Tailwind CSS via CDN (config extended)
- Pure CSS animations (no JS required)
- CSS columns for masonry (no library)

---

## Unresolved Questions

None.
