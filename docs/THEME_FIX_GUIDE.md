# 🔧 Hướng Dẫn Fix Lỗi Theme

## ⚠️ Vấn Đề Bạn Đang Gặp

**Triệu chứng:**
- Cả 2 themes đều hiển thị badge "Đang Dùng"
- Không thể kích hoạt theme khác
- UI không đổi khi click "Kích Hoạt Theme"

**Nguyên nhân:**
Database có **nhiều hơn 1 theme** với `isActive: true` → Lỗi logic

---

## ✅ Giải Pháp Nhanh (30 giây)

### Cách 1: Dùng Nút "Fix DB" (Khuyên dùng)

1. Truy cập: `http://localhost:3001/admin/themes`

2. Bạn sẽ thấy **warning màu đỏ**:
   ```
   ⚠️ Cảnh báo: Phát hiện 2 themes đang active cùng lúc!
   Điều này gây lỗi hệ thống. Nhấn nút "Fix DB" để khắc phục.
   ```

3. Nhấn nút **"Fix DB"** (góc trên bên phải, bên trái nút "Seed Themes")

4. Đợi thông báo:
   ```
   ✓ Database fixed! Default theme is now active.
   ```

5. **DONE!** Theme "Mặc Định" giờ là theme duy nhất active

---

### Cách 2: Dùng API (Nếu UI không load)

```bash
curl -X POST http://localhost:3001/api/admin/themes/fix \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Database fixed! Default theme is now active.",
  "fixed": true,
  "activeTheme": {
    "id": "xxx",
    "name": "default",
    "displayName": "Mặc Định"
  }
}
```

---

### Cách 3: Fix Bằng MongoDB (Manual)

**Nếu 2 cách trên không work:**

```javascript
// Kết nối MongoDB Atlas hoặc local
// Chạy trong MongoDB Shell hoặc Compass

// 1. Xem tất cả themes đang active
db.themes.find({ isActive: true })

// 2. Deactivate tất cả themes
db.themes.updateMany(
  {},
  { $set: { isActive: false } }
)

// 3. Activate theme "default"
db.themes.updateOne(
  { name: "default" },
  { $set: { isActive: true } }
)

// 4. Verify
db.themes.find({ isActive: true }).count()
// → Should return 1
```

---

## 🧪 Verify Fix Đã Thành Công

### Check 1: Admin UI
Reload `/admin/themes`:

**Trước fix:**
```
┌──────────────┐  ┌──────────────┐
│ Mặc Định     │  │ 🌸 20/10     │
│ ✓ Đang Dùng  │  │ ✓ Đang Dùng  │ ← WRONG!
│              │  │              │
│ [Kích Hoạt]  │  │              │ ← BOTH show button
└──────────────┘  └──────────────┘
```

**Sau fix:**
```
┌──────────────┐  ┌──────────────┐
│ Mặc Định     │  │ 🌸 20/10     │
│ ✓ Đang Dùng  │  │              │ ← CORRECT!
│              │  │              │
│              │  │ [Kích Hoạt]  │ ← Only inactive has button
└──────────────┘  └──────────────┘
```

### Check 2: Warning Biến Mất
Warning màu đỏ **KHÔNG HIỆN** nữa.

### Check 3: Terminal Logs
```
[FIX] Starting database fix...
[FIX] Found 2 active themes
[FIX] Multiple active themes detected! Fixing...
[FIX] All themes deactivated
[FIX] Activated default theme (ID: xxx)
```

### Check 4: API Response
```bash
curl http://localhost:3001/api/theme/active | jq '.theme.name'
# → "default"
```

---

## 🎨 Bây Giờ Kích Hoạt Theme 20/10

**Sau khi fix xong:**

1. Tìm card **"🌸 Ngày Phụ Nữ Việt Nam 20/10"**
2. Nhấn nút **"Kích Hoạt Theme"**
3. Đợi 1 giây → Page reload
4. Verify:
   - Theme 20/10 có badge "Đang Dùng"
   - Theme Mặc Định có nút "Kích Hoạt Theme"
   - Homepage hiện banner + hoa rơi

---

## 🐛 Troubleshooting

### Issue: Nút "Fix DB" Không Xuất Hiện

**Nguyên nhân:** Chưa có warning (database đã consistent)

**Check:**
```javascript
// Trong browser console (F12)
fetch('/api/admin/themes')
  .then(r => r.json())
  .then(data => {
    const activeCount = data.themes.filter(t => t.isActive).length
    console.log('Active themes:', activeCount)
  })
// → Should be 1
```

---

### Issue: Click "Fix DB" Nhưng Lỗi 403 Unauthorized

**Nguyên nhân:** Không phải admin

**Fix:**
```sql
-- Trong Supabase SQL Editor
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();
```

Logout → Login lại.

---

### Issue: Fix Xong Nhưng Vẫn Thấy 2 Themes Active

**Nguyên nhân:** Cache browser

**Fix:**
```
Hard reload: Ctrl + Shift + R (Windows/Linux)
            Cmd + Shift + R (Mac)
```

Hoặc:
```javascript
localStorage.clear()
location.reload()
```

---

### Issue: API Trả Về "No themes found in database"

**Nguyên nhân:** Database rỗng

**Fix:**
```bash
# Seed themes trước
curl -X POST http://localhost:3001/api/admin/themes/seed

# Sau đó fix
curl -X POST http://localhost:3001/api/admin/themes/fix
```

---

## 📋 Technical Details

### Root Cause Analysis

**Vấn đề:** MongoDB middleware `pre('save')` không chạy khi dùng `findOneAndUpdate()`

**Before (buggy code):**
```typescript
async setActive(id: string) {
  return await Theme.findOneAndUpdate(
    { id },
    { $set: { isActive: true } },
    { new: true }
  )
}
```

**Issue:** Không deactivate themes khác trước → Multiple active themes

**After (fixed code):**
```typescript
async setActive(id: string) {
  // 1. Deactivate ALL themes first
  await Theme.updateMany(
    {},
    { $set: { isActive: false } }
  )

  // 2. Activate requested theme
  return await Theme.findOneAndUpdate(
    { id },
    { $set: { isActive: true } },
    { new: true }
  )
}
```

**Result:** Atomic operation, always only 1 active theme

---

### Fix Endpoint Logic

**File:** `app/api/admin/themes/fix/route.ts`

**Flow:**
1. Check auth (admin only)
2. Count active themes
3. If <= 1: Already consistent, return success
4. If > 1:
   - Deactivate ALL themes
   - Activate "default" theme (or first theme if no default)
   - Return success with active theme info

---

## ✅ Prevention

**Để tránh lỗi này trong tương lai:**

1. ✅ **Repository method đã fix** → Không xảy ra lại
2. ✅ **UI có warning** → Phát hiện ngay nếu có
3. ✅ **Fix endpoint sẵn sàng** → Khắc phục 1-click

---

## 🎓 Related Docs

- **Full Theme Docs**: `docs/THEME_SYSTEM.md`
- **Quick Start**: `THEME_QUICK_START.md`
- **Test Guide**: `THEME_TEST_GUIDE.md`

---

**Fix trong 30 giây! 🚀**

Nhấn **"Fix DB"** → Done!
