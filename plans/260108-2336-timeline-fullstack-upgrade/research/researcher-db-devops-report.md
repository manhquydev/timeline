# Researcher Report: MongoDB & DevOps Optimization (v2026.01)

## 1. MongoDB Atlas Indexing Strategies
*   **ESR Rule**: Follow Equality, Sort, Range order for compound indexes.
    *   *Equality*: Fields queried with exact values (e.g., `status: "approved"`).
    *   *Sort*: Fields used for ordering (e.g., `created_at: -1`).
    *   *Range*: Fields queried with inequalities (e.g., `views: { $gt: 100 }`).
*   **Partial Indexes**: Use for status-based queries (e.g., index only `approved` posts) to reduce index size and write latency.
*   **TTL Indexes**: Automatically purge old event logs or temporary data.

## 2. Mongoose Query Optimization
*   **`.lean()`**: Mandatory for read-only operations. Reduces memory overhead by 3-5x by returning POJOs instead of Mongoose Documents.
*   **`.select()`**: Explicitly include/exclude fields (e.g., `.select('title media_url')`). Prevents over-fetching large `wishText` or metadata.
*   **Cursor-based Pagination**: Replace `skip/limit` with range queries on indexed fields (e.g., `_id` or `created_at`) to avoid performance degradation on deep pages.
*   **Connection Pooling**: Next.js 15 requires cached connection logic to prevent "Too many connections" errors in serverless environments.

## 3. Caching Patterns for Serverless
*   **Next.js 15 Cache Changes**: `fetch` is no longer cached by default. Use `cache: 'force-cache'` or `revalidate` option explicitly.
*   **In-Memory (Process-level)**: Use global variables for small, static data, but remember Vercel lambdas are short-lived.
*   **Shared Cache**: Use Vercel KV (Redis) or MongoDB itself with optimized queries for cross-request caching.
*   **Edge Caching**: Use `stale-while-revalidate` via `Cache-Control` headers for public assets/pages to serve from CDN.

## 4. Sentry + Next.js 15 App Router
*   **Instrumentation**: Utilize `instrumentation.ts` with the `onRequestError` hook to capture server-side errors in Next.js 15.
*   **Config Separation**: Use `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` for environment-specific init.
*   **Source Maps**: Automatically upload source maps via Vercel integration for readable stack traces.
*   **Performance Monitoring**: Enable "Distributed Tracing" to track requests from frontend to MongoDB.

## 5. Vercel & Deployment Optimization
*   **Edge Functions**: Use for lightweight logic (geo-routing, headers) but avoid for MongoDB heavy lifting due to lack of standard driver support (use Data API if needed).
*   **ISR (Incremental Static Regeneration)**: Opt-in for event pages that don't change frequently (`export const revalidate = 60`).
*   **Dependency Trimming**: Ensure `sharp` is optimized for Vercel production to keep lambda sizes small.
*   **Environment Hygiene**: Use Vercel's multi-environment variables (Development, Preview, Production) strictly.

---
### Actionable Recommendations
1.  **Audit**: Identify top 3 slow queries and apply ESR-compliant compound indexes.
2.  **Refactor**: Add `.lean()` to all `EventRepository` and `PostRepository` read methods.
3.  **Monitor**: Update Sentry SDK to v8.28.0+ for full Next.js 15 support.
4.  **Cache**: Implement ISR for the event landing pages to reduce MongoDB Atlas Read Unit consumption.

### Sources:
- [MongoDB Atlas Performance Best Practices](https://www.mongodb.com/docs/atlas/performance-best-practices/)
- [Mongoose Lean Documentation](https://mongoosejs.com/docs/tutorials/lean.html)
- [Next.js 15 Caching Updates](https://nextjs.org/docs/app/building-your-application/caching)
- [Sentry Next.js SDK Reference](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Deployment Strategies](https://vercel.com/docs/deployments/overview)

**Unresolved Questions:**
- None at this stage.
