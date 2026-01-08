# Phase 2: Design System Updates

## Context
Current `globals.css` has extensive CSS variables and utilities. This phase refines them based on design guidelines: warmer color palette, subtle glassmorphism 2.0, and animation utilities compatible with Motion One.

## Overview
- Update CSS variables for refined color palette
- Add scroll-driven animation CSS (with fallback)
- Create reusable timeline-specific utilities
- Ensure WCAG 2.1 AA compliance for all color combinations

## Key Insights
- Research recommends "Subtle Layering" over heavy blur glassmorphism
- Mocha Mousse accent adds warmth/nostalgia to memory platform
- CSS `scroll-timeline` supported in Chrome 115+; fallback via IntersectionObserver

## Requirements
- Maintain backward compatibility with existing components
- All text/background combos pass 4.5:1 contrast ratio
- Animation utilities should be composable with Motion One

## Implementation Steps

### 1. Update Color Variables (app/globals.css)
Add refined palette from design guidelines:
```css
:root {
  /* Refined Primary - Teky Purple */
  --primary: 270 70% 50%;
  --primary-light: 270 70% 65%;
  --primary-dark: 270 70% 40%;

  /* Accent - Solace Blue (calm, clarity) */
  --accent-blue: 210 30% 75%;

  /* Warm - Mocha Mousse (nostalgia) */
  --warm-mocha: 20 15% 70%;

  /* Surface - Frosted Pearl */
  --surface-glass: 0 0% 100% / 0.6;

  /* Border - Luminous */
  --border-luminous: 270 70% 90% / 0.3;
}
```

### 2. Add Glassmorphism 2.0 Utilities
Replace heavy blur with subtle layering:
```css
.glass-subtle {
  background: hsl(0 0% 100% / 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border-luminous));
  box-shadow:
    0 4px 24px hsl(270 50% 20% / 0.08),
    inset 0 1px 0 hsl(0 0% 100% / 0.5);
}

.glass-card {
  background: hsl(0 0% 100% / 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border-luminous));
  border-radius: 16px;
  box-shadow: 0 4px 24px hsl(270 50% 20% / 0.08);
}
```

### 3. Add Scroll-Driven Animation CSS
```css
/* Modern browsers (Chrome 115+) */
@supports (animation-timeline: scroll()) {
  .scroll-animate-path {
    animation: draw-path linear;
    animation-timeline: scroll();
    animation-range: 0% 100%;
  }

  @keyframes draw-path {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
  }
}

/* Fallback class for JS-controlled animation */
.scroll-animate-path-fallback {
  transition: stroke-dashoffset 0.3s ease-out;
}
```

### 4. Add Timeline-Specific Utilities
```css
/* Timeline node states */
.timeline-node {
  @apply relative w-12 h-12 md:w-14 md:h-14 rounded-full
         flex items-center justify-center
         border-[3px] border-primary bg-white
         shadow-lg transition-all duration-300;
}

.timeline-node-active {
  @apply bg-gradient-to-br from-primary to-secondary scale-110;
  box-shadow: 0 0 20px hsl(var(--primary) / 0.4);
}

.timeline-node-past {
  @apply opacity-70 border-muted;
}

/* Timeline connector */
.timeline-connector {
  stroke: hsl(var(--primary) / 0.3);
  stroke-width: 2;
  stroke-dasharray: 8 4;
  fill: none;
}
```

### 5. Add Motion-Compatible Animation Classes
```css
/* Base states for Motion One to animate from */
.motion-initial {
  opacity: 0;
  transform: translateY(20px);
}

.motion-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger delay utilities */
.stagger-1 { --stagger-delay: 0.05s; }
.stagger-2 { --stagger-delay: 0.1s; }
.stagger-3 { --stagger-delay: 0.15s; }
.stagger-4 { --stagger-delay: 0.2s; }
.stagger-5 { --stagger-delay: 0.25s; }
```

### 6. Update Typography Classes
```css
/* Apply new fonts */
h1, h2, h3, .font-heading {
  font-family: var(--font-heading), 'Be Vietnam Pro', sans-serif;
}

body, p, .font-body {
  font-family: var(--font-body), 'Inter', sans-serif;
}

/* Heading styles per design guidelines */
.heading-hero {
  @apply text-fluid-4xl font-heading font-bold leading-tight tracking-tight;
}

.heading-section {
  @apply text-fluid-3xl font-heading font-bold leading-snug;
}

.heading-card {
  @apply text-fluid-xl font-heading font-semibold leading-snug;
}
```

## Todo
- [ ] Add refined color variables to `:root`
- [ ] Add `.glass-subtle` and `.glass-card` utilities
- [ ] Add scroll-driven animation CSS with `@supports`
- [ ] Add timeline-specific utilities
- [ ] Add motion-compatible animation classes
- [ ] Update typography classes for new fonts
- [ ] Test contrast ratios with WebAIM tool

## Success Criteria
- [ ] New color variables accessible in Tailwind
- [ ] `.glass-card` renders with subtle blur effect
- [ ] Scroll-driven CSS works in Chrome, gracefully degrades elsewhere
- [ ] All text passes WCAG 2.1 AA contrast (4.5:1)
- [ ] Typography renders with Be Vietnam Pro headings

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CSS conflicts with existing classes | Medium | Low | Prefix new classes, test thoroughly |
| Browser compat for scroll-timeline | High | Low | `@supports` query with JS fallback |
| Contrast issues | Low | High | Use WebAIM contrast checker |

## Files Modified
- `app/globals.css` - Add new variables and utilities
- `tailwind.config.ts` - Extend theme if needed

## Dependencies
- Phase 1 completed (fonts installed)
