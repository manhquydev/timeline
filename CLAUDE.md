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
// Server components
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

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
