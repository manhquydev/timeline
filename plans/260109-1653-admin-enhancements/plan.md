# Admin Interface Enhancement Plan

This plan addresses the gaps identified in the "Admin Interface Gap Analysis" report, focusing on operational efficiency, system control, and technical scalability.

## Objectives
- Implement bulk management tools for content moderation.
- Create a centralized system settings dashboard.
- Establish a robust audit logging system.
- Refactor admin UI components for better consistency and desktop UX.

## Phase 1: Bulk Management Tools
*Goal: Allow moderators to process high volumes of content efficiently.*

### Tasks
- [ ] **State Management**: Add multi-select state to `PostManagementList`.
- [ ] **Bulk Action Bar**: Create a floating/sticky toolbar that appears when items are selected.
- [ ] **API Updates**: Update `POST /api/admin/posts` to accept an array of IDs for batch processing.
- [ ] **UI Feedback**: Add batch progress indicators and success notifications.

## Phase 2: System Settings Dashboard
*Goal: Centralize configuration and maintenance controls.*

### Tasks
- [ ] **Schema Design**: Define a `Settings` model in MongoDB for global config.
- [ ] **Page Implementation**: Create `app/admin/settings/page.tsx`.
- [ ] **Features**:
    - Maintenance mode toggle.
    - Global upload limits and allowed file types.
    - Site metadata (title, description, social links).
    - Email notification toggles.
- [ ] **API Route**: Implement `GET/PATCH /api/admin/settings`.

## Phase 3: Audit Logging System
*Goal: Track administrative actions for accountability.*

### Tasks
- [ ] **Schema Design**: Create `AuditLog` model (user_id, action, target_type, target_id, changes, timestamp).
- [ ] **Middleware/Utility**: Create a `logAdminAction` utility to be called in admin API routes.
- [ ] **UI Implementation**: Replace the mock feed on the Dashboard with a real `AuditLogList` component.
- [ ] **Filtering**: Add filtering by user, action type, and date range.

## Phase 4: UI/UX Refinement & Refactoring
*Goal: Improve consistency and power-user experience.*

### Tasks
- [ ] **Desktop Sidebar**: Add a collapsible sidebar for desktop view, complementing `AdminBottomNav`.
- [ ] **Mobile Optimization**: Convert `UserManagementList` dropdowns to `Sheet` components.
- [ ] **Generic Data Table**: Extract shared table logic (search, filter, pagination) into a reusable `AdminDataTable` component.
- [ ] **High-Res Lightbox**: Integrate `framer-motion` or a library for full-screen post previews during moderation.

## Implementation Notes
- **DRY**: Ensure the new `AdminDataTable` is used in Users, Posts, and Audit Logs.
- **KISS**: Start with simple MongoDB-backed logs before considering external observability tools.
- **YAGNI**: Focus on the most frequent administrative tasks (moderation and user roles) before building complex reporting.

## Unresolved Questions
- Should audit logs have an auto-expiration/cleanup policy (e.g., 90 days)?
- Do we need granular permissions within the Admin role (e.g., Content Moderator vs. User Manager)?
- Should "Bulk Actions" include user deletion or only role changes and post moderation?
