# 🚀 Quick Start: Admin Setup (5 phút)

## ✨ Tổng Quan Hệ Thống

Hệ thống **Company Memory Timeline** đã được nâng cấp hoàn chỉnh với:

| Role | Dashboard | Quyền Chính |
|------|-----------|-------------|
| 👤 **User** | - | Upload ảnh, xem timeline |
| 🛡️ **Moderator** | `/moderator` | Duyệt bài đăng |
| 👑 **Admin** | `/admin` | Quản lý toàn bộ (users, events, posts) |
| 🔥 **Super Admin** | `/admin` | Admin + quyền cao nhất |
| 👁️ **Guest** | - | Chỉ xem (không upload) |

---

## ⚡ Setup Nhanh (3 Bước)

### Bước 1: Chạy Migration (1 phút)

Vào **Supabase Dashboard > SQL Editor**, chạy file:
```
supabase/migrations/004_create_user_roles.sql
```

Hoặc copy-paste SQL này:

```sql
-- Tạo bảng user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON user_roles FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Only admins can manage roles" ON user_roles FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Trigger: Auto tạo role 'user' cho user mới
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

✅ **Done!** Bảng `user_roles` đã được tạo.

---

### Bước 2: Thêm Admin Đầu Tiên (2 phút)

**2.1.** Đăng ký tài khoản qua app:
```
http://localhost:3000/login
```
Nhập email → Nhận magic link → Login

**2.2.** Quay lại **Supabase SQL Editor**, chạy:

```sql
-- Thay 'your-email@company.com' bằng email bạn vừa đăng ký
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'your-email@company.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', updated_at = NOW();
```

**2.3.** Verify:
```sql
SELECT ur.role, u.email, ur.created_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin');
```

✅ **Done!** Bạn đã là Admin!

---

### Bước 3: Đăng Nhập Admin (1 phút)

1. **Logout** khỏi app (nếu đang login)
2. **Login lại** bằng email admin
3. Bạn sẽ thấy:
   - ✅ Nút **"Quản Trị"** trên header
   - ✅ Badge **"Quản trị"** màu gradient

4. Click **"Quản Trị"** → Truy cập: `/admin`

✅ **Done!** Admin dashboard đã sẵn sàng!

---

## 🎯 Các Trang Đã Xây Dựng

### 1. **Admin Dashboard** `/admin`
- 📊 Thống kê: Events, Photos, Contributors
- 🔗 Quick links: Analytics, Users, Posts, Create Event

### 2. **User Management** `/admin/users`
- 👥 Danh sách tất cả users
- 🔍 Search & filter by role
- ⚙️ Change roles (User → Moderator → Admin)
- 🗑️ Delete users

### 3. **Analytics Dashboard** `/admin/analytics`
- 📈 Posts over time (14 days chart)
- 🥧 Events by status (pie chart)
- 📊 Posts by status
- 🏆 Top 10 contributors

### 4. **Moderator Dashboard** `/moderator`
- 📑 Tabs: Pending / Approved / Rejected
- 👁️ Preview posts
- ✅ Approve / ❌ Reject
- 📊 Stats by status

### 5. **Content Management** `/admin/posts`
- Same as Moderator + Admin powers

### 6. **Event Management** `/admin/events/create`
- Tạo events mới
- Set status: Draft / Open / Closed / Archived
- Config permissions

---

## 🎨 Screenshots

### Admin Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  📊 Bảng Điều Khiển Quản Trị                             │
│  [Thống Kê] [Quản Lý User] [Nội Dung] [➕ Tạo Sự Kiện]  │
├─────────────────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐               │
│  │ 12    │ │ 345   │ │ 28    │ │ 5     │               │
│  │ Events│ │ Photos│ │ Users │ │ Open  │               │
│  └───────┘ └───────┘ └───────┘ └───────┘               │
├─────────────────────────────────────────────────────────┤
│  📅 Tất Cả Sự Kiện                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Team Building Q4  [Mở]  📅 Dec 15  📸 45  👥 12 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### User Management
```
┌─────────────────────────────────────────────────────────┐
│  👥 Quản Lý Người Dùng                                   │
│  [Tổng: 28] [Admins: 2] [Moderators: 3] [Active: 18]   │
├─────────────────────────────────────────────────────────┤
│  🔍 [Search...]  [Filter by role ▼]                     │
├─────────────────────────────────────────────────────────┤
│  👤 John Doe          🔵 Admin         📧 john@co.com   │
│     └─ 45 uploads     🎂 Joined Dec 2024               │
│                       [⚙️ Change Role ▼]                │
│  ────────────────────────────────────────────────       │
│  👤 Jane Smith        🟢 Moderator    📧 jane@co.com   │
│     └─ 23 uploads     🎂 Joined Dec 2024               │
│                       [⚙️ Change Role ▼]                │
└─────────────────────────────────────────────────────────┘
```

### Moderator Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  🛡️ Bảng Điều Khiển Kiểm Duyệt                          │
│  [⏳ Chờ Duyệt: 12] [✅ Đã Duyệt: 245] [❌ Từ Chối: 3]  │
├─────────────────────────────────────────────────────────┤
│  Tabs: [⏳ Chờ Duyệt] [✅ Đã Duyệt] [❌ Đã Từ Chối]     │
├─────────────────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐              │
│  │ 📸    │ │ 📸    │ │ 📸    │ │ 📸    │              │
│  │       │ │       │ │       │ │       │              │
│  │[✅][❌]│ │[✅][❌]│ │[✅][❌]│ │[✅][❌]│              │
│  └───────┘ └───────┘ └───────┘ └───────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Commands Hữu Ích

### Thêm Moderator:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'moderator' FROM auth.users
WHERE email = 'mod@company.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'moderator';
```

### Thêm Admin:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE email = 'admin@company.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Xem Tất Cả Admins:
```sql
SELECT u.email, ur.role, ur.created_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.created_at DESC;
```

### Hạ Cấp User:
```sql
UPDATE user_roles SET role = 'user', updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'downgrade@co.com');
```

---

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Không thấy nút "Quản Trị" | Logout → Login lại → Clear cache (Ctrl+Shift+R) |
| "Unauthorized: Admin access required" | Check database: `SELECT * FROM user_roles WHERE user_id = 'xxx'` |
| Charts không có data | Tạo events + upload ảnh → Refresh page |
| Failed to fetch users | Check `.env.local` có `SUPABASE_SERVICE_ROLE_KEY` |

---

## 📚 Full Documentation

Xem hướng dẫn chi tiết: [`docs/ADMIN_COMPLETE_GUIDE.md`](./ADMIN_COMPLETE_GUIDE.md)

---

## ✅ Checklist Hoàn Thành

- [x] ✅ Migration user_roles table
- [x] ✅ Thêm admin đầu tiên
- [x] ✅ Login và verify admin badge
- [x] ✅ Truy cập `/admin` dashboard
- [x] ✅ Test user management
- [x] ✅ Test analytics dashboard
- [x] ✅ Test moderator workflow
- [x] ✅ Test event creation
- [x] ✅ Test content approval

---

## 🎉 Kết Quả

Sau khi setup xong, bạn có:

✨ **Hệ thống admin hoàn chỉnh** với 5 roles rõ ràng
✨ **6 trang admin** chức năng đầy đủ
✨ **User management** với role assignment UI
✨ **Analytics dashboard** với charts đẹp
✨ **Moderator workflow** cho content approval
✨ **API routes** bảo mật với role checking
✨ **Responsive UI** theo best practices

**Total Setup Time:** ~5 phút ⏱️

---

**🚀 Ready to Go!** Start managing your timeline now!
