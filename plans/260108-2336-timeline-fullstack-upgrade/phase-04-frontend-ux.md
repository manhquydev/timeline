# Phase 4: Frontend UX Enhancement

## Context
- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 2 (API) - for consistent error handling
- **Docs:** [docs/PERFORMANCE_OPTIMIZATION_V2.md](../../docs/PERFORMANCE_OPTIMIZATION_V2.md)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-01-08 |
| Priority | P2 - Medium |
| Effort | 8h |
| Implementation Status | ✅ completed |
| Review Status | ✅ completed |

## Key Insights
- Loading skeletons exist but underutilized
- Error boundary exists but no global strategy
- Framer Motion available for animations
- No optimistic updates pattern
- Virtual scrolling implemented for photo grid
- Accessibility needs audit

## Requirements
1. Implement optimistic updates for mutations
2. Add micro-interactions and transitions
3. Create global error handling strategy
4. Improve loading state coverage
5. Enhance accessibility (ARIA, focus management)
6. Add haptic feedback for mobile

## Architecture

### Optimistic Updates Pattern
```typescript
// lib/hooks/use-optimistic-mutation.ts
function useOptimisticMutation<T>({
  mutationFn,
  onOptimisticUpdate,
  onError,
  onSuccess,
}) {
  // Update UI immediately
  // Rollback on error
  // Sync with server response
}
```

### Animation System
```typescript
// lib/animations/index.ts
export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  smooth: { duration: 0.2, ease: 'easeInOut' },
}

export const variants = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  slideUp: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  scale: { initial: { scale: 0.9 }, animate: { scale: 1 } },
}
```

### Global Error Handler
```typescript
// components/providers/error-provider.tsx
- Catch unhandled errors
- Show toast notifications
- Log to Sentry (Phase 5)
- Provide recovery actions
```

## Related Code Files
- `components/ui/error-boundary.tsx`
- `components/ui/loading-skeleton.tsx`
- `components/social/heart-button.tsx` - Add optimistic
- `components/social/comment-section.tsx` - Add optimistic
- `lib/stores/loading-store.ts`

## Implementation Steps

### Step 1: Create Animation System (1.5h)
- [ ] Create `lib/animations/index.ts`
- [ ] Define reusable motion variants
- [ ] Create spring and smooth transitions
- [ ] Add stagger children utilities
- [ ] Create `AnimatedList` component

### Step 2: Implement Optimistic Updates (2h)
- [ ] Create `useOptimisticMutation` hook
- [ ] Apply to like/unlike actions
- [ ] Apply to comment creation
- [ ] Apply to post deletion
- [ ] Add rollback on error

### Step 3: Add Micro-interactions (1.5h)
- [ ] Button press feedback (scale)
- [ ] Card hover effects
- [ ] Navigation transitions
- [ ] Success/error state animations
- [ ] Pull-to-refresh animation

### Step 4: Global Error Handling (1.5h)
- [ ] Create `ErrorProvider` context
- [ ] Integrate with toast system
- [ ] Add error categorization
- [ ] Create recovery action patterns
- [ ] Add "Report Issue" option

### Step 5: Accessibility Improvements (1.5h)
- [ ] Audit with axe-core
- [ ] Add missing ARIA labels
- [ ] Implement focus trap for modals
- [ ] Add skip navigation link
- [ ] Ensure 4.5:1 contrast ratio
- [ ] Test with screen reader

## Todo List
- [ ] Create animation system
- [ ] Build optimistic mutation hook
- [ ] Add micro-interactions
- [ ] Implement global error handler
- [ ] Accessibility audit and fixes
- [ ] Test on mobile devices

## Success Criteria
- [ ] Likes/comments update instantly (< 50ms perceived)
- [ ] All interactive elements have animations
- [ ] Errors show recovery options
- [ ] Lighthouse accessibility > 90
- [ ] No WCAG 2.1 AA violations

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation jank on low-end devices | Medium | Medium | Use will-change, reduce complexity |
| Optimistic updates cause confusion | Low | Medium | Show sync indicator |
| Accessibility breaks existing styles | Low | Low | Use ARIA, minimal visual changes |

## Accessibility Checklist
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not only indicator
- [ ] Keyboard navigation works
- [ ] Focus visible on all elements
- [ ] Screen reader announces changes
