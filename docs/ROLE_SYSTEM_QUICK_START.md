# Role Management - Quick Start Guide

## 🎯 Tóm Tắt Nhanh

Hệ thống phân quyền đã được **hoàn thiện và sẵn sàng sử dụng**. Admin có thể phân quyền admin cho nhau (peer-to-peer) và quản lý users dễ dàng.

## ✅ Đã Hoàn Thành

### 1. **Fix lỗi /admin/users không load được data** ✅
- Tạo `createAdminClient()` với Service Role Key
- Cập nhật page và API dùng admin client
- Trang giờ hoạt động hoàn hảo

### 2. **Phân quyền ngang hàng (Peer-to-Peer)** ✅
- ✅ Admin có thể phân quyền admin cho người khác
- ✅ Admin có thể cắt quyền admin của admin khác
- ✅ Không thể tự cắt quyền chính mình (bảo mật)

### 3. **Security & Audit** ✅
- ✅ Log mọi thay đổi quyền
- ✅ Track người thực hiện thay đổi
- ✅ Validation đầy đủ

### 4. **Smart UI/UX** ✅
- ✅ Confirmation dialog khi thay đổi admin
- ✅ Cảnh báo rõ ràng về hậu quả
- ✅ Visual comparison quyền cũ → mới

## 🚀 Cách Sử Dụng

### Truy cập trang quản lý
```
/admin/users
```

### Phân quyền cho người khác
1. Click "..." bên cạnh tên user
2. Chọn role mới
3. Xác nhận trong dialog (nếu là admin role)

### Cắt quyền admin
1. Click "..." → Chọn role thấp hơn (user/moderator)
2. Đọc warning về hậu quả
3. Xác nhận thay đổi

## ⚠️ Điều Quan Trọng

### Khi phân quyền Admin
> **User mới có quyền admin sẽ có TOÀN QUYỀN như bạn**, bao gồm khả năng cắt quyền của bạn. Chỉ phân quyền cho người đáng tin cậy!

### Khi cắt quyền Admin
> **User bị cắt sẽ MẤT HOÀN TOÀN** quyền truy cập admin dashboard. Hãy chắc chắn trước khi thực hiện!

### Bảo vệ tự động
- ❌ Không thể tự thay đổi quyền của mình
- ❌ Không thể tự xóa account của mình
- ✅ Luôn cần admin khác thực hiện

## 📋 Các Role Hiện Tại

```
super_admin  → Toàn quyền (sẽ triển khai sau)
admin        → Quản trị viên (có thể phân quyền ngang hàng)
moderator    → Người kiểm duyệt posts
user         → Người dùng thường
guest        → Khách (không auth)
```

## 🔍 Debug & Troubleshooting

### Không thấy users?
```
1. Check: SUPABASE_SERVICE_ROLE_KEY trong .env.local
2. Visit: /debug-role để xem role của bạn
3. Console: Xem logs [ROLE_CHANGE] và errors
```

### Thay đổi quyền bị lỗi?
```
Error: "Cannot change your own role"
→ Đây là security feature, nhờ admin khác thay đổi

Error: "Unauthorized"
→ Bạn không phải admin, check /debug-role

Error: "Invalid role"
→ Role không hợp lệ, chỉ dùng: user, moderator, admin, super_admin
```

## 📚 Tài Liệu Chi Tiết

- **Full Guide:** `docs/ROLE_MANAGEMENT_SYSTEM.md`
- **Changelog:** `docs/CHANGELOG_v1.2.0.md`
- **Admin Setup:** `docs/ADMIN_SETUP.md`

## 🎓 Best Practices

### ✅ DO
- Validate admin permission trước mọi operation
- Log audit trail cho mọi thay đổi
- Show warning rõ ràng cho user
- Chỉ phân quyền admin cho người đáng tin

### ❌ DON'T
- Dùng admin client mà không validate permission
- Cho phép tự thay đổi quyền của mình
- Skip confirmation cho admin role changes
- Trust client input mà không validate

## 🏗️ Kiến Trúc

```typescript
// Regular operations
const supabase = await createClient()
const { data: user } = await supabase.auth.getUser()

// Admin operations (sau khi validate)
if (await isCurrentUserAdmin()) {
  const adminClient = createAdminClient()
  await adminClient.auth.admin.listUsers()
}
```

## 📊 Feature Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Load /admin/users | ✅ | Fixed with admin client |
| List all users | ✅ | With full details |
| Search users | ✅ | By email/name |
| Filter by role | ✅ | All roles |
| Change role | ✅ | With confirmation |
| Admin → Admin | ✅ | Peer-to-peer enabled |
| Delete users | ✅ | With audit |
| Self-protection | ✅ | Can't modify self |
| Audit logging | ✅ | Full trail |
| Super admin | 🔜 | Phase 2 |

## 🚦 Quick Commands

```bash
# Start dev server
npm run dev

# Build and test
npm run build

# Check role
# → Visit /debug-role in browser
```

## 📞 Need Help?

1. Read full docs: `docs/ROLE_MANAGEMENT_SYSTEM.md`
2. Check troubleshooting section above
3. Verify `.env.local` has Service Role Key
4. Check console logs for errors

---

**Version:** 1.2.0
**Status:** Production Ready ✅
**Last Updated:** 2025-01-18
