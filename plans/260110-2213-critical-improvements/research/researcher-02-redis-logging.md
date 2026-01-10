# Researcher Report: Redis Rate Limiting & Structured Logging

## 1. Upstash Redis for Serverless Rate Limiting
Upstash is the preferred choice for serverless/edge environments due to its **REST API** (bypassing TCP connection limits) and **Scale-to-Zero** billing.

### Setup & SDK
- **Packages**: `npm install @upstash/ratelimit @upstash/redis`
- **Configuration**: Use `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### Pricing (2026 Estimates)
- **Free Tier**: 10,000 requests/day.
- **Pay-As-You-Go**: ~$0.40 per 100,000 requests (ideal for bursty traffic).
- **Fixed Plan**: ~$60/month for consistent high load (up to 1M requests/day).

## 2. Rate Limiting Patterns in Next.js 16 (`proxy.ts`)
Next.js 16 replaces `middleware.ts` with `proxy.ts` for network boundary clarity.

### Implementation Pattern (Sliding Window)
```typescript
// proxy.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

export async function proxy(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Reset": reset.toString() }
    });
  }
}
```

## 3. Pino Logging for Next.js
Pino provides structured JSON logging, essential for production observability.

### Configuration (`lib/logger.ts`)
```typescript
import pino from 'pino';

const transport = process.env.NODE_ENV === 'development'
  ? { target: 'pino-pretty', options: { colorize: true } }
  : undefined;

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { env: process.env.NODE_ENV, service: 'timeline-api' },
  transport,
});
```

### Next.js Integration
Enable in `next.config.ts`:
```typescript
const nextConfig = {
  experimental: { instrumentationHook: true }
};
```
Initialize in `instrumentation.ts` to capture server-side boot events.

## 4. Audit Logging Best Practices (MongoDB)
Audit logs must be immutable and provide a clear trail of sensitive actions.

### MongoDB Schema Design
```typescript
const AuditLogSchema = new Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  actor: {
    userId: { type: String, index: true },
    role: String,
    ip: String
  },
  action: { type: String, required: true }, // e.g., "DELETE_POST"
  resource: {
    type: String, // e.g., "Post"
    id: String
  },
  changes: {
    before: Object,
    after: Object
  },
  status: { type: String, enum: ['success', 'failure'] },
  metadata: Object
});
```

## 5. Comparison: Redis Providers

| Feature | Upstash | Redis Cloud | Self-Hosted (EC2/Docker) |
| :--- | :--- | :--- | :--- |
| **Billing** | Pay-per-request | Instance-based | Infrastructure cost |
| **Serverless Ready** | Yes (HTTP/REST) | Partial (TCP only) | No (TCP Management) |
| **Connection Limit** | Unlimited (REST) | Limited by tier | Limited by memory/CPU |
| **Maintenance** | Zero | Low | High |

## Unresolved Questions
1. Should we implement **request-id** propagation across `proxy.ts` and API routes for trace correlation?
2. Is there a requirement for log rotation or off-site cold storage for audit logs beyond 90 days?

---
**Sources:**
- [Upstash Redis Pricing](https://upstash.com/pricing)
- [Pino Next.js Guide](https://github.com/pinojs/pino)
- [MongoDB Audit Log Patterns](https://www.mongodb.com/blog/post/audit-logging-best-practices)
- [Next.js 16 Proxy Documentation](https://nextjs.org/docs)
