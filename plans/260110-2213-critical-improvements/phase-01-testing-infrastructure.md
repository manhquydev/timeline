# Phase 01: Testing Infrastructure Setup

## Context Links
- Parent: [plan.md](./plan.md)
- Research: [researcher-01-testing-infrastructure.md](./research/researcher-01-testing-infrastructure.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-10 |
| Priority | P0 - Critical |
| Effort | 3h |
| Implementation Status | pending |
| Review Status | pending |

Setup testing infrastructure with Vitest + React Testing Library for unit/integration tests and Playwright for E2E tests.

## Key Insights

- React 19 requires `@testing-library/react` ^16.1.0+
- Async Server Components need Playwright, not Vitest
- `mongodb-memory-server` for isolated DB tests
- Mock `next/headers` and `@supabase/ssr` for auth tests

## Requirements

1. Install testing dependencies
2. Configure Vitest with jsdom environment
3. Configure Playwright for E2E
4. Create test setup files with mocks
5. Write initial critical path tests
6. Add npm scripts for test execution

## Architecture

```
/
├── vitest.config.mts          # Vitest configuration
├── playwright.config.ts       # Playwright configuration
├── tests/
│   ├── setup.ts               # Global test setup
│   ├── setup-db.ts            # MongoDB memory server setup
│   ├── mocks/
│   │   ├── supabase.ts        # Supabase client mocks
│   │   └── next-headers.ts    # next/headers mock
│   ├── integration/
│   │   └── api/               # API route tests
│   └── e2e/
│       └── auth.spec.ts       # E2E auth flow
├── lib/
│   └── **/*.test.ts           # Unit tests co-located
└── components/
    └── **/*.test.tsx          # Component tests co-located
```

## Related Code Files

- `package.json` - Add dependencies and scripts
- `tsconfig.json` - Ensure test files included
- `lib/mongodb/connection.ts` - Need to mock for tests
- `lib/supabase/server.ts` - Need to mock for tests

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths \
  @testing-library/react @testing-library/jest-dom jsdom \
  @playwright/test mongodb-memory-server
```

### Step 2: Create vitest.config.mts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', '.next', 'tests']
    }
  }
})
```

### Step 3: Create tests/setup.ts
```typescript
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn().mockReturnValue({ value: 'mock-session' }),
    set: vi.fn(),
    delete: vi.fn()
  }),
  headers: () => new Headers()
}))
```

### Step 4: Create tests/setup-db.ts
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server'
import { beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
```

### Step 5: Create tests/mocks/supabase.ts
```typescript
import { vi } from 'vitest'

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated'
}

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null })
  })
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createAdminClient: vi.fn().mockReturnValue(mockSupabaseClient)
}))
```

### Step 6: Create playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

### Step 7: Add npm scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Step 8: Write first unit test (lib/auth-utils.test.ts)
```typescript
import { describe, it, expect, vi } from 'vitest'
import { getUserRole, isAdmin } from './auth-utils'

describe('auth-utils', () => {
  it('returns user role from database', async () => {
    const role = await getUserRole('test-user-id')
    expect(role).toBe('admin')
  })

  it('isAdmin returns true for admin role', async () => {
    const result = await isAdmin('test-user-id')
    expect(result).toBe(true)
  })
})
```

### Step 9: Write first E2E test (tests/e2e/home.spec.ts)
```typescript
import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Timeline/)
  await expect(page.locator('main')).toBeVisible()
})

test('login page accessible', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('form')).toBeVisible()
})
```

## Todo List

- [ ] Install testing dependencies
- [ ] Create vitest.config.mts
- [ ] Create tests/setup.ts with global mocks
- [ ] Create tests/setup-db.ts for MongoDB
- [ ] Create tests/mocks/supabase.ts
- [ ] Create playwright.config.ts
- [ ] Add npm scripts to package.json
- [ ] Write lib/auth-utils.test.ts
- [ ] Write tests/e2e/home.spec.ts
- [ ] Run tests and verify passing
- [ ] Initialize Playwright browsers

## Success Criteria

- [ ] `npm test` runs Vitest successfully
- [ ] `npm run test:e2e` runs Playwright successfully
- [ ] At least 2 unit tests passing
- [ ] At least 2 E2E tests passing
- [ ] Coverage report generates

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| mongodb-memory-server Windows issues | Medium | High | Test in WSL2 or CI |
| React 19 RTL compatibility | Low | Medium | Use RTL ^16.1.0 |
| Async component testing | Medium | Low | Use Playwright for RSC |

## Security Considerations

- Test credentials must NOT be real credentials
- Mock Supabase service role key in tests
- E2E tests should use test database

## Next Steps

After completion:
1. Run code review
2. Proceed to Phase 02 (Redis Rate Limiting)
3. Add more tests incrementally per feature
