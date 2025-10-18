# Hướng Dẫn Test Theme System

## 🚀 Bước 1: Khởi Động Dev Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 🔑 Bước 2: Đăng Nhập Admin

1. Truy cập: `http://localhost:3000/login`
2. Đăng nhập với tài khoản admin
3. Kiểm tra có badge "Admin" trên header không

**Nếu không có badge Admin:**
- Xem hướng dẫn: `ADMIN_QUICK_START.md`
- Hoặc chạy SQL trong Supabase để set role admin

---

## 🎨 Bước 3: Truy Cập Theme Management

1. Truy cập: `http://localhost:3000/admin/themes`
2. Bạn sẽ thấy một trong hai trạng thái:

### Trạng Thái A: Chưa Có Theme (Empty State)

Nếu thấy màn hình:
```
┌─────────────────────────────────────────┐
│          🎨                              │
│     Chưa Có Theme Nào                   │
│                                          │
│  Hệ thống chưa có theme nào...         │
│                                          │
│  ┌─────────────────────────────┐       │
│  │ 🎨 Theme Mặc Định           │       │
│  │    Theme chuẩn (xanh tím)   │       │
│  │                              │       │
│  │ 🌸 Theme 20/10              │       │
│  │    Ngày Phụ Nữ VN (hồng)   │       │
│  └─────────────────────────────┘       │
│                                          │
│  [✨ Seed Themes Ngay]                  │
└─────────────────────────────────────────┘
```

**→ Nhấn nút "Seed Themes Ngay"**

### Trạng Thái B: Đã Có Themes

Nếu thấy grid với 2 theme cards:
```
┌──────────────┐  ┌──────────────┐
│ [Purple Grad]│  │ [Pink Grad]  │
│              │  │  ✓ Đang Dùng │
│ Mặc Định     │  │              │
│ Theme chuẩn  │  │ 🌸 20/10     │
│              │  │ Ngày Phụ Nữ  │
│ [Primary]    │  │ [Primary]    │
│ [Secondary]  │  │ [Secondary]  │
│ [Accent]     │  │ [Accent]     │
│              │  │              │
│ [Gradient 1] │  │ [Gradient 1] │
│ [Gradient 2] │  │ [Gradient 2] │
│              │  │              │
│ [Kích Hoạt]  │  │              │
└──────────────┘  └──────────────┘
```

**→ Themes đã sẵn sàng!**

---

## ✅ Bước 4: Seed Themes (Nếu Chưa Có)

1. Nhấn nút **"Seed Themes"** (góc trên bên phải)
   - Hoặc nút **"Seed Themes Ngay"** (giữa màn hình)

2. Đợi vài giây

3. Bạn sẽ thấy thông báo:
   ```
   ✓ Đã tạo 2 themes, bỏ qua 0 themes đã tồn tại
   ```

4. Grid hiển thị 2 theme cards:
   - **Theme Mặc Định** (màu xanh tím)
   - **🌸 Ngày Phụ Nữ Việt Nam 20/10** (màu hồng)

**Debug Logs (Trong Terminal):**
```
[SEED] Starting theme seeding process...
[SEED] User ID: xxx-xxx-xxx
[SEED] Predefined themes count: 2
[SEED] Processing theme: default
[SEED] Creating theme: default
[SEED] Successfully created theme: default (ID: xxx)
[SEED] Processing theme: 20-10
[SEED] Creating theme: 20-10
[SEED] Successfully created theme: 20-10 (ID: xxx)
[SEED] Seeding complete! Created: 2, Skipped: 0
```

---

## 🌸 Bước 5: Kích Hoạt Theme 20/10

### Cách 1: Via UI (Khuyên dùng)

1. Tìm card theme **"🌸 Ngày Phụ Nữ Việt Nam 20/10"**
2. Nhấn nút **"Kích Hoạt Theme"**
3. Đợi thông báo: `✓ Theme đã được kích hoạt thành công!`
4. Page sẽ reload tự động sau 1 giây

### Cách 2: Via API

```bash
# Lấy theme ID trước
curl http://localhost:3000/api/admin/themes

# Kích hoạt theme (thay THEME_ID)
curl -X PATCH http://localhost:3000/api/admin/themes \
  -H "Content-Type: application/json" \
  -d '{"id": "THEME_ID", "action": "activate"}'
```

---

## 🎉 Bước 6: Verify Theme Đã Active

### Check 1: Admin UI
Quay lại `/admin/themes`, theme 20/10 phải có:
- Badge **"✓ Đang Dùng"** (góc trên bên phải card)
- Ring màu primary quanh card
- **KHÔNG CÓ** nút "Kích Hoạt Theme"

### Check 2: Homepage
Truy cập homepage `/`:

**Bạn PHẢI thấy:**
1. ✅ **ThemeBanner** trên cùng trang:
   ```
   ┌─────────────────────────────────────────────────┐
   │ ✨ 🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸        [X] │
   │ Theme thanh lịch, lãng mạn với tông màu...     │
   └─────────────────────────────────────────────────┘
   ```

2. ✅ **Falling Petals** (hoa rơi):
   - Hoa hồng, tim, tròn rơi từ trên xuống
   - Màu hồng nhạt #FFB6D9
   - Rơi liên tục

3. ✅ **Màu sắc đổi**:
   - Hero section: Gradient hồng-tím-lavender
   - Buttons: Gradient rose gold
   - Cards: Gradient coral-orchid
   - Background: Hơi hồng nhẹ

4. ✅ **Stats cards**: Glass effect với màu primary hồng

### Check 3: DevTools Console
```javascript
// Check CSS variables
getComputedStyle(document.documentElement).getPropertyValue('--primary')
// → Should be: "340 90% 65%" (rose pink)

// Check theme from API
fetch('/api/theme/active').then(r => r.json()).then(console.log)
// → Should return theme 20-10
```

### Check 4: localStorage
```javascript
// Check banner closed state
localStorage.getItem('theme-banner-closed-20-10')
// → Should be null (banner visible)

// To reset banner:
localStorage.removeItem('theme-banner-closed-20-10')
location.reload()
```

---

## 🔄 Bước 7: Chuyển Về Theme Mặc Định

1. Quay lại `/admin/themes`
2. Tìm card **"Mặc Định"**
3. Nhấn **"Kích Hoạt Theme"**
4. Page reload

**Verify:**
- Banner **KHÔNG HIỆN** (theme default không show banner)
- Particles **KHÔNG HIỆN** (hoặc particles trắng basic)
- Màu về xanh tím (purple) bình thường

---

## 🐛 Troubleshooting

### Issue 1: Không Thấy Nút "Seed Themes"
**Nguyên nhân:** Không phải admin

**Fix:**
```sql
-- Chạy trong Supabase SQL Editor
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();
```

Logout → Login lại.

---

### Issue 2: Seed Themes Bị Lỗi
**Check terminal logs:**
```
[SEED] Error seeding themes: ...
```

**Common fixes:**
- MongoDB chưa kết nối → Check `.env.local` có `MONGODB_URI`
- Network issue → Check VPN/Firewall
- Auth issue → Run `npm run fix:mongodb-auth`

---

### Issue 3: Theme Active Nhưng UI Không Đổi
**Fix 1: Hard Reload**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Fix 2: Clear Cache**
```javascript
localStorage.clear()
location.reload()
```

**Fix 3: Check CSS Variables**
```javascript
// Should have values
console.log(getComputedStyle(document.documentElement).getPropertyValue('--primary'))
console.log(getComputedStyle(document.documentElement).getPropertyValue('--secondary'))
```

---

### Issue 4: Particles Không Hiện
**Check 1: Theme effects**
```javascript
fetch('/api/theme/active')
  .then(r => r.json())
  .then(data => console.log(data.theme.effects.enableParticles))
// → Should be true
```

**Check 2: Reduced motion**
```javascript
window.matchMedia('(prefers-reduced-motion: reduce)').matches
// → Should be false (if true, particles disabled for accessibility)
```

**Check 3: Console errors**
```
F12 → Console tab → Look for errors
```

---

### Issue 5: Banner Bị Stuck/Không Đóng Được
**Fix:**
```javascript
// Clear banner state
localStorage.removeItem('theme-banner-closed-20-10')
location.reload()
```

---

## 📋 Test Checklist

Sau khi seed themes và activate theme 20/10:

### Visual Tests
- [ ] Banner hiển thị với đúng text & emoji
- [ ] Particles (hoa rơi) hoạt động smooth
- [ ] Màu sắc toàn bộ UI đổi sang hồng-tím
- [ ] Gradient hero section đúng màu
- [ ] Buttons & cards có gradient mới
- [ ] Mobile responsive (test trên phone)

### Functional Tests
- [ ] User có thể đóng banner (click X)
- [ ] Banner không hiện lại sau khi đóng
- [ ] Theme persist sau khi reload page
- [ ] Chỉ 1 theme active tại 1 thời điểm
- [ ] Theme switch triggers full UI update

### Performance Tests
- [ ] Page load time < 2s
- [ ] Particles smooth trên desktop (60 FPS)
- [ ] Particles acceptable trên mobile (30-60 FPS)
- [ ] No layout shift (CLS score good)

### Accessibility Tests
- [ ] Color contrast đủ WCAG AA
- [ ] Banner closable bằng keyboard (Tab + Enter)
- [ ] Particles disable với prefers-reduced-motion
- [ ] Screen reader friendly

---

## 🎓 Advanced Testing

### Test Theme Switching Nhiều Lần
```bash
# Cycle: Default → 20/10 → Default → 20/10
# Check:
# - No memory leaks
# - CSS variables update correctly
# - No duplicate particles
```

### Test Concurrent Users
```bash
# User A activates theme 20/10
# User B (on another browser) sees theme 20/10 after reload
# Only admin can activate, normal users just see result
```

### Test API Directly
```bash
# Get all themes
curl http://localhost:3000/api/admin/themes

# Get active theme (public)
curl http://localhost:3000/api/theme/active

# Seed themes
curl -X POST http://localhost:3000/api/admin/themes/seed

# Activate theme
curl -X PATCH http://localhost:3000/api/admin/themes \
  -H "Content-Type: application/json" \
  -d '{"id": "THEME_ID", "action": "activate"}'
```

---

## ✅ Success Criteria

Theme system hoạt động đúng khi:

1. ✅ Admin thấy UI theme management (`/admin/themes`)
2. ✅ Seed tạo được 2 themes vào database
3. ✅ Kích hoạt theme 20/10 thành công
4. ✅ Banner hiển thị rõ ràng thông báo sự kiện
5. ✅ Particles (hoa rơi) hoạt động mượt
6. ✅ Màu sắc toàn UI đổi theo theme
7. ✅ Performance không bị ảnh hưởng
8. ✅ Accessibility được đảm bảo

---

**Happy Testing! 🎉🌸**

Nếu gặp vấn đề:
- Check terminal logs
- Check browser console
- Xem `THEME_QUICK_START.md`
- Xem `docs/THEME_SYSTEM.md`
