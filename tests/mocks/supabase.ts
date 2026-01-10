import { vi } from 'vitest'

/**
 * Mock Supabase client for testing
 */
export const mockSupabaseUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

export const mockSupabaseSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockSupabaseUser,
}

export const createMockSupabaseClient = (overrides?: {
  user?: typeof mockSupabaseUser | null
  session?: typeof mockSupabaseSession | null
}) => {
  const user = overrides?.user !== undefined ? overrides.user : mockSupabaseUser
  const session = overrides?.session !== undefined ? overrides.session : mockSupabaseSession

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    storage: {
      from: vi.fn((bucket: string) => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock-url.com/image.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
  }
}

// Mock createClient for server-side
export const mockCreateClient = vi.fn(() => createMockSupabaseClient())

// Mock createAdminClient for admin operations
export const mockCreateAdminClient = vi.fn(() => ({
  ...createMockSupabaseClient(),
  auth: {
    ...createMockSupabaseClient().auth,
    admin: {
      listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
      deleteUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getUserById: vi.fn().mockResolvedValue({ data: { user: mockSupabaseUser }, error: null }),
    },
  },
}))
