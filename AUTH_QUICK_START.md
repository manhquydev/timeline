# 🚀 Quick Start - Email/Password Authentication

## ⏱️ Setup trong 5 phút!

### Bước 1: Kích Hoạt Email Provider (2 phút)

1. Mở **Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project → **Authentication** → **Providers**
3. Tìm **Email** và đảm bảo:
   - ✅ **Enable Email provider** = ON
   - ✅ **Confirm email** = ON (khuyến nghị)

### Bước 2: Cấu Hình URLs (1 phút)

1. Vào **Authentication** → **URL Configuration**
2. Thêm vào **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/reset-password
   https://yourdomain.com/auth/callback
   https://yourdomain.com/reset-password
   ```

### Bước 3: Test Thử (2 phút)

1. Chạy dev server:
   ```bash
   npm run dev
   ```

2. Truy cập: http://localhost:3000/signup

3. Test signup:
   - Email: test@example.com
   - Password: password123
   - Nhấn "Tạo tài khoản"

4. Kiểm tra email để xác thực (nếu confirm email = ON)

5. Login tại: http://localhost:3000/login

## ✅ Xong!

### Các trang mới:
- 🔐 `/login` - Đăng nhập (có cả password + magic link)
- ✨ `/signup` - Đăng ký tài khoản
- 🔑 `/forgot-password` - Quên mật khẩu
- 🔄 `/reset-password` - Đặt lại mật khẩu

### Navigation:
- Header button "Tham Gia Ngay" → `/signup`
- Header button "Đăng Nhập" → `/login`

---

## 📚 Chi Tiết Hơn?

Xem các tài liệu sau:
- **`docs/EMAIL_PASSWORD_AUTH_SETUP.md`** - Hướng dẫn đầy đủ
- **`CHANGELOG_AUTH_UPGRADE.md`** - Chi tiết thay đổi
- **`CLAUDE.md`** - Architecture overview

---

## 🐛 Lỗi thường gặp?

### "Email not confirmed"
→ User cần xác thực email trước khi login

### "Invalid login credentials"
→ Sai email hoặc password

### Reset password link không hoạt động
→ Kiểm tra `/reset-password` có trong Redirect URLs chưa

---

## 🎉 Features

✅ Email/Password login/signup
✅ Magic Link (vẫn hoạt động)
✅ Forgot/Reset password
✅ Password strength indicator
✅ Mobile responsive
✅ Professional UI/UX
✅ Security best practices

**Enjoy!** 🚀
