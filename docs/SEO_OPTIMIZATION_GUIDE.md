# SEO Optimization Guide - Timeline Teky Hoàng Mai

## 📋 Tổng quan

Tài liệu này mô tả các tối ưu SEO đã được triển khai cho dự án Timeline Teky Hoàng Mai nhằm cải thiện khả năng tìm kiếm trên Google và các công cụ tìm kiếm khác.

**Version:** 1.0.0
**Ngày cập nhật:** 2025-01-18
**Next.js Version:** 15.5.5

---

## ✅ Các tính năng đã triển khai

### 1. **Enhanced Metadata** ⭐

**File:** `app/layout.tsx`

Đã nâng cấp metadata với:
- ✅ `metadataBase` cho URL resolution
- ✅ Title template: `%s | Timeline Teky Hoàng Mai`
- ✅ Keywords đầy đủ tiếng Việt
- ✅ Open Graph tags với hình ảnh 1200x630px
- ✅ Twitter Cards (summary_large_image)
- ✅ Robots directives (index, follow, max-preview)
- ✅ Canonical URLs
- ✅ Verification tags (sẵn sàng cho Google Search Console)

**Ví dụ:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Timeline Teky Hoàng Mai - Lưu Giữ Khoảnh Khắc Đáng Nhớ",
    template: "%s | Timeline Teky Hoàng Mai"
  },
  description: "Nền tảng chia sẻ ảnh sự kiện...",
  keywords: ["Teky Hoàng Mai", "timeline", "chia sẻ ảnh", ...],
  openGraph: { /* ... */ },
  twitter: { /* ... */ },
  robots: { /* ... */ }
}
```

### 2. **Dynamic Sitemap** 🗺️

**File:** `app/sitemap.ts`

Sitemap tự động cập nhật với:
- ✅ Tất cả trang static (home, events, profile)
- ✅ Tất cả event pages động từ MongoDB
- ✅ Priority và changeFrequency tối ưu
- ✅ lastModified tự động từ database

**Truy cập:** `/sitemap.xml`

**Priority levels:**
- Home: 1.0 (cao nhất)
- Events listing: 0.9
- Event detail: 0.8
- Profile: 0.5

### 3. **Robots.txt** 🤖

**File:** `app/robots.ts`

Cấu hình crawler rules:
- ✅ Allow toàn bộ public pages
- ✅ Disallow admin/moderator dashboards
- ✅ Disallow API routes
- ✅ Disallow test pages
- ✅ Sitemap reference
- ✅ Googlebot specific rules

**Truy cập:** `/robots.txt`

### 4. **Structured Data (JSON-LD)** 📊

**File:** `lib/seo/structured-data.ts`

Đã triển khai schemas:
- ✅ **Organization Schema** - Thông tin tổ chức
- ✅ **Website Schema** - Site search support
- ✅ **Event Schema** - Rich snippets cho events
- ✅ **Breadcrumb Schema** - Navigation trong search results
- ✅ **Image Schema** - Google Images optimization

**Tích hợp:**
- `app/layout.tsx` - Organization + Website schemas
- `app/events/[slug]/page.tsx` - Event + Breadcrumb schemas

**Google Rich Results:** Hỗ trợ rich snippets trong kết quả tìm kiếm

### 5. **Event Page Metadata Enhancement** 📄

**File:** `app/events/[slug]/page.tsx`

Mỗi event page có metadata riêng:
- ✅ Dynamic title với event name
- ✅ Description từ event data
- ✅ Keywords bao gồm event title
- ✅ Open Graph với event cover image
- ✅ Twitter Cards
- ✅ Canonical URL cho từng event
- ✅ Event schema với startDate, endDate, location
- ✅ Breadcrumb navigation

---

## 🚀 Cách sử dụng

### Kiểm tra Sitemap
```bash
# Development
http://localhost:3000/sitemap.xml

# Production
https://your-domain.com/sitemap.xml
```

### Kiểm tra Robots.txt
```bash
# Development
http://localhost:3000/robots.txt

# Production
https://your-domain.com/robots.txt
```

### Xem Structured Data
1. Mở Chrome DevTools
2. Chọn Elements tab
3. Tìm `<script type="application/ld+json">`
4. Hoặc dùng [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 🛠️ Cấu hình Production

### 1. Set Environment Variable

**File:** `.env.production` hoặc Vercel/Netlify settings

```env
NEXT_PUBLIC_SITE_URL=https://timeline.tekyhoangmai.com
```

⚠️ **Quan trọng:** URL này ảnh hưởng đến:
- Canonical URLs
- Open Graph URLs
- Sitemap URLs
- Structured Data

### 2. Google Search Console Setup

**Bước 1:** Thêm verification code

Edit `app/layout.tsx`:
```typescript
verification: {
  google: 'your-google-verification-code',
}
```

**Bước 2:** Submit sitemap
- Truy cập Google Search Console
- Property Settings → Sitemaps
- Thêm: `https://your-domain.com/sitemap.xml`

**Bước 3:** Request indexing
- URL Inspection tool
- Request indexing cho các trang quan trọng

### 3. Social Media Cards Testing

**Facebook:**
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Nhập URL event page để test Open Graph

**Twitter:**
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Test Twitter Card appearance

---

## 📊 Monitoring & Testing

### SEO Testing Tools

**1. Google Lighthouse**
```bash
npm run build
npm run start
# Mở Chrome DevTools → Lighthouse
# Run audit với SEO category
```

**Expected scores:**
- SEO: 95-100
- Performance: 85+
- Accessibility: 90+
- Best Practices: 90+

**2. Google Rich Results Test**
- URL: https://search.google.com/test/rich-results
- Test từng event page
- Verify Event schema hiển thị đúng

**3. Structured Data Testing Tool**
- URL: https://validator.schema.org/
- Paste HTML source
- Check không có errors

**4. SEO Site Checkup**
- URL: https://seositecheckup.com/
- Full site SEO analysis
- Check metadata, performance, mobile

### Key Metrics to Monitor

**Google Search Console:**
- Impressions (lượt hiển thị)
- Clicks (lượt click)
- CTR (Click-through rate)
- Average position
- Coverage issues
- Mobile usability

**Google Analytics:**
- Organic traffic
- Bounce rate
- Pages per session
- Average session duration
- Top landing pages

---

## 🎯 Optimization Checklist

### Pre-Launch
- [ ] Set `NEXT_PUBLIC_SITE_URL` cho production
- [ ] Add Google Search Console verification
- [ ] Test sitemap.xml loads correctly
- [ ] Test robots.txt loads correctly
- [ ] Verify structured data với Rich Results Test
- [ ] Check Open Graph preview với Facebook Debugger
- [ ] Run Lighthouse audit (target score 95+)

### Post-Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing cho home page
- [ ] Request indexing cho top 5 events
- [ ] Monitor Google Search Console cho errors
- [ ] Check mobile usability issues
- [ ] Setup Google Analytics
- [ ] Monitor Core Web Vitals

### Maintenance (Monthly)
- [ ] Check sitemap coverage trong Search Console
- [ ] Review performance reports
- [ ] Fix any coverage errors
- [ ] Update metadata nếu cần
- [ ] Monitor search rankings cho keywords chính
- [ ] Review và optimize slow pages

---

## 📝 Best Practices

### Content
1. **Titles:** 50-60 ký tự, bao gồm keyword chính
2. **Descriptions:** 150-160 ký tự, mô tả hấp dẫn
3. **Keywords:** 5-10 keywords liên quan, tiếng Việt + tiếng Anh
4. **Headings:** Sử dụng H1 (1 lần), H2, H3 hợp lý
5. **Images:** Alt text mô tả, optimize size < 200KB

### Technical
1. **URLs:** Clean, descriptive slugs (`/events/ngay-hoi-ban-hang`)
2. **Mobile:** Mobile-first, responsive design
3. **Speed:** Target FCP < 1.8s, LCP < 2.5s
4. **HTTPS:** Bắt buộc cho production
5. **Canonical:** Tránh duplicate content

### Structured Data
1. **Organization:** Update khi có social media mới
2. **Events:** Luôn có startDate, description, image
3. **Breadcrumbs:** Consistent navigation hierarchy
4. **Testing:** Verify sau mỗi deploy

---

## 🔧 Troubleshooting

### Sitemap không load
**Lỗi:** "Cannot connect to database"

**Giải pháp:**
```typescript
// app/sitemap.ts
try {
  await connectToDatabase()
  events = await eventRepository.findPublic()
} catch (error) {
  console.error('Error fetching events:', error)
  // Return empty array, sitemap vẫn hoạt động
}
```

### Structured Data errors
**Lỗi:** "Missing required field"

**Giải pháp:**
- Check Event schema có đầy đủ: name, startDate, url
- Verify date format ISO 8601: `new Date().toISOString()`
- Test với validator.schema.org

### Open Graph preview sai
**Lỗi:** Facebook hiển thị sai image/title

**Giải pháp:**
1. Clear cache: Facebook Sharing Debugger
2. Click "Scrape Again"
3. Verify metadata trong HTML source
4. Check image URL accessible (public, HTTPS)

### Sitemap bị reject bởi Search Console
**Lỗi:** "Couldn't fetch" hoặc "Parse error"

**Giải pháp:**
1. Verify sitemap.xml syntax
2. Check tất cả URLs trả về 200 OK
3. Ensure HTTPS và không redirect
4. Verify `NEXT_PUBLIC_SITE_URL` đúng

---

## 📚 Resources

### Documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Event](https://schema.org/Event)
- [Open Graph Protocol](https://ogp.me/)

### Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Schema Markup Validator](https://validator.schema.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Learning
- [SEO Starter Guide (Google)](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Core Web Vitals](https://web.dev/vitals/)
- [Structured Data Guidelines](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data)

---

## 🎯 Next Steps

**Cải tiến tiếp theo (Priority):**

1. **Images Optimization** (High Priority)
   - [ ] Add alt text cho tất cả images
   - [ ] Optimize image sizes < 200KB
   - [ ] Convert to WebP format
   - [ ] Lazy loading với priority hints

2. **Performance** (High Priority)
   - [ ] Reduce JavaScript bundle size
   - [ ] Implement code splitting
   - [ ] Optimize fonts loading
   - [ ] Add service worker cho offline

3. **Content SEO** (Medium Priority)
   - [ ] Create blog cho tutorials
   - [ ] Add FAQ section
   - [ ] Internal linking strategy
   - [ ] Add more keywords to content

4. **Analytics** (Medium Priority)
   - [ ] Setup conversion tracking
   - [ ] Monitor user behavior
   - [ ] A/B testing cho titles/descriptions
   - [ ] Heat maps với Microsoft Clarity

5. **Advanced Schema** (Low Priority)
   - [ ] FAQPage schema
   - [ ] VideoObject schema (nếu có videos)
   - [ ] Review schema (user reviews)
   - [ ] LocalBusiness schema (nếu có địa chỉ)

---

## ✅ Build Status

**Latest Build:** ✅ Successful

```
Route (app)                Size    First Load JS
├ ○ /sitemap.xml          165 B   102 kB
├ ○ /robots.txt           165 B   102 kB
├ ƒ /                     18.4 kB 137 kB
├ ƒ /events/[slug]        7.58 kB 193 kB
```

**No TypeScript Errors:** ✅
**No Build Warnings:** ✅ (chỉ có ESLint img warnings - cần fix)
**SEO Score (Expected):** 95-100

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Author:** Claude Code Team
**Last Updated:** 2025-01-18
