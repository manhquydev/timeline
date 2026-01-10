# Research: Testing Infrastructure (Next.js 16 + React 19)

## 1. Core Testing Stack
- **Unit/Integration**: Vitest + React Testing Library (RTL)
- **E2E**: Playwright
- **Database**: `mongodb-memory-server` (Integration), `vi.mock` (Unit)
- **Mocks**: `vi.mock` for Supabase & Next.js Headers

## 2. Package Versions & Requirements
| Package | Version | Notes |
|---------|---------|-------|
| `vitest` | ^3.0.0 | Vite-based runner, Jest compatible |
| `@testing-library/react` | ^16.1.0 | Required for React 19 support |
| `jsdom` | ^26.0.0 | Browser environment simulation |
| `@playwright/test` | ^1.49.0 | E2E runner |
| `mongodb-memory-server` | ^10.1.0 | Isolated MongoDB for integration |

## 3. Configuration Snippets

### Vitest Config (`vitest.config.mts`)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts',
    coverage: { reporter: ['text', 'json', 'html'] },
  },
})
```

### Playwright Config (`playwright.config.ts`)
```typescript
import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:3000' },
});
```

## 4. React 19 Compatibility & Concerns
- **`react-dom/test-utils` Deprecation**: Removed in React 19. RTL ^16+ handles this internally via `act` from `react` directly.
- **Async Server Components**: Vitest cannot easily execute async RSCs.
  - **Strategy**: Unit test logic in `lib/` or `repositories/`. Use Playwright for components using `await` in the body.
- **Ref API**: React 19 changes how refs are handled (passed as props). RTL correctly handles this if using latest versions.

## 5. Mocking Strategies

### Supabase & Auth
Mock `next/headers` and `@supabase/ssr` to simulate authenticated states:
```typescript
vi.mock('next/headers', () => ({
  cookies: () => ({ get: vi.fn().mockReturnValue({ value: 'mock-session' }) })
}));
```

### MongoDB (Mongoose)
1. **Unit**: Mock models using `vi.mock`.
2. **Integration**: Use `mongodb-memory-server`.
```typescript
// test/setup-db.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
let mongod: MongoMemoryServer;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
});
afterAll(async () => await mongod.stop());
```

## 6. Test Organization
- **Unit**: `{name}.test.ts(x)` next to source file.
- **Integration**: `tests/integration/` (e.g., API routes).
- **E2E**: `tests/e2e/` for Playwright specs.

## Sources
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)
- [Vitest Configuration](https://vitest.dev/config/)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-test-utils)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## Unresolved Questions
- Should we use `happy-dom` instead of `jsdom` for faster execution (at the cost of some browser fidelity)?
- Do we need specialized visual regression testing (e.g., Playwright screenshots)?
