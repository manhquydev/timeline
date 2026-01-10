# Scout Report: MongoDB Models, Repositories, and Types
**Date:** 2026-01-10
**Task:** 260110-2213-critical-improvements

## 1. MongoDB Models (\`lib/mongodb/models/\`)
Centralized in \`index.ts\` for unified exports.

- **AuditLog.ts**: Audit trail for security and content actions.
- **Event.ts**: Core event data (metadata, status, branding).
- **Post.ts**: Media uploads (images/videos) with status and user association.
- **Theme.ts**: Dynamic theme configurations for special events.
- **Analytics.ts**: Tracking events and metrics.
- **Settings.ts**: Global, Site, and Upload configurations.
- **Workflow.ts**: Admin/Moderator workflow definitions.
- **Comment.ts, Like.ts, Notification.ts, TeamMember.ts**: Social and team features.

### Audit Log Schema Structure
Found in \`lib/mongodb/models/AuditLog.ts\`:
\`\`\`typescript
interface IAuditLog {
    action: AuditAction // Enum: LOGIN_SUCCESS, POST_CREATED, SETTINGS_CHANGE, etc.
    userId?: string     // Actor's Supabase ID
    actorName?: string  // Display name or email
    ipAddress?: string
    userAgent?: string
    resourceId?: string // ID of the affected object (Post, Event, etc.)
    resourceType?: string
    status: 'success' | 'failure'
    details?: Record<string, any>
    timestamp: Date
}
\`\`\`

## 2. Repositories (\`lib/mongodb/repositories/\`)
Abstracted data access layer using the Repository pattern.

- **BaseRepository.ts**: Abstract base class providing CRUD, lean queries, and cursor pagination.
- **AuditLogRepository.ts**: Specialized methods for logging and security event retrieval.
- **EventRepository.ts**: Event-specific queries (public vs private).
- **PostRepository.ts**: Post management, approvals, and event-based filtering.
- **index.ts**: Exports singleton instances of all repositories.

## 3. Type Definitions
- **lib/types.ts**: Clean application-level interfaces used for frontend and business logic. Includes \`Event\`, \`Post\`, \`UserProfile\`, \`UserRole\`, and \`Theme\`.
- **lib/supabase/database.types.ts**: Types for Supabase Auth and User tables (\`user_profiles\`, \`user_roles\`).
- **lib/mongodb/models/index.ts**: Re-exports Mongoose document types (e.g., \`IEventDocument\`).

## 4. Validation Schemas (\`lib/validations/\`)
Zod-based validation for API request bodies and forms.

- **index.ts**: Utility functions \`validateSchema\`, \`parseBody\`, \`parseFormData\`.
- **common.ts**: Reusable schemas (\`idSchema\`, \`urlSchema\`, \`cursorPaginationSchema\`).
- **events.ts**: \`createEventSchema\`, \`updateEventSchema\`.
- **posts.ts**: Post creation, status update, and comment schemas.
- **admin.ts**: User role management, team member CRUD, and theme activation schemas.

## Type Organization Patterns
1. **Repository Pattern**: Models are never accessed directly; \`BaseRepository\` ensures DB connection and standardizes query patterns (lean by default where appropriate).
2. **Hybrid Types**: Interface definitions in \`lib/types.ts\` often overlap with Supabase/MongoDB types but serve as the "Contract" for the UI.
3. **Zod Inference**: API routes use \`z.infer\` from validation schemas to maintain type safety from request to repository.
4. **Action Enums**: Heavy use of Enums (e.g., \`AuditAction\`, \`NotificationType\`) for searchable/filterable fields.

## Unresolved Questions
- None. The relationship between Supabase Auth and MongoDB records is clearly handled via the \`user_id\` (Supabase ID) stored in MongoDB.
