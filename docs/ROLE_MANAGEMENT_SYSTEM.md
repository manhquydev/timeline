# Role Management System - Hệ Thống Quản Lý Phân Quyền

## 📋 Tổng Quan

Hệ thống phân quyền (Role-Based Access Control - RBAC) cho phép admin quản lý người dùng và phân quyền một cách linh hoạt, bao gồm khả năng **phân quyền ngang hàng** (peer-to-peer admin authorization).

## 🎯 Tính Năng Chính

### ✅ Đã Triển Khai (v1.2.0)

1. **Admin Client với Service Role Key**
   - Tạo `createAdminClient()` riêng để bypass RLS
   - Sử dụng Service Role Key cho các operations đặc quyền
   - Bảo mật cao với validation đầy đủ

2. **Phân Quyền Ngang Hàng (Peer-to-Peer)**
   - Admin có thể phân quyền admin cho người khác
   - Admin có thể cắt quyền admin của admin khác
   - Không thể tự thay đổi quyền của chính mình (self-protection)

3. **Audit Logging**
   - Ghi log mọi thay đổi quyền
   - Track người thực hiện thay đổi (`created_by`)
   - Timestamp cho mọi thao tác

4. **UI/UX Warnings**
   - Confirmation dialog khi thay đổi quyền admin
   - Cảnh báo rõ ràng về hậu quả của thay đổi
   - Hiển thị trực quan quyền cũ → quyền mới

5. **Security Features**
   - Prevent self-demotion (không thể tự hạ quyền)
   - Prevent self-deletion (không thể tự xóa)
   - Validate role trước mọi thay đổi

## 📊 Role Hierarchy

```
super_admin  (Toàn quyền - để sau triển khai)
    ↓
  admin      (Quản trị viên - có thể phân quyền ngang hàng)
    ↓
moderator    (Người kiểm duyệt - duyệt posts)
    ↓
  user       (Người dùng thường)
    ↓
  guest      (Khách - không auth)
```

## 🔧 Cách Sử Dụng

### 1. Lấy Danh Sách Người Dùng

Truy cập trang: `/admin/users`

**Tính năng:**
- Hiển thị tất cả người dùng với thông tin đầy đủ
- Search theo email hoặc tên
- Filter theo role
- Xem stats: total uploads, last sign in, created date

### 2. Thay Đổi Quyền Người Dùng

**Các bước:**
1. Click vào menu "..." bên cạnh tên user
2. Chọn role mới từ dropdown:
   - Người Dùng (user)
   - Người Kiểm Duyệt (moderator)
   - Quản Trị Viên (admin)
   - Quản Trị Cấp Cao (super_admin)
3. Nếu thay đổi liên quan đến admin → Hiện confirmation dialog
4. Xác nhận thay đổi

**⚠️ Lưu ý khi phân quyền Admin:**
- User mới có quyền admin sẽ có **toàn quyền** như bạn
- Họ có thể cắt quyền admin của bạn
- Họ có thể phân quyền admin cho người khác
- Hãy chỉ phân quyền cho người đáng tin cậy

**⚠️ Lưu ý khi cắt quyền Admin:**
- User bị cắt quyền sẽ **mất truy cập** vào trang admin
- Họ sẽ chỉ còn quyền của role mới được gán
- Hành động này có thể ảnh hưởng đến hoạt động quản trị

### 3. Xóa Người Dùng

**Các bước:**
1. Click vào menu "..." bên cạnh tên user
2. Chọn "Xóa Người Dùng" (màu đỏ)
3. Xác nhận trong dialog

**⚠️ Lưu ý:**
- Hành động này **không thể hoàn tác**
- Tất cả dữ liệu của user sẽ bị xóa (posts, uploads, etc.)
- Không thể xóa chính mình

## 🏗️ Kiến Trúc Hệ Thống

### 1. Backend Layer

**File: `lib/supabase/server.ts`**

```typescript
// Regular client (với user context)
const supabase = await createClient()

// Admin client (bypass RLS, toàn quyền)
const adminClient = createAdminClient()
```

**Khi nào dùng Admin Client:**
- ✅ Khi cần `auth.admin.listUsers()`
- ✅ Khi cần `auth.admin.deleteUser()`
- ✅ Khi cần bypass RLS để update roles
- ❌ KHÔNG dùng cho user-level operations
- ❌ KHÔNG dùng khi chưa validate admin permission

### 2. API Routes

**File: `/app/api/admin/users/route.ts`**

**GET** - Lấy danh sách users:
```typescript
const adminClient = createAdminClient()
const { data: { users } } = await adminClient.auth.admin.listUsers()
```

**PATCH** - Cập nhật role:
```typescript
// Security checks
if (userId === user.id) {
  return NextResponse.json({ error: 'Cannot change your own role' }, { status: 403 })
}

// Audit logging
console.log(`[ROLE_CHANGE] Admin ${user.email} changing user ${userId} from ${targetUserRole} to ${role}`)

// Update with admin client
const adminClient = createAdminClient()
await adminClient.from('user_roles').upsert({ ... })
```

**DELETE** - Xóa user:
```typescript
// Security checks
if (userId === user.id) {
  return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
}

// Delete with audit
const adminClient = createAdminClient()
await adminClient.auth.admin.deleteUser(userId)
```

### 3. Frontend Components

**File: `/app/admin/users/page.tsx`**
- Server component
- Fetch data song song (parallel)
- Pass `currentUserRole` cho component con

**File: `/components/admin/user-management-list.tsx`**
- Client component
- Handle user interactions
- Show confirmation dialogs
- Update via API calls

## 🔒 Security Best Practices

### 1. Always Validate Admin Permission

```typescript
// ✅ GOOD
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user || !(await isCurrentUserAdmin())) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}

// Sau đó mới dùng admin client
const adminClient = createAdminClient()
```

### 2. Prevent Self-Operations

```typescript
// ✅ GOOD
if (userId === currentUser.id) {
  throw new Error('Cannot modify your own role/account')
}
```

### 3. Audit Everything

```typescript
// ✅ GOOD
console.log(`[ROLE_CHANGE] Admin ${adminEmail} changed user ${userId} from ${oldRole} to ${newRole}`)

return {
  audit: {
    changed_by: adminEmail,
    changed_from: oldRole,
    changed_to: newRole,
    timestamp: new Date().toISOString()
  }
}
```

### 4. Never Trust Client Input

```typescript
// ✅ GOOD
const validRoles = ['user', 'moderator', 'admin', 'super_admin']
if (!validRoles.includes(role)) {
  throw new Error('Invalid role')
}
```

## 📈 Roadmap - Tính Năng Sắp Tới

### Phase 2: Super Admin (Chưa triển khai)

- [ ] Tạo role `super_admin` không thể bị cắt quyền
- [ ] Chỉ super admin mới có thể:
  - Phân quyền super admin
  - Cắt quyền super admin khác
  - Xóa admin khác
- [ ] UI riêng cho super admin dashboard

### Phase 3: Advanced Features

- [ ] Role permissions matrix (fine-grained permissions)
- [ ] Activity log viewer (xem lịch sử thay đổi)
- [ ] Bulk role updates
- [ ] Role templates
- [ ] Email notifications khi role thay đổi

## 🐛 Troubleshooting

### Lỗi: "SUPABASE_SERVICE_ROLE_KEY is not set"

**Nguyên nhân:** Thiếu Service Role Key trong `.env.local`

**Giải pháp:**
1. Mở Supabase Dashboard
2. Project Settings → API
3. Copy "service_role" key (secret)
4. Thêm vào `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```
5. Restart dev server

### Lỗi: "Không lấy được danh sách users"

**Nguyên nhân:** RLS policies blocking hoặc thiếu admin client

**Giải pháp:**
1. Kiểm tra user có role admin không (`/debug-role`)
2. Verify Service Role Key đã set
3. Check console logs để xem error cụ thể
4. Ensure đang dùng `createAdminClient()` cho admin operations

### Lỗi: "Cannot change your own role"

**Nguyên nhân:** Security feature - không thể tự thay đổi quyền của mình

**Giải pháp:**
- Đây là tính năng bảo mật, không phải bug
- Nhờ admin khác thay đổi quyền cho bạn
- Hoặc dùng Supabase Dashboard để update trực tiếp DB (development only)

## 📚 Related Documentation

- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Setup admin role lần đầu
- [ADMIN_COMPLETE_GUIDE.md](./ADMIN_COMPLETE_GUIDE.md) - Hướng dẫn admin toàn diện
- [CLAUDE.md](../CLAUDE.md) - Project overview

## 🎓 Best Practices Summary

1. ✅ **Luôn validate** admin permission trước khi dùng admin client
2. ✅ **Luôn log** mọi thay đổi quyền (audit trail)
3. ✅ **Luôn confirm** với user trước khi thay đổi admin role
4. ✅ **Không bao giờ** cho phép self-demotion/self-deletion
5. ✅ **Luôn validate** role input từ client
6. ✅ **Luôn dùng** admin client cho privileged operations
7. ✅ **Luôn show** clear warnings cho dangerous operations

---

**Version:** 1.2.0
**Last Updated:** 2025-01-18
**Author:** Claude Code Team
