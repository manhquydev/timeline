# Design Report: Homepage Timeline Wireframes

**Date:** 2026-01-09 | **Agent:** ui-ux-designer | **ID:** a62b888

## Summary

Created design guidelines and HTML wireframes for the Company Memory Timeline homepage upgrade. Deliverables prioritize 80% mobile users while maintaining desktop parity.

## Deliverables

| File | Purpose | Lines |
|------|---------|-------|
| `docs/design-guidelines.md` | Design tokens, typography, components | 148 |
| `docs/wireframes/homepage-desktop.html` | Desktop wireframe (1440px) | 380 |
| `docs/wireframes/homepage-mobile.html` | Mobile wireframe (375px) | 420 |

## Design Decisions

### 1. Pattern: Adaptive Hybrid Timeline
- **Desktop**: 3-column layout (sidebar + river + sidebar)
- **Mobile**: Single-column with left-aligned river line
- SVG path connector on desktop, CSS gradient line on mobile

### 2. Color System
- Primary: `hsl(270 70% 50%)` - Teky Purple
- Surface: Glass effect with `backdrop-filter: blur(12px)`
- Borders: Luminous `hsl(270 70% 90% / 0.3)`

### 3. Typography
- Headings: Be Vietnam Pro (Vietnamese-optimized)
- Body: Inter (high legibility)
- Mobile H1: 28px, Desktop H1: 48px

### 4. Mobile-First Patterns
- Fixed bottom navigation with FAB upload button
- Horizontal scroll for year navigation
- "On This Day" widget with horizontal card scroll
- Touch targets: 44-48px minimum
- Progressive disclosure (truncated descriptions)

### 5. Component Patterns
- **Glass Card**: Semi-transparent with blur
- **Event Node**: 48px mobile, 56px desktop
- **Photo Mosaic**: Bento grid (2-col mobile, 3-col desktop)
- **Stats Badge**: Gradient pill with photo count

## Accessibility Compliance

- WCAG 2.1 AA color contrast
- 44x44px minimum touch targets
- Semantic HTML structure
- Focus states defined in guidelines

## Animation Guidelines

- Micro: 100-150ms (button press)
- Standard: 200-300ms (hover states)
- Emphasis: 400-500ms (card reveals)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

## Next Steps

1. Implement React components based on wireframes
2. Add Motion One scroll animations
3. Integrate with existing theme system
4. Test with React Virtuoso for large galleries

## Unresolved Questions

1. Should river path SVG be interactive (click to scroll)?
2. How to handle theme color overrides for accessibility?
3. Slideshow feature: client-side or server-rendered?
