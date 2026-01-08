# Security & Architecture Research Report (Next.js 15 + Hybrid Stack)
**Date:** 2026-01-08 | **Project:** Company Memory Timeline

## 1. Next.js 15 Security Best Practices
- **Server Actions Security**:
    - Next.js 15 uses non-deterministic ID references for actions to prevent endpoint discovery.
    - **Recommendation**: Always check authorization *inside* the action body. Do not rely on middleware alone as it can be bypassed in some edge cases.
    - **Validation**: Use `zod` for strict input schema validation at the action entry point.
- **CSRF Protection**:
    - Built-in protection for Server Actions via SameSite cookies.
    - **Recommendation**: For standard API routes, implement `x-csrf-token` headers or use a library like `next-safe-action`.
- **Security Headers**:
    - Implement via `next.config.ts` or middleware.
    - **Focus**: `Content-Security-Policy` (strict), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`.

## 2. API Security 2025
- **Rate Limiting**:
    - **Pattern**: Use Vercel Edge Middleware with `@upstash/ratelimit` (Redis) or `Arcjet` for low-latency protection.
    - **Strategy**: Tiered limits (100 req/min for users, 1000 for admins).
- **Zod Integration**:
    - Centralize schemas in `lib/validations/` to share between client/server.
    - Use `.superRefine()` for complex business logic (e.g., checking if event is active before posting).

## 3. MongoDB Performance & Architecture
- **Connection Management**:
    - **Avoid Connection Storming**: Maintain the singleton pattern in `lib/mongodb/connection.ts`.
    - **Pooling**: Set `maxPoolSize: 10` for serverless environments to avoid saturating Atlas limits.
- **Query Optimization**:
    - **Indexes**: Ensure `posts` has compound index on `{ event_id: 1, status: 1, created_at: -1 }`.
    - **Aggregations**: Always place `$match` and `$sort` as the first stages to utilize indexes.
- **Write Safety**: Use `w: 'majority'` for critical operations (event creation) to ensure durability.

## 4. Supabase + MongoDB Hybrid Patterns
- **Identity Bridging**:
    - Use Supabase `sub` (UUID) as the foreign key in MongoDB `posts.user_id`.
    - **Recommendation**: Denormalize user display names in MongoDB `posts` to avoid multi-db joins on every read. Sync via Webhooks or Background Jobs if display names change.
- **RBAC Enforcement**:
    - **Logic**: Fetch role from Supabase -> Store in JWT/Session -> Pass to MongoDB Repositories.
    - **Safety**: Repositories should accept a `userContext` object to auto-inject filter clauses (e.g., `status: 'pending'` only visible to moderators).

## 5. TypeScript Strict Mode Migration
- **Strategy**:
    1. Update `tsconfig.json`: `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`.
    2. Phase 1: Enable `checkJs: true` for existing JS files to catch low-hanging fruit.
    3. Phase 2: Convert `lib/` and `components/ui/` first (core stability).
    4. Phase 3: Convert `app/` routes.
- **Advanced Types**: Use `Discriminated Unions` for UI states (loading, success, error) to eliminate null checks.

## Actionable Recommendations
1. **Immediate**: Implement `zod` validation in all `/api/upload` and `/api/admin` routes.
2. **Architecture**: Move RBAC checks into a higher-order function/decorator for Repositories.
3. **Infrastructure**: Set up `@upstash/ratelimit` for the public photo upload endpoint.
4. **DevX**: Activate strict TypeScript mode in the `plans/` directory immediately for new modules.

## Unresolved Questions
- Should we use Supabase Edge Functions for data-sync between Supabase and MongoDB?
- Impact of Next.js 15 "Security by Default" on existing magic link redirect logic?
- Best strategy for handling large MongoDB transactions across serverless invocations?
