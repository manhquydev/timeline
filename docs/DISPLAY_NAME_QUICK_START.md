# ✨ Display Name Feature - Quick Start

## 🎯 Tính Năng

Cho phép người dùng đặt **biệt danh/nickname** thay vì hiển thị tên thật hoặc email khi đăng ảnh.

**Thứ tự hiển thị:** `display_name` > `full_name` > `email` > `Anonymous`

---

## ⚡ Setup Nhanh (3 Bước)

### Bước 1: Chạy Migration SQL

Trong Supabase Dashboard → SQL Editor, chạy file:
```
supabase/migrations/006_add_display_name_and_auto_profile.sql
```

Hoặc dùng CLI:
```bash
supabase db push
```

### Bước 2: Deploy Code

Code đã sẵn sàng, chỉ cần deploy:
```bash
npm run build
npm run start
# hoặc deploy lên Vercel
```

### Bước 3: Test

1. **Login vào hệ thống**
2. **Click Avatar** (góc phải) → chọn **"Cài đặt tên hiển thị"**
3. **Nhập biệt danh** (VD: "Tony", "Sếp Tèo") → **Lưu**
4. **Upload ảnh** → Verify tên mới xuất hiện

---

## 📁 Files Đã Thay Đổi

✅ **Migration:** `supabase/migrations/006_add_display_name_and_auto_profile.sql`
✅ **API Upload:** `app/api/upload/route.ts` (dòng 48-59)
✅ **API Profile:** `app/api/profile/update/route.ts` (NEW)
✅ **Page:** `app/profile/settings/page.tsx` (NEW)
✅ **Form:** `components/profile/profile-settings-form.tsx` (NEW)
✅ **Header:** `components/layout/header.tsx` (thêm menu item)
✅ **Types:** `lib/types.ts` (thêm `display_name`)

---

## 🎨 Demo Flow

### 1. Trước khi có Display Name
```
Upload ảnh → Hiển thị: "bởi user@email.com" hoặc "Anonymous"
```

### 2. Sau khi đặt Display Name
```
Profile Settings → Nhập "Tony Stark" → Lưu
Upload ảnh → Hiển thị: "bởi Tony Stark" ✨
```

---

## ❓ FAQ

**Q: Tên cũ trên ảnh có tự động đổi không?**
A: Không. Mỗi ảnh lưu tên tại thời điểm upload (by design).

**Q: Bắt buộc phải đặt tên không?**
A: Không. Hệ thống tự dùng full_name hoặc email nếu không có display_name.

**Q: Có thể dùng emoji không?**
A: Có! VD: "Tony 🎯", "Sếp 🔥"

**Q: User cũ có bị ảnh hưởng không?**
A: Migration tự động tạo profile cho user cũ. Họ chỉ cần vào Settings để đặt tên.

---

## 📚 Documentation Đầy Đủ

Xem chi tiết tại: `docs/DISPLAY_NAME_SETUP.md`

---

**Version:** 1.0.0
**Date:** 2025-10-18
