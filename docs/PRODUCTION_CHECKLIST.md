# Production Deployment Checklist

## Tổng quan
Checklist này đảm bảo dự án **Company Memory Timeline** hoạt động tốt trên production (https://www.tekyhm.me).

---

## 🔐 Authentication & Email

### ✅ Supabase URL Configuration
- [ ] **Site URL** đã set thành: `https://www.tekyhm.me`
- [ ] **Additional Redirect URLs** bao gồm:
  - `https://www.tekyhm.me/auth/callback`
  - `https://www.tekyhm.me/*`
  - (Tùy chọn) `http://localhost:3000/*` cho local dev

**Kiểm tra:**
```bash
# Đăng ký trên production
# Email magic link phải redirect về: https://www.tekyhm.me/auth/callback?token=...
# ❌ KHÔNG được về: http://localhost:3000/...
```

**Tài liệu:** `docs/PRODUCTION_AUTH_QUICK_FIX.md`

---

### ✅ Email Template Customization
- [ ] Subject line đã đổi sang tiếng Việt
- [ ] Email body đã customize với branding công ty
- [ ] Test email đã gửi thành công
- [ ] Email không vào spam folder

**Template mẫu:** `docs/SUPABASE_EMAIL_TEMPLATE.html`

**Tài liệu:** `docs/CUSTOMIZE_EMAIL_TEMPLATE.md`

---

## 🌐 Environment Variables

### ✅ Production Environment
Kiểm tra `.env.local` hoặc platform environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lcoppqufztwjkjmlxzun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (correct key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (correct service role key)

# MongoDB
MONGODB_URI=mongodb+srv://... (production cluster)
```

**Lưu ý:**
- `NEXT_PUBLIC_*` variables phải có trong build environment
- `SUPABASE_SERVICE_ROLE_KEY` cần cho admin operations
- MongoDB URI phải point đến production cluster (không phải test/dev)

---

## 🗄️ Database

### ✅ MongoDB Atlas
- [ ] IP Whitelist bao gồm production server IPs (hoặc `0.0.0.0/0` nếu cần)
- [ ] Database user có quyền read/write
- [ ] Connection string đúng format: `mongodb+srv://...`
- [ ] Collections `events` và `posts` đã được migrate

**Test connection:**
```bash
npm run test:mongodb
```

**Tài liệu:** `docs/MONGODB_ATLAS_SETUP.md`

---

### ✅ Supabase Database
- [ ] RLS Policies đã setup đúng (không có "infinite recursion")
- [ ] Tables: `user_profiles`, `user_roles` đã tạo
- [ ] Admin users đã được set role = 'admin'

**Test admin access:**
- Login với admin account
- Truy cập `/admin` → Phải thấy admin dashboard (không redirect về home)
- Kiểm tra `/debug-role` → Role phải là "admin"

**Tài liệu:** `docs/ADMIN_SETUP.md`

---

## 📦 Storage

### ✅ Supabase Storage
- [ ] Buckets đã tạo: `event-covers`, `event-media`
- [ ] Public access policies đã set
- [ ] CORS đã configure cho production domain

**Test upload:**
- Tạo event mới với cover image
- Upload ảnh vào event
- Verify ảnh hiển thị trên production

---

## 🔑 Admin & Roles

### ✅ Admin Access
- [ ] Ít nhất 1 user đã có role = 'admin'
- [ ] Admin badge hiển thị trong header khi login
- [ ] Có thể truy cập `/admin/*` routes
- [ ] User management hoạt động (change roles, delete users)

**Setup admin:**
```sql
-- Run in Supabase SQL Editor
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id FROM auth.users WHERE email = 'your-admin@email.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();
```

**Tài liệu:** `ADMIN_QUICK_START.md`

---

## 🚀 Deployment

### ✅ Build & Deploy
- [ ] `npm run build` thành công (no errors)
- [ ] All environment variables đã set trong deployment platform
- [ ] HTTPS đã enabled (production domain)
- [ ] Custom domain đã point đúng

**Common platforms:**

#### Vercel
```bash
# Set env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add MONGODB_URI

# Deploy
vercel --prod
```

#### Netlify
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "value"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "value"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "value"
netlify env:set MONGODB_URI "value"

netlify deploy --prod
```

---

## 🧪 Post-Deploy Testing

### ✅ Critical User Flows

#### 1. Authentication Flow
- [ ] User có thể đăng ký (nhập email)
- [ ] Email magic link được gửi đến
- [ ] Click link → redirect về `https://www.tekyhm.me/auth/callback`
- [ ] Sau login → redirect về homepage
- [ ] User name hiển thị trong header

#### 2. Event Creation (Admin)
- [ ] Admin login
- [ ] Truy cập `/admin/events/create`
- [ ] Tạo event mới với cover image
- [ ] Event xuất hiện trên homepage

#### 3. Photo Upload (User)
- [ ] User login
- [ ] Click vào event
- [ ] Upload ảnh với wish text
- [ ] Ảnh chuyển status "pending" (nếu moderation enabled)
- [ ] Admin/Moderator approve → ảnh hiển thị public

#### 4. Admin Operations
- [ ] Truy cập `/admin/users` → list tất cả users
- [ ] Change user role → role updated thành công
- [ ] Truy cập `/admin/posts` → list pending posts
- [ ] Approve/reject posts → status changed
- [ ] Truy cập `/admin/analytics` → charts hiển thị

---

## 🔍 Monitoring & Logs

### ✅ Error Tracking
- [ ] Check server logs cho errors
- [ ] MongoDB connection stable (no timeouts)
- [ ] Supabase auth working (no rate limit errors)

**Common platforms:**
- Vercel: https://vercel.com/dashboard → Project → Logs
- Netlify: https://app.netlify.com → Site → Functions → Logs
- Railway: https://railway.app → Project → Deployments

---

## 🐛 Common Production Issues

### Issue 1: "Email redirect to localhost"
**Symptom:** Magic link trong email redirect về `http://localhost:3000`

**Fix:**
1. Vào Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL = `https://www.tekyhm.me`
3. Add redirect URLs như trên

**Docs:** `docs/PRODUCTION_AUTH_QUICK_FIX.md`

---

### Issue 2: "Can't access /admin"
**Symptom:** Admin routes redirect về homepage

**Fix:**
1. Check role trong database: `SELECT * FROM user_roles WHERE user_id = 'xxx'`
2. Set admin role: `UPDATE user_roles SET role = 'admin' WHERE user_id = 'xxx'`
3. Logout và login lại

**Docs:** `ADMIN_QUICK_START.md`

---

### Issue 3: "MongoDB connection timeout"
**Symptom:** `MongooseError: Operation timed out`

**Fix:**
1. Check IP whitelist trong MongoDB Atlas Network Access
2. Add production server IP hoặc `0.0.0.0/0`
3. Wait 1-2 minutes sau khi add IP

**Docs:** `docs/MONGODB_AUTH_TROUBLESHOOTING.md`

---

### Issue 4: "Images not loading"
**Symptom:** Uploaded images hiển thị broken link

**Fix:**
1. Check Supabase Storage bucket policies (phải public)
2. Verify CORS settings
3. Check image URLs trong database (phải là full URL)

---

### Issue 5: "RLS Policy infinite recursion"
**Symptom:** Error khi query `user_roles` table

**Fix:**
```sql
-- Run in Supabase SQL Editor
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

CREATE POLICY "Authenticated users can read all roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);
```

**Docs:** `docs/ADMIN_SETUP.md`

---

## 📊 Performance Optimization

### ✅ Optional Improvements
- [ ] Setup CDN cho static assets
- [ ] Enable image optimization (Next.js Image)
- [ ] Add caching headers
- [ ] Monitor Core Web Vitals
- [ ] Setup custom SMTP (SendGrid, AWS SES)

---

## 🔒 Security Checklist

### ✅ Production Security
- [ ] Environment variables không commit vào Git
- [ ] Service role key chỉ dùng server-side
- [ ] RLS policies đã test kỹ
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled (Supabase)
- [ ] Sensitive data không log ra console

---

## 📞 Support & Resources

### Documentation Links
- **Quick Fixes:** `docs/PRODUCTION_AUTH_QUICK_FIX.md`
- **Admin Setup:** `ADMIN_QUICK_START.md`
- **Email Customization:** `docs/CUSTOMIZE_EMAIL_TEMPLATE.md`
- **MongoDB Issues:** `docs/MONGODB_AUTH_TROUBLESHOOTING.md`

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

---

## ✅ Final Checklist

Trước khi launch production:

- [ ] Tất cả environment variables đã set
- [ ] Database connections working
- [ ] Admin access working
- [ ] Email authentication working
- [ ] Email templates customized
- [ ] Image upload/display working
- [ ] All critical user flows tested
- [ ] No console errors on production
- [ ] Mobile responsive tested
- [ ] HTTPS enabled
- [ ] Custom domain configured

---

**🎉 Production Ready!**

Nếu tất cả checklist đã hoàn thành, dự án đã sẵn sàng cho production! 🚀
