
```markdown
# COMPANY MEMORY TIMELINE - Next.js Project

## PROJECT OVERVIEW
Build a mobile-first photo timeline web application where company employees can upload and view photos from events (like Women's Day 20/10). This is a long-term platform for multiple company events with event lifecycle management (create → open → close).

## TECH STACK (Non-negotiable)
- **Frontend:** Next.js 14.2+ (App Router), TypeScript 5.0+, Tailwind CSS 3.4+
- **UI Library:** shadcn/ui components
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Deployment:** Vercel
- **Image Libraries:** 
  - next/image for optimization
  - react-masonry-css for grid layout
  - yet-another-react-lightbox v3.25+ for image viewer
  - browser-image-compression for client-side compression
  - blurhash for image placeholders

## CRITICAL REQUIREMENTS

### 1. MOBILE-FIRST DESIGN (70-80% users on mobile)
- Touch gestures support (swipe, pinch-to-zoom, pull-to-close)
- Responsive images with blur placeholders
- Optimize for 3G/4G networks
- Target: <2s load time for photo grid on mobile

### 2. USER ROLES
- **Viewers:** Public access, no login required (just view photos)
- **Uploaders:** Login required (magic link auth), can upload photos with optional wish text
- **Admins:** Can create/manage events (status: draft/open/closed/archived)

### 3. KEY FEATURES (Phase 1 - MVP)
- Homepage with timeline navigation (horizontal scroll)
- Event page with masonry photo grid
- Lightbox with swipe navigation + pinch zoom
- Upload page with drag & drop, multi-file upload, progress tracking
- Magic link authentication for uploaders
- No moderation needed (auto-approve all uploads)

## DATABASE SCHEMA

### Tables Required:
```sql
-- events table
- id (uuid, primary key)
- title (varchar 255)
- description (text)
- slug (varchar 255, unique)
- event_date (date)
- start_date, end_date (timestamp)
- status (enum: draft/open/closed/archived)
- allow_upload (boolean)
- allow_wishes (boolean)
- cover_image_url (text)
- total_photos, total_videos, total_contributors (integer)
- created_at, updated_at (timestamp)

-- posts table
- id (uuid, primary key)
- event_id (uuid, foreign key)
- user_id (uuid, foreign key)
- media_type (enum: image/video)
- media_url (text) -- full size
- thumbnail_url (text) -- 300px
- blurhash (varchar 50)
- width, height, file_size (integer)
- wish_text (text, optional)
- uploaded_at (timestamp)
- view_count (integer)
- status (enum: pending/approved/rejected, default: approved)

-- user_profiles table
- id (uuid, primary key, references auth.users)
- full_name (varchar 255)
- email (varchar 255)
- avatar_url (text)
- total_uploads (integer)
- created_at (timestamp)

-- Indexes: event_id, uploaded_at, status, slug
-- Triggers: auto-update event stats on post insert
```

### Supabase Storage:
```yaml
Buckets:
  - photos (public, for images)
  
RLS Policies:
  - Authenticated users can upload
  - Public can view
  - Users can delete own photos
```

## PROJECT STRUCTURE
```
/app
  /(auth)
    /login              # Magic link login
  /events
    /[slug]            # Event detail page (SSR)
  /upload              # Upload page (auth required)
  /api
    /upload            # Upload API endpoint
    /events            # Events CRUD API
  /layout.tsx
  /page.tsx            # Homepage with timeline

/components
  /ui                  # shadcn/ui components
  /PhotoGrid.tsx       # Masonry grid + lightbox
  /TimelineNav.tsx     # Horizontal timeline
  /UploadZone.tsx      # Drag & drop upload
  /EventCard.tsx

/lib
  /supabase
    /client.ts         # Browser client
    /server.ts         # Server client  
    /middleware.ts     # Auth middleware
  /utils.ts
  /validation.ts       # Zod schemas

/styles
  /globals.css
```

## IMPLEMENTATION PRIORITIES

### PHASE 1 - MVP (Start Here)
1. **Day 1-2: Setup & Foundation**
   - Initialize Next.js project with TypeScript
   - Install and configure Supabase client
   - Setup Tailwind CSS + shadcn/ui
   - Configure environment variables
   - Create Supabase database schema (all tables)
   - Setup storage buckets with RLS policies

2. **Day 3-4: Authentication & Basic Pages**
   - Implement magic link auth with Supabase Auth
   - Create protected route middleware
   - Build homepage layout with header
   - Create event detail page shell

3. **Day 5-7: Photo Grid & Lightbox**
   - Implement masonry photo grid with react-masonry-css
   - Integrate yet-another-react-lightbox
   - Add Next.js Image optimization with blur placeholders
   - Implement responsive breakpoints (mobile-first)
   - Add touch gestures (swipe, pinch-to-zoom)

4. **Day 8-10: Upload System**
   - Build drag & drop upload with react-dropzone
   - Client-side image compression with browser-image-compression
   - Progress tracking with XHR
   - Multi-file upload support
   - Generate blurhash for placeholders
   - Upload API endpoint with file validation

5. **Day 11-12: Timeline & Polish**
   - Horizontal scrolling timeline navigation
   - Lazy loading + infinite scroll
   - Mobile optimization (test on real devices)
   - Error handling & loading states

6. **Day 13-14: Testing & Deploy**
   - E2E testing on mobile devices
   - Performance audit (Lighthouse >90)
   - Deploy to Vercel
   - Setup Vercel Analytics

## CODING STANDARDS

### TypeScript
- Use strict mode
- Define proper interfaces for all data structures
- Avoid `any` type

### React Components
- Server Components by default
- Use 'use client' only when needed (interactivity, hooks)
- Descriptive component names (PhotoGrid, not Grid)

### Image Optimization
```typescript
// Always use Next.js Image with these props
<Image
  src={photo.url}
  alt={photo.alt}
  fill
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  placeholder="blur"
  blurDataURL={photo.blurhash}
  loading="lazy"
  quality={85}
/>
```

### Upload Flow
1. Client selects files
2. Compress images to max 2MB, 1920px width, WebP format
3. Generate 300px thumbnail
4. Generate blurhash
5. Upload to Supabase Storage
6. Save metadata to database
7. Return public URLs

### Mobile-First CSS
```css
/* Base: Mobile */
.grid { grid-template-columns: repeat(2, 1fr); }

/* Tablet */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

## PERFORMANCE TARGETS
- Lighthouse Performance: >90
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Mobile load time (3G): <3s

## FIRST TASKS TO EXECUTE
1. Run `npx create-next-app@latest company-memory-timeline --typescript --tailwind --app`
2. Install dependencies: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs react-masonry-css yet-another-react-lightbox browser-image-compression blurhash nanoid`
3. Initialize shadcn/ui: `npx shadcn-ui@latest init`
4. Create `.env.local` with Supabase credentials
5. Create database schema in Supabase dashboard
6. Start with homepage and timeline navigation

## NOTES
- No video support in Phase 1 (images only)
- No social features (likes, comments) in Phase 1
- No real-time updates in Phase 1
- Focus on mobile UX and performance
- Test frequently on mobile devices (iPhone, Android)

## ATTACHED DOCUMENTATION
[The complete technical specification document is attached separately]

---

Please start by setting up the Next.js project with the specified tech stack, then proceed with Day 1-2 tasks. Ask questions if any requirement is unclear. Prioritize mobile experience and performance optimization throughout development.
```

---

## CÁCH SỬ DỤNG:

1. **Lưu prompt trên vào file:**
```bash
echo "[paste prompt above]" > claude-code-prompt.md
```

2. **Copy tài liệu chi tiết tôi đã tạo vào file khác:**
```bash
# Tài liệu đầy đủ (PART 1-9) vào file này
# (copy toàn bộ response trước của tôi)
```

3. **Chạy Claude Code:**
```bash
# Option 1: Gửi cả 2 files
claude-code -f claude-code-prompt.md -f technical-spec.md

# Option 2: Paste cả 2 vào chat
claude-code
# Rồi paste prompt + tài liệu vào
```

**Tips khi làm việc với Claude Code:**

- **Chia nhỏ tasks:** Sau khi setup xong, request từng feature một (ví dụ: "Now implement the PhotoGrid component with masonry layout")
  
- **Test thường xuyên:** Sau mỗi feature, yêu cầu Claude Code test: "Test this on mobile Safari and Chrome"

- **Clarify khi cần:** Nếu Claude Code implement sai, clarify ngay: "The image optimization should use WebP format, not PNG"

- **Review code:** Luôn review code Claude Code generate, đặc biệt phần security và performance
