import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  authLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { createClient } from '@/lib/supabase/server'
import {
  getUserRole,
  isAdmin,
  isModerator,
  isSuperAdmin,
  isCurrentUserAdmin,
  getCurrentUserRole,
  hasRole,
  hasAnyRole,
} from '@/lib/auth-utils'

const makeSupabaseClient = (roleData: any, authUser: any = { id: 'uid-1' }) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(roleData),
  }),
})

describe('getUserRole()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the role from database', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'admin' }, error: null }) as any
    )
    expect(await getUserRole('uid-1')).toBe('admin')
  })

  it('returns "user" as default when no role row exists', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: null, error: { message: 'No rows' } }) as any
    )
    expect(await getUserRole('uid-1')).toBe('user')
  })

  it('returns "user" on database error (safe default)', async () => {
    vi.mocked(createClient).mockRejectedValue(new Error('DB failure'))
    expect(await getUserRole('uid-1')).toBe('user')
  })

  // BUG: getUserRole never returns 'guest' — unauthenticated users get 'user' by mistake
  // if called without verifying auth first. The caller must guard against this separately.
  it('returns "user" (not "guest") when userId is empty string — caller must guard', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: null, error: null }) as any
    )
    expect(await getUserRole('')).toBe('user')
  })
})

describe('isAdmin()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns true for admin role', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'admin' }, error: null }) as any
    )
    expect(await isAdmin('uid-1')).toBe(true)
  })

  it('returns true for super_admin role', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'super_admin' }, error: null }) as any
    )
    expect(await isAdmin('uid-1')).toBe(true)
  })

  it('returns false for moderator role', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'moderator' }, error: null }) as any
    )
    expect(await isAdmin('uid-1')).toBe(false)
  })

  it('returns false for regular user', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'user' }, error: null }) as any
    )
    expect(await isAdmin('uid-1')).toBe(false)
  })
})

describe('isModerator()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns true for moderator', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'moderator' }, error: null }) as any
    )
    expect(await isModerator('uid-1')).toBe(true)
  })

  it('returns true for admin (higher privilege)', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'admin' }, error: null }) as any
    )
    expect(await isModerator('uid-1')).toBe(true)
  })

  it('returns true for super_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'super_admin' }, error: null }) as any
    )
    expect(await isModerator('uid-1')).toBe(true)
  })

  it('returns false for regular user', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'user' }, error: null }) as any
    )
    expect(await isModerator('uid-1')).toBe(false)
  })
})

describe('isSuperAdmin()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns true only for super_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'super_admin' }, error: null }) as any
    )
    expect(await isSuperAdmin('uid-1')).toBe(true)
  })

  it('returns false for admin', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'admin' }, error: null }) as any
    )
    expect(await isSuperAdmin('uid-1')).toBe(false)
  })
})

describe('isCurrentUserAdmin()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns false when no authenticated user', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'admin' }, error: null }, null) as any
    )
    expect(await isCurrentUserAdmin()).toBe(false)
  })

  it('returns true when authenticated user is admin', async () => {
    const roleClient = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'uid-1' } }, error: null }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      }),
    }
    vi.mocked(createClient).mockResolvedValue(roleClient as any)
    expect(await isCurrentUserAdmin()).toBe(true)
  })

  it('returns false on exception (secure default)', async () => {
    vi.mocked(createClient).mockRejectedValue(new Error('network error'))
    expect(await isCurrentUserAdmin()).toBe(false)
  })
})

describe('getCurrentUserRole()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null for unauthenticated user', async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
      from: vi.fn(),
    }
    vi.mocked(createClient).mockResolvedValue(client as any)
    expect(await getCurrentUserRole()).toBeNull()
  })

  it('returns role for authenticated user', async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'uid-2' } }, error: null }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'moderator' }, error: null }),
      }),
    }
    vi.mocked(createClient).mockResolvedValue(client as any)
    expect(await getCurrentUserRole()).toBe('moderator')
  })
})

describe('hasRole() / hasAnyRole()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hasRole returns true for exact match', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'moderator' }, error: null }) as any
    )
    expect(await hasRole('uid-1', 'moderator')).toBe(true)
  })

  it('hasRole returns false for non-match', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'user' }, error: null }) as any
    )
    expect(await hasRole('uid-1', 'admin')).toBe(false)
  })

  it('hasAnyRole returns true when role is in list', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'moderator' }, error: null }) as any
    )
    expect(await hasAnyRole('uid-1', ['moderator', 'admin'])).toBe(true)
  })

  it('hasAnyRole returns false when role is not in list', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ data: { role: 'user' }, error: null }) as any
    )
    expect(await hasAnyRole('uid-1', ['moderator', 'admin'])).toBe(false)
  })
})
