# 🚀 Quick Fix: Production Auth & Email (5 phút)

## Vấn đề hiện tại
1. ❌ Email redirect về `http://localhost:3000` thay vì `https://www.tekyhm.me`
2. ❌ Email template mặc định không thân thiện, bằng tiếng Anh

## Giải pháp nhanh (Follow từng bước)

### ⚡ Bước 1: Fix Redirect URL (2 phút)

1. Vào Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/lcoppqufztwjkjmlxzun
   ```

2. **Authentication** → **URL Configuration**

3. **Paste vào và Save:**

   **Site URL:**
   ```
   https://www.tekyhm.me
   ```

   **Additional Redirect URLs** (mỗi URL 1 dòng):
   ```
   https://www.tekyhm.me/auth/callback
   https://www.tekyhm.me/*
   http://localhost:3000/auth/callback
   http://localhost:3000/*
   ```

4. **Save** → Đợi 1 phút

✅ **Done!** Email giờ sẽ redirect đúng về production.

---

### ⚡ Bước 2: Custom Email Template (3 phút)

1. Trong Supabase Dashboard: **Authentication** → **Email Templates**

2. Chọn **"Magic Link"**

3. **Thay Subject thành:**
   ```
   🔐 Xác nhận đăng nhập - Company Memory Timeline
   ```

4. **Copy toàn bộ code dưới đây và paste vào Body:**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}
    .email-container{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
    .header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center}
    .header h1{margin:0;color:#fff;font-size:28px;font-weight:700}
    .header p{margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px}
    .content{padding:40px 30px}
    .greeting{font-size:18px;font-weight:600;color:#1a202c;margin:0 0 20px 0}
    .message{font-size:15px;line-height:1.6;color:#4a5568;margin:0 0 30px 0}
    .cta-button{display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff!important;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 8px 20px rgba(102,126,234,0.4)}
    .button-container{text-align:center;margin:30px 0}
    .info-box{background:#f7fafc;border-left:4px solid #667eea;padding:16px 20px;margin:30px 0;border-radius:8px}
    .info-box p{margin:0;font-size:14px;color:#4a5568;line-height:1.5}
    .footer{background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0}
    .footer p{margin:0 0 8px 0;font-size:13px;color:#718096}
    .footer a{color:#667eea;text-decoration:none}
    @media only screen and (max-width:600px){
      .email-container{margin:20px;border-radius:12px}
      .header{padding:30px 20px}
      .header h1{font-size:24px}
      .content{padding:30px 20px}
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎉 Company Memory Timeline</h1>
      <p>Nền tảng chia sẻ khoảnh khắc công ty</p>
    </div>
    <div class="content">
      <p class="greeting">Xin chào! 👋</p>
      <p class="message">
        Cảm ơn bạn đã sử dụng <strong>Company Memory Timeline</strong>!
        Chúng tôi nhận được yêu cầu đăng nhập vào tài khoản của bạn.
      </p>
      <p class="message">
        Để tiếp tục, vui lòng nhấn vào nút bên dưới. Link này sẽ tự động đăng nhập
        và đưa bạn vào hệ thống một cách an toàn.
      </p>
      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="cta-button">
          🔐 Xác nhận và Đăng nhập ngay
        </a>
      </div>
      <div style="height:1px;background:#e2e8f0;margin:30px 0"></div>
      <div class="info-box">
        <p><strong>🛡️ Lưu ý bảo mật:</strong></p>
        <p>• Link này chỉ có hiệu lực trong <strong>60 phút</strong></p>
        <p>• Chỉ sử dụng được <strong>1 lần duy nhất</strong></p>
        <p>• Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này</p>
      </div>
      <p class="message" style="margin-top:30px;font-size:14px">
        Hoặc copy link này vào trình duyệt nếu nút không hoạt động:
        <br><br>
        <code style="background:#f7fafc;padding:8px 12px;border-radius:6px;font-size:12px;word-break:break-all;display:block">{{ .ConfirmationURL }}</code>
      </p>
    </div>
    <div class="footer">
      <p><strong>Company Memory Timeline</strong></p>
      <p>Lưu giữ và chia sẻ kỷ niệm đáng nhớ</p>
      <p style="margin-top:16px">
        <a href="https://www.tekyhm.me">Truy cập website</a> •
        <a href="https://www.tekyhm.me/about">Về chúng tôi</a>
      </p>
      <p style="margin-top:16px;font-size:12px;color:#a0aec0">
        © 2025 Company Memory Timeline. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
```

5. **Save**

6. **Test:** Nhấn "Send test email" và nhập email của bạn

✅ **Done!** Email giờ đẹp và bằng tiếng Việt!

---

## 🧪 Testing

### Test Redirect URL:
1. Mở production: https://www.tekyhm.me
2. Đăng ký với email
3. Kiểm tra email → Hover chuột lên button
4. URL phải là: `https://www.tekyhm.me/auth/callback?token=...`

### Test Email Template:
1. Supabase → Email Templates → "Send test email"
2. Kiểm tra inbox
3. Email phải:
   - ✅ Tiêu đề tiếng Việt
   - ✅ Design đẹp với gradient
   - ✅ Button hoạt động
   - ✅ Responsive trên mobile

---

## 🐛 Troubleshooting

### Vẫn redirect về localhost?
```bash
# Đợi 2 phút sau khi save config
# Clear browser cache
# Thử incognito mode
# Logout và login lại
```

### Email vào spam?
```bash
# Kiểm tra spam folder
# Thêm noreply@supabase vào contacts
# (Tùy chọn) Setup custom SMTP - xem CUSTOMIZE_EMAIL_TEMPLATE.md
```

---

## 📚 Tài liệu chi tiết

Nếu muốn customize sâu hơn, xem:
- `docs/PRODUCTION_REDIRECT_FIX.md` - Chi tiết redirect URLs
- `docs/CUSTOMIZE_EMAIL_TEMPLATE.md` - Customize email nâng cao
- `docs/SUPABASE_EMAIL_TEMPLATE.html` - Full template code

---

## ✅ Checklist

- [ ] Đã config Site URL trong Supabase
- [ ] Đã thêm Additional Redirect URLs
- [ ] Đã thay email template
- [ ] Đã test redirect URL (phải là https://www.tekyhm.me)
- [ ] Đã test email template (đẹp + tiếng Việt)
- [ ] Production hoạt động bình thường

---

**⏱️ Tổng thời gian: ~5 phút**

Nếu gặp vấn đề, mở issue hoặc xem docs chi tiết ở trên! 🚀
