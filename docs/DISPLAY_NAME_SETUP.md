# Display Name / Nickname Setup Guide

## Tổng Quan

Hệ thống **Display Name** cho phép người dùng:
- Đặt **biệt danh/nickname** để hiển thị trên ảnh thay vì tên thật
- Tự động hiển thị tên theo thứ tự ưu tiên: `display_name` > `full_name` > `email`
- Thay đổi tên hiển thị bất kỳ lúc nào qua trang Profile Settings

---

## 🚀 Hướng Dẫn Triển Khai

### Bước 1: Chạy Migration SQL

Chạy migration mới để thêm field `display_name` và cập nhật trigger:

```bash
# Option 1: Thông qua Supabase CLI
supabase db push

# Option 2: Copy nội dung file và chạy trong Supabase Dashboard > SQL Editor
```

File migration: `supabase/migrations/006_add_display_name_and_auto_profile.sql`

**Migration này sẽ:**
1. ✅ Thêm column `display_name` vào bảng `user_profiles`
2. ✅ Tạo index cho tra cứu nhanh
3. ✅ Cập nhật trigger `handle_new_user()` để tự động tạo `user_profiles` khi đăng ký
4. ✅ Backfill tất cả user hiện tại (tạo profile cho user cũ chưa có)

### Bước 2: Verify Migration

Kiểm tra trong Supabase Dashboard:

```sql
-- Kiểm tra column display_name đã được thêm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles';

-- Kiểm tra trigger đã được cập nhật
SELECT tgname, tgrelid::regclass, tgfoid::regproc
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Kiểm tra tất cả user đã có profile
SELECT
  u.email,
  up.display_name,
  up.full_name,
  CASE
    WHEN up.id IS NULL THEN '❌ Missing Profile'
    ELSE '✅ Has Profile'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id;
```

### Bước 3: Test Tính Năng

1. **Test User Mới:**
   - Đăng ký tài khoản mới qua magic link
   - Verify `user_profiles` được tạo tự động
   - Upload ảnh → kiểm tra tên hiển thị (sẽ dùng email làm mặc định)

2. **Test Đặt Biệt Danh:**
   - Login vào hệ thống
   - Click vào Avatar (góc phải) → chọn "Cài đặt tên hiển thị"
   - Nhập biệt danh (VD: "Tony Stark", "Sếp Tèo")
   - Lưu và upload ảnh mới
   - Verify tên mới xuất hiện trên ảnh

3. **Test Thứ Tự Ưu Tiên:**
   - Case 1: Chỉ có `display_name` → hiển thị `display_name`
   - Case 2: Có cả `display_name` và `full_name` → hiển thị `display_name`
   - Case 3: Chỉ có `full_name` → hiển thị `full_name`
   - Case 4: Không có gì → hiển thị phần trước @ của email

---

## 📁 Files Đã Thay Đổi

### 1. Database Schema
- ✅ `supabase/migrations/006_add_display_name_and_auto_profile.sql` - Migration mới

### 2. Backend (API)
- ✅ `app/api/upload/route.ts` - Cập nhật logic lấy tên người dùng (dòng 48-59)
- ✅ `app/api/profile/update/route.ts` - API mới để cập nhật profile

### 3. Frontend (UI)
- ✅ `app/profile/settings/page.tsx` - Trang cài đặt profile
- ✅ `components/profile/profile-settings-form.tsx` - Form component
- ✅ `components/layout/header.tsx` - Thêm menu item "Cài đặt tên hiển thị"

### 4. TypeScript Types
- ✅ `lib/types.ts` - Thêm `display_name` vào interface `UserProfile`

### 5. Display Logic
- ⚠️ **Không thay đổi:** `components/photos/photo-grid.tsx` - Logic hiển thị đã hoạt động đúng

---

## 🔧 Cách Hoạt Động

### Flow Đăng Ký User Mới

```
1. User nhập email → Supabase gửi magic link
2. User click link → Supabase tạo record trong auth.users
3. Trigger `on_auth_user_created` được kích hoạt
4. Function `handle_new_user()` chạy:
   - Tạo record trong `user_roles` (role = 'user')
   - Tạo record trong `user_profiles` (email, full_name từ metadata, display_name = NULL)
5. User có thể upload ngay lập tức
```

### Flow Upload Ảnh

```
1. User chọn ảnh và nhấn Upload
2. API `/api/upload` nhận request
3. Query user_profiles: SELECT display_name, full_name, email
4. Xác định tên hiển thị:
   - Nếu có display_name → dùng display_name
   - Nếu không có display_name nhưng có full_name → dùng full_name
   - Nếu không có cả 2 → dùng email.split('@')[0]
   - Nếu không có gì (edge case) → dùng 'Anonymous'
5. Lưu Post với user_name đã xác định
6. PhotoGrid hiển thị "bởi {user_name}"
```

### Flow Đổi Tên Hiển Thị

```
1. User click Avatar → "Cài đặt tên hiển thị"
2. Hiển thị form với:
   - Biệt danh hiện tại (display_name)
   - Tên thật hiện tại (full_name)
   - Email (read-only)
   - Preview tên sẽ hiển thị
3. User nhập biệt danh mới → Lưu
4. API `/api/profile/update` cập nhật user_profiles
5. Các ảnh mới sẽ dùng tên mới
6. Ảnh cũ GIỮ NGUYÊN tên cũ (tính năng này đúng design)
```

---

## ❓ Troubleshooting

### Issue 1: User cũ không có profile

**Triệu chứng:** Upload lỗi "user_profiles not found"

**Giải pháp:**
```sql
-- Chạy lại backfill trong migration
INSERT INTO user_profiles (id, email, full_name, display_name)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' AS full_name,
  NULL AS display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
```

### Issue 2: Tên vẫn hiển thị "Anonymous"

**Kiểm tra:**
```sql
-- Check data trong user_profiles
SELECT id, email, full_name, display_name
FROM user_profiles
WHERE id = 'USER_ID_HERE';

-- Check data trong posts
SELECT id, user_id, user_name, media_url
FROM posts
WHERE user_id = 'USER_ID_HERE'
ORDER BY uploaded_at DESC
LIMIT 5;
```

**Nguyên nhân có thể:**
- User_profiles không có data → chạy backfill
- Upload API không query đúng field → check code app/api/upload/route.ts
- Posts cũ có user_name = NULL → đây là expected (chỉ ảnh mới có tên)

### Issue 3: Trigger không chạy khi đăng ký user mới

**Kiểm tra:**
```sql
-- Verify trigger exists và enabled
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Test trigger manually
SELECT public.handle_new_user();

-- Check function definition
\df+ public.handle_new_user
```

### Issue 4: Link "Cài đặt tên hiển thị" không xuất hiện

**Nguyên nhân:** User chưa login hoặc Header component không nhận được user prop

**Giải pháp:**
- Logout và login lại
- Clear browser cache
- Check `components/layout/header.tsx` đã được update

---

## 🎯 Best Practices

### 1. Naming Convention
- **display_name:** Biệt danh/nickname (VD: "Tony", "Sếp Tèo", "BinhMinh")
- **full_name:** Họ tên thật (VD: "Nguyễn Văn A")
- Cho phép user dùng emoji trong display_name nếu muốn

### 2. Privacy
- Không bắt buộc phải điền full_name
- Display_name cho phép user giấu tên thật
- Email không hiển thị công khai (chỉ phần trước @)

### 3. Data Consistency
- Tên trên ảnh **không tự động cập nhật** khi user đổi tên (by design)
- Mỗi post lưu snapshot của `user_name` tại thời điểm upload
- Lý do: Giữ tính chân thực của timeline (ai đăng thì tên đó)

---

## 📊 Database Schema

### user_profiles Table

| Column        | Type | Nullable | Description |
|--------------|------|----------|-------------|
| id           | UUID | NO       | Foreign key to auth.users (Primary Key) |
| email        | TEXT | YES      | User email từ Supabase Auth |
| full_name    | TEXT | YES      | Họ tên thật |
| **display_name** | **TEXT** | **YES** | **Biệt danh/nickname (NEW)** |
| avatar_url   | TEXT | YES      | URL ảnh đại diện |
| total_uploads | INT | NO      | Số ảnh đã upload (default: 0) |
| created_at   | TIMESTAMPTZ | NO | Thời gian tạo |

---

## 🔄 Migration Rollback (Nếu Cần)

Nếu cần rollback migration:

```sql
-- Remove display_name column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS display_name;

-- Remove index
DROP INDEX IF EXISTS idx_user_profiles_display_name;

-- Revert handle_new_user function to old version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**⚠️ Lưu ý:** Rollback sẽ mất tất cả display_name đã set!

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trong Supabase Dashboard
2. Verify migration đã chạy thành công
3. Test với user mới trước
4. Check browser console cho lỗi API

---

**Last Updated:** 2025-10-18
**Version:** 1.0.0
