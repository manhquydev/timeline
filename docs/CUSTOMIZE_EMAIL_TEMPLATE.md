# Hướng dẫn Tùy chỉnh Email Template Supabase

## Tổng quan
Supabase cho phép tùy chỉnh hoàn toàn email template cho Magic Link authentication, bao gồm:
- Thiết kế HTML/CSS tùy ý
- Branding với logo, màu sắc công ty
- Nội dung tiếng Việt thân thiện
- Custom SMTP server (tùy chọn)

## Bước 1: Truy cập Email Templates

1. Vào Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/lcoppqufztwjkjmlxzun
   ```

2. Vào **Authentication** → **Email Templates**

3. Chọn **"Magic Link"** trong danh sách templates

## Bước 2: Sử dụng Template Có Sẵn

### Template đã được chuẩn bị sẵn tại:
```
docs/SUPABASE_EMAIL_TEMPLATE.html
```

### Tính năng của template:

✅ **Thiết kế hiện đại:**
- Gradient background đẹp mắt (purple-blue)
- Card design với shadow và border-radius
- Responsive trên mobile
- Hover effects cho button

✅ **Nội dung tiếng Việt:**
- Greeting thân thiện
- Hướng dẫn rõ ràng
- Info box bảo mật
- Footer với thông tin công ty

✅ **UX tốt:**
- CTA button nổi bật
- Fallback link nếu button không hoạt động
- Thông tin thời gian hết hạn (60 phút)
- Mobile-friendly

### Copy template và paste vào Supabase:

1. Mở file `docs/SUPABASE_EMAIL_TEMPLATE.html`
2. Copy toàn bộ nội dung
3. Paste vào Supabase Email Templates editor
4. **Lưu ý**: Giữ nguyên biến `{{ .ConfirmationURL }}` - Supabase sẽ tự động thay thế

## Bước 3: Customize theo Branding

### Thay đổi màu sắc:

```css
/* Gradient chính (header + button) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Thay bằng màu công ty, ví dụ: */
background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%);
```

### Thay đổi logo/tên công ty:

```html
<!-- Trong header -->
<h1>🎉 Company Memory Timeline</h1>
<p>Nền tảng chia sẻ khoảnh khắc công ty</p>

<!-- Thay thành: -->
<h1>🎉 Tên Công Ty Bạn</h1>
<p>Slogan công ty bạn</p>
```

### Thêm logo hình ảnh:

```html
<!-- Trong .header div, thêm: -->
<img src="https://your-domain.com/logo.png"
     alt="Logo"
     style="max-width: 150px; margin-bottom: 20px;">
```

### Thay đổi nội dung chính:

```html
<p class="message">
  <!-- Viết lại nội dung theo phong cách công ty -->
  Chào mừng bạn đến với [Tên Công Ty]!
  Để đăng nhập an toàn, vui lòng nhấn nút bên dưới...
</p>
```

## Bước 4: Variables có sẵn trong Supabase

### Magic Link Template Variables:

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `{{ .ConfirmationURL }}` | URL xác thực đầy đủ | https://app.com/auth/callback?token=... |
| `{{ .Token }}` | Token xác thực (nếu cần dùng riêng) | abc123xyz... |
| `{{ .TokenHash }}` | Hash của token | hash123... |
| `{{ .SiteURL }}` | Site URL từ config | https://www.tekyhm.me |
| `{{ .Email }}` | Email người dùng | user@example.com |

### Sử dụng variables:

```html
<!-- Hiển thị email người dùng -->
<p>Email: {{ .Email }}</p>

<!-- Link đầy đủ -->
<a href="{{ .ConfirmationURL }}">Xác nhận</a>

<!-- Hoặc tách riêng -->
<a href="{{ .SiteURL }}/auth/callback?token={{ .Token }}">Xác nhận</a>
```

## Bước 5: Thay đổi Subject Line

Trong Supabase Email Templates, có 2 phần:
1. **Subject**: Tiêu đề email
2. **Body**: Nội dung HTML

### Subject mặc định:
```
Confirm Your Signup
```

### Thay thành tiếng Việt:
```
🔐 Xác nhận đăng nhập - Company Memory Timeline
```

Hoặc cá nhân hóa:
```
👋 Xin chào! Đây là link đăng nhập của bạn
```

## Bước 6: Advanced - Custom SMTP Server

### Tại sao cần Custom SMTP?

✅ **Lợi ích:**
- Email gửi từ domain công ty (noreply@yourcompany.com)
- Tăng trust và professional
- Tránh spam folder
- Tracking mở email, click link
- Tùy chỉnh sender name

### Cấu hình SMTP:

1. Trong Supabase Dashboard: **Authentication** → **Email Templates**
2. Scroll lên đầu trang, tìm **"SMTP Settings"**
3. Điền thông tin:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: <your-sendgrid-api-key>
Sender Email: noreply@yourdomain.com
Sender Name: Company Memory Timeline
```

### Các SMTP provider phổ biến:

#### SendGrid (Recommend)
- Free: 100 emails/day
- SMTP: smtp.sendgrid.net:587
- Docs: https://sendgrid.com/docs/for-developers/sending-email/integrating-with-the-smtp-api/

#### AWS SES
- Very cheap (~$0.10/1000 emails)
- SMTP: email-smtp.us-east-1.amazonaws.com:587
- Docs: https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html

#### Mailgun
- Free: 5,000 emails/month
- SMTP: smtp.mailgun.org:587
- Docs: https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp

#### Gmail (Chỉ cho test)
- SMTP: smtp.gmail.com:587
- User: your-email@gmail.com
- Password: App Password (tạo trong Google Account Security)
- **Lưu ý**: Gmail limit 500 emails/day

## Bước 7: Testing Email

### Test trong Development:

1. **Mailtrap** (Recommend cho dev):
   - Free email testing service
   - Bắt mọi email, không gửi thật
   - URL: https://mailtrap.io
   - SMTP: smtp.mailtrap.io:587

2. **Supabase Built-in Preview**:
   - Trong Email Templates editor
   - Click **"Send test email"**
   - Nhập email của bạn để nhận test

### Checklist Testing:

- [ ] Subject line hiển thị đúng tiếng Việt
- [ ] Email không bị vào spam
- [ ] Button CTA hoạt động
- [ ] Fallback link copy được
- [ ] Responsive tốt trên mobile
- [ ] Logo/hình ảnh hiển thị (nếu có)
- [ ] Link redirect đúng domain production

## Bước 8: Best Practices

### Design:

✅ **Nên:**
- Giữ width max 600px để tương thích email client
- Inline CSS (một số email client không support `<style>`)
- Dùng table layout nếu cần complex layout
- Test trên nhiều email client (Gmail, Outlook, Apple Mail)

❌ **Tránh:**
- JavaScript (sẽ bị strip)
- External CSS files
- Video embeds
- Forms trong email

### Content:

✅ **Nên:**
- Rõ ràng, súc tích
- CTA nổi bật
- Có fallback link
- Thông tin thời gian hết hạn
- Contact support info

❌ **Tránh:**
- Quá dài dòng
- Nhiều CTA button (confusing)
- Thiếu branding
- Không có fallback cho image

### Security:

✅ **Nên:**
- Nhắc nhở về thời gian hết hạn
- Hướng dẫn không share link
- Thông tin "nếu không phải bạn yêu cầu..."

❌ **Tránh:**
- Hiển thị password/token raw
- External tracking pixels (privacy)

## Templates Mẫu Khác

### Template 1: Minimal (Light)

```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #333;">Xác nhận đăng nhập</h1>
  </div>

  <p style="font-size: 16px; color: #555; line-height: 1.6;">
    Xin chào!<br><br>
    Nhấn nút bên dưới để đăng nhập vào Company Memory Timeline:
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="display: inline-block; padding: 15px 30px; background: #667eea;
              color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Đăng nhập ngay
    </a>
  </div>

  <p style="font-size: 14px; color: #777; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
    Link này có hiệu lực trong 60 phút.<br>
    Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.
  </p>
</body>
</html>
```

### Template 2: Corporate (Professional)

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr style="background: #2c3e50;">
            <td style="padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Company Memory Timeline</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Yêu cầu đăng nhập</h2>
              <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đăng nhập từ tài khoản của bạn.
                Để xác nhận và tiếp tục, vui lòng nhấn nút bên dưới:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}"
                       style="display: inline-block; padding: 15px 40px; background: #3498db;
                              color: white; text-decoration: none; border-radius: 6px;
                              font-weight: bold; font-size: 16px;">
                      Xác nhận đăng nhập
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; background: #ecf0f1; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 13px; color: #555;">
                      <strong>Lưu ý bảo mật:</strong><br>
                      • Link có hiệu lực trong 60 phút<br>
                      • Chỉ sử dụng được 1 lần<br>
                      • Không chia sẻ link này với bất kỳ ai
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr style="background: #34495e;">
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #bdc3c7;">
                © 2025 Company Memory Timeline. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Troubleshooting

### Email bị vào spam:

1. **Setup SPF, DKIM, DMARC records** (nếu dùng custom SMTP)
2. **Tránh spam words** trong subject: "FREE", "CLICK HERE", "!!!"
3. **Maintain good sender reputation**
4. **Dùng SMTP provider uy tín** (SendGrid, AWS SES)

### Hình ảnh không hiển thị:

1. **Dùng absolute URL** (https://...)
2. **Host images trên CDN** (Cloudinary, Imgur)
3. **Test image URL** trong browser trước
4. **Có alt text** cho mọi image

### CSS không hoạt động:

1. **Inline CSS** thay vì `<style>` tag
2. **Tránh CSS properties** không support (flexbox, grid)
3. **Dùng table layout** cho complex designs
4. **Test trên litmus.com** hoặc email-on-acid.com

## Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Can I Email?](https://www.caniemail.com/) - CSS support trong email
- [Really Good Emails](https://reallygoodemails.com/) - Inspiration
- [Litmus](https://litmus.com/) - Email testing platform
- [MJML](https://mjml.io/) - Responsive email framework

## Checklist Hoàn thành

- [ ] Đã copy template vào Supabase Email Templates
- [ ] Đã thay đổi branding (tên, màu sắc, logo)
- [ ] Đã customize nội dung tiếng Việt
- [ ] Đã thay đổi subject line
- [ ] Đã test gửi email thử
- [ ] Email hiển thị đẹp trên mobile
- [ ] Link redirect hoạt động đúng
- [ ] (Tùy chọn) Đã setup custom SMTP server
