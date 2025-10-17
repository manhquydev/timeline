# 🎯 Hướng Dẫn Setup Hệ Thống Admin Hoàn Chỉnh

## 📋 Tổng Quan

Dự án **Company Memory Timeline** đã được nâng cấp với hệ thống quản trị đầy đủ, bao gồm:
- ✅ Admin Dashboard với Analytics
- ✅ User Management (quản lý người dùng & roles)
- ✅ Moderator Dashboard (kiểm duyệt nội dung)
- ✅ Event Management (quản lý sự kiện)
- ✅ Content Approval System (duyệt bài đăng)

---

## 🔐 Phân Quyền Hệ Thống

### 1. **User (Người dùng thông thường)**
- ✅ Xem tất cả events và posts đã được duyệt
- ✅ Upload ảnh vào events đang mở
- ✅ Thêm lời nhắn kèm ảnh (nếu event cho phép)
- ❌ Không được tạo events
- ❌ Không được duyệt/xóa bài đăng

### 2. **Moderator (Người kiểm duyệt)**
- ✅ Tất cả quyền của User
- ✅ Truy cập Moderator Dashboard (`/moderator`)
- ✅ Duyệt/từ chối bài đăng của users
- ✅ Xem thống kê posts theo status
- ❌ Không được tạo/sửa/xóa events
- ❌ Không được quản lý users

### 3. **Admin (Quản trị viên)**
- ✅ Tất cả quyền của Moderator
- ✅ Truy cập Admin Dashboard (`/admin`)
- ✅ Tạo/sửa/xóa events
- ✅ Quản lý tất cả users (thêm/sửa/xóa)
- ✅ Thay đổi roles của users
- ✅ Xem analytics và thống kê chi tiết
- ✅ Toàn quyền với mọi dữ liệu

### 4. **Super Admin (Quản trị cấp cao)**
- ✅ Tất cả quyền của Admin
- ✅ Quyền cao nhất trong hệ thống
- 🔒 Không thể bị xóa bởi Admin thông thường

### 5. **Guest (Khách chưa đăng ký)**
- ✅ Chỉ xem events và posts đã được duyệt
- ❌ Không được upload ảnh
- ❌ Không được tương tác với hệ thống

---

## 🚀 Bước 1: Setup Database & Roles

### 1.1. Chạy Migration User Roles

Truy cập **Supabase Dashboard > SQL Editor** và chạy:

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

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger: Tự động tạo role 'user' cho user mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.2. Thêm Admin Đầu Tiên

**Bước 1:** Đăng ký tài khoản qua ứng dụng (`http://localhost:3000/login`)

**Bước 2:** Sau khi đăng nhập, quay lại Supabase SQL Editor và chạy:

```sql
-- Thay 'your-email@company.com' bằng email bạn vừa đăng ký
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'your-email@company.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();
```

**Bước 3:** Kiểm tra:
```sql
SELECT
  ur.role,
  u.email,
  ur.created_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin');
```

---

## 📱 Bước 2: Truy Cập Admin Dashboard

### Sau khi setup xong:

1. **Đăng xuất và đăng nhập lại** để load lại permissions
2. Truy cập: `http://localhost:3000/admin`
3. Bạn sẽ thấy:
   - ✅ Nút **"Quản Trị"** trên header
   - ✅ Badge **"Quản trị"** trong dropdown menu
   - ✅ Admin Dashboard với các tính năng:
     - 📊 Thống kê tổng quan
     - 👥 Quản lý người dùng
     - 📈 Analytics & Reports
     - 📝 Quản lý nội dung
     - 📅 Tạo/sửa/xóa events

---

## 🎨 Các Tính Năng Đã Xây Dựng

### 1. **Admin Dashboard** (`/admin`)
- **Thống kê tổng quan**: Tổng events, photos, contributors, events đang mở
- **Quick Actions**: Buttons nhanh đến các trang quản lý
- **Events List**: Danh sách tất cả events với status và thống kê

**Các nút chức năng:**
- 🔵 **Thống Kê** → `/admin/analytics`
- 🔵 **Quản Lý User** → `/admin/users`
- 🔵 **Quản Lý Nội Dung** → `/admin/posts`
- 🟢 **Tạo Sự Kiện** → `/admin/events/create`

### 2. **Analytics Dashboard** (`/admin/analytics`)
Features:
- 📊 **Posts Over Time**: Biểu đồ bar chart uploads 14 ngày gần nhất
- 🥧 **Events by Status**: Pie chart trạng thái events
- 📈 **Posts by Status**: Thống kê posts (pending/approved/rejected)
- 🏆 **Top 10 Contributors**: Xếp hạng người upload nhiều nhất
- 📉 **Growth Metrics**: Tăng trưởng 30 ngày (posts, events)
- ⚡ **Quick Actions**: Shortcut đến các trang quan trọng

### 3. **User Management** (`/admin/users`)
Features:
- 👥 **User List**: Danh sách tất cả users với avatar, email, role
- 🔍 **Search & Filter**: Tìm kiếm theo email/tên, lọc theo role
- 🎨 **Role Badges**: Visual badges cho từng role (color-coded)
- ⚙️ **Role Management**: Dropdown menu để thay đổi role:
  - User → Moderator
  - Moderator → Admin
  - Admin → Super Admin
- 🗑️ **Delete Users**: Xóa user (không thể xóa chính mình)
- 📊 **User Stats**: Total users, admins, moderators, active users

### 4. **Moderator Dashboard** (`/moderator`)
Features:
- 📑 **Tabs Navigation**: Pending / Approved / Rejected
- 🖼️ **Image Grid**: Gallery view với thumbnails
- 👁️ **Quick Preview**: Hover để xem nhanh
- ⚡ **Bulk Actions**: Duyệt/từ chối nhanh
- 🔍 **Detail View**: Dialog xem chi tiết bài đăng
- 📊 **Stats Cards**: Count theo từng status

**Workflow kiểm duyệt:**
1. User uploads ảnh → Status: `pending`
2. Moderator xem ảnh trong tab "Chờ Duyệt"
3. Click "Duyệt" → Status: `approved` (hiển thị công khai)
4. Click "Từ Chối" → Status: `rejected` (ẩn khỏi timeline)

### 5. **Content Management** (`/admin/posts`)
- Tương tự Moderator Dashboard nhưng Admin có thêm quyền:
  - ✅ Xóa vĩnh viễn bài đăng
  - ✅ Edit thông tin post
  - ✅ Force approve/reject

### 6. **Event Management** (`/admin/events/create`)
Form tạo event với fields:
- **Tên Sự Kiện** (required)
- **URL Slug** (auto-generate từ tên)
- **Mô Tả**
- **Ngày Sự Kiện** (required)
- **Ngày Bắt Đầu** (required)
- **Ngày Kết Thúc**
- **Trạng Thái**: Draft / Open / Closed / Archived
- **Permissions**: Allow upload, Allow wishes

---

## 🔐 API Routes Đã Tạo

### 1. **User Management API** (`/api/admin/users`)

**GET** - Lấy danh sách users:
```typescript
GET /api/admin/users
Response: {
  users: Array<{
    id: string
    email: string
    full_name: string | null
    role: 'user' | 'moderator' | 'admin' | 'super_admin'
    total_uploads: number
    last_sign_in_at: string | null
  }>
  total: number
}
```

**PATCH** - Cập nhật role:
```typescript
PATCH /api/admin/users
Body: {
  userId: string
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
}
```

**DELETE** - Xóa user:
```typescript
DELETE /api/admin/users?userId=xxx
```

### 2. **Posts Management API** (`/api/admin/posts`)

**GET** - Lấy tất cả posts (đã có)

**PATCH** - Cập nhật status (đã có):
```typescript
PATCH /api/admin/posts
Body: {
  postId: string
  status: 'approved' | 'rejected'
}
```

### 3. **Events API** (`/api/admin/events`)

**POST** - Tạo event mới (đã có)

**PATCH** - Cập nhật event

**DELETE** - Xóa event

---

## 🧪 Testing Checklist

### Test Admin Features:
- [ ] Login với admin account
- [ ] Truy cập `/admin` - Thấy dashboard
- [ ] Truy cập `/admin/users` - Thấy user list
- [ ] Thay đổi role của 1 user → Refresh → Check role đã đổi
- [ ] Xóa 1 user (test user) → Verify đã xóa
- [ ] Truy cập `/admin/analytics` - Thấy charts
- [ ] Truy cập `/admin/events/create` - Tạo event mới
- [ ] Upload ảnh vào event → Check status `pending`

### Test Moderator Features:
- [ ] Tạo moderator account (via admin panel)
- [ ] Login với moderator account
- [ ] Truy cập `/moderator` - Thấy dashboard
- [ ] Kiểm tra có bài đăng pending
- [ ] Duyệt 1 bài → Verify status `approved`
- [ ] Từ chối 1 bài → Verify status `rejected`
- [ ] Verify moderator KHÔNG thấy `/admin` trong menu

### Test User Features:
- [ ] Login với user thông thường
- [ ] Truy cập `/upload` - Upload được ảnh
- [ ] Verify KHÔNG thấy nút "Quản Trị" hoặc "Kiểm Duyệt"
- [ ] Thử truy cập `/admin` → Redirect về `/`
- [ ] Thử truy cập `/moderator` → Redirect về `/`

### Test Guest (Chưa đăng nhập):
- [ ] Logout khỏi ứng dụng
- [ ] Xem timeline - Chỉ thấy posts `approved`
- [ ] Verify KHÔNG thấy nút "Upload"
- [ ] Thử truy cập `/upload` → Redirect về `/login`
- [ ] Thử truy cập `/admin` → Redirect về `/login`

---

## 🎨 UI/UX Design Highlights

### Thiết Kế Theo Best Practices 2025:

1. **Clean & Minimalist**
   - Ample white space
   - Limited color palette (gradient-1 to gradient-4)
   - Consistent button/icon styles

2. **Responsive Design**
   - Mobile-first approach
   - Touch-optimized buttons
   - Collapsible sidebar on mobile

3. **Visual Feedback**
   - Hover effects (`hover-lift`, `hover-glow`)
   - Loading states (spinner)
   - Animated entries (`animate-scale-in`, `animate-slide-in`)
   - Badge colors theo status

4. **Data Visualization**
   - Bar charts với gradient backgrounds
   - Progress bars với smooth transitions
   - Color-coded role badges
   - Stats cards với icons

5. **Accessibility**
   - Clear labels
   - Descriptive button text
   - Keyboard navigation support
   - High contrast colors

---

## 📝 Quản Lý Admin Sau Setup

### Thêm Admin Mới:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'new-admin@company.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### Thêm Moderator:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'moderator'
FROM auth.users
WHERE email = 'moderator@company.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'moderator', updated_at = NOW();
```

### Hạ Cấp Admin Xuống User:
```sql
UPDATE user_roles
SET role = 'user', updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'demote@company.com'
);
```

### Xem Tất Cả Admins:
```sql
SELECT
  ur.role,
  u.email,
  u.created_at as "Đăng ký lúc",
  ur.created_at as "Phong admin lúc"
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.created_at DESC;
```

---

## 🔧 Troubleshooting

### Lỗi: "Unauthorized: Admin access required"
**Nguyên nhân:** User chưa có role admin trong database

**Giải pháp:**
1. Check role trong database:
```sql
SELECT * FROM user_roles WHERE user_id = 'your-user-id';
```
2. Nếu chưa có, chạy query thêm admin ở Bước 1.2

### Không thấy menu "Quản Trị"
**Giải pháp:**
1. Đăng xuất và đăng nhập lại
2. Clear cache trình duyệt (Ctrl+Shift+R)
3. Check database xem role đã được thêm chưa

### Lỗi: "Failed to fetch users"
**Nguyên nhân:** Supabase service role key chưa config

**Giải pháp:**
- Check `.env.local` có `SUPABASE_SERVICE_ROLE_KEY`
- Restart dev server: `npm run dev`

### Charts không hiển thị data
**Nguyên nhân:** Chưa có data trong MongoDB

**Giải pháp:**
1. Tạo vài events
2. Upload vài ảnh
3. Refresh analytics page

---

## 📚 File Structure

```
timeline/
├── app/
│   ├── admin/
│   │   ├── page.tsx                 # Admin Dashboard
│   │   ├── users/
│   │   │   └── page.tsx             # User Management
│   │   ├── analytics/
│   │   │   └── page.tsx             # Analytics Dashboard
│   │   ├── posts/
│   │   │   └── page.tsx             # Posts Management
│   │   └── events/
│   │       └── create/page.tsx      # Create Event
│   ├── moderator/
│   │   └── page.tsx                 # Moderator Dashboard
│   └── api/
│       └── admin/
│           ├── users/route.ts       # User Management API
│           ├── posts/route.ts       # Posts API
│           └── events/route.ts      # Events API
├── components/
│   ├── admin/
│   │   ├── user-management-list.tsx
│   │   ├── analytics-charts.tsx
│   │   └── post-management-list.tsx
│   ├── moderator/
│   │   └── moderator-post-list.tsx
│   └── layout/
│       └── header.tsx               # Updated with mod/admin badges
├── lib/
│   └── auth-utils.ts                # Role checking functions
└── docs/
    └── ADMIN_COMPLETE_GUIDE.md      # This file
```

---

## 🎯 Tổng Kết

Hệ thống admin đã hoàn thiện với:

✅ **3 cấp độ phân quyền rõ ràng** (User, Moderator, Admin)
✅ **5 trang admin chức năng đầy đủ**
✅ **User Management** với role assignment
✅ **Analytics Dashboard** với charts & stats
✅ **Moderator Workflow** cho content approval
✅ **API Routes** bảo mật với role checking
✅ **Responsive UI** theo best practices 2025
✅ **Documentation đầy đủ** cho setup & usage

**Next Steps:**
- 🔐 Setup production với secure env vars
- 📧 Thêm email notifications cho moderators
- 📊 Thêm export reports (CSV/PDF)
- 🌐 I18n support (English/Vietnamese)
- 📱 Native mobile app (React Native)

---

**Created:** December 2024
**Version:** 1.0.0
**Author:** AI Assistant + Project Team
