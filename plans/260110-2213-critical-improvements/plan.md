---
title: "Critical Infrastructure Improvements"
description: "Testing, Redis rate limiting, audit logging, blurhash fix, admin middleware"
status: pending
priority: P0
effort: 12h
branch: main
tags: [testing, security, performance, infrastructure]
created: 2026-01-10
---

# Critical Infrastructure Improvements Plan

## Overview

Implement critical improvements from comprehensive project evaluation to increase production readiness from 70% to 90%+.

## Research & Scout Reports

- [Testing Infrastructure Research](./research/researcher-01-testing-infrastructure.md)
- [Redis & Logging Research](./research/researcher-02-redis-logging.md)
- [Security & Middleware Scout](./scout/scout-01-security-middleware.md)
- [MongoDB & Types Scout](./scout/scout-02-mongodb-types.md)

## Implementation Phases

| Phase | Title | Priority | Effort | Status |
|-------|-------|----------|--------|--------|
| 01 | [Testing Infrastructure Setup](./phase-01-testing-infrastructure.md) | P0 | 3h | pending |
| 02 | [Redis Rate Limiting (Upstash)](./phase-02-redis-rate-limiting.md) | P0 | 2h | pending |
| 03 | [Persistent Audit Logging](./phase-03-audit-logging.md) | P0 | 2h | pending |
| 04 | [Blurhash Client Decoding](./phase-04-blurhash-fix.md) | P1 | 1h | pending |
| 05 | [Admin Auth Middleware](./phase-05-admin-middleware.md) | P1 | 2h | pending |
| 06 | [Structured Logging (Pino)](./phase-06-pino-logging.md) | P2 | 2h | pending |

## Dependencies

```
Phase 01 ──┐
Phase 02 ──┼── Can run in parallel (no dependencies)
Phase 03 ──┘
Phase 04 ────── Independent
Phase 05 ────── Independent
Phase 06 ────── Depends on Phase 03 (uses same logger for audit)
```

## Success Criteria

- [ ] Vitest + Playwright configured and running
- [ ] At least 5 critical path tests written (auth, upload, admin)
- [ ] Rate limiting works across multiple instances
- [ ] Admin actions persisted to MongoDB audit_logs collection
- [ ] Blurhash placeholders show actual blur effect
- [ ] Admin routes use centralized middleware
- [ ] Console statements replaced with Pino logger

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Upstash cold start latency | Use regional endpoint, implement fallback |
| MongoDB memory server on Windows | Test in CI environment (Linux) |
| Breaking changes in middleware refactor | Comprehensive E2E tests before refactor |

## Next Steps

1. Review and approve this plan
2. Execute phases in priority order (P0 first)
3. Run code review after each phase
