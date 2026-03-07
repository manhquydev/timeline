# Backend Flow Map (User + Admin)

Last updated: 2026-03-07

## Admin flows

- Event management: `GET/POST/PATCH/DELETE /api/admin/events`
  - Create event, validate slug uniqueness, update fields/status, cascade delete posts, audit logging.
- Post moderation: `POST /api/admin/posts`
  - Approve/reject/delete post, remove storage objects, recalculate event stats.
- User management: `GET/PATCH/DELETE /api/admin/users`
  - List users + roles, change role, delete account, prevent self-demotion/deletion.
- Team management: `GET/POST/PATCH/DELETE /api/admin/team`, `POST /api/admin/team/reorder`, `POST /api/admin/team/upload-avatar`
- Theme management: `GET/POST/PATCH/DELETE /api/admin/themes`, `PATCH /api/admin/themes/[id]`, `POST /api/admin/themes/seed`, `POST /api/admin/themes/fix`
- Settings & cleanup: `GET/PATCH /api/admin/settings`, `POST /api/admin/cleanup`
- Workflow management: `GET/POST/PATCH/DELETE /api/admin/workflows`
- Activity feeds: `GET /api/admin/activities`

## User flows

- Upload media: `POST /api/upload`, `POST /api/upload/presigned`
  - Auth check, event status check, file validation, image processing, storage upload, post creation, stats update.
- Read event posts: `GET /api/events/[eventId]/posts`
- Post interaction:
  - `POST/GET /api/posts/[postId]/like`
  - `GET /api/posts/[postId]/likes`
  - `GET/POST /api/posts/[postId]/comments`
  - `PUT/DELETE /api/comments/[commentId]`
  - `POST /api/posts/create`
  - `POST /api/posts/[postId]/edit`
- Profile & settings:
  - `PATCH /api/profile/update`
  - `GET/PATCH /api/notifications`
  - MFA routes: `/api/auth/mfa/*`
  - GDPR routes: `/api/auth/gdpr/*`
- Utility/system:
  - `GET /api/health`
  - `GET /api/csrf`
  - `POST /api/analytics/track`
  - `GET /api/analytics/export`
  - `GET /api/wall/[userId]`

## Test coverage added in this task

- `tests/admin/admin-events-route.test.ts`
  - Route-level CRUD tests for `api/admin/events` including slug conflict, not-found, and cascade delete behavior.
- `tests/admin/admin-users-route.test.ts`
  - Route-level tests for `api/admin/users` covering user list join logic, self-protection checks, role update, and account deletion audit flow.
- `tests/admin/admin-posts-route.test.ts`
  - Route-level moderation tests for `api/admin/posts` covering approve/reject/delete, storage cleanup, validation error path, and moderation failure handling.
- `tests/admin/admin-team-routes.test.ts`
  - Route-level tests for `api/admin/team` and `api/admin/team/reorder` covering active-member listing, create/update/delete member flow, and reorder validation.
- `tests/admin/admin-workflows-route.test.ts`
  - Route-level tests for `api/admin/workflows` covering list, seed, toggle status, record run metrics, and delete not-found handling.
- `tests/admin/admin-settings-route.test.ts`
  - Route-level tests for `api/admin/settings` covering read settings, schema validation, and upsert update behavior.
- `tests/admin/admin-cleanup-route.test.ts`
  - Route-level tests for `api/admin/cleanup` covering orphaned post detection and deletion execution.
- `tests/e2e/event-lifecycle-flow.test.ts`
  - End-to-end API lifecycle:
    1) Admin creates draft event
    2) User upload blocked while draft
    3) Admin opens event
    4) User upload succeeds
    5) Admin deletes event
    6) User upload returns 404 after deletion
- `tests/e2e/social-interaction-flow.test.ts`
  - End-to-end API social lifecycle:
    1) User likes a post
    2) User unlikes the same post
    3) User adds a comment
    4) User edits the comment
    5) User deletes the comment
    6) Notification + realtime broadcast paths are exercised
- `tests/e2e/admin-event-crud-extended-flow.test.ts`
  - End-to-end API admin event lifecycle (extended):
    1) Admin creates event
    2) Admin edits event (slug/status/title)
    3) Admin fetches by slug
    4) User uploads into opened event
    5) Admin deletes post via moderation route
    6) Admin deletes event and verifies not-found behavior
    7) Slug collision path when editing event is validated
- `tests/e2e/admin-operations-extended-flow.test.ts`
  - End-to-end API admin operations (extended):
    1) Team member create/reorder/delete
    2) Settings update + read-back
    3) Workflow seed/list/toggle/delete
    4) Cleanup orphaned posts
- `tests/e2e/user-security-privacy-flow.test.ts`
  - End-to-end API advanced user flows:
    1) Notifications list + mark one/all as read
    2) MFA factors list, enroll, verify
    3) GDPR data export payload/headers
    4) GDPR delete-account request flow
    5) Auth, validation, and provider-error paths
- `tests/e2e/user-presigned-upload-flow.test.ts`
  - End-to-end API presigned upload flow:
    1) Generate presigned URLs for valid request
    2) Unauthorized/missing fields/too-many-files/event-state validation paths
    3) Signed-URL generation failure handling
- `tests/e2e/analytics-track-export-flow.test.ts`
  - End-to-end API analytics flow:
    1) Track multi-type events with device detection
    2) Export analytics CSV for admin session
    3) Validation, unauthorized export, and tracking failure paths
- `tests/e2e/user-wall-comments-likes-flow.test.ts`
  - End-to-end API wall/social interaction flow:
    1) Load user wall (approved posts only)
    2) Like/unlike post and query like state/list
    3) Create/list/edit/delete comments
    4) Notification and realtime broadcast paths
    5) Validation/auth/not-found error paths
