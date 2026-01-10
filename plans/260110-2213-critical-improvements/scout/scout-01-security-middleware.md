# Scout Report: Security, Admin Routes, Logging, and Blurhash

**Date:** 2026-01-10
**Task:** Identify patterns for security improvements and performance optimizations.

## 1. Rate Limiting and Middleware
- **Core Utility:** \`lib/security/rate-limit.ts\`
  - Implements a sliding-window rate limiter using an in-memory \`Map\`.
  - Configurable intervals and maximum request counts.
  - Exported presets: \`STRICT\` (10/min), \`DEFAULT\` (60/min), \`GENEROUS\` (200/min).
- **Middleware Usage:** \`middleware.ts\`
  - Applies rate limiting to all \`/api/\` routes.
  - Uses \`STRICT\` for \`/api/auth/*\` and \`DEFAULT\` for others.
  - Extracts IP from \`x-forwarded-for\` or \`request.ip\`.
  - Returns 429 status with \`X-RateLimit-*\` headers on failure.

## 2. Admin API Routes and Authentication
- **Location:** \`app/api/admin/*\`
- **Key Pattern:**
  - Most routes follow a standard pattern:
    1. \`supabase.auth.getUser()\` to verify session.
    2. \`isCurrentUserAdmin()\` from \`lib/auth-utils.ts\` for role check.
    3. \`validateBody\` or \`validateQuery\` from \`lib/api-utils.ts\` for Zod validation.
- **Notable Routes:**
  - \`app/api/admin/users/route.ts\`: Uses \`createAdminClient()\` (Service Role) to bypass RLS for role management and deletions.
  - \`app/api/admin/events/route.ts\`: Handles CRUD for events in MongoDB.

## 3. Logging Patterns
- **Standard Catch Blocks:** Almost all API routes use \`console.error\` in their \`catch\` blocks to log the full error before returning an \`errorResponse\`.
- **Audit Logging:**
  - \`app/api/admin/users/route.ts\`: Logs \`[ROLE_CHANGE]\` and \`[USER_DELETE]\` with admin email and target user details.
  - \`app/api/admin/events/route.ts\`: Logs \`Cascade delete\` count when removing an event.
- **Warnings:**
  - \`app/api/upload/route.ts\`: Logs \`console.warn\` if file validation (magic bytes) fails.

## 4. Blurhash and Image Optimization
- **Display Component:** \`components/ui/optimized-image.tsx\`
  - Uses a placeholder SVG in \`blurhashToDataURL\` (Comment says: "In production, you would use the blurhash library to decode").
  - Fades out the placeholder when the actual image loads.
  - Handles error states and shimmer effects.
- **Generation:** \`app/api/upload/route.ts\`
  - Uses \`sharp\` to resize image to 32x32.
  - Uses \`encode\` from \`blurhash\` library.
  - Stores the generated string in the MongoDB \`posts\` collection.

## Dependencies and Relations
- \`lib/auth-utils.ts\` is the central hub for role-based access control.
- \`lib/api-utils.ts\` provides standardized response and validation wrappers used across almost all API routes.
- \`app/api/upload/route.ts\` is the primary entry point for media, bridging Supabase Storage and MongoDB records.

## Unresolved Questions / Observations
- **Rate Limiting:** The in-memory storage will reset on serverless function cold starts or across multiple instances. Consider Redis if high accuracy is needed.
- **Blurhash:** The client-side component has a TODO/Placeholder for the actual decoding logic. It currently uses a static SVG gradient instead of decoding the blurhash string.
- **Logging:** Consistency is high, but logs are standard \`console\` calls. No structured logging library (like Pino) is currently used.
