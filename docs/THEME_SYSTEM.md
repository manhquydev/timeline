# Theme System Documentation

## Overview

Timeline Teky Hoàng Mai có hệ thống theme động cho phép admin thay đổi giao diện toàn bộ website để phù hợp với các sự kiện đặc biệt (20/10, Tết, Giáng Sinh, v.v.).

### Kiến Trúc Theme System

```
┌─────────────────────────────────────────────────────────┐
│                    MongoDB (themes)                      │
│  - Theme data (colors, gradients, effects)              │
│  - isActive flag (only 1 theme active at a time)        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              ThemeProvider (Client Component)            │
│  - Load active theme from API                           │
│  - Apply CSS variables to DOM                           │
│  - Listen for theme-changed events                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────┬─────────────────────┬───────────────┐
│   ThemeBanner     │   FallingPetals     │  CSS Variables│
│  (Notification)   │  (Visual Effects)   │  (Styling)    │
└───────────────────┴─────────────────────┴───────────────┘
```

---

## Core Components

### 1. Theme Model (`lib/mongodb/models/Theme.ts`)

Định nghĩa cấu trúc dữ liệu theme:

```typescript
interface ITheme {
  id: string
  name: string                    // unique identifier (e.g., "20-10", "default")
  displayName: string             // Display name (e.g., "🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸")
  description: string             // Theme description
  colors: ThemeColors             // Color palette (HSL format)
  gradients: ThemeGradients       // Gradient definitions
  effects: ThemeEffects           // Visual effects config
  coverImage?: string             // Optional cover image URL
  icon?: string                   // Optional icon URL
  isActive: boolean               // Only 1 theme can be active
  createdAt: Date
  updatedAt: Date
  createdBy: string              // User ID who created theme
}
```

#### Theme Colors (HSL Format)
```typescript
interface ThemeColors {
  primary: string           // Main brand color
  secondary: string         // Secondary color
  accent: string            // Accent/highlight color
  background: string        // Page background
  foreground: string        // Text color
  muted: string            // Muted backgrounds
  mutedForeground: string  // Muted text
  border: string           // Border colors
  card: string             // Card backgrounds
  cardForeground: string   // Card text
}
```

**Tại sao dùng HSL?**
- Dễ điều chỉnh độ sáng/tối (lightness)
- Dễ tạo các biến thể màu
- CSS variables dùng HSL format

#### Theme Gradients
```typescript
interface ThemeGradients {
  hero: string[]      // Hero section gradient (3-4 colors)
  card: string[]      // Card gradient (2-3 colors)
  button: string[]    // Button gradient (2-3 colors)
  accent: string[]    // Accent gradient (2-3 colors)
}
```

#### Theme Effects
```typescript
interface ThemeEffects {
  enableParticles: boolean       // Enable falling petals/particles
  particleColor: string          // Particle color (hex/hsl)
  enableGradientAnimation: boolean  // Animate gradients
  enableGlassEffect: boolean     // Glass morphism effects
}
```

---

### 2. ThemeProvider (`lib/themes/theme-provider.tsx`)

Client component wrap toàn bộ app, quản lý theme state.

#### Features:
- Load active theme from `/api/theme/active`
- Apply CSS variables to `document.documentElement`
- Listen for `theme-changed` custom event
- Auto-refresh theme (optional polling)

#### Usage:
```tsx
// app/layout.tsx
import { ThemeProvider } from '@/lib/themes/theme-provider'

export default function RootLayout({ children }) {
  const activeTheme = await fetchActiveTheme() // SSR

  return (
    <ThemeProvider initialTheme={activeTheme}>
      {children}
    </ThemeProvider>
  )
}
```

#### Hook:
```tsx
import { useTheme } from '@/lib/themes/theme-provider'

function MyComponent() {
  const { theme, isLoading, refreshTheme } = useTheme()

  return (
    <div style={{ color: theme.colors.primary }}>
      Current theme: {theme.displayName}
    </div>
  )
}
```

---

### 3. ThemeBanner (`components/theme/theme-banner.tsx`)

Hiển thị banner thông báo khi theme đặc biệt được kích hoạt.

#### Features:
- Auto-show when special theme active (not default)
- User can close (saved to localStorage)
- Animated entrance/exit
- Gradient background from theme
- Mobile responsive

#### Display Logic:
```
1. Check if theme is special (name !== "default")
2. Check localStorage: `theme-banner-closed-${theme.name}`
3. If not closed → Show banner with animation
4. User clicks X → Save to localStorage & hide
```

#### Preview:
```
┌─────────────────────────────────────────────────────────┐
│ 🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸                    [X] │
│ Theme thanh lịch, lãng mạn với tông màu hồng rose...    │
└─────────────────────────────────────────────────────────┘
```

---

### 4. FallingPetals (`components/theme/falling-petals.tsx`)

Hiệu ứng hoa rơi (falling petals) cho theme đặc biệt.

#### Features:
- Auto-enable when `theme.effects.enableParticles = true`
- 3 shapes: Heart ❤️, Circle ⚪, Petal 🌸
- CSS animation (GPU accelerated)
- Responsive: 12 particles (mobile), 20 particles (desktop)
- Respects `prefers-reduced-motion` for accessibility

#### Performance Optimizations:
- `pointer-events-none` → Không block clicks
- CSS animations (not JS) → Better performance
- Fewer particles on mobile
- Auto-disable on `prefers-reduced-motion`

---

## Predefined Themes

### Theme 20/10 (Women's Day Vietnam)

**File:** `lib/themes/predefined-themes.ts`

```typescript
export const THEME_20_10 = {
  name: '20-10',
  displayName: '🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸',
  description: 'Theme thanh lịch, lãng mạn với tông màu hồng rose gold...',
  colors: {
    primary: 'hsl(340 90% 65%)',    // Vibrant rose pink
    secondary: 'hsl(280 70% 88%)',  // Light lavender
    accent: 'hsl(350 85% 70%)',     // Coral pink
    // ... more colors
  },
  gradients: {
    hero: [
      'hsl(340 90% 65%)',  // Rose pink
      'hsl(330 85% 68%)',  // Rose gold
      'hsl(310 80% 72%)',  // Orchid
      'hsl(280 75% 75%)',  // Lavender
    ],
    // ... more gradients
  },
  effects: {
    enableParticles: true,
    particleColor: '#FFB6D9',       // Light pink
    enableGradientAnimation: true,
    enableGlassEffect: true,
  }
}
```

#### Color Palette:
- **Primary**: Vibrant rose pink `hsl(340 90% 65%)`
- **Secondary**: Light lavender `hsl(280 70% 88%)`
- **Accent**: Coral pink `hsl(350 85% 70%)`
- **Particles**: Light pink `#FFB6D9`

#### Visual Effects:
- ✅ Falling petals (hearts, circles, flower petals)
- ✅ Animated gradients
- ✅ Glass morphism
- ✅ Banner notification

---

### Theme Default

```typescript
export const THEME_DEFAULT = {
  name: 'default',
  displayName: 'Mặc Định',
  description: 'Theme mặc định của hệ thống với tông màu xanh tím...',
  colors: {
    primary: 'hsl(262.1 83.3% 57.8%)',  // Purple
    // ... standard colors
  },
  effects: {
    enableParticles: true,    // Basic particles
    particleColor: '#ffffff',
    enableGradientAnimation: true,
    enableGlassEffect: true,
  }
}
```

---

## Admin Theme Management

### UI: `/admin/themes`

**Component:** `components/admin/theme-management.tsx`

#### Features:
1. **Seed Themes** - Tạo predefined themes vào database
2. **View Themes** - Xem tất cả themes với preview
3. **Activate Theme** - Kích hoạt theme (reload page)

#### Preview Card:
```
┌────────────────────────────────────┐
│  [Gradient Preview]     [✓ Active] │
│                                    │
│  🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸  │
│  Theme thanh lịch, lãng mạn...     │
│                                    │
│  [Primary][Secondary][Accent]      │
│  [Button Gradient Preview]         │
│  [Card Gradient Preview]           │
│                                    │
│  [Kích Hoạt Theme]                 │
└────────────────────────────────────┘
```

### API Routes

#### `POST /api/admin/themes/seed`
Seed predefined themes vào database.

**Request:**
```bash
curl -X POST /api/admin/themes/seed
```

**Response:**
```json
{
  "success": true,
  "message": "Đã seed 2 themes thành công",
  "themes": [
    { "id": "...", "name": "default", "isActive": true },
    { "id": "...", "name": "20-10", "isActive": false }
  ]
}
```

#### `PATCH /api/admin/themes`
Kích hoạt theme.

**Request:**
```bash
curl -X PATCH /api/admin/themes \
  -H "Content-Type: application/json" \
  -d '{"id": "theme-id", "action": "activate"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Theme đã được kích hoạt",
  "theme": { ... }
}
```

#### `GET /api/theme/active`
Lấy theme đang active (public API).

**Response:**
```json
{
  "theme": {
    "id": "...",
    "name": "20-10",
    "displayName": "🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸",
    "colors": { ... },
    "gradients": { ... },
    "effects": { ... }
  }
}
```

---

## How CSS Variables Work

### Apply Theme to DOM

```typescript
function applyThemeToDOM(theme: ITheme) {
  const root = document.documentElement

  // Apply colors as CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    // Extract HSL values (remove "hsl(" and ")")
    const hslValue = value.replace(/hsl\((.*)\)/, '$1')
    root.style.setProperty(`--${cssVar}`, hslValue)
  })

  // Example result:
  // --primary: 340 90% 65%
  // --secondary: 280 70% 88%
  // --accent: 350 85% 70%
}
```

### Usage in CSS/Tailwind

```css
/* In CSS */
.my-element {
  background: hsl(var(--primary));
  color: hsl(var(--foreground));
}

/* In Tailwind */
<div className="bg-primary text-foreground">
  Content
</div>
```

### Gradient CSS Variables

```typescript
root.style.setProperty('--gradient-hero', theme.gradients.hero.join(', '))
root.style.setProperty('--gradient-button', theme.gradients.button.join(', '))

// Usage:
background: linear-gradient(135deg, var(--gradient-hero));
```

---

## Usage Examples

### Example 1: Create New Theme

```typescript
// 1. Define theme in predefined-themes.ts
export const THEME_TET = {
  name: 'tet-2025',
  displayName: '🎊 Tết Nguyên Đán 2025 🎊',
  description: 'Theme rực rỡ cho năm mới với màu đỏ và vàng...',
  colors: {
    primary: 'hsl(0 85% 55%)',      // Red
    secondary: 'hsl(45 100% 50%)',  // Gold
    accent: 'hsl(15 90% 60%)',      // Orange
    // ... more colors
  },
  gradients: {
    hero: ['hsl(0 85% 55%)', 'hsl(15 90% 60%)', 'hsl(45 100% 50%)'],
    // ...
  },
  effects: {
    enableParticles: true,
    particleColor: '#FFD700',  // Gold
    enableGradientAnimation: true,
    enableGlassEffect: true,
  }
}

// 2. Add to PREDEFINED_THEMES array
export const PREDEFINED_THEMES = [
  THEME_DEFAULT,
  THEME_20_10,
  THEME_TET,  // ← Add new theme
]

// 3. Seed themes via admin UI or API
POST /api/admin/themes/seed
```

### Example 2: Custom Component Using Theme

```tsx
'use client'
import { useTheme } from '@/lib/themes/theme-provider'

export function EventCard() {
  const { theme } = useTheme()

  if (!theme) return null

  const gradientStyle = {
    background: `linear-gradient(135deg, ${theme.gradients.card.join(', ')})`
  }

  return (
    <div
      className="p-6 rounded-xl text-white"
      style={gradientStyle}
    >
      <h3 className="text-2xl font-bold">
        Current Theme: {theme.displayName}
      </h3>
      <p className="opacity-90">
        {theme.description}
      </p>
    </div>
  )
}
```

### Example 3: Manually Trigger Theme Change

```tsx
// In admin component after activating theme
const handleActivateTheme = async (themeId: string) => {
  const response = await fetch('/api/admin/themes', {
    method: 'PATCH',
    body: JSON.stringify({ id: themeId, action: 'activate' })
  })

  if (response.ok) {
    // Trigger custom event for ThemeProvider to refresh
    window.dispatchEvent(new Event('theme-changed'))

    // Or reload page for full refresh
    window.location.reload()
  }
}
```

---

## Best Practices

### 1. Color Design
- ✅ Dùng HSL format cho colors (dễ điều chỉnh)
- ✅ Đảm bảo contrast ratio WCAG 2.1 (AA) cho text
- ✅ Test theme trên cả light & dark surfaces
- ❌ Tránh dùng quá nhiều màu (max 3-4 main colors)

### 2. Performance
- ✅ Giữ số lượng particles <= 20 (desktop), <= 12 (mobile)
- ✅ Dùng CSS animations thay vì JS
- ✅ Respect `prefers-reduced-motion`
- ❌ Tránh animate too many elements đồng thời

### 3. User Experience
- ✅ Hiển thị ThemeBanner để user biết sự kiện gì đang diễn ra
- ✅ Cho phép user đóng banner (lưu localStorage)
- ✅ Smooth transitions khi đổi theme
- ❌ Không auto-switch theme mà không thông báo

### 4. Accessibility
- ✅ Adequate color contrast (WCAG AA minimum)
- ✅ Support `prefers-reduced-motion`
- ✅ Keyboard navigation cho admin UI
- ✅ Screen reader friendly

---

## Troubleshooting

### Theme không apply sau khi activate?

**Solution:**
1. Check console for errors
2. Verify theme saved to database: `db.themes.find({ isActive: true })`
3. Clear browser cache & hard reload
4. Check `localStorage` for banner closed state

### Particles không hiện?

**Solution:**
1. Check `theme.effects.enableParticles === true`
2. Check theme name !== 'default'
3. Check console for errors
4. Verify `prefers-reduced-motion` setting:
   ```js
   window.matchMedia('(prefers-reduced-motion: reduce)').matches
   ```

### CSS variables không work?

**Solution:**
1. Inspect `<html>` element styles
2. Verify CSS variables applied:
   ```js
   getComputedStyle(document.documentElement).getPropertyValue('--primary')
   ```
3. Check HSL format is correct

### Banner bị stuck/không đóng được?

**Solution:**
```js
// Clear localStorage
localStorage.removeItem(`theme-banner-closed-${themeName}`)
```

---

## Future Enhancements

### Planned Features:
- [ ] Theme scheduling (auto-activate on specific dates)
- [ ] Theme preview mode (test before activating)
- [ ] Custom theme creator UI for admins
- [ ] Theme analytics (engagement metrics)
- [ ] More particle effects (snow, confetti, fireworks)
- [ ] Theme marketplace (community themes)

### Advanced Features:
- [ ] Per-event custom themes
- [ ] User theme preferences (override system theme)
- [ ] Dark mode support for all themes
- [ ] Theme A/B testing

---

## Related Files

```
theme-system/
├── lib/
│   ├── mongodb/
│   │   └── models/Theme.ts              # Theme model schema
│   └── themes/
│       ├── predefined-themes.ts         # Predefined themes
│       └── theme-provider.tsx           # ThemeProvider component
│
├── components/
│   ├── admin/
│   │   └── theme-management.tsx         # Admin UI
│   └── theme/
│       ├── theme-banner.tsx             # Notification banner
│       └── falling-petals.tsx           # Particle effects
│
├── app/
│   ├── layout.tsx                       # Root layout (ThemeProvider)
│   ├── admin/themes/page.tsx            # Admin theme page
│   └── api/
│       ├── theme/active/route.ts        # GET active theme
│       └── admin/themes/
│           ├── route.ts                 # PATCH activate theme
│           └── seed/route.ts            # POST seed themes
│
└── docs/
    └── THEME_SYSTEM.md                  # This documentation
```

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in theme files
3. Check `/admin/themes` UI for theme status
4. Contact development team

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Author:** Timeline Teky Hoàng Mai Team
