# Hướng Dẫn Cấu Hình Email/Password Authentication

## 📋 Tổng Quan

Dự án hiện đã được nâng cấp để hỗ trợ **cả 2 phương thức xác thực**:
1. **Email/Password** - Dễ dùng cho người dùng thường xuyên
2. **Magic Link** - An toàn cho người dùng không muốn nhớ mật khẩu

## 🎯 Các Trang Đã Được Tạo

### 1. **Trang Đăng Nhập** - `/login`
- Hỗ trợ cả email/password và magic link
- Giao diện tab để chuyển đổi giữa 2 phương thức
- Link "Quên mật khẩu?" cho người dùng password
- Link "Tham gia ngay" để chuyển sang trang đăng ký

### 2. **Trang Đăng Ký** - `/signup`
- Thiết kế riêng biệt với CTA "Tham gia ngay"
- Gradient background khác biệt (gradient-2)
- Hiển thị lợi ích của việc tham gia
- Xác nhận mật khẩu khi đăng ký bằng password

### 3. **Trang Quên Mật Khẩu** - `/forgot-password`
- Gửi email với link reset password
- UI chuyên nghiệp với success state
- Security badge và thông tin về link expiry

### 4. **Trang Reset Password** - `/reset-password`
- Password strength indicator (weak/medium/strong)
- Show/hide password toggle
- Xác nhận mật khẩu
- Validation session để đảm bảo link hợp lệ

## 🔧 Cấu Hình Supabase Dashboard

### Bước 1: Kích Hoạt Email/Password Provider

1. Truy cập **Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Authentication** → **Providers**
4. Tìm **Email** provider
5. Đảm bảo các tùy chọn sau được **BẬT**:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (khuyến nghị để bảo mật)
   - ✅ **Secure email change** (khuyến nghị)

### Bước 2: Cấu Hình Email Templates

#### 2.1. Confirm Signup Template
1. Vào **Authentication** → **Email Templates**
2. Chọn **Confirm signup**
3. Sử dụng template sau:

```html
<h2>Xác Thực Email</h2>
<p>Xin chào!</p>
<p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Timeline Teky Hoàng Mai</strong>.</p>
<p>Vui lòng nhấn vào nút bên dưới để xác thực email và kích hoạt tài khoản:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Xác Thực Email</a></p>
<p>Hoặc sao chép link sau vào trình duyệt:<br>
<code>{{ .ConfirmationURL }}</code></p>
<p>Link này sẽ <strong>hết hạn sau 24 giờ</strong>.</p>
<p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
<hr>
<p style="color: #666; font-size: 12px;">© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
```

#### 2.2. Reset Password Template
1. Chọn **Reset Password**
2. Sử dụng template sau:

```html
<h2>Đặt Lại Mật Khẩu</h2>
<p>Xin chào!</p>
<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>Timeline Teky Hoàng Mai</strong>.</p>
<p>Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Đặt Lại Mật Khẩu</a></p>
<p>Hoặc sao chép link sau vào trình duyệt:<br>
<code>{{ .ConfirmationURL }}</code></p>
<p>Link này sẽ <strong>hết hạn sau 1 giờ</strong>.</p>
<p><strong>⚠️ Lưu ý bảo mật:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và liên hệ với chúng tôi ngay.</p>
<hr>
<p style="color: #666; font-size: 12px;">© 2025 Timeline Teky Hoàng Mai. Mọi quyền được bảo lưu.</p>
```

### Bước 3: Cấu Hình URL Settings

1. Vào **Authentication** → **URL Configuration**
2. Cấu hình các URL sau:

**Site URL** (Production):
```
https://yourdomain.com
```

**Redirect URLs** (Thêm tất cả các URL sau):
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
http://localhost:3000/reset-password
https://yourdomain.com/reset-password
```

### Bước 4: Password Policy (Khuyến Nghị)

1. Vào **Authentication** → **Policies**
2. Cấu hình password requirements:
   - **Minimum length**: 6 ký tự (hoặc 8 để bảo mật cao hơn)
   - **Require lowercase**: ✅ (khuyến nghị)
   - **Require uppercase**: ✅ (khuyến nghị)
   - **Require numbers**: ✅ (khuyến nghị)
   - **Require special characters**: ⬜ (tùy chọn)

### Bước 5: Rate Limiting (Bảo Mật)

1. Vào **Authentication** → **Rate Limits**
2. Đảm bảo các giới hạn sau:
   - **Sign up**: 5 requests/hour/IP (chống spam)
   - **Sign in**: 10 requests/minute/IP (chống brute force)
   - **Password reset**: 3 requests/hour/email (chống abuse)

## 🚀 Testing

### Test Email/Password Signup

1. Truy cập `/signup`
2. Chọn tab **"Mật khẩu"**
3. Nhập email và password (tối thiểu 6 ký tự)
4. Nhấn **"Tạo tài khoản"**
5. Kiểm tra email để xác thực (nếu confirm email được bật)
6. Nhấn vào link xác thực
7. Đăng nhập tại `/login`

### Test Magic Link (Vẫn hoạt động)

1. Truy cập `/login` hoặc `/signup`
2. Chọn tab **"Magic Link"**
3. Nhập email
4. Nhấn **"Gửi Magic Link"**
5. Kiểm tra email và nhấn vào link

### Test Forgot Password

1. Truy cập `/login`
2. Nhấn **"Quên mật khẩu?"**
3. Nhập email tại `/forgot-password`
4. Kiểm tra email và nhấn vào link reset
5. Tạo mật khẩu mới tại `/reset-password`
6. Đăng nhập với mật khẩu mới

## 🎨 UI/UX Features

### Enhanced Auth Form

**Component**: `components/auth/enhanced-auth-form.tsx`

**Features**:
- ✅ Tab switching giữa Password và Magic Link
- ✅ Toggle button giữa Login và Signup mode
- ✅ Real-time validation
- ✅ Loading states với spinners
- ✅ Error handling với Vietnamese messages
- ✅ Success messages
- ✅ Security badges

### Password Strength Indicator

**Component**: `components/auth/reset-password-form.tsx`

**Features**:
- ✅ 4-level visual indicator (red → yellow → green)
- ✅ Text feedback (Yếu, Trung bình, Mạnh)
- ✅ Show/hide password toggle
- ✅ Password tips trong info box

### Professional Navigation

**Component**: `components/layout/header.tsx`

**Changes**:
- ✅ Button "Tham Gia Ngay" với gradient-2
- ✅ Button "Đăng Nhập" outline style
- ✅ Camera icon cho CTA button
- ✅ Mobile responsive (hide "Đăng Nhập" trên mobile)

## 📱 Mobile Optimization

Tất cả các trang auth đã được tối ưu cho mobile:
- ✅ Touch-friendly button sizes (h-11, h-12)
- ✅ Responsive layouts (flex, hidden lg:flex)
- ✅ Mobile logo trong các trang auth
- ✅ Gradient backgrounds với animated elements

## 🔒 Security Features

1. **Password Validation**:
   - Minimum 6 characters
   - Confirm password matching
   - Strength indicator

2. **Session Management**:
   - Automatic redirect after login
   - Session validation for reset password
   - Link expiry handling

3. **Error Handling**:
   - Vietnamese error messages
   - User-friendly error translations
   - Proper error states in UI

4. **Rate Limiting**:
   - Supabase built-in rate limits
   - 60-second cooldown for magic links

## 🐛 Troubleshooting

### Issue 1: "Email not confirmed" error
**Solution**: Người dùng cần xác thực email trước khi đăng nhập. Kiểm tra email confirmation setting trong Supabase.

### Issue 2: Reset password link không hoạt động
**Solution**: Kiểm tra `reset-password` có trong Redirect URLs của Supabase hay chưa.

### Issue 3: Magic link vẫn chuyển về localhost
**Solution**: Xem `docs/PRODUCTION_AUTH_QUICK_FIX.md`

### Issue 4: Password quá ngắn
**Solution**: Cập nhật password policy trong Supabase hoặc thay đổi validation trong code (hiện tại: min 6 chars).

## 📚 Related Documentation

- `docs/PRODUCTION_AUTH_QUICK_FIX.md` - Fix redirect URLs
- `docs/CUSTOMIZE_EMAIL_TEMPLATE.md` - Custom email templates
- `docs/ADMIN_SETUP.md` - Setup admin roles
- `CLAUDE.md` - Project architecture overview

## ✅ Checklist Triển Khai

- [ ] Kích hoạt Email provider trong Supabase
- [ ] Cấu hình email templates (Confirm signup, Reset password)
- [ ] Thêm redirect URLs cho production
- [ ] Thiết lập password policy
- [ ] Cấu hình rate limiting
- [ ] Test signup flow với email/password
- [ ] Test login flow với email/password
- [ ] Test magic link flow (đảm bảo vẫn hoạt động)
- [ ] Test forgot password flow
- [ ] Test reset password flow
- [ ] Test trên mobile devices
- [ ] Update CLAUDE.md với thông tin mới

## 🎉 Kết Luận

Hệ thống authentication hiện đã được nâng cấp lên phiên bản **hybrid** với:
- ✅ Email/Password authentication (primary)
- ✅ Magic Link authentication (alternative)
- ✅ Forgot/Reset password flow
- ✅ Professional UI/UX
- ✅ Mobile-optimized
- ✅ Security best practices

Người dùng giờ có thể **tự chọn** phương thức xác thực phù hợp với nhu cầu của họ.
