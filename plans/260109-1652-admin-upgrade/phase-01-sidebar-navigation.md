# Phase 1: Desktop Sidebar & Navigation

**Priority:** High | **Status:** In Progress

## Context
- Current: Only bottom nav exists, no desktop sidebar
- Gap: Power users on desktop need quick access to all admin sections
- Solution: Collapsible sidebar for lg+ screens

## Requirements
1. Sidebar visible on lg+ (1024px+)
2. Collapsible with toggle button
3. Shows all admin sections with icons
4. Active state indicator
5. Persistent collapse state (localStorage)
6. Bottom nav remains for mobile (<1024px)

## Architecture
```
app/admin/
├── layout.tsx          # Add AdminSidebar wrapper
components/admin/
├── admin-sidebar.tsx   # New: Desktop sidebar
├── admin-bottom-nav.tsx # Existing: Mobile nav
├── admin-layout.tsx    # New: Layout wrapper
```

## Implementation Steps
- [x] Create AdminSidebar component
- [x] Create AdminLayout wrapper
- [x] Update app/admin/layout.tsx
- [x] Add collapse toggle with localStorage
- [x] Style active states per design guidelines
- [ ] Test responsive behavior

## Related Files
- `components/admin/admin-bottom-nav.tsx`
- `docs/admin-design-guidelines.md`

## Success Criteria
- Sidebar shows on desktop (lg+)
- Bottom nav shows on mobile
- Collapse state persists
- Active section highlighted
