# Theme System - Quick Start Guide

Hướng dẫn nhanh 5 phút để sử dụng Theme System cho sự kiện đặc biệt.

---

## 🚀 Kích Hoạt Theme 20/10 (3 bước)

### Bước 1: Seed Themes vào Database

1. Đăng nhập với tài khoản Admin
2. Truy cập: `/admin/themes`
3. Nhấn nút **"Seed Themes"**

✅ Kết quả: 2 themes được tạo (Default + 20/10)

### Bước 2: Kích Hoạt Theme 20/10

1. Tìm card theme **"🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸"**
2. Nhấn nút **"Kích Hoạt Theme"**
3. Đợi page reload tự động

✅ Kết quả: Theme 20/10 được kích hoạt toàn website

### Bước 3: Kiểm Tra Kết Quả

Truy cập trang chủ `/` và kiểm tra:

- ✅ Banner thông báo "🌸 Ngày Phụ Nữ Việt Nam 20/10" hiện ở đầu trang
- ✅ Màu sắc website chuyển sang tông hồng-tím lãng mạn
- ✅ Hoa rơi (falling petals) xuất hiện trên trang
- ✅ Gradient hero section đổi màu

---

## 🎨 Features Khi Theme 20/10 Active

### 1. ThemeBanner (Banner Thông Báo)
```
┌─────────────────────────────────────────────────────┐
│ 🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸              [X]   │
│ Theme thanh lịch, lãng mạn với tông màu hồng...     │
└─────────────────────────────────────────────────────┘
```

**Tính năng:**
- Auto-show khi theme active
- User có thể đóng (lưu localStorage)
- Gradient background động
- Mobile responsive

### 2. Falling Petals (Hoa Rơi)

**Hiệu ứng:**
- 3 loại hình: ❤️ Heart, ⚪ Circle, 🌸 Petal
- Màu hồng nhạt (#FFB6D9)
- Rơi từ trên xuống với animation mượt
- 20 particles (desktop), 12 particles (mobile)

**Performance:**
- CSS animation (GPU accelerated)
- Auto-disable với `prefers-reduced-motion`
- Không block user interactions

### 3. Color Palette

| Element | Color | HSL |
|---------|-------|-----|
| Primary | Rose Pink | `hsl(340 90% 65%)` |
| Secondary | Light Lavender | `hsl(280 70% 88%)` |
| Accent | Coral Pink | `hsl(350 85% 70%)` |
| Background | Pink-White | `hsl(330 30% 98%)` |

### 4. Gradient Updates

- **Hero Section**: Rose Pink → Rose Gold → Orchid → Lavender
- **Buttons**: Vibrant Rose → Rose Gold → Orchid
- **Cards**: Coral → Rose Gold → Light Orchid

---

## 🔄 Quay Về Theme Mặc Định

### Cách 1: Admin UI

1. Truy cập `/admin/themes`
2. Tìm theme **"Mặc Định"**
3. Nhấn **"Kích Hoạt Theme"**

### Cách 2: API

```bash
curl -X PATCH /api/admin/themes \
  -H "Content-Type: application/json" \
  -d '{"id": "default-theme-id", "action": "activate"}'
```

---

## 🛠️ Tạo Theme Mới Cho Sự Kiện Khác

### Step 1: Define Theme

Edit file: `lib/themes/predefined-themes.ts`

```typescript
export const THEME_TET_2025 = {
  name: 'tet-2025',
  displayName: '🎊 Tết Nguyên Đán 2025 🎊',
  description: 'Theme rực rỡ cho năm mới với màu đỏ và vàng',
  colors: {
    primary: 'hsl(0 85% 55%)',      // Red
    secondary: 'hsl(45 100% 50%)',  // Gold
    accent: 'hsl(15 90% 60%)',      // Orange
    background: 'hsl(45 40% 98%)',
    foreground: 'hsl(0 10% 15%)',
    muted: 'hsl(45 20% 95%)',
    mutedForeground: 'hsl(0 10% 50%)',
    border: 'hsl(45 30% 88%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 10% 15%)',
  },
  gradients: {
    hero: [
      'hsl(0 85% 55%)',   // Red
      'hsl(15 90% 60%)',  // Orange
      'hsl(45 100% 50%)', // Gold
    ],
    card: ['hsl(0 85% 55%)', 'hsl(15 90% 60%)'],
    button: ['hsl(0 85% 55%)', 'hsl(15 90% 60%)'],
    accent: ['hsl(15 90% 60%)', 'hsl(45 100% 50%)'],
  },
  effects: {
    enableParticles: true,
    particleColor: '#FFD700',  // Gold
    enableGradientAnimation: true,
    enableGlassEffect: true,
  }
}

// Add to array
export const PREDEFINED_THEMES = [
  THEME_DEFAULT,
  THEME_20_10,
  THEME_TET_2025,  // ← New theme
]
```

### Step 2: Seed to Database

1. Rebuild app: `npm run build`
2. Truy cập `/admin/themes`
3. Nhấn **"Seed Themes"**
4. Kích hoạt theme mới

---

## 🧪 Testing Checklist

Sau khi kích hoạt theme mới, test các điểm sau:

### Visual Tests
- [ ] Banner hiển thị đúng với displayName & description
- [ ] Màu sắc chính (primary, secondary, accent) đã đổi
- [ ] Gradient hero section đúng màu
- [ ] Buttons & cards dùng gradient mới
- [ ] Particles (nếu enable) hoạt động mượt

### Functional Tests
- [ ] User có thể đóng banner (nhấn X)
- [ ] Banner không hiện lại sau khi đóng (localStorage)
- [ ] Particles không lag trên mobile
- [ ] Theme hoạt động trên mọi trang (home, events, admin)

### Performance Tests
- [ ] Page load time không tăng đáng kể
- [ ] Particles smooth trên mobile (không giật lag)
- [ ] CSS animations không block scrolling
- [ ] `prefers-reduced-motion` được tôn trọng

### Accessibility Tests
- [ ] Color contrast đủ WCAG AA (text readable)
- [ ] Banner có thể đóng bằng keyboard (Tab + Enter)
- [ ] Screen reader đọc được thông báo
- [ ] Motion effects disable với `prefers-reduced-motion`

---

## 📱 Mobile Experience

Theme system được optimize đặc biệt cho mobile (80% users):

### Optimizations
- **Particles**: 12 thay vì 20 trên mobile
- **Banner**: Compact layout, touch-friendly close button
- **Gradients**: Smooth performance với CSS
- **Animations**: Faster duration (6s vs 8s)

### Testing Mobile
```bash
# Chrome DevTools
1. F12 → Toggle Device Toolbar
2. Select "iPhone 12 Pro" or similar
3. Test banner, particles, scrolling
4. Check performance tab
```

---

## 🐛 Troubleshooting

### Theme không đổi sau khi activate?
```bash
# Solution 1: Hard reload
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Solution 2: Clear cache
localStorage.clear()
location.reload()
```

### Particles không hiện?
```js
// Check in Console:
console.log(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
// → Should be false

// Check theme:
const theme = await fetch('/api/theme/active').then(r => r.json())
console.log(theme.effects.enableParticles)  // → Should be true
```

### Banner bị stuck?
```js
// Clear localStorage in Console:
localStorage.removeItem('theme-banner-closed-20-10')
location.reload()
```

---

## 🎓 Learn More

- **Full Documentation**: [`docs/THEME_SYSTEM.md`](docs/THEME_SYSTEM.md)
- **Theme Model**: [`lib/mongodb/models/Theme.ts`](lib/mongodb/models/Theme.ts)
- **Predefined Themes**: [`lib/themes/predefined-themes.ts`](lib/themes/predefined-themes.ts)
- **Admin UI**: [`/admin/themes`](/admin/themes)

---

## 💡 Tips & Best Practices

### Color Design
- Dùng HSL format cho dễ điều chỉnh lightness
- Test contrast với WebAIM Contrast Checker
- Giữ palette đơn giản (3-4 màu chính)

### Performance
- Limit particles <= 20 (desktop), <= 12 (mobile)
- Dùng CSS animations > JS animations
- Test trên thiết bị thật, không chỉ emulator

### User Experience
- Luôn có ThemeBanner để user biết sự kiện gì
- Cho phép user đóng banner
- Không auto-switch theme mà không thông báo

---

**Ready to celebrate special events with beautiful themes! 🎉**
