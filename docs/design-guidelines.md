# Design Guidelines - Company Memory Timeline

Version 1.0.0 | Updated: 2026-01-09

## Color Palette

### Primary Colors
| Role | Name | HSL | Hex | Usage |
|------|------|-----|-----|-------|
| Primary | Teky Purple | `hsl(270 70% 50%)` | #8B5CF6 | CTAs, active states, brand |
| Primary Light | Lavender | `hsl(270 70% 65%)` | #A78BFA | Hover states, gradients |
| Primary Dark | Deep Purple | `hsl(270 70% 40%)` | #6D28D9 | Text on light bg |

### Accent Colors
| Role | Name | HSL | Usage |
|------|------|-----|-------|
| Accent | Solace Blue | `hsl(210 30% 75%)` | Secondary actions, info |
| Warm | Mocha Mousse | `hsl(20 15% 70%)` | Nostalgic elements |
| Success | Emerald | `hsl(160 60% 45%)` | Confirmations |
| Warning | Amber | `hsl(45 90% 55%)` | Alerts |

### Surface Colors
| Role | HSL | Usage |
|------|-----|-------|
| Background | `hsl(270 20% 98%)` | Page background |
| Surface | `hsl(0 0% 100% / 0.6)` | Glass cards |
| Border | `hsl(270 70% 90% / 0.3)` | Luminous borders |
| Foreground | `hsl(270 15% 15%)` | Primary text |
| Muted | `hsl(270 10% 45%)` | Secondary text |

## Typography

### Font Families
- **Headings**: `'Be Vietnam Pro', sans-serif` (weights: 500, 700)
- **Body**: `'Inter', sans-serif` (weights: 400, 500, 600)

### Type Scale (Mobile-First)
| Level | Mobile | Desktop | Weight | Line Height |
|-------|--------|---------|--------|-------------|
| H1 | 32px | 48px | 700 | 1.2 |
| H2 | 24px | 36px | 700 | 1.25 |
| H3 | 20px | 24px | 600 | 1.3 |
| Body | 16px | 16px | 400 | 1.6 |
| Small | 14px | 14px | 400 | 1.5 |
| Caption | 12px | 12px | 500 | 1.4 |

## Spacing System (8px Base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Icon gaps |
| `space-3` | 12px | Inline elements |
| `space-4` | 16px | Card padding (mobile) |
| `space-5` | 24px | Section gaps |
| `space-6` | 32px | Card padding (desktop) |
| `space-8` | 48px | Section margins |
| `space-10` | 64px | Hero spacing |

## Component Patterns

### Glass Card
```css
.glass-card {
  background: hsl(0 0% 100% / 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(270 70% 90% / 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 24px hsl(270 50% 20% / 0.08);
}
```

### Timeline Node
- Size: 48px (mobile), 56px (desktop)
- Border: 3px solid primary
- Background: white with gradient on active
- Touch target: 44px minimum

### Event Card
- Border-radius: 16px
- Photo aspect: 4:5 (portrait) or 16:9 (landscape)
- Padding: 16px (mobile), 24px (desktop)
- Hover: translateY(-4px), shadow increase

### Button Styles
- Height: 44px minimum (touch target)
- Padding: 12px 24px
- Border-radius: 8px
- Transition: 200ms ease-out

## Animation Guidelines

### Durations
| Type | Duration | Usage |
|------|----------|-------|
| Micro | 100-150ms | Button press, toggles |
| Standard | 200-300ms | Hover, focus states |
| Emphasis | 400-500ms | Card reveals, modals |
| Scroll | 600-800ms | Page transitions |

### Easing
- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)`
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)`
- **Spring**: `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Motion Principles
1. Animate only `transform` and `opacity` (GPU-accelerated)
2. Respect `prefers-reduced-motion`
3. Stagger reveals: 50-100ms between items
4. Scroll-triggered: fade + translateY(20px)

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

### Touch Targets
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing between targets: 8px minimum

### Focus States
- Outline: 2px solid primary
- Offset: 2px
- Never remove focus indicators

### Screen Readers
- Use semantic HTML (`<ol>`, `<li>` for timeline)
- ARIA labels for interactive elements
- Alt text for all images

## Responsive Breakpoints

| Name | Width | Columns |
|------|-------|---------|
| Mobile | 320-767px | 1-2 |
| Tablet | 768-1023px | 2-3 |
| Desktop | 1024-1439px | 3-4 |
| Wide | 1440px+ | 4 |

## Timeline-Specific Patterns

### Memory River Path
- SVG stroke: 2px, dashed pattern
- Color: primary at 30% opacity
- Animate: dash-offset on scroll

### Event Node States
- Default: white bg, purple border
- Hover: scale(1.1), glow effect
- Active: gradient bg, pulse animation
- Past: muted colors, no glow

### Photo Mosaic (Bento Grid)
- 2-3 photos per event card
- Gap: 4px
- First photo: larger (span 2 rows)
- Hover: slight zoom (1.02)

### Stats Badge
- Position: top-right of event card
- Background: primary gradient
- Content: photo count, date
