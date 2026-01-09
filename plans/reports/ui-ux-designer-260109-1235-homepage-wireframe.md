# Homepage Wireframe Report

**File**: `D:\project\timeline\docs\wireframes\homepage-wireframe.html`
**Date**: 2026-01-09
**Type**: HTML Wireframe (Liquid Glass Design)

---

## Summary

Created a complete, self-contained HTML wireframe for the Company Memory Timeline homepage redesign featuring:

- Liquid Glass aesthetics with glassmorphism effects
- Animated gradient mesh background (CSS-only)
- Mobile-first responsive design (80% mobile users)
- Vietnamese language support with proper diacritics

---

## Sections Implemented

### 1. Hero Section
- **Gradient mesh background**: Multi-layer radial gradients with `meshFloat` animation (20s cycle)
- **Floating particles**: 8 CSS-only particles with staggered `float` animation
- **Kinetic typography**: "Khoảnh Khắc Đáng Nhớ" with `textReveal` + `charFloat` animations
- **Gradient text effect**: Purple-to-coral shifting gradient on headline
- **CTA buttons**: "Khám Phá" (primary) + "Đăng Tải" (secondary), 48px min-height touch targets

### 2. Stats Section (Bento Grid)
- 4 glass cards: Photos (2,847), Events (156), Users (89), Reactions (5.2K)
- `glass-strong` effect with 24px blur
- Hover: `translateY(-4px) scale(1.02)` with enhanced shadow
- Gradient text on stat values
- 2x2 grid on mobile, 4-column on desktop

### 3. Event Cards Section
- Section title: "Sự Kiện Gần Đây" with gradient accent bar
- 3 event cards in bento layout (1-col mobile, 3-col desktop)
- Each card features:
  - Cover image placeholder (picsum.photos)
  - Photo count badge (gradient background)
  - Title, date, description
  - Glassmorphism with `card-glow` hover effect
  - `translateY(-8px)` lift on hover

### 4. Timeline Navigation
- Sticky glass nav bar (`position: sticky; top: 0`)
- Year filters: 2026, 2025, 2024, "Tất cả"
- Active state: Gradient background + gradient underline
- Horizontal scroll on mobile with hidden scrollbar

---

## Technical Implementation

### Fonts
```css
font-heading: 'Be Vietnam Pro', sans-serif (400, 500, 600, 700)
font-body: 'Inter', sans-serif (400, 500, 600)
```
Both support Vietnamese characters (ă, â, đ, ê, ô, ơ, ư).

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `hsl(270, 70%, 50%)` | CTAs, active states |
| `--primary-light` | `hsl(270, 70%, 65%)` | Gradients, hover |
| `--coral` | `hsl(15, 85%, 60%)` | Accent, gradients |
| `--bg` | `hsl(270, 20%, 98%)` | Page background |

### Animations (CSS-only)
| Animation | Duration | Purpose |
|-----------|----------|---------|
| `meshFloat` | 20s | Gradient mesh movement |
| `float` | 15-24s | Particle floating |
| `textReveal` | 1s | Hero text entrance |
| `gradientShift` | 4s | Text gradient cycling |

### Accessibility
- `min-height: 48px` on all buttons (WCAG touch targets)
- `prefers-reduced-motion` media query disables animations
- Proper `aria-hidden` on decorative elements
- Semantic HTML structure

### Responsive Breakpoints
- Mobile: < 768px (1-2 columns)
- Tablet: 768px+ (2 columns)
- Desktop: 1024px+ (3-4 columns)

---

## Dependencies

- Tailwind CSS v3 (CDN)
- Google Fonts (Be Vietnam Pro, Inter)
- No JavaScript required

---

## Usage

Open in browser:
```
file:///D:/project/timeline/docs/wireframes/homepage-wireframe.html
```

Or serve locally:
```bash
npx serve docs/wireframes
```

---

## Unresolved Questions

1. Should particles be disabled on mobile for performance?
2. Exact animation timing preferences for kinetic typography?
3. Integration with existing theme system (20/10, Tet themes)?
