# Phase 1: Story Mode Store

## Context

Need global state to track when story view is active so MobileBottomNav can hide itself. Follow existing pattern from `lib/stores/loading-store.ts`.

## Overview

Create minimal Zustand store with `isStoryMode` boolean and setter action.

## Requirements

1. Store file at `lib/stores/story-mode-store.ts`
2. Export `useStoryModeStore` hook
3. State: `isStoryMode: boolean`
4. Actions: `setStoryMode(active: boolean)`

## Implementation Steps

### Step 1: Create Store File

```typescript
// lib/stores/story-mode-store.ts
import { create } from 'zustand'

interface StoryModeState {
  isStoryMode: boolean
  setStoryMode: (active: boolean) => void
}

export const useStoryModeStore = create<StoryModeState>((set) => ({
  isStoryMode: false,
  setStoryMode: (active) => set({ isStoryMode: active }),
}))
```

### Step 2: Add to Store Index (if exists)

If `lib/stores/index.ts` exists, add export:
```typescript
export { useStoryModeStore } from './story-mode-store'
```

## Success Criteria

- [ ] Store created at correct path
- [ ] Follows same pattern as loading-store.ts
- [ ] TypeScript types correct
- [ ] Can import and use in components

## Risk Assessment

**Low risk** - Simple Zustand store, well-established pattern in codebase.

## Effort

30 minutes

## Dependencies

- zustand (already installed)
