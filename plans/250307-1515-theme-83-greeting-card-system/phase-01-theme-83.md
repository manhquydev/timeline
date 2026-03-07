# Phase 1: Theme 8/3 — Color System & Predefined Theme

**Priority:** High  
**Status:** ⬜ Not Started  
**Depends on:** nothing (standalone config)

---

## Overview

Thêm `THEME_8_3` vào `predefined-themes.ts` và đảm bảo seed mechanism hoạt động.  
Theme này khi kích hoạt sẽ apply màu hồng-đỏ lãng mạn toàn bộ dự án qua CSS variables.

---

## Key Insights

- Theme system đã hoàn chỉnh: `predefined-themes.ts` → seed API → PATCH /api/admin/themes → `revalidateTag('theme', 'max')` → ThemeProvider apply CSS vars
- `FallingPetals` đã được trigger bởi `theme.effects.enableParticles` — ta sẽ tắt cái này và dùng hệ thống thiệp mới thay thế
- Cần thêm field `cardEffectType: 'falling-cards-8-3' | 'falling-petals' | null` vào `ThemeEffects` để ThemeProvider biết trigger component nào

---

## Requirements

### Colors — Palette 8/3 (Đỏ hồng + Vàng ấm + Trắng tinh)
```
primary:    hsl(350 85% 58%)   — Đỏ hồng rực (đặc trưng 8/3)
secondary:  hsl(0 70% 92%)     — Hồng nhạt nền
accent:     hsl(45 95% 55%)    — Vàng ấm (vàng hoa mimosa, hoa 8/3)
background: hsl(0 40% 98%)     — Trắng hồng nhẹ
border:     hsl(350 40% 88%)   — Viền hồng nhẹ
```

### Gradients
```
hero:    Đỏ hồng → Hồng cánh sen → Tím nhẹ (lãng mạn)
card:    Hồng nhạt → Trắng (glassmorphism)
button:  Đỏ hồng → Hồng ấm
accent:  Vàng → Cam ấm (mimosa)
```

### Effects
```
enableParticles: false        — Tắt petal CSS, dùng Three.js thay
cardEffectType: 'falling-cards-8-3'   — NEW field, trigger FallingCards component
particleColor: '#FF4D79'
enableGradientAnimation: true
enableGlassEffect: true
```

---

## Files to Modify

| File | Action |
|------|--------|
| `lib/mongodb/models/Theme.ts` | Thêm `cardEffectType?: string` vào `ThemeEffects` |
| `lib/themes/predefined-themes.ts` | Thêm `THEME_8_3` + export vào `PREDEFINED_THEMES` |
| `app/layout.tsx` | Import `FallingCards` lazily, render khi `theme.effects.cardEffectType === 'falling-cards-8-3'` |

---

## Implementation Steps

### Step 1: Extend ThemeEffects model
```typescript
// lib/mongodb/models/Theme.ts
export interface ThemeEffects {
  enableParticles: boolean
  particleColor: string
  enableGradientAnimation: boolean
  enableGlassEffect: boolean
  cardEffectType?: 'falling-cards-8-3' | 'falling-petals' | null  // NEW
}
```

### Step 2: Add THEME_8_3 constant
```typescript
// lib/themes/predefined-themes.ts
export const THEME_8_3: Omit<ITheme, 'id'|'createdAt'|'updatedAt'|'createdBy'|'isActive'> = {
  name: '8-3',
  displayName: '🌹 Ngày Quốc Tế Phụ Nữ 8/3 🌹',
  description: 'Theme chào mừng Ngày Quốc Tế Phụ Nữ với hiệu ứng thiệp chúc mừng rơi',
  colors: { ... },
  gradients: { ... },
  typography: {
    fontSans: '"Be Vietnam Pro", "Inter", sans-serif',
    fontHeader: '"Be Vietnam Pro", "Inter", sans-serif',
    baseSize: '16px',
    borderRadius: '0.75rem',
  },
  effects: {
    enableParticles: false,
    cardEffectType: 'falling-cards-8-3',
    particleColor: '#FF4D79',
    enableGradientAnimation: true,
    enableGlassEffect: true,
  },
}

export const PREDEFINED_THEMES = [THEME_DEFAULT, THEME_20_10, THEME_8_3]  // add 8-3
```

### Step 3: Conditionally render in layout
```tsx
// app/layout.tsx
const FallingCards = dynamic(
  () => import('@/components/theme/falling-cards').then(m => ({ default: m.FallingCards })),
  { ssr: false }
)

// Inside layout, alongside <FallingPetals>:
<FallingPetals />
{activeTheme?.effects?.cardEffectType === 'falling-cards-8-3' && <FallingCards />}
```

---

## Success Criteria
- [ ] Theme 8/3 xuất hiện trong `/admin/themes` sau seed
- [ ] Kích hoạt → toàn bộ màu dự án chuyển sang palette 8/3
- [ ] `cardEffectType` field lưu được vào MongoDB

---

## Risk
- Schema change `ThemeEffects` cần backward-compatible (field optional) ✓
