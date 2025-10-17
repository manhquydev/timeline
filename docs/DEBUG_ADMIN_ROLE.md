# 🔍 Debug Guide: Tại sao không thấy quyền Admin?

## ✅ Bạn đã set admin thành công trong database

Theo file CSV, bạn đã có:
- Email: `manhquydev@gmail.com`
- Role: `admin`
- Created: `2025-10-16`

## 🐛 Các nguyên nhân phổ biến

### 1. **Chưa logout/login lại** (90% trường hợp)

**Vấn đề:** Session cũ vẫn cache role cũ

**Giải pháp:**
```bash
1. Click vào avatar ở góc phải
2. Click "Đăng Xuất"
3. Đăng nhập lại bằng manhquydev@gmail.com
4. Kiểm tra lại header
```

### 2. **RLS Policies chưa đúng**

**Kiểm tra:** Vào Supabase SQL Editor, chạy:

```sql
-- Kiểm tra user_id của bạn
SELECT id, email FROM auth.users WHERE email = 'manhquydev@gmail.com';

-- Kiểm tra role trong database
SELECT * FROM user_roles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'manhquydev@gmail.com'
);

-- Test RLS policy
SELECT * FROM user_roles;
```

**Nếu query thất bại:** RLS policies có vấn đề

**Giải pháp:** Chạy lại migration `004_create_user_roles.sql`

### 3. **Service Role Key chưa config**

**Kiểm tra:** File `.env.local` có đủ keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ← CẦN KEY NÀY!
```

**Lấy Service Role Key:**
1. Vào Supabase Dashboard
2. Settings > API
3. Copy `service_role` key (không phải `anon` key!)
4. Paste vào `.env.local`
5. Restart server: `npm run dev`

### 4. **Supabase Client cache**

**Giải pháp:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### 5. **Wrong Supabase Project**

**Kiểm tra:** URL trong `.env.local` có đúng project không?

```bash
# In ra URL đang dùng
grep SUPABASE_URL .env.local
```

So sánh với URL trong Supabase Dashboard

## 🔧 Debug Steps (Làm theo thứ tự)

### Step 1: Truy cập trang debug
```
http://localhost:3002/debug-role
```

Trang này sẽ hiển thị:
- ✅ User ID hiện tại
- ✅ Email
- ✅ Role từ database
- ✅ Kết quả `isAdmin()` check
- ✅ Error messages (nếu có)

### Step 2: Kiểm tra kết quả

#### ✅ **Nếu thấy "You are an admin!"**
→ Role đã đúng! Vấn đề là UI chưa update

**Fix:**
1. Logout
2. Login lại
3. Hard refresh (Ctrl + Shift + R)

#### ❌ **Nếu thấy "You are NOT an admin"**
→ Role chưa được lưu đúng

**Fix:** Chạy SQL này trong Supabase:

```sql
-- Lấy user_id
SELECT id FROM auth.users WHERE email = 'manhquydev@gmail.com';

-- Insert/Update role (thay 'YOUR_USER_ID' bằng id ở trên)
INSERT INTO user_roles (user_id, role, created_by)
VALUES ('YOUR_USER_ID', 'admin', 'YOUR_USER_ID')
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Verify
SELECT ur.*, u.email
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'manhquydev@gmail.com';
```

#### ⚠️ **Nếu thấy "Error querying user_roles table"**
→ Bảng `user_roles` chưa tồn tại hoặc RLS sai

**Fix:** Chạy lại migration đầy đủ (xem `ADMIN_QUICK_START.md`)

### Step 3: Check Header Component

Sau khi fix, kiểm tra header:

```typescript
// Trong components/layout/header.tsx
// Phải thấy logic này:

{isAdmin && (
  <span className="text-xs px-2 py-0.5 rounded-full gradient-1 text-white inline-block w-fit">
    Quản trị
  </span>
)}
```

Nếu `isAdmin = true` nhưng vẫn không thấy badge → Kiểm tra component render

### Step 4: Check Layout

```typescript
// Trong app/layout.tsx
// Phải có:

const isAdmin = user ? await isCurrentUserAdmin() : false

<Header user={user} isAdmin={isAdmin} isModerator={isModerator} />
```

## 🎯 Quick Fix Script

Chạy script này để auto-fix:

```sql
-- 1. Kiểm tra user tồn tại
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'manhquydev@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ User not found! Please register first.';
  ELSE
    RAISE NOTICE '✅ User found: %', v_user_id;

    -- Upsert role
    INSERT INTO user_roles (user_id, role, created_by)
    VALUES (v_user_id, 'admin', v_user_id)
    ON CONFLICT (user_id)
    DO UPDATE SET role = 'admin', updated_at = NOW();

    RAISE NOTICE '✅ Role set to admin!';
  END IF;
END $$;

-- 2. Verify
SELECT
  u.email,
  ur.role,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'manhquydev@gmail.com';
```

## 📊 Expected Results

Sau khi fix xong, bạn phải thấy:

### ✅ Trong Header
```
┌─────────────────────────────────────┐
│  🏠 Dòng Thời Gian   📸 Upload       │
│                                      │
│              👑 Quản Trị    [Avatar] │
│                      ↑               │
│              NÚT NÀY PHẢI HIỆN       │
└─────────────────────────────────────┘
```

### ✅ Trong User Dropdown
```
┌─────────────────────────┐
│  manhquydev@gmail.com   │
│  [🔴 Quản trị]          │ ← Badge này
│  ───────────────────    │
│  👤 Hồ sơ               │
│  ───────────────────    │
│  🚪 Đăng Xuất           │
└─────────────────────────┘
```

### ✅ URL Access
- ✅ `/admin` → Admin Dashboard (OK)
- ✅ `/admin/users` → User Management (OK)
- ✅ `/admin/analytics` → Analytics (OK)
- ❌ `/moderator` → Redirect (Admin dùng `/admin` thay vì)

## 🔥 Nuclear Option (Nếu tất cả đều fail)

```bash
# 1. Stop server
# Ctrl + C

# 2. Clear everything
rm -rf .next
rm -rf node_modules/.cache

# 3. Restart
npm run dev

# 4. In Supabase SQL Editor
DELETE FROM user_roles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'manhquydev@gmail.com'
);

INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'manhquydev@gmail.com';

# 5. Logout from app completely
# 6. Clear browser cache (Ctrl + Shift + Del)
# 7. Login again
# 8. Visit http://localhost:3002/debug-role
```

## 📞 Need Help?

1. Truy cập: `http://localhost:3002/debug-role`
2. Screenshot kết quả
3. Check console logs (F12)
4. Check Network tab (F12) → Xem API calls to `/api/admin/*`

## ✅ Verification Checklist

- [ ] User đã đăng ký và có thể login
- [ ] Table `user_roles` đã được tạo trong Supabase
- [ ] Role 'admin' đã được insert cho user
- [ ] `.env.local` có đủ 3 keys (URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Đã logout và login lại
- [ ] Đã clear cache (Ctrl + Shift + R)
- [ ] `/debug-role` shows "You are an admin!"
- [ ] Header shows "Quản Trị" button
- [ ] Can access `/admin` without redirect

---

**Nếu vẫn không được, hãy:**
1. Share screenshot của `/debug-role`
2. Share output từ SQL query verify
3. Check browser console errors
