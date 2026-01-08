# Phase 3: Database Optimization

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 2 (API) - for consistent error handling
- **Docs:** [CLAUDE.md](../../CLAUDE.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-08 |
| Priority | P1 - High |
| Effort | 8h |
| Implementation Status | pending |
| Review Status | pending |

## Key Insights
- BaseRepository pattern exists but lacks optimization
- No `.lean()` usage - returning full Mongoose documents
- No field projection with `.select()`
- Offset-based pagination (not cursor-based)
- No query result caching
- Connection pool: 10 max, 2 min

## Requirements
1. Add `.lean()` to all read queries
2. Implement field projection
3. Add cursor-based pagination
4. Implement query caching layer
5. Optimize connection pooling
6. Add database health checks

## Architecture

### Enhanced BaseRepository
```typescript
class BaseRepository<T> {
  // Add lean versions of all read methods
  async findByIdLean(id: string, select?: string[]): Promise<T | null>
  async findLean(filter, options: QueryOptions): Promise<T[]>

  // Cursor pagination
  async findPaginated(filter, cursor?: string, limit = 20): Promise<{
    data: T[]
    nextCursor: string | null
    hasMore: boolean
  }>
}
```

### Caching Layer
```typescript
// lib/cache/index.ts
class QueryCache {
  private cache: Map<string, { data: any, expires: number }>

  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttl: number): void
  invalidate(pattern: string): void
}
```

### Query Options Interface
```typescript
interface QueryOptions {
  select?: string[]      // Field projection
  lean?: boolean         // Return plain objects
  cursor?: string        // Cursor for pagination
  limit?: number         // Page size
  sort?: Record<string, 1 | -1>
}
```

## Related Code Files
- `lib/mongodb/repositories/BaseRepository.ts`
- `lib/mongodb/repositories/PostRepository.ts`
- `lib/mongodb/repositories/EventRepository.ts`
- `lib/mongodb/connection.ts`
- `scripts/add-db-indexes.ts`

## Implementation Steps

### Step 1: Enhance BaseRepository (2h)
- [ ] Add `findByIdLean()` method
- [ ] Add `findLean()` with select support
- [ ] Add `findOneLean()` method
- [ ] Update existing methods to accept options
- [ ] Add TypeScript overloads for lean returns

### Step 2: Implement Cursor Pagination (2h)
- [ ] Add `findPaginated()` to BaseRepository
- [ ] Use `_id` as cursor (natural ordering)
- [ ] Return `nextCursor` and `hasMore`
- [ ] Update PostRepository.findByEvent()
- [ ] Update EventRepository.findPublic()

### Step 3: Create Caching Layer (1.5h)
- [ ] Create `lib/cache/query-cache.ts`
- [ ] Implement in-memory cache with TTL
- [ ] Add cache key generation helpers
- [ ] Integrate with repositories
- [ ] Add cache invalidation on writes

### Step 4: Optimize Queries (1.5h)
- [ ] Audit all repository methods
- [ ] Add appropriate indexes (compound indexes)
- [ ] Add field projections to heavy queries
- [ ] Update `scripts/add-db-indexes.ts`

### Step 5: Connection & Health (1h)
- [ ] Tune connection pool settings
- [ ] Create `/api/health` endpoint
- [ ] Add MongoDB connection check
- [ ] Add Supabase connection check
- [ ] Return status and latency

## Todo List
- [ ] Add lean methods to BaseRepository
- [ ] Implement cursor pagination
- [ ] Create query cache
- [ ] Audit and optimize queries
- [ ] Add compound indexes
- [ ] Create health endpoint

## Success Criteria
- [ ] All read queries use .lean()
- [ ] Cursor pagination on list endpoints
- [ ] Cache hit rate > 50% for repeated queries
- [ ] Query times < 100ms for common operations
- [ ] Health endpoint responds < 500ms

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cache staleness | Medium | Medium | Short TTL (60s), invalidate on write |
| Cursor breaks on data changes | Low | Low | Use stable _id ordering |
| Memory pressure from cache | Medium | Medium | Limit cache size, LRU eviction |

## Performance Benchmarks
Before optimization, measure:
- Average query time for post listing
- Memory usage per request
- Database connection count

After optimization, target:
- 50% reduction in query time
- 30% reduction in memory per request
- Stable connection count under load
