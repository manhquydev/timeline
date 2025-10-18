# SEO Quick Start Guide 🚀

## ✅ Đã triển khai (Ready to use)

### 1. **Metadata Enhancement** ⭐
- ✅ Title templates cho tất cả pages
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Keywords tiếng Việt
- ✅ Canonical URLs

### 2. **Sitemap.xml** 🗺️
- ✅ Tự động cập nhật từ MongoDB
- ✅ Bao gồm tất cả events
- **Truy cập:** `/sitemap.xml`

### 3. **Robots.txt** 🤖
- ✅ Allow public pages
- ✅ Disallow admin/API routes
- **Truy cập:** `/robots.txt`

### 4. **Structured Data (JSON-LD)** 📊
- ✅ Organization Schema
- ✅ Website Schema
- ✅ Event Schema (cho mỗi event)
- ✅ Breadcrumb Schema

---

## 🚀 Production Setup (5 phút)

### Bước 1: Set Environment Variable
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Bước 2: Deploy
```bash
npm run build
# Deploy lên Vercel/Netlify
```

### Bước 3: Google Search Console
1. Truy cập: https://search.google.com/search-console
2. Add property: `https://your-domain.com`
3. Verify ownership (có nhiều cách)
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

### Bước 4: Test SEO
```bash
# Test với Lighthouse
npm run build
npm run start
# Chrome DevTools → Lighthouse → Run SEO audit
```

**Expected Score:** 95-100 ✅

---

## 🧪 Test ngay (Development)

### 1. Xem Sitemap
```
http://localhost:3000/sitemap.xml
```

### 2. Xem Robots.txt
```
http://localhost:3000/robots.txt
```

### 3. Xem Structured Data
**Chrome DevTools:**
1. F12 → Elements
2. Tìm `<script type="application/ld+json">`
3. Click để xem JSON

**Rich Results Test:**
1. Build production: `npm run build && npm run start`
2. Truy cập: https://search.google.com/test/rich-results
3. Nhập URL: `http://localhost:3000`

### 4. Test Open Graph
**Facebook Debugger:**
1. Truy cập: https://developers.facebook.com/tools/debug/
2. Nhập URL event page
3. Click "Scrape"
4. Xem preview

---

## 📊 Key Features

### Home Page
- Organization Schema (Teky Hoàng Mai)
- Website Schema (Site search)
- Open Graph với logo 1200x630px

### Event Pages
- Dynamic metadata cho mỗi event
- Event Schema với dates, location
- Breadcrumb navigation
- Open Graph với event cover image

### Sitemap
- Priority 1.0: Home
- Priority 0.9: Events listing
- Priority 0.8: Event details
- Auto-updates từ database

### Robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /moderator/

Sitemap: https://your-domain.com/sitemap.xml
```

---

## 🎯 SEO Checklist

### Pre-Launch
- [ ] `NEXT_PUBLIC_SITE_URL` set đúng
- [ ] Build successful (`npm run build`)
- [ ] Sitemap loads: `/sitemap.xml`
- [ ] Robots loads: `/robots.txt`
- [ ] Lighthouse score ≥ 95

### Post-Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Verify structured data with Rich Results Test
- [ ] Test Open Graph với Facebook Debugger
- [ ] Request indexing cho home page

### Monitoring (Weekly)
- [ ] Check Google Search Console cho errors
- [ ] Monitor impressions & clicks
- [ ] Review Core Web Vitals
- [ ] Fix any coverage issues

---

## 🛠️ Files quan trọng

```
app/
├── layout.tsx              # Root metadata + Organization/Website schemas
├── sitemap.ts              # Dynamic sitemap generation
├── robots.ts               # Crawler rules
└── events/[slug]/
    └── page.tsx            # Event metadata + Event/Breadcrumb schemas

lib/seo/
└── structured-data.ts      # All schema helpers
```

---

## 📚 Full Documentation

Xem chi tiết: **`docs/SEO_OPTIMIZATION_GUIDE.md`**

---

## ⚡ Quick Commands

```bash
# Build
npm run build

# Test production locally
npm run start

# Check sitemap
curl http://localhost:3000/sitemap.xml

# Check robots
curl http://localhost:3000/robots.txt
```

---

## 🎯 Expected Results

### Google Search Console (sau 1-2 tuần)
- ✅ All pages indexed
- ✅ No coverage errors
- ✅ Mobile-friendly
- ✅ Rich results eligible

### Lighthouse Scores
- **SEO:** 95-100 ✅
- **Performance:** 85+
- **Accessibility:** 90+
- **Best Practices:** 90+

### Rich Results
- ✅ Organization card
- ✅ Event cards với dates
- ✅ Breadcrumbs trong search
- ✅ Site search box (có thể)

---

**Version:** 1.0.0 | **Status:** ✅ Ready
**Full Guide:** `docs/SEO_OPTIMIZATION_GUIDE.md`
