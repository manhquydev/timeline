import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e', '.claude'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          statements: 65,
          branches: 45,
          functions: 65,
          lines: 65,
        },
      },
      exclude: [
        'node_modules/',
        '.next/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'scripts/',
      ],
    },
    // Mock Next.js modules
    alias: {
      '@/': path.resolve(__dirname, './'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
