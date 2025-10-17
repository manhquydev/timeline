# Hướng dẫn Sửa Lỗi Redirect URL trong Production

## Vấn đề
Khi đăng ký tài khoản trên production (https://www.tekyhm.me/), link trong email xác thực lại redirect về `http://localhost:3000/` thay vì domain production.

## Nguyên nhân
Supabase Dashboard chưa được cấu hình đúng **Site URL** và **Redirect URLs** cho môi trường production.

## Giải pháp

### Bước 1: Cấu hình Supabase Dashboard (QUAN TRỌNG)

1. **Truy cập Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/lcoppqufztwjkjmlxzun
   ```

2. **Vào Authentication → URL Configuration**

3. **Cấu hình Site URL:**
   ```
   Site URL: https://www.tekyhm.me
   ```

4. **Cấu hình Additional Redirect URLs** (mỗi URL 1 dòng):
   ```
   https://www.tekyhm.me/auth/callback
   https://www.tekyhm.me/*
   http://localhost:3000/auth/callback
   http://localhost:3000/*
   ```

5. **Lưu thay đổi** (Save)

### Bước 2: Kiểm tra lại

- Đợi 1-2 phút để Supabase apply config
- Thử đăng ký lại trên production
- Kiểm tra email → URL phải là `https://www.tekyhm.me/auth/callback?...`

## Chi tiết Kỹ thuật

### Code hiện tại (auth-form.tsx:25)
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

**Code này đã ĐÚNG** vì:
- `window.location.origin` tự động lấy domain hiện tại
- Production: `https://www.tekyhm.me`
- Local: `http://localhost:3000`

### Tại sao vẫn bị lỗi?

Supabase có **whitelist redirect URLs** ở dashboard. Nếu URL không nằm trong whitelist, Supabase sẽ fallback về URL mặc định (thường là localhost nếu bạn setup dev đầu tiên).

### Cấu hình Redirect URLs

#### Site URL
- **Vai trò**: Domain chính của ứng dụng
- **Production**: `https://www.tekyhm.me`
- **Lưu ý**: Chỉ nên có 1 site URL duy nhất cho production

#### Additional Redirect URLs
- **Vai trò**: Danh sách whitelist các URL được phép redirect
- **Wildcard `/*`**: Cho phép mọi route trong domain
- **Ví dụ**:
  - `https://www.tekyhm.me/*` → Allow mọi route production
  - `http://localhost:3000/*` → Allow mọi route local dev

### Các pattern Redirect URLs nên dùng

✅ **Nên dùng:**
```
https://www.tekyhm.me/*                    # Production wildcard
https://www.tekyhm.me/auth/callback        # Specific production route
http://localhost:3000/*                    # Local dev wildcard
https://preview-xyz.vercel.app/*           # Preview environments
```

❌ **Không nên dùng:**
```
*                                          # Quá rộng, không an toàn
https://www.tekyhm.me/**                   # Globstar không được hỗ trợ
```

## Troubleshooting

### Vẫn redirect về localhost sau khi config?

1. **Clear browser cache và cookies**
2. **Đăng xuất và đăng nhập lại**
3. **Kiểm tra URL Configuration trong Supabase Dashboard**
4. **Thử incognito mode**

### Kiểm tra domain đang dùng

Mở browser console và chạy:
```javascript
console.log(window.location.origin)
// Production: https://www.tekyhm.me
// Local: http://localhost:3000
```

### Kiểm tra email redirect URL

Khi nhận email, hover chuột lên button "Xác nhận đăng nhập":
- ✅ Đúng: `https://www.tekyhm.me/auth/callback?token=...`
- ❌ Sai: `http://localhost:3000/auth/callback?token=...`

## Lưu ý Quan trọng

1. **Site URL**: Phải là HTTPS trong production (trừ localhost)
2. **Wildcard**: Sử dụng `/*` chứ không phải `/**`
3. **Thời gian apply**: Config mất 1-2 phút để có hiệu lực
4. **Multiple environments**: Có thể thêm nhiều domain (staging, preview, etc.)

## Tài liệu Tham khảo

- [Supabase Redirect URLs Documentation](https://supabase.com/docs/guides/auth/redirect-urls)
- [Magic Link Authentication](https://supabase.com/docs/guides/auth/auth-email-passwordless)

## Checklist Hoàn thành

- [ ] Đã cấu hình Site URL: `https://www.tekyhm.me`
- [ ] Đã thêm `https://www.tekyhm.me/*` vào Additional Redirect URLs
- [ ] Đã thêm `https://www.tekyhm.me/auth/callback` vào Additional Redirect URLs
- [ ] Đã save và đợi 1-2 phút
- [ ] Đã test đăng ký lại trên production
- [ ] Email redirect URL đã đúng là `https://www.tekyhm.me/...`
