import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PREDEFINED_THEMES } from '@/lib/themes/predefined-themes'

// Helpers to make Mongoose query mocks that are both awaitable AND chainable
function makeQuery(value: any) {
  // Thenables so `await model.findOne(...)` works directly
  // AND `.lean()` works for findOneLean
  const p = Promise.resolve(value)
  return Object.assign(Object.create(p), p, {
    lean: vi.fn().mockResolvedValue(value),
    select: vi.fn().mockReturnThis(),
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  })
}

// Mock the Theme model used by BaseRepository
vi.mock('@/lib/mongodb/models/Theme', () => {
  const mockModel = {
    findOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    updateMany: vi.fn(),
    findOneAndUpdate: vi.fn(),  // used by BaseRepository.update()
    deleteOne: vi.fn(),          // used by BaseRepository.delete()
    create: vi.fn(),
    prototype: {},
  }
  return { default: mockModel }
})

vi.mock('@/lib/mongodb/connection', () => ({
  connectToDatabase: vi.fn(),
}))

import Theme from '@/lib/mongodb/models/Theme'
import { ThemeRepository } from '@/lib/mongodb/repositories/ThemeRepository'

const mockTheme = vi.mocked(Theme)

function makeThemeDoc(overrides = {}) {
  return {
    id: 'theme-1',
    name: 'default',
    displayName: 'Default',
    isActive: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

describe('ThemeRepository.findActive', () => {
  let repo: ThemeRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new ThemeRepository()
  })

  it('queries with isActive: true', async () => {
    mockTheme.findOne.mockReturnValue(makeQuery(makeThemeDoc({ isActive: true })))

    await repo.findActive()

    const callArg = mockTheme.findOne.mock.calls[0][0]
    expect(callArg).toMatchObject({ isActive: true })
  })

  it('returns null when no active theme exists', async () => {
    mockTheme.findOne.mockReturnValue(makeQuery(null))

    const result = await repo.findActive()

    expect(result).toBeNull()
  })
})

describe('ThemeRepository.setActive', () => {
  let repo: ThemeRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new ThemeRepository()
  })

  it('deactivates all themes before activating the target', async () => {
    const updatedTheme = makeThemeDoc({ id: 'theme-2', isActive: true })
    mockTheme.updateMany.mockResolvedValue({ modifiedCount: 3 } as any)
    mockTheme.findOneAndUpdate.mockResolvedValue(updatedTheme as any)

    await repo.setActive('theme-2')

    // updateMany({}, { isActive: false }) must be called
    expect(mockTheme.updateMany).toHaveBeenCalledWith({}, { isActive: false })
    // update (findOneAndUpdate) must also be called
    expect(mockTheme.findOneAndUpdate).toHaveBeenCalled()
  })

  it('calls update with isActive: true on the target id', async () => {
    const targetId = 'theme-abc'
    mockTheme.updateMany.mockResolvedValue({ modifiedCount: 0 } as any)
    mockTheme.findOneAndUpdate.mockResolvedValue(
      makeThemeDoc({ id: targetId, isActive: true }) as any
    )

    await repo.setActive(targetId)

    expect(mockTheme.findOneAndUpdate).toHaveBeenCalledWith(
      { id: targetId },
      expect.objectContaining({ $set: expect.objectContaining({ isActive: true }) }),
      expect.anything()
    )
  })
})

describe('ThemeRepository.delete', () => {
  let repo: ThemeRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new ThemeRepository()
  })

  it('throws when attempting to delete the active theme', async () => {
    // findById uses model.findOne({ id }) — awaited directly (no .lean())
    mockTheme.findOne.mockReturnValue(makeQuery(makeThemeDoc({ isActive: true })))

    await expect(repo.delete('theme-1')).rejects.toThrow(
      'Cannot delete active theme'
    )
    expect(mockTheme.deleteOne).not.toHaveBeenCalled()
  })

  it('returns false when theme does not exist', async () => {
    mockTheme.findOne.mockReturnValue(makeQuery(null))

    const result = await repo.delete('nonexistent-id')

    expect(result).toBe(false)
    expect(mockTheme.deleteOne).not.toHaveBeenCalled()
  })

  it('deletes an inactive theme successfully', async () => {
    mockTheme.findOne.mockReturnValue(makeQuery(makeThemeDoc({ isActive: false })))
    mockTheme.deleteOne.mockResolvedValue({ deletedCount: 1 } as any)

    const result = await repo.delete('theme-1')

    expect(result).toBe(true)
    expect(mockTheme.deleteOne).toHaveBeenCalledWith({ id: 'theme-1' })
  })
})

describe('PREDEFINED_THEMES catalog', () => {
  it('contains exactly 3 predefined themes', () => {
    expect(PREDEFINED_THEMES).toHaveLength(3)
  })

  it('includes default, 20-10, and 8-3 themes', () => {
    const names = PREDEFINED_THEMES.map(t => t.name)
    expect(names).toContain('default')
    expect(names).toContain('20-10')
    expect(names).toContain('8-3')
  })

  it('each theme has required fields', () => {
    for (const theme of PREDEFINED_THEMES) {
      expect(theme.name).toBeTruthy()
      expect(theme.displayName).toBeTruthy()
      expect(theme.colors).toBeDefined()
      expect(theme.gradients).toBeDefined()
      expect(theme.effects).toBeDefined()
    }
  })
})
