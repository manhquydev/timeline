# Admin Interface Tech Stack

## Current Stack (Maintained)
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 15 (App Router) | Server-side rendering, routing |
| Language | TypeScript | Type safety |
| Styling | TailwindCSS + shadcn/ui | Utility-first CSS, accessible components |
| Animation | Framer Motion | Micro-interactions |
| Database | MongoDB Atlas | Events, posts, audit logs |
| Auth | Supabase Auth | User authentication, roles |
| Storage | Supabase Storage | Media files |
| Charts | Recharts | Data visualization |

## New Components for Admin Upgrade

### Navigation
- **Desktop Sidebar**: Collapsible sidebar (lg+) using shadcn `Sheet` or custom component
- **Global Search**: Command palette using shadcn `Command` (Cmd+K)
- **Breadcrumbs**: Context-aware breadcrumb trail

### Data Management
- **AdminDataTable**: Unified table with search, filter, pagination, virtual scrolling
- **BulkActionBar**: Floating toolbar for multi-select operations
- **ImageLightbox**: Full-screen preview for post moderation

### System Features
- **AuditLog Model**: MongoDB schema for tracking admin actions
- **Settings Model**: MongoDB schema for global configuration
- **NotificationBell**: Real-time notification center

## Architecture Decisions

### 1. Sidebar Navigation (Desktop)
**Decision**: Add collapsible sidebar for lg+ screens, keep bottom nav for mobile
**Rationale**: Power users need quick access to all sections; mobile UX remains touch-optimized

### 2. Global Search (Cmd+K)
**Decision**: Implement using shadcn Command component
**Rationale**: Standard pattern for admin dashboards; improves discoverability

### 3. Bulk Actions
**Decision**: Add multi-select checkboxes + floating action bar
**Rationale**: High-volume moderation requires batch processing; reduces click fatigue

### 4. Audit Logging
**Decision**: MongoDB-backed audit log with server-side utility
**Rationale**: Simple, integrated with existing stack; no external dependencies

### 5. Virtual Scrolling
**Decision**: Use TanStack Virtual for large lists (100+ items)
**Rationale**: Maintains 60fps performance; essential for user/post tables

## Performance Optimizations
- Route-based code splitting for admin bundle
- Skeleton loaders for charts and tables
- Lazy loading for heavy components (AnalyticsCharts)
- WebP images with blurhash placeholders (existing)

## Security Considerations
- All admin routes protected by `isCurrentUserAdmin()` check
- Audit logs capture user_id, action, target, changes, timestamp
- Settings changes require super_admin or admin role
- Sensitive operations (user deletion) require confirmation modal
