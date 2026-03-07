# Phase 6: Integration, Polish & Testing

**Priority:** Medium  
**Status:** ⬜ Not Started  
**Depends on:** All previous phases complete

---

## Overview

Kết nối tất cả components lại, polish UX, viết tests, deploy.

---

## Integration Points

### `app/layout.tsx` — Add new components

```tsx
// Existing imports
import { FallingPetals } from '@/components/theme/falling-petals'

// NEW imports
import dynamic from 'next/dynamic'
const FallingCards = dynamic(
  () => import('@/components/theme/falling-cards').then(m => m.FallingCards),
  { ssr: false }
)
const CardOpenModal = dynamic(
  () => import('@/components/theme/card-open-modal').then(m => m.CardOpenModal),
  { ssr: false }
)
const GreetingWriteForm = dynamic(
  () => import('@/components/theme/greeting-write-form').then(m => m.GreetingWriteForm),
  { ssr: false }
)

// Usage context: ThemeAwareEffects component
```

### `components/theme/theme-aware-effects.tsx` — NEW unified effects manager

```tsx
'use client'
export function ThemeAwareEffects() {
  const { theme } = useTheme()
  const [openCard, setOpenCard] = useState<{ templateId: number } | null>(null)

  if (!theme || theme.name === 'default') return null
  
  return (
    <>
      {/* 20/10 theme → CSS petals */}
      {theme.effects.enableParticles && theme.effects.cardEffectType !== 'falling-cards-8-3' && (
        <FallingPetals />
      )}
      
      {/* 8/3 theme → Three.js cards */}
      {theme.effects.cardEffectType === 'falling-cards-8-3' && (
        <>
          <FallingCards onCardClick={(tid) => setOpenCard({ templateId: tid })} />
          <CardOpenModal
            isOpen={!!openCard}
            templateId={openCard?.templateId ?? null}
            onClose={() => setOpenCard(null)}
          />
          <GreetingWriteForm />
        </>
      )}
    </>
  )
}
```

### `app/layout.tsx` changes
- Replace `<FallingPetals />` with `<ThemeAwareEffects />`
- Add navigation link to admin greetings

---

## Seed Update

### `app/api/admin/themes/seed/route.ts` — Add THEME_8_3

```typescript
import { PREDEFINED_THEMES } from '@/lib/themes/predefined-themes'
// PREDEFINED_THEMES already includes THEME_8_3 after Phase 1 changes
```

### Default greetings seed (optional)

```typescript
// scripts/seed-greetings-8-3.ts
const DEFAULT_GREETINGS = [
  { message: 'Chúc bạn luôn tươi trẻ, xinh đẹp và hạnh phúc! 🌹', authorName: 'Team Timeline' },
  { message: 'Cảm ơn bạn đã làm cho thế giới này tươi đẹp hơn! 💕', authorName: 'Mọi người' },
  { message: 'Phụ nữ mạnh mẽ, tự tin và tỏa sáng 🌟', authorName: 'Timeline App' },
  // ... 10 defaults
]
```

---

## Polish Items

### Performance
- [ ] `FallingCards` lazy loaded (dynamic import, ssr:false)
- [ ] Three.js bundle size check (< 150kb gzipped with tree-shaking)
- [ ] Canvas textures cached (create once, reuse)
- [ ] `CardOpenModal` lazy loaded
- [ ] Greeting fetch với `stale-while-revalidate` pattern

### Accessibility
- [ ] FallingCards canvas has `aria-hidden="true"` (decorative)
- [ ] CardOpenModal has proper `role="dialog"`, `aria-modal="true"`, focus trap
- [ ] Close button has `aria-label="Đóng thiệp"`
- [ ] Greeting form has proper labels

### Mobile UX
- [ ] Touch tap → open card (không cần click)
- [ ] Modal 90vw on mobile
- [ ] Greeting form bottom sheet on mobile
- [ ] Reduce cards to 12 on mobile (already in Phase 2)

### `prefers-reduced-motion`
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReducedMotion) {
  // FallingCards: stop all animations, show static cards
  // CardOpenModal: no animation, instant show
}
```

---

## Admin Navigation Update

### `app/admin/layout.tsx` or nav component
- Add "Lời chúc 8/3" link pointing to `/admin/greetings`

---

## Tests

### Unit Tests: `tests/theme-8-3.test.ts`

```typescript
describe('Theme 8/3', () => {
  it('THEME_8_3 has cardEffectType = falling-cards-8-3')
  it('PREDEFINED_THEMES includes THEME_8_3')
})

describe('Greeting Repository', () => {
  it('findRandom returns approved greeting')
  it('findRandom returns null when no approved greetings')
  it('create sets isApproved = false by default')
})

describe('Greeting API', () => {
  it('POST /api/greetings creates greeting')
  it('POST /api/greetings rejects empty message')
  it('POST /api/greetings rejects message > 280 chars')
  it('GET /api/greetings/random returns fallback when empty')
})
```

### E2E: `tests/e2e/theme-8-3.e2e.ts`

```typescript
describe('8/3 Theme E2E', () => {
  it('activating 8-3 theme applies correct CSS vars')
  it('FallingCards renders on 8-3 theme')
  it('clicking falling card opens modal')
  it('modal shows greeting or fallback')
  it('greeting form submits successfully')
})
```

---

## Deployment Checklist

- [ ] `npm install three @types/three` committed
- [ ] `ThemeEffects` interface updated in `Theme.ts`
- [ ] `THEME_8_3` added to `predefined-themes.ts` + `PREDEFINED_THEMES` array
- [ ] All new API routes created
- [ ] Admin page for greetings created
- [ ] All unit tests pass
- [ ] Build `npm run build` passes with no errors
- [ ] `npm run lint` passes
- [ ] Seed THEME_8_3 via /admin/themes UI
- [ ] Test on mobile viewport
- [ ] Commit with message: `feat: add 8/3 Women's Day theme with falling cards and greeting system`

---

## Files Summary — All Phases

| File | Action |
|------|--------|
| `lib/mongodb/models/Theme.ts` | MODIFY — add cardEffectType |
| `lib/themes/predefined-themes.ts` | MODIFY — add THEME_8_3 |
| `lib/mongodb/models/Greeting.ts` | CREATE |
| `lib/mongodb/repositories/greeting-repository.ts` | CREATE |
| `lib/mongodb/repositories/index.ts` | MODIFY — export greetingRepository |
| `lib/themes/card-templates-8-3.ts` | CREATE |
| `lib/themes/card-canvas-utils.ts` | CREATE |
| `components/theme/falling-cards.tsx` | CREATE |
| `components/theme/card-open-modal.tsx` | CREATE |
| `components/theme/greeting-write-form.tsx` | CREATE |
| `components/theme/theme-aware-effects.tsx` | CREATE |
| `app/api/greetings/route.ts` | CREATE |
| `app/api/greetings/random/route.ts` | CREATE |
| `app/api/admin/greetings/route.ts` | CREATE |
| `app/admin/greetings/page.tsx` | CREATE |
| `components/admin/greeting-management-list.tsx` | CREATE |
| `app/layout.tsx` | MODIFY — use ThemeAwareEffects |
| `tests/theme-8-3.test.ts` | CREATE |

---

## Success Criteria (Final)
- [ ] Theme 8/3 activate → toàn bộ project đổi màu đỏ hồng + vàng mimosa
- [ ] Thiệp 3D rơi trên nền trang (3 template ngẫu nhiên)
- [ ] Click thiệp → mở phong bì → thiệp slide ra → lời chúc hiển thị
- [ ] User có thể gửi lời chúc → admin duyệt
- [ ] Lời chúc được duyệt xuất hiện ngẫu nhiên khi mở thiệp
- [ ] Không ảnh hưởng performance trên mobile
- [ ] All tests pass
