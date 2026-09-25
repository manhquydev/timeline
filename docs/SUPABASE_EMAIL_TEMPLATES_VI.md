# Bộ Mail Template Tiếng Việt Cho Supabase (Timeline Teky Hoàng Mai)

Ngày kiểm tra: 2026-03-07

## 1) Nhận diện dự án đã dùng để thiết kế template

- Tên sản phẩm: `Timeline Teky Hoàng Mai`
- Mô tả: nền tảng chia sẻ ảnh sự kiện, lưu giữ khoảnh khắc đáng nhớ.
- Logo đang dùng trong app:
  - `https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg`
- Màu brand chính:
  - Primary: `#8B5CF6` (Teky Purple)
  - Primary light: `#A78BFA`
  - Text đậm: `#1F2937`
  - Text phụ: `#6B7280`

## 2) Kết quả kiểm tra UTF-8 (tiếng Việt có dấu)

- Đã kiểm tra decode UTF-8 trên mã nguồn và docs: **không có file non-UTF8** trong phạm vi project.
- Nếu terminal hiển thị kiểu `HoÃ ng` / `Ä‘`, đó thường là lỗi **codepage hiển thị của console**, không phải file lưu sai UTF-8.
- File này được lưu `UTF-8` và viết tiếng Việt đầy đủ dấu để dùng trực tiếp.

## 3) Biến Supabase dùng trong template

- Auth:
  - `{{ .ConfirmationURL }}`
  - `{{ .Token }}`
  - `{{ .TokenHash }}`
  - `{{ .SiteURL }}`
  - `{{ .RedirectTo }}`
  - `{{ .Email }}`
  - `{{ .Data }}`
  - `{{ .NewEmail }}` (đổi email)
- Security notifications:
  - `{{ .OldEmail }}`
  - `{{ .Phone }}`
  - `{{ .OldPhone }}`
  - `{{ .Provider }}`
  - `{{ .FactorType }}`

## 4) Mẫu cho từng loại mail

Lưu ý:
- Mỗi template bên dưới là **full HTML** để paste trực tiếp vào Supabase.
- Giữ nguyên các biến `{{ ... }}`.

### A. Confirm sign up
Subject:
```text
Xác nhận tài khoản Timeline Teky Hoàng Mai
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;">
<img src="https://s3-sgn10.fptcloud.com/teky-prod/teky-edu-vn/media/project_medias/2023/9/23/9RAQ3dMtpTNlxW7G_2023923151535.jpg" alt="Teky Logo" width="56" height="56" style="border-radius:50%;display:block;margin:0 auto 12px;">
<h1 style="margin:0;font-size:24px;">Xác nhận tài khoản</h1><p style="margin:8px 0 0;opacity:.95;">Timeline Teky Hoàng Mai</p></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;">
<p style="margin:0 0 12px;">Xin chào {{ .Email }},</p>
<p style="margin:0 0 18px;">Bạn vừa đăng ký tài khoản mới. Vui lòng xác nhận để bắt đầu chia sẻ khoảnh khắc cùng cộng đồng Teky Hoàng Mai.</p>
<p style="text-align:center;margin:24px 0;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;">Xác nhận tài khoản</a></p>
<p style="font-size:13px;color:#6B7280;">Nếu bạn không thực hiện yêu cầu này, có thể bỏ qua email.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table>
</td></tr></table></body></html>
```

### B. Invite user
Subject:
```text
Bạn được mời tham gia Timeline Teky Hoàng Mai
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Thư mời tham gia</h1><p style="margin:8px 0 0;">Timeline Teky Hoàng Mai</p></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Bạn đã được mời tham gia nền tảng chia sẻ ảnh sự kiện.</p><p>Nhấn nút bên dưới để chấp nhận lời mời:</p>
<p style="text-align:center;margin:24px 0;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;">Chấp nhận lời mời</a></p>
<p style="font-size:13px;color:#6B7280;">Nếu bạn nhận nhầm email này, vui lòng bỏ qua.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### C. Magic link
Subject:
```text
Link đăng nhập của bạn - Timeline Teky Hoàng Mai
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Đăng nhập an toàn</h1><p style="margin:8px 0 0;">Magic Link một lần</p></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Xin chào {{ .Email }},</p><p>Bạn vừa yêu cầu đăng nhập. Nhấn nút để truy cập nhanh, không cần mật khẩu:</p>
<p style="text-align:center;margin:24px 0;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;">Đăng nhập ngay</a></p>
<p style="font-size:13px;color:#6B7280;">Link có hiệu lực trong thời gian ngắn và chỉ dùng một lần.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### D. Change email address
Subject:
```text
Xác nhận thay đổi email
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Xác nhận đổi email</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Email hiện tại: <strong>{{ .Email }}</strong></p><p>Email mới: <strong>{{ .NewEmail }}</strong></p>
<p style="text-align:center;margin:24px 0;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;">Xác nhận thay đổi</a></p>
<p style="font-size:13px;color:#6B7280;">Nếu bạn không yêu cầu thao tác này, hãy liên hệ quản trị viên ngay.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### E. Reset password
Subject:
```text
Đặt lại mật khẩu tài khoản của bạn
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Đặt lại mật khẩu</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Xin chào {{ .Email }},</p><p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tiếp tục:</p>
<p style="text-align:center;margin:24px 0;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;">Đặt lại mật khẩu</a></p>
<p style="font-size:13px;color:#6B7280;">Nếu không phải bạn, vui lòng bỏ qua email này.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### F. Reauthentication
Subject:
```text
Mã xác minh xác thực lại
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Xác thực lại tài khoản</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Xin chào {{ .Email }},</p><p>Nhập mã bên dưới để tiếp tục thao tác nhạy cảm:</p>
<p style="text-align:center;margin:20px 0;padding:14px;border:1px dashed #c4b5fd;border-radius:10px;font-size:28px;letter-spacing:4px;font-weight:700;color:#6d28d9;">{{ .Token }}</p>
<p style="font-size:13px;color:#6B7280;">Mã có hiệu lực trong thời gian ngắn.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### G. Password changed notification
Subject:
```text
Mật khẩu của bạn vừa được thay đổi
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Thông báo bảo mật</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Mật khẩu của tài khoản <strong>{{ .Email }}</strong> đã được thay đổi thành công.</p><p>Nếu không phải bạn, vui lòng đổi mật khẩu ngay và liên hệ quản trị viên.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### H. Email address changed notification
Subject:
```text
Email tài khoản vừa được thay đổi
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Thông báo thay đổi email</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Email tài khoản đã đổi từ <strong>{{ .OldEmail }}</strong> sang <strong>{{ .Email }}</strong>.</p><p>Nếu bạn không thực hiện, hãy liên hệ hỗ trợ ngay.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### I. Phone number changed notification
Subject:
```text
Số điện thoại tài khoản vừa được thay đổi
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Thông báo thay đổi số điện thoại</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Số điện thoại đã đổi từ <strong>{{ .OldPhone }}</strong> sang <strong>{{ .Phone }}</strong>.</p><p>Tài khoản liên quan: <strong>{{ .Email }}</strong></p><p>Nếu không phải bạn, vui lòng xử lý ngay.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### J. Identity linked notification
Subject:
```text
Đã liên kết phương thức đăng nhập mới
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Thông báo bảo mật</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Một phương thức đăng nhập mới đã được liên kết: <strong>{{ .Provider }}</strong>.</p><p>Tài khoản: <strong>{{ .Email }}</strong>.</p><p>Nếu không phải bạn, vui lòng liên hệ quản trị viên.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### K. Identity unlinked notification
Subject:
```text
Đã hủy liên kết một phương thức đăng nhập
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">Thông báo bảo mật</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Một phương thức đăng nhập đã bị hủy liên kết: <strong>{{ .Provider }}</strong>.</p><p>Tài khoản: <strong>{{ .Email }}</strong>.</p><p>Nếu thao tác này không phải của bạn, hãy kiểm tra bảo mật ngay.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### L. MFA method added notification
Subject:
```text
Đã thêm phương thức xác thực 2 lớp (MFA)
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">MFA đã được thêm</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Bạn vừa thêm phương thức MFA: <strong>{{ .FactorType }}</strong>.</p><p>Tài khoản: <strong>{{ .Email }}</strong>.</p><p>Nếu không phải bạn, vui lòng kiểm tra tài khoản ngay.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

### M. MFA method removed notification
Subject:
```text
Đã gỡ một phương thức xác thực 2 lớp (MFA)
```
Body:
```html
<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;background:#fff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
<tr><td style="padding:24px;text-align:center;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;"><h1 style="margin:0;font-size:24px;">MFA đã được gỡ</h1></td></tr>
<tr><td style="padding:28px;color:#1F2937;line-height:1.6;"><p>Một phương thức MFA đã bị gỡ: <strong>{{ .FactorType }}</strong>.</p><p>Tài khoản: <strong>{{ .Email }}</strong>.</p><p>Nếu không phải bạn, hãy cập nhật bảo mật ngay.</p></td></tr>
<tr><td style="padding:16px 28px;background:#faf7ff;color:#6B7280;font-size:12px;">© Timeline Teky Hoàng Mai</td></tr></table></td></tr></table></body></html>
```

## 5) Khuyến nghị chống email scanner “ăn” link một lần

Với các template dùng link xác nhận, bạn có thể đổi CTA từ `{{ .ConfirmationURL }}` sang dạng `TokenHash`:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/">
  Xác nhận
</a>
```

Template reset password:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
  Đặt lại mật khẩu
</a>
```
