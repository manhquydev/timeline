# Admin Design Guidelines - Hướng Dẫn Thiết Kế Admin

Version 1.0.0 | Updated: 2026-01-09

## Color Palette (Kế thừa Teky Brand)

| Role | HSL | Usage |
|------|-----|-------|
| Primary | `hsl(270 70% 50%)` | CTAs, active states, sidebar accent |
| Primary Light | `hsl(270 70% 65%)` | Hover, selected rows |
| Success | `hsl(160 60% 45%)` | Approved, online, positive delta |
| Warning | `hsl(45 90% 55%)` | Pending, alerts |
| Destructive | `hsl(0 72% 51%)` | Delete, errors, negative delta |
| Muted | `hsl(270 10% 45%)` | Secondary text, placeholders |
| Surface | `hsl(0 0% 100% / 0.6)` | Cards with backdrop-blur |
| Border | `hsl(270 70% 90% / 0.3)` | Dividers, table borders |

## Typography (Admin-Specific)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page Title | 24px | 700 | 1.2 |
| Section Header | 18px | 600 | 1.3 |
| Card Title | 16px | 600 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Table Cell | 14px | 400 | 1.4 |
| Caption/Label | 12px | 500 | 1.4 |
| KPI Number | 32px | 700 | 1.1 |

## Spacing System (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Icon + text, inline elements |
| `gap-3` | 12px | Form fields, table cells |
| `gap-4` | 16px | Card padding (mobile), list items |
| `gap-6` | 24px | Card padding (desktop), section gaps |
| `gap-8` | 32px | Page sections |

## Component Patterns

### KPI Card
```tsx
<Card className="p-4 md:p-6">
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-sm">Label</span>
    <Icon className="h-5 w-5 text-muted-foreground" />
  </div>
  <p className="text-3xl font-bold mt-2">1,234</p>
  <p className="text-xs text-success mt-1">+12% vs last week</p>
</Card>
```

### Data Table
- Header: `bg-muted/50`, sticky on scroll
- Rows: hover `bg-muted/30`, selected `bg-primary/10`
- Actions: icon buttons, rightmost column
- Pagination: bottom-right, show "1-10 of 100"

### Forms
- Label: above input, `text-sm font-medium`
- Input height: 40px (touch-friendly)
- Error: red border + message below
- Required: asterisk after label

### Modal/Dialog
- Max-width: 480px (forms), 640px (confirmations)
- Padding: 24px
- Actions: right-aligned, primary right of secondary

## Navigation Patterns

### Desktop Sidebar (lg+)
- Width: 256px, fixed left
- Sections: collapsible groups
- Active: `bg-primary/10 border-l-2 border-primary`
- Icons: 20px, left of label

### Mobile Bottom Sheet
- Trigger: hamburger in header
- Full-width, slide up
- Touch targets: 48px height

### Breadcrumbs
- Show on detail pages: `Admin / Users / user@email.com`
- Chevron separator
- Last item: non-clickable, bold

## Responsive Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | <768px | Stack, bottom sheet nav |
| Tablet | 768-1023px | 2-col grid, collapsible sidebar |
| Desktop | 1024px+ | Sidebar + content, 3-4 col grids |

## Interactive States

| State | Style |
|-------|-------|
| Hover | `bg-muted/50` or `opacity-80` |
| Focus | `ring-2 ring-primary ring-offset-2` |
| Active | `scale-[0.98]` + darker bg |
| Disabled | `opacity-50 cursor-not-allowed` |
| Loading | Spinner inline or skeleton |

## Loading States

### Skeleton
- Use for cards, tables, forms during fetch
- Match exact layout dimensions
- Animate: `animate-pulse` on `bg-muted`

### Spinner
- Inline: 16px for buttons, 20px for sections
- Full-page: centered, 32px with message

### Progress
- File upload: horizontal bar with percentage
- Bulk actions: show "3 of 10 completed"

## Empty States

```tsx
<div className="flex flex-col items-center py-12 text-center">
  <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="font-semibold text-lg">No users found</h3>
  <p className="text-muted-foreground text-sm mt-1 max-w-[300px]">
    Try adjusting your search or filters
  </p>
  <Button className="mt-4">Add User</Button>
</div>
```

## Mobile-Specific Patterns

### Touch Targets
- Minimum: 44x44px
- Recommended: 48x48px for primary actions
- Spacing between targets: 8px+

### Bottom Sheet (thay Dropdown)
- Use for filters, bulk actions on mobile
- Slide up animation, swipe down to close
- Max height: 80vh

### Floating Action Button (FAB)
- Position: bottom-right, 16px from edges
- Size: 56px
- Above bottom nav: `bottom-20` on mobile

## Accessibility Checklist

- [ ] Color contrast 4.5:1 (text), 3:1 (UI)
- [ ] Focus visible on all interactive elements
- [ ] ARIA labels for icon-only buttons
- [ ] Table headers with `scope="col"`
- [ ] Form labels linked via `htmlFor`
- [ ] Error messages announced via `aria-live`

## Quick Reference Classes

```css
/* Glass Card */
.admin-card { @apply bg-white/60 backdrop-blur-sm border border-border rounded-xl shadow-sm; }

/* Table Row Hover */
.table-row { @apply hover:bg-muted/30 transition-colors; }

/* Status Badge */
.badge-success { @apply bg-success/10 text-success text-xs px-2 py-0.5 rounded-full; }
.badge-warning { @apply bg-warning/10 text-warning text-xs px-2 py-0.5 rounded-full; }
.badge-destructive { @apply bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full; }

/* Touch Target */
.touch-target { @apply min-h-[44px] min-w-[44px]; }
```

---

**Tham khảo thêm:**
- `docs/design-guidelines.md` - Design system tổng quát
- `docs/FOOTER_SYSTEM.md` - Mobile-first footer
- `docs/THEME_SYSTEM.md` - Theme động
