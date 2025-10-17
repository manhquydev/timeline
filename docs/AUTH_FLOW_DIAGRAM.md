# Authentication Flow Diagram

## Magic Link Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Browser    │
│ (Production) │
│tekyhm.me     │
└──────┬───────┘
       │
       │ 1. User enters email
       │    on login form
       ▼
┌─────────────────────────────┐
│  auth-form.tsx              │
│  ┌─────────────────────┐    │
│  │ signInWithOtp({     │    │
│  │   email,            │    │
│  │   emailRedirectTo:  │    │
│  │   window.location   │◄───┼─── ✅ Correct: Lấy domain hiện tại
│  │     .origin +       │    │     Production: https://www.tekyhm.me
│  │   "/auth/callback"  │    │     Local: http://localhost:3000
│  │ })                  │    │
│  └─────────────────────┘    │
└──────────┬──────────────────┘
           │
           │ 2. Request gửi đến Supabase
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH SERVER                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Check: emailRedirectTo có trong whitelist không?      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Site URL: https://www.tekyhm.me             │      │    │
│  │  │  Additional Redirect URLs:                   │      │    │
│  │  │    ✅ https://www.tekyhm.me/auth/callback   │      │    │
│  │  │    ✅ https://www.tekyhm.me/*                │      │    │
│  │  │    ✅ http://localhost:3000/*                │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  IF trong whitelist:                                   │    │
│  │    ✅ Use emailRedirectTo từ request                  │    │
│  │  ELSE:                                                  │    │
│  │    ❌ Fallback to Site URL (mặc định)                 │    │
│  │    ⚠️  ĐÓNG LẠI VẤN ĐỀ!                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  3. Generate magic link token                                   │
│  4. Compose email với template                                  │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │ 5. Send email
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EMAIL TEMPLATE                            │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  Subject: 🔐 Xác nhận đăng nhập - Company Memory... │      │
│  │                                                        │      │
│  │  Body:                                                 │      │
│  │  ┌──────────────────────────────────────────────┐    │      │
│  │  │ [Header với gradient đẹp]                    │    │      │
│  │  │                                               │    │      │
│  │  │ Xin chào! 👋                                  │    │      │
│  │  │ Cảm ơn bạn đã sử dụng Company Memory...     │    │      │
│  │  │                                               │    │      │
│  │  │ [CTA Button]                                  │    │      │
│  │  │ ┌────────────────────────────────────────┐  │    │      │
│  │  │ │ 🔐 Xác nhận và Đăng nhập ngay         │  │    │      │
│  │  │ │ href="{{ .ConfirmationURL }}"          │  │    │      │
│  │  │ └────────────────────────────────────────┘  │    │      │
│  │  │                                               │    │      │
│  │  │ [Info box bảo mật]                           │    │      │
│  │  │ • Link có hiệu lực 60 phút                  │    │      │
│  │  │ • Chỉ dùng được 1 lần                        │    │      │
│  │  │                                               │    │      │
│  │  │ [Footer]                                      │    │      │
│  │  └──────────────────────────────────────────────┘    │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  {{ .ConfirmationURL }} được thay thế bằng:                    │
│  https://www.tekyhm.me/auth/callback?token=abc123...           │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │ 6. User nhận email
               ▼
┌─────────────────────────┐
│   User's Email Inbox    │
│  ┌───────────────────┐  │
│  │ [Đẹp, Tiếng Việt] │  │
│  │ [Gradient design]  │  │
│  │ [CTA button nổi]   │  │
│  └───────────────────┘  │
└──────────┬──────────────┘
           │
           │ 7. User click button
           ▼
┌─────────────────────────────────────────┐
│  https://www.tekyhm.me/auth/callback    │
│         ?token=abc123...                 │
└──────────┬──────────────────────────────┘
           │
           │ 8. Browser navigate to callback URL
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              app/auth/callback/route.ts                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. Get code from URL params                             │    │
│  │ 2. Exchange code for session                            │    │
│  │ 3. Set auth cookies                                     │    │
│  │ 4. Redirect to home (/)                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 9. Redirect to homepage
           ▼
┌─────────────────────────┐
│   Homepage (/)          │
│   ✅ User logged in     │
│   ✅ Name in header     │
└─────────────────────────┘
```

---

## Vấn đề Trước Khi Fix

```
┌──────────────┐
│   Browser    │
│ (Production) │
│tekyhm.me     │
└──────┬───────┘
       │ 1. emailRedirectTo = https://www.tekyhm.me/auth/callback
       ▼
┌─────────────────────────────────────────┐
│      SUPABASE AUTH SERVER               │
│  ┌───────────────────────────────────┐  │
│  │ Check whitelist:                  │  │
│  │ Site URL: http://localhost:3000   │  │  ❌ WRONG!
│  │ Redirect URLs: (empty)            │  │  ❌ WRONG!
│  └───────────────────────────────────┘  │
│                                          │
│  ❌ https://www.tekyhm.me NOT in list  │
│  ⚠️  FALLBACK to Site URL              │
│  📧 Email link = http://localhost:3000 │  ❌ VẤN ĐỀ!
└─────────────────────────────────────────┘
       │
       ▼
    Email gửi với link:
    http://localhost:3000/auth/callback  ❌ SAI!
```

---

## Sau Khi Fix

```
┌──────────────┐
│   Browser    │
│ (Production) │
│tekyhm.me     │
└──────┬───────┘
       │ 1. emailRedirectTo = https://www.tekyhm.me/auth/callback
       ▼
┌─────────────────────────────────────────────────────┐
│      SUPABASE AUTH SERVER                           │
│  ┌───────────────────────────────────────────────┐  │
│  │ Check whitelist:                              │  │
│  │ Site URL: https://www.tekyhm.me               │  │  ✅ CORRECT!
│  │ Redirect URLs:                                │  │
│  │   ✅ https://www.tekyhm.me/auth/callback     │  │  ✅ CORRECT!
│  │   ✅ https://www.tekyhm.me/*                  │  │  ✅ CORRECT!
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ✅ https://www.tekyhm.me/auth/callback IN LIST    │
│  ✅ USE emailRedirectTo from request               │
│  📧 Email link = https://www.tekyhm.me/...         │  ✅ ĐÚNG!
└─────────────────────────────────────────────────────┘
       │
       ▼
    Email gửi với link:
    https://www.tekyhm.me/auth/callback  ✅ ĐÚNG!
```

---

## Email Template Customization Flow

```
┌───────────────────────────────────────────────────────────────┐
│              SUPABASE EMAIL TEMPLATE SYSTEM                   │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  1. Default Template (Built-in)                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Subject: "Confirm your signup"                      │    │
│  │ Body: Plain English HTML                            │    │
│  │ ❌ Không có branding                                │    │
│  │ ❌ Tiếng Anh                                        │    │
│  │ ❌ Design cũ                                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ CUSTOMIZE ↓
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Custom Template (Your Design)                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Subject: "🔐 Xác nhận đăng nhập - Company..."      │    │
│  │ Body: Beautiful HTML with:                          │    │
│  │   ✅ Gradient background                           │    │
│  │   ✅ Responsive design                             │    │
│  │   ✅ Tiếng Việt                                    │    │
│  │   ✅ Company branding                              │    │
│  │   ✅ Info box bảo mật                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  3. Variables được Supabase thay thế tự động                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ {{ .ConfirmationURL }} → Full URL with token        │  │
│  │ {{ .Token }}           → Token only                  │  │
│  │ {{ .Email }}           → User's email                │  │
│  │ {{ .SiteURL }}         → Your site URL               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Example:
  Template: <a href="{{ .ConfirmationURL }}">Click here</a>
  ↓ Supabase processes ↓
  Output: <a href="https://www.tekyhm.me/auth/callback?token=abc123">
            Click here
          </a>
```

---

## Config Priority Flow

```
                     ┌─────────────────────┐
                     │ Supabase Dashboard  │
                     │ URL Configuration   │
                     └──────────┬──────────┘
                                │
                                │ Highest Priority
                                ▼
                     ┌─────────────────────┐
                     │     Site URL        │
                     │ (Main domain)       │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────────┐
                     │ Additional Redirect URLs │
                     │ (Whitelist)              │
                     └──────────┬───────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ Production   │   │ Staging      │   │ Development  │
    │ tekyhm.me/*  │   │ staging.com/*│   │localhost:3000│
    └──────────────┘   └──────────────┘   └──────────────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │ Code              │
                      │ window.location   │
                      │   .origin         │
                      └───────────────────┘
                                │
                        Lowest Priority
                        (Gets compared with whitelist)
```

**Cách hoạt động:**
1. Code gửi `emailRedirectTo` = current domain
2. Supabase check domain có trong whitelist không
3. Nếu có → dùng domain đó
4. Nếu không → fallback về Site URL

---

## Security Flow

```
┌────────────────────────────────────────────────────────────┐
│                   SECURITY CHECKS                          │
└────────────────────────────────────────────────────────────┘

User clicks link → Supabase validates:
                    │
                    ├─► ✅ Token valid? (not expired)
                    │
                    ├─► ✅ Token not used before? (one-time use)
                    │
                    ├─► ✅ Redirect URL in whitelist?
                    │
                    └─► ✅ All checks pass → Allow login

⚠️  Security Notes:
• Token expires after 60 minutes
• Token can only be used once
• Redirect URL must be whitelisted
• HTTPS required in production
```

---

## Summary: 2 Cách Fix

### ❌ Cách SAI (không nên làm)
```javascript
// Hardcode production URL trong code
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: 'https://www.tekyhm.me/auth/callback', // ❌ BAD!
  },
})
// Vấn đề: Không hoạt động trong dev/staging
```

### ✅ Cách ĐÚNG (best practice)
```javascript
// Dynamic URL + Supabase config
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`, // ✅ GOOD!
  },
})

// + Config trong Supabase Dashboard:
// Site URL: https://www.tekyhm.me
// Redirect URLs: https://www.tekyhm.me/*, http://localhost:3000/*
```

**Tại sao đúng?**
- ✅ Hoạt động trên mọi environment
- ✅ Không cần change code khi deploy
- ✅ Secure (whitelist based)
- ✅ Maintainable

---

## Related Docs

- Implementation: `docs/PRODUCTION_AUTH_QUICK_FIX.md`
- Deep dive: `docs/PRODUCTION_REDIRECT_FIX.md`
- Email customization: `docs/CUSTOMIZE_EMAIL_TEMPLATE.md`
