# Hướng Dẫn Triển Khai Hệ Thống Admin Role

## 📋 Tổng Quan

Hệ thống quản lý admin được triển khai bằng cách sử dụng bảng `user_roles` trong Supabase để lưu trữ vai trò của người dùng.

## 🎯 Các Role Có Sẵn

- **user** (mặc định): Người dùng thông thường, có thể tải ảnh lên
- **moderator**: Người kiểm duyệt, có thể duyệt bài đăng
- **admin**: Quản trị viên, có thể quản lý sự kiện
- **super_admin**: Quản trị viên cấp cao, toàn quyền truy cập

## 🚀 Bước 1: Chạy Migration

### Trên Supabase Dashboard:

1. Truy cập **SQL Editor** trên Supabase Dashboard
2. Mở file `supabase/migrations/004_create_user_roles.sql`
3. Copy toàn bộ nội dung và paste vào SQL Editor
4. Nhấn **Run** để thực thi

### Hoặc qua CLI (nếu đã setup Supabase CLI):

```bash
cd "C:\Users\manhq\Downloads\clone 2\timeline"
supabase db push
```

## 👤 Bước 2: Thêm Admin Đầu Tiên

### Cách 1: Qua Supabase Dashboard (Khuyến nghị)

1. Truy cập **SQL Editor**
2. Mở file `supabase/migrations/005_add_first_admin.sql`
3. Tìm dòng:
   ```sql
   WHERE email = 'your-email@company.com'
   ```
4. Thay `your-email@company.com` bằng **email bạn đã đăng ký** trong ứng dụng
5. Run các query sau theo thứ tự:

```sql
-- Bước 1: Kiểm tra user của bạn đã tồn tại chưa
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your-email@company.com';

-- Bước 2: Thêm role admin
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'your-email@company.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Bước 3: Kiểm tra đã thêm thành công
SELECT
  ur.role,
  u.email,
  ur.created_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin');
```

### Cách 2: Nếu chưa có tài khoản

1. Đăng nhập vào ứng dụng trước: http://localhost:3001/login
2. Nhập email và nhận magic link
3. Sau khi đăng nhập thành công, quay lại Supabase Dashboard
4. Làm theo **Cách 1** ở trên

## ✅ Bước 3: Kiểm Tra Hoạt Động

1. Truy cập: http://localhost:3001
2. Đăng nhập bằng email admin
3. Sau khi đăng nhập, bạn sẽ thấy:
   - Nút **"Quản Trị"** trên header
   - Badge **"Quản trị"** bên cạnh tên
4. Click vào **"Quản Trị"** để truy cập Admin Dashboard

## 📊 Bước 4: Quản Lý Admin (Tùy Chọn)

### Thêm admin mới:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'new-admin@company.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### Thêm nhiều admin cùng lúc:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email IN (
  'admin1@company.com',
  'admin2@company.com',
  'admin3@company.com'
)
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### Xem tất cả admin:

```sql
SELECT
  ur.role,
  u.email,
  u.created_at as "Đăng ký lúc",
  ur.created_at as "Được phong admin lúc"
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.created_at DESC;
```

### Hạ cấp admin xuống user:

```sql
UPDATE user_roles
SET role = 'user', updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user-to-demote@company.com'
);
```

### Xóa admin khỏi hệ thống:

```sql
DELETE FROM user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user-to-remove@company.com'
);
```

## 🔒 Bảo Mật

### Các chính sách đã được thiết lập:

1. ✅ **Tự động tạo role 'user'** khi có người đăng ký mới
2. ✅ **User chỉ có thể xem role của chính mình**
3. ✅ **Chỉ admin mới xem được role của người khác**
4. ✅ **Chỉ admin mới có thể thay đổi role**
5. ✅ **Trigger tự động cập nhật updated_at**

## 🛠️ Helper Functions Có Sẵn

File: `lib/auth-utils.ts`

```typescript
// Kiểm tra user hiện tại có phải admin không
const isAdmin = await isCurrentUserAdmin()

// Lấy role của user hiện tại
const role = await getCurrentUserRole()

// Kiểm tra một user cụ thể
const isUserAdmin = await isAdmin(userId)
const isUserModerator = await isModerator(userId)

// Cập nhật role (chỉ admin mới được phép)
await updateUserRole(userId, 'admin')

// Lấy danh sách tất cả user với role
const usersWithRoles = await getAllUsersWithRoles()
```

## 🐛 Troubleshooting

### Lỗi: "Migration failed"
- Kiểm tra kết nối Supabase
- Đảm bảo đã có quyền admin trong Supabase Dashboard

### Không thấy menu "Quản Trị"
1. Kiểm tra user đã được thêm vào `user_roles`:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'your-user-id';
   ```
2. Đăng xuất và đăng nhập lại
3. Clear cache trình duyệt (Ctrl+Shift+R)

### Lỗi: "Unauthorized: Admin access required"
- User chưa có role 'admin' trong database
- Chạy lại query thêm admin ở Bước 2

## 📝 Notes

- Migration tự động tạo role 'user' cho tất cả user mới
- User hiện tại (đã đăng ký trước khi có migration) cần được thêm role thủ công
- Để thêm role cho user cũ hàng loạt:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;
```

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành các bước trên:

- ✅ Bảng `user_roles` được tạo trong Supabase
- ✅ Các RLS policies được thiết lập
- ✅ User mới tự động có role 'user'
- ✅ Admin có thể truy cập /admin
- ✅ Admin có badge "Quản trị" trên header
- ✅ Hệ thống sẵn sàng mở rộng thêm roles
