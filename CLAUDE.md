# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Company Memory Timeline** is a mobile-first photo sharing platform for company events. It uses a hybrid database architecture: **MongoDB Atlas** for data storage (events, posts) and **Supabase** for authentication and role management.

### Key Architecture Decisions

1. **Hybrid Database Strategy**: MongoDB stores high-volume data (events, posts), while Supabase handles auth, user profiles, and roles
2. **Role-Based Access Control**: 5-tier system (guest, user, moderator, admin, super_admin) managed via `user_roles` table in Supabase
3. **Server-Side Rendering**: Next.js 15 App Router with SSR for fast initial loads
4. **Repository Pattern**: MongoDB data access abstracted via repositories (`EventRepository`, `PostRepository`)

## Common Commands

### Development
```bash
npm run dev              # Start dev server (defaults to port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
```

### Database Operations
```bash
npm run migrate          # Run MongoDB migrations
npm run migrate:rollback # Rollback MongoDB migrations
npm run test:mongodb     # Test MongoDB connection
npm run fix:mongodb-auth # Diagnose MongoDB auth issues
```

### Testing MongoDB Connection
If you encounter authentication errors:
1. Run `npm run fix:mongodb-auth` for diagnosis
2. Ensure password is alphanumeric-only (no special chars)
3. Check IP whitelist in MongoDB Atlas Network Access

## Database Architecture

### MongoDB (Primary Data Store)
- **Collections**: `events`, `posts`
- **Connection**: Mongoose with connection pooling (cached in `global.mongoose`)
- **Access Pattern**: Use repositories from `lib/mongodb/repositories/`
  ```typescript
  import { eventRepository, postRepository } from '@/lib/mongodb/repositories'
  const events = await eventRepository.findAll()
  ```

### Supabase (Auth & Roles Only)
- **Tables**: `user_profiles`, `user_roles`
- **Auth**: Magic link authentication
- **Storage**: `event-covers`, `event-media` buckets
- **Access Pattern**: Use `createClient()` from `lib/supabase/server.ts` for server-side
- **Display Names**: Users can set custom nicknames via `/profile/settings`

**IMPORTANT**: Never query `events` or `posts` from Supabase - they were migrated to MongoDB.

## Role-Based Access Control

### Role Hierarchy
```
guest (no auth) < user < moderator < admin < super_admin
```

### Checking Roles
```typescript
import { isCurrentUserAdmin, isModerator, getUserRole } from '@/lib/auth-utils'

// Server components
const isAdmin = await isCurrentUserAdmin()
const role = await getUserRole(userId)

// Check specific role
if (await isModerator(userId)) { /* ... */ }
```

### Common Role Patterns
- **Admin-only pages**: Check `isCurrentUserAdmin()` and redirect if false
- **API routes**: Always check role before sensitive operations
- **Layout/Header**: Pass `isAdmin` and `isModerator` props for conditional rendering

### Admin Setup (First Time)
If admin features aren't working, run this SQL in Supabase:
```sql
-- Fix infinite recursion in RLS policies
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

CREATE POLICY "Authenticated users can read all roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- Set admin role
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id FROM auth.users WHERE email = 'your-email@company.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();
```

See `docs/ADMIN_SETUP.md` for complete setup guide. If you encounter "infinite recursion detected in policy" error, the RLS policies need to be fixed as shown above.

## API Routes Structure

### Admin APIs (`/api/admin/*`)
All admin APIs check `isCurrentUserAdmin()` before processing:
```typescript
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  // ... admin logic
}
```

### Available Admin Routes
- `POST /api/admin/events` - Create event
- `GET /api/admin/users` - List all users with roles
- `PATCH /api/admin/users` - Update user role
- `DELETE /api/admin/users?userId=xxx` - Delete user
- `PATCH /api/admin/posts` - Approve/reject posts

## Image Processing

### Upload Flow
1. **Client-side**: Compression via `browser-image-compression`
2. **Upload**: FormData to `/api/upload` with `eventId`, `files`, `wishText`
3. **Server-side**:
   - Sharp generates thumbnails and blurhash
   - Upload to Supabase Storage (`event-media` bucket)
   - Fetch user display name (priority: `display_name` > `full_name` > `email`)
   - Create MongoDB `posts` document with `user_name`

### Image Optimization
- **Thumbnails**: Auto-generated at 800px width
- **Blurhash**: Generated for smooth loading placeholders
- **Format**: WebP preferred, fallback to original format
- **Loading**: Use `<OptimizedImage>` component for automatic blurhash placeholders and lazy loading

## Environment Variables

Required in `.env.local`:
```env
# Supabase (Auth & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Required for admin operations

# MongoDB (Data Storage)
MONGODB_URI=mongodb+srv://...
```

**Critical**: `SUPABASE_SERVICE_ROLE_KEY` is required for admin user management and bypassing RLS.

## Admin Dashboard Pages

### Main Admin Routes
- `/admin` - Dashboard with stats
- `/admin/users` - User management (roles, deletion)
- `/admin/analytics` - Charts and metrics
- `/admin/posts` - Content moderation
- `/admin/events/create` - Create new events

### Moderator Routes
- `/moderator` - Content approval dashboard (moderators can't access `/admin`)

### Route Protection
All admin/moderator routes check roles in their page components:
```typescript
export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }
  // ... page content
}
```

## Common Patterns

### Fetching Events with Posts
```typescript
import { eventRepository } from '@/lib/mongodb/repositories'
const events = await eventRepository.findAll()
```

### Creating Posts
```typescript
const Post = (await import('@/lib/mongodb/models')).Post
await Post.create({
  id: nanoid(),
  event_id: eventId,
  media_url: url,
  status: 'pending',
  // ...
})
```

### Supabase Client Usage
```typescript
// Server components (regular user context)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Server components (admin operations - bypasses RLS)
import { createAdminClient } from '@/lib/supabase/server'
const adminClient = createAdminClient()

// Use admin client for:
// - auth.admin.listUsers()
// - auth.admin.deleteUser()
// - Bypassing RLS policies
// ⚠️ Only use after validating admin permission!

// Client components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## Debugging

### Debug Admin Roles
If admin features aren't visible after setup:
1. Visit `/debug-role` to see current role status
2. Check RLS policies in Supabase (look for "infinite recursion" errors)
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
4. Logout and login again to refresh session

### MongoDB Connection Issues
```bash
npm run fix:mongodb-auth  # Diagnostic script
npm run test:mongodb      # Test connection
```

Common fixes:
- Use alphanumeric-only passwords (avoid special characters)
- Whitelist IP in MongoDB Atlas Network Access
- Wait 1-2 minutes after password reset

## Key Files

### Database Layer
- `lib/mongodb/connection.ts` - MongoDB connection with caching
- `lib/mongodb/models/` - Mongoose models for Event and Post
- `lib/mongodb/repositories/` - Data access layer (use these, not direct models)

### Auth Layer
- `lib/auth-utils.ts` - All role checking functions
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client

### Admin Components
- `components/admin/user-management-list.tsx` - User list with role changes
- `components/admin/analytics-charts.tsx` - Dashboard charts
- `components/moderator/moderator-post-list.tsx` - Post approval UI

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Email redirects to localhost in production | See `docs/PRODUCTION_AUTH_QUICK_FIX.md` - Config Supabase URL settings |
| Want to customize email template | See `docs/CUSTOMIZE_EMAIL_TEMPLATE.md` - Full customization guide |
| "infinite recursion detected in policy" | Fix RLS policies (see Admin Setup section) |
| Admin badge not showing | Logout/login, check `/debug-role`, verify role in DB |
| MongoDB auth failed | Run `npm run fix:mongodb-auth`, use alphanumeric password |
| Can't access `/admin` | Check `isCurrentUserAdmin()` returns true |
| Service role key missing | Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` |

## User Profile & Display Names

### Display Name Feature (NEW)
Users can set custom nicknames to appear on their uploaded photos instead of email or real name.

**Pages:**
- `/profile/settings` - User settings for display name and full name

**API:**
- `PATCH /api/profile/update` - Update user profile (display_name, full_name, avatar_url)

**Display Priority:**
```typescript
// When showing user name on photos
const displayName = user.display_name || user.full_name || user.email.split('@')[0] || 'Anonymous'
```

**Setup:** See `DISPLAY_NAME_QUICK_START.md` or `docs/DISPLAY_NAME_SETUP.md`

## Production Issues & Solutions

### Email Redirect to Localhost in Production
If magic link emails redirect to `http://localhost:3000` instead of production domain:
- **Quick Fix**: See `docs/PRODUCTION_AUTH_QUICK_FIX.md` (5 minutes)
- **Detailed Guide**: See `docs/PRODUCTION_REDIRECT_FIX.md`
- **Root Cause**: Supabase Dashboard URL Configuration not set for production

### Custom Email Templates
To customize magic link emails with branding and Vietnamese content:
- **Quick Setup**: See `docs/PRODUCTION_AUTH_QUICK_FIX.md`
- **Advanced Guide**: See `docs/CUSTOMIZE_EMAIL_TEMPLATE.md`
- **Template File**: `docs/SUPABASE_EMAIL_TEMPLATE.html`

## Documentation Files

### Setup & Installation
- `README.md` - Setup and installation

### Admin & Auth
- `docs/ADMIN_SETUP.md` - Role-based access setup
- `docs/ADMIN_COMPLETE_GUIDE.md` - Full admin system documentation
- `docs/ROLE_MANAGEMENT_SYSTEM.md` - **Role management & peer-to-peer authorization (v1.2.0)** ⭐
- `ADMIN_QUICK_START.md` - 5-minute admin setup

### Database
- `docs/MONGODB_ATLAS_SETUP.md` - MongoDB configuration
- `docs/MONGODB_AUTH_TROUBLESHOOTING.md` - MongoDB auth issues

### Production & Email
- `docs/PRODUCTION_AUTH_QUICK_FIX.md` - **Quick fix for redirect & email (5 min)** ⭐
- `docs/PRODUCTION_REDIRECT_FIX.md` - Detailed redirect URL troubleshooting
- `docs/CUSTOMIZE_EMAIL_TEMPLATE.md` - Email template customization guide
- `docs/SUPABASE_EMAIL_TEMPLATE.html` - Ready-to-use Vietnamese email template

### User Features
- `docs/DISPLAY_NAME_SETUP.md` - Display name feature guide
- `DISPLAY_NAME_QUICK_START.md` - Quick setup for display names
- `CHANGELOG_DISPLAY_NAME.md` - Display name feature changelog

### Performance & Loading System ⚡
- `docs/PERFORMANCE_OPTIMIZATION_V2.md` - **Latest performance optimization guide (v2.0)** ⭐⭐
- `docs/PERFORMANCE_OPTIMIZATION.md` - Previous performance guide (v1.1.0)
- `docs/LOADING_SYSTEM_QUICK_START.md` - Quick reference for loading components
- `docs/PERFORMANCE_IMPROVEMENTS_SUMMARY.md` - Summary of all improvements

### UI Components & Layout (NEW - v1.0.0) 🎨
- `docs/FOOTER_SYSTEM.md` - **Footer system guide (mobile-first design)** ⭐

### Theme System (NEW - v2.0.0) 🎨
- `docs/THEME_SYSTEM.md` - **Full theme system documentation** ⭐
- `THEME_QUICK_START.md` - Quick guide for theme activation (3 steps)

## Performance & Loading System

### Overview
Version 1.1.0 introduces comprehensive loading UX and performance optimizations:
- ✅ Global progress bar for route transitions
- ✅ Skeleton loaders for all major components
- ✅ Optimized images with blurhash placeholders
- ✅ 50% faster Time to Interactive (TTI)
- ✅ Mobile-optimized animations

### Using Loading Components

**1. Skeleton Loaders**
```typescript
import { EventCardSkeleton, PhotoGridSkeleton, InlineSpinner } from '@/components/ui/loading-skeleton'

// Show skeleton while loading
{loading ? <EventCardSkeleton /> : <EventCard data={data} />}
```

**2. Progress Bar**
```typescript
import { ProgressBar } from '@/components/ui/progress-bar'

<ProgressBar progress={75} message="Đang tải..." showPercentage />
```

**3. Optimized Images**
```typescript
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src={post.media_url}
  alt={post.wish_text}
  blurhash={post.blurhash}
  priority={index < 6}  // Prioritize above-the-fold
/>
```

**4. Global Loading State**
```typescript
import { useLoadingStore } from '@/lib/stores/loading-store'

const { setLoading } = useLoadingStore()

// Show global loading
setLoading(true, 'Đang xử lý...')
await action()
setLoading(false)
```

**5. Button Loading States**
```typescript
import { InlineSpinner } from '@/components/ui/loading-skeleton'

<Button disabled={isLoading}>
  {isLoading ? (
    <><InlineSpinner size="sm" className="mr-2" />Đang xử lý...</>
  ) : (
    'Xác nhận'
  )}
</Button>
```

### Performance Best Practices

**1. Parallel Data Fetching**
```typescript
// ✅ Good - Parallel
const [events, user] = await Promise.all([
  eventRepository.findPublic(),
  getUser()
])

// ❌ Bad - Sequential
const events = await eventRepository.findPublic()
const user = await getUser()
```

**2. Limit Initial Data Load**
```typescript
// Only load what's needed for preview
const posts = await postRepository.findByEvent(eventId, 'approved')
return posts.slice(0, 6)  // Not all posts
```

**3. Optimize Images**
```typescript
// Always use OptimizedImage for better UX
<OptimizedImage src={url} blurhash={hash} priority={isAboveFold} />
```

**4. Add Loading States**
```typescript
// Always show feedback for async actions
{loading && <EventCardSkeleton />}
```

### Performance Metrics (v1.1.0)
- First Contentful Paint: ~1.2s (-52%)
- Time to Interactive: ~2.1s (-50%)
- Total Blocking Time: ~300ms (-62.5%)
- Cumulative Layout Shift: 0.02 (-86%)

### Documentation
- Full guide: `docs/PERFORMANCE_OPTIMIZATION.md`
- Quick start: `docs/LOADING_SYSTEM_QUICK_START.md`
- Summary: `docs/PERFORMANCE_IMPROVEMENTS_SUMMARY.md`

## Footer System (NEW - v1.0.0) 🦶

### Overview
Version 1.0.0 introduces professional footer with mobile-first design optimized for 80% mobile users:
- ✅ Mobile-First: 1-column on mobile, 2 on tablet, 4 on desktop
- ✅ No conflicts with MobileBottomNav (fixed bottom navigation)
- ✅ Brand consistency (Teky colors & gradients)
- ✅ Accessibility compliant (WCAG 2.1 Level AA)
- ✅ SEO-friendly with proper semantic HTML

### Component Location
```typescript
import { Footer } from '@/components/layout/footer'

// Auto-integrated in app/layout.tsx
<div className="flex flex-col min-h-screen">
  <Header />
  <main className="flex-1">
    {children}
  </main>
  <Footer />  {/* Sticky to bottom */}
</div>
```

### Key Features
1. **Responsive Layout**
   - Mobile: 1 column (stack vertically)
   - Tablet: 2 columns (md:grid-cols-2)
   - Desktop: 4 columns (lg:grid-cols-4)

2. **Footer Sections**
   - Brand & About (with Teky logo)
   - Quick Links (Timeline, About)
   - Legal Links (Privacy, Terms)
   - Copyright & Credits

3. **Mobile Optimization**
   - Font size: 15px (better readability than 14px)
   - Touch targets: 44x44px minimum
   - Bottom padding: 80px (avoids MobileBottomNav overlap)

### Integration with MobileBottomNav
The footer uses `pb-20` (80px) padding on mobile to prevent overlap with the fixed MobileBottomNav (64px height):
```tsx
// Footer component
<div className="... pb-20 md:pb-8">
  {/* Content - visible above MobileBottomNav */}
</div>

// MobileBottomNav (fixed at bottom)
<nav className="fixed bottom-0 ... h-16">
  {/* 64px height */}
</nav>
```

### Adding New Links
```tsx
// Edit components/layout/footer.tsx
<li>
  <Link
    href="/new-page"
    className="text-slate-600 hover:text-primary transition-colors
               inline-flex items-center gap-2 touch-target-sm
               text-[15px] md:text-sm font-medium"
  >
    New Page
  </Link>
</li>
```

### Documentation
- **Complete Guide**: `docs/FOOTER_SYSTEM.md` ⭐
  - Architecture & design principles
  - Responsive breakpoints
  - Customization guide
  - Troubleshooting & FAQ

## Theme System (NEW - v2.0.0) 🎨

### Overview
Version 2.0.0 introduces dynamic theme system for special events (20/10, Tết, Christmas, etc.):
- ✅ MongoDB-backed theme storage
- ✅ Admin UI for theme management (`/admin/themes`)
- ✅ Theme banner notification (auto-show when active)
- ✅ Falling petals effect (hearts, circles, flower petals)
- ✅ Dynamic CSS variables (colors, gradients)
- ✅ Mobile-optimized animations

### Quick Start (3 Steps)

**Step 1: Seed Themes**
```bash
# Via UI: /admin/themes → Click "Seed Themes"
# Or via API:
curl -X POST /api/admin/themes/seed
```

**Step 2: Activate Theme**
```bash
# Via UI: /admin/themes → Select theme → Click "Kích Hoạt Theme"
# Page will reload automatically
```

**Step 3: Verify**
- Visit homepage `/`
- See banner: "🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸"
- See falling petals animation
- Colors changed to pink/purple palette

### Available Themes

#### 1. Theme 20/10 (Women's Day Vietnam)
- **Colors**: Rose pink, lavender, coral
- **Effects**: Falling petals (hearts, circles, flower shapes)
- **Banner**: "🌸 Ngày Phụ Nữ Việt Nam 20/10 🌸"
- **Use case**: October 20 celebration

#### 2. Theme Default
- **Colors**: Purple, blue-gray
- **Effects**: Basic particles
- **Use case**: Normal operations

### Core Components

**ThemeBanner** (`components/theme/theme-banner.tsx`)
- Auto-show when special theme active
- User can close (saved to localStorage)
- Gradient background from theme
- Mobile responsive

**FallingPetals** (`components/theme/falling-petals.tsx`)
- 3 shapes: Heart ❤️, Circle ⚪, Petal 🌸
- CSS animation (GPU accelerated)
- 20 particles (desktop), 12 particles (mobile)
- Respects `prefers-reduced-motion`

**ThemeProvider** (`lib/themes/theme-provider.tsx`)
- Load active theme from `/api/theme/active`
- Apply CSS variables to DOM
- Listen for `theme-changed` event

### Admin Theme Management

**UI Location:** `/admin/themes`

**Features:**
1. **Seed Themes** - Create predefined themes in database
2. **View Themes** - Preview all themes with colors & gradients
3. **Activate Theme** - Switch active theme (only 1 active at a time)

**API Routes:**
- `POST /api/admin/themes/seed` - Seed predefined themes
- `PATCH /api/admin/themes` - Activate theme
- `GET /api/theme/active` - Get active theme (public)

### Creating New Theme

```typescript
// 1. Edit lib/themes/predefined-themes.ts
export const THEME_TET_2025 = {
  name: 'tet-2025',
  displayName: '🎊 Tết Nguyên Đán 2025 🎊',
  description: 'Theme rực rỡ cho năm mới...',
  colors: {
    primary: 'hsl(0 85% 55%)',      // Red
    secondary: 'hsl(45 100% 50%)',  // Gold
    accent: 'hsl(15 90% 60%)',      // Orange
    // ... more colors
  },
  gradients: {
    hero: ['hsl(0 85% 55%)', 'hsl(15 90% 60%)', 'hsl(45 100% 50%)'],
    // ...
  },
  effects: {
    enableParticles: true,
    particleColor: '#FFD700',  // Gold
    enableGradientAnimation: true,
    enableGlassEffect: true,
  }
}

// 2. Add to PREDEFINED_THEMES array
export const PREDEFINED_THEMES = [
  THEME_DEFAULT,
  THEME_20_10,
  THEME_TET_2025,  // ← Add here
]

// 3. Seed via /admin/themes UI
```

### Usage in Components

```tsx
'use client'
import { useTheme } from '@/lib/themes/theme-provider'

export function MyComponent() {
  const { theme, isLoading, refreshTheme } = useTheme()

  if (!theme) return null

  const gradientStyle = {
    background: `linear-gradient(135deg, ${theme.gradients.card.join(', ')})`
  }

  return (
    <div style={gradientStyle}>
      <h2>{theme.displayName}</h2>
      <p>{theme.description}</p>
    </div>
  )
}
```

### CSS Variables

Theme automatically applies CSS variables to `:root`:

```css
/* Auto-generated from theme */
--primary: 340 90% 65%        /* Rose pink */
--secondary: 280 70% 88%      /* Lavender */
--accent: 350 85% 70%         /* Coral */
--background: 330 30% 98%     /* Light pink */
--foreground: 280 15% 20%     /* Dark text */
/* ... more variables */

/* Usage */
.my-element {
  background: hsl(var(--primary));
  color: hsl(var(--foreground));
}
```

### Performance Optimizations

- **Particles**: Limited to 20 (desktop), 12 (mobile)
- **Animations**: CSS-based (GPU accelerated)
- **Accessibility**: Respects `prefers-reduced-motion`
- **Storage**: Theme cached in localStorage
- **Load**: Server-side initial theme fetch (no flash)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Theme not changing | Hard reload (Ctrl+Shift+R), clear cache |
| Particles not showing | Check `theme.effects.enableParticles === true` |
| Banner stuck | Clear localStorage: `localStorage.removeItem('theme-banner-closed-20-10')` |
| CSS variables not applied | Inspect `<html>` element styles in DevTools |

### Documentation
- **Full Guide**: `docs/THEME_SYSTEM.md` ⭐
  - Architecture details
  - Theme model schema
  - Creating custom themes
  - API reference
- **Quick Start**: `THEME_QUICK_START.md`
  - 3-step activation guide
  - Testing checklist
  - Troubleshooting tips
