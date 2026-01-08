# Next.js 15 Fullstack Security Upgrade Report

## 1. Input Validation (Zod)
- **Recommendation**: Standardize on Zod for all `api/` Route Handlers and Server Actions.
- **Action**: Use `z.safeParse()` to prevent throwing unhandled errors.
- **Why**: Protects against injection, ensures type safety at boundaries, and provides clean error messages for clients.

## 2. CSRF Protection
- **Server Actions**: Next.js 15 handles this via automated Origin header validation for `POST` requests.
- **Route Handlers**: Manual implementation required.
- **Strategy**: Use `middleware.ts` to verify `Host` vs `Origin/Referer` headers for state-changing methods (`POST`, `PUT`, `DELETE`, `PATCH`).
- **Alternative**: Use `@edge-csrf/nextjs` for token-based protection if cross-origin requests are needed.

## 3. Supabase RLS Best Practices
- **Enable RLS**: Mandatory for all tables (events, posts, user_profiles).
- **Policies**:
  - Use `auth.uid() = user_id` for owner-only access.
  - Implement role-based policies using custom functions or checking the `user_roles` table.
- **Security**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Only use in `lib/supabase/server.ts`.
- **Indexing**: Ensure columns used in RLS policies (like `user_id`) are indexed to prevent performance degradation.

## 4. Security Headers (CSP & HSTS)
- **Deployment**: Vercel handles standard headers, but custom CSP is needed.
- **CSP**: Use a strict policy in `next.config.ts`.
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' *.supabase.co *.vercel-scripts.com` (avoid `'unsafe-inline'`).
  - `connect-src 'self' *.supabase.co *.mongodb.net`
- **HSTS**: Set `max-age=31536000; includeSubDomains; preload`.

## 5. Rate Limiting (Serverless)
- **Pattern**: Middleware-based limiting using a Redis-backed store (Upstash) to persist state across serverless instances.
- **Implementation**:
  - Limit `/api/upload` and `/api/auth` endpoints strictly.
  - Use `ratelimit` library from Upstash for 1ms latency impact at the edge.
- **Alternative**: Vercel Web Application Firewall (WAF) for infrastructure-level blocking.

## Actionable Summary
1. Create a `lib/validations/` directory for shared Zod schemas.
2. Update `middleware.ts` to include CSRF Origin checks and Rate Limiting.
3. Review all Supabase RLS policies to ensure no "SELECT ALL" rules exist without `auth.uid()` checks.
4. Audit `next.config.ts` for strict CSP implementation.

## Unresolved Questions
- Should we implement a global "maintenance mode" via middleware?
- Are there specific IP-based whitelist requirements for the MongoDB Atlas connection in production?

## Sources
- [Next.js Security Guide](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Security Headers](https://vercel.com/docs/concepts/edge-network/headers)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
