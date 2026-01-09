# Phase 05: Admin Dashboard

## Context
- [Design Guidelines](../../docs/design-guidelines.md)
- [User Management](../../components/admin/user-management-list.tsx)
- [Analytics Charts](../../components/admin/analytics-charts.tsx)
- [Theme Management](../../components/admin/theme-management.tsx)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-09 |
| Priority | P2 - Medium |
| Status | Planning |
| Est. Effort | 4-5 days |

## Key Insights
- Admin is desktop-primary (60% desktop usage)
- Quick stats overview most valuable for daily check
- Content moderation queue needs efficiency focus
- Theme management already functional, needs polish

## Requirements

### UI Requirements
- [ ] Stats overview cards with trend indicators
- [ ] Data tables with sorting, filtering, pagination
- [ ] Content moderation queue with bulk actions
- [ ] Theme preview cards with live color swatches
- [ ] Sidebar navigation (desktop), bottom tabs (mobile)

### UX Requirements
- [ ] Quick actions from dashboard (approve, reject)
- [ ] Keyboard shortcuts for power users
- [ ] Bulk select with shift-click
- [ ] Confirmation dialogs for destructive actions

### A11y Requirements
- [ ] Tables have proper header associations
- [ ] Sortable columns announce state changes
- [ ] Color swatches have text labels

## Architecture

### Enhanced Components
```
components/admin/
  stats-overview.tsx       # KPI cards with sparklines
  data-table.tsx           # Reusable table component
  moderation-queue.tsx     # Pending posts list
  theme-preview-card.tsx   # Theme with color swatches
  admin-sidebar.tsx        # Desktop navigation
```

### Data Flow
```
AdminDashboard -> /api/admin/stats (aggregated)
              -> /api/admin/users (paginated)
              -> /api/admin/posts?status=pending
```

## Implementation Steps
1. Create `stats-overview.tsx` with animated counters
2. Build `data-table.tsx` with shadcn/ui table base
3. Enhance `moderation-queue.tsx` with bulk actions
4. Redesign `theme-preview-card.tsx` with better visuals
5. Add `admin-sidebar.tsx` for desktop navigation
6. Implement keyboard shortcuts (j/k navigation, a/r approve/reject)
7. Test on tablet and desktop breakpoints

## Success Criteria
- [ ] Dashboard loads < 1s with cached data
- [ ] Bulk approve 10 posts < 3 seconds
- [ ] All tables keyboard navigable
- [ ] Mobile admin experience is usable

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Large data pagination | Medium | Server-side pagination, limit 50 |
| Accidental bulk delete | High | Confirmation modal, undo option |
| Stats query perf | Medium | Caching, incremental updates |
