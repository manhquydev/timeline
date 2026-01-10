# Workflow Fixes Implementation Plan

**Created:** 2026-01-11 02:14
**Completed:** 2026-01-11 02:25
**Branch:** main
**Status:** ✅ COMPLETED

---

## Objective

Fix các issues được xác định trong workflow assessment theo priority order.

---

## Phase 1: P0 - Security Fixes (Immediate) ✅

### Task 1.1: Remove/Protect Debug Routes ✅
- [x] Move `/debug-role`, `/test-popup`, `/ux-test` to `(dev)` route group
- [x] Add admin-only protection layout for dev routes

### Task 1.2: Fix Rate Limit Identifier ✅
- [x] Update `middleware.ts` - replaced static `127.0.0.1` fallback
- [x] Add user-agent based fallback identifier

---

## Phase 2: P1 - Performance & DX Fixes ✅

### Task 2.1: Fix N+1 Query in Homepage ✅
- [x] Added `findPostsByEventIds()` aggregation method to PostRepository
- [x] Updated `app/page.tsx` to use batch query (single DB call)

### Task 2.2: Add Request ID Tracking ✅
- [x] Added `generateRequestId()` to middleware
- [x] Propagated request ID to response headers

### Task 2.3: Consolidate Validation Helpers ✅
- [x] Removed unused `parseBody`, `parseSearchParams`, `parseParams`, `parseFormData` from `lib/validations/index.ts`
- [x] Kept `lib/api-utils.ts` validation functions (more widely used)

---

## Phase 3: P2 - Maintainability Fixes

### Task 3.1: Split Loading Store - SKIPPED ⏭️
- Reason: Only 1 consumer (`upload-zone.tsx`), not worth splitting

### Task 3.2: Enhance Health Check - SKIPPED ⏭️
- Reason: Already comprehensive with MongoDB + Supabase checks

### Task 3.3: Add Database Retry Logic ✅
- [x] Added exponential backoff with jitter to `lib/mongodb/connection.ts`
- [x] Max 3 retries with configurable delays

---

## Phase 4: P3 - Cleanup ✅

### Task 4.1: Remove Deprecated Code ✅
- [x] Removed `rateLimitSync()` from `lib/security/rate-limit.ts`

### Task 4.2: Verify Analytics Tracker Usage ✅
- [x] Removed unused import from `app/layout.tsx`
- [x] Deleted `components/analytics-tracker.tsx`
- [x] Deleted `hooks/use-behavior-tracking.ts`

---

## Validation ✅

- [x] `npm run build` passes
- [x] All routes accessible
- [x] No TypeScript errors

---

## Summary of Changes

| File | Change |
|------|--------|
| `app/(dev)/layout.tsx` | NEW - Admin-only protection for dev routes |
| `app/(dev)/debug-role/` | MOVED from `app/debug-role/` |
| `app/(dev)/test-popup/` | MOVED from `app/test-popup/` |
| `app/(dev)/ux-test/` | MOVED from `app/ux-test/` |
| `middleware.ts` | Enhanced rate limit ID + request ID tracking |
| `lib/mongodb/repositories/PostRepository.ts` | Added `findPostsByEventIds()` |
| `app/page.tsx` | Use batch query instead of N+1 |
| `lib/validations/index.ts` | Removed unused parse functions |
| `lib/mongodb/connection.ts` | Added retry logic with backoff |
| `lib/security/rate-limit.ts` | Removed deprecated `rateLimitSync` |
| `app/layout.tsx` | Removed unused analytics import |
| `components/analytics-tracker.tsx` | DELETED |
| `hooks/use-behavior-tracking.ts` | DELETED |
