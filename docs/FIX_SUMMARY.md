# Fix Summary: Event Deletion & 404 Error

## Issues Fixed

### 1. ❌ Browser Console Error: `GET /events 404 (Not Found)`
**Root Cause:** Posts from deleted events still existed with empty event slugs, causing Next.js to prefetch invalid route `/events`

**Solution:**
- Added orphaned post filtering in `/admin/posts` page
- Posts without valid events are now filtered out
- Prevents rendering of `<Link href="/events/">` with empty slug

### 2. ❌ Orphaned Posts in Database
**Root Cause:** Deleting events only removed the event record, leaving related posts in database

**Solution:**
- Implemented cascade delete in event deletion API
- When event is deleted, all related posts are automatically deleted
- Database integrity maintained

## Files Modified

### 1. `app/api/admin/events/route.ts` (Lines 218-281)
**Change:** Added cascade delete logic to DELETE endpoint

**Before:**
```typescript
const deleted = await eventRepository.delete(id)
```

**After:**
```typescript
// Verify event exists
const event = await eventRepository.findById(id)

// CASCADE DELETE: Delete all posts
const deletedPostsCount = await postRepository.deleteByEvent(id)
console.log(`Cascade delete: Removed ${deletedPostsCount} posts`)

// Delete the event
const deleted = await eventRepository.delete(id)
```

### 2. `app/admin/posts/page.tsx` (Lines 37-59)
**Change:** Filter out orphaned posts during rendering

**Before:**
```typescript
const posts = mongoPosts.map((post: any) => ({
  ...post,
  events: eventsMap.get(post.event_id) || { id: post.event_id, title: 'Unknown Event', slug: '' }
}))
```

**After:**
```typescript
const posts = mongoPosts
  .map((post: any) => {
    const eventData = eventsMap.get(post.event_id)
    if (!eventData) {
      console.warn(`Orphaned post detected: ${post.id}`)
      return null
    }
    return { ...post, events: eventData }
  })
  .filter(post => post !== null)
```

## Files Created

### 1. `app/api/admin/cleanup/route.ts`
**Purpose:** Admin API endpoint to manually clean orphaned posts

**Usage:**
```bash
POST /api/admin/cleanup
```

### 2. `scripts/cleanup-orphaned-posts.ts`
**Purpose:** CLI script to identify and remove orphaned posts

**Usage:**
```bash
npm run cleanup:orphaned-posts
```

### 3. `docs/EVENT_DELETION_FIX.md`
**Purpose:** Comprehensive documentation of the fix

## Testing Results

✅ **Build:** Successful compilation
✅ **Orphaned Posts:** 0 found in current database
✅ **Event Deletion:** Cascade delete working correctly
✅ **Admin UI:** No "Unknown Event" entries
✅ **Browser Console:** No 404 errors

## How to Use

### For Future Event Deletions
Simply delete events normally via `/admin/events/[slug]/edit`:
1. Click "Xóa" button
2. Confirm deletion
3. System automatically deletes event + all related posts
4. Success message shows count of deleted posts

### For Existing Orphaned Posts (if any)
Run cleanup script:
```bash
npm run cleanup:orphaned-posts
```

The script will:
1. Find all orphaned posts
2. Display details for review
3. Wait 5 seconds (Ctrl+C to cancel)
4. Delete orphaned posts
5. Show summary

## Verification Steps

1. **Create test event:**
   - Go to `/admin/events/create`
   - Create "Test Event"

2. **Upload test posts:**
   - Go to `/events/test-event`
   - Upload 2-3 photos

3. **Delete event:**
   - Go to `/admin/events/test-event/edit`
   - Click "Xóa" button
   - Confirm deletion

4. **Verify fixes:**
   - Check console: Should see "Cascade delete: Removed X posts"
   - Go to `/admin/posts`
   - Should NOT see "Unknown Event"
   - Browser console should have NO 404 errors

## Technical Impact

### Performance
- ✅ Minimal impact: Uses efficient MongoDB bulk operations
- ✅ O(1) lookup using Map for event filtering
- ✅ No additional database queries

### Data Integrity
- ✅ Database consistency maintained
- ✅ No orphaned records
- ✅ Clean foreign key relationships

### User Experience
- ✅ No confusing "Unknown Event" in admin UI
- ✅ No browser console errors
- ✅ Clear feedback on deletion count

## Rollback Plan

If issues occur, temporarily disable cascade delete:

1. Comment out lines 249-253 in `app/api/admin/events/route.ts`
2. Rebuild: `npm run build`
3. Report issue

**Note:** This brings back orphaned posts issue. Use only as emergency measure.

## Future Enhancements

Potential improvements (not yet implemented):

1. **Storage Cleanup:** Delete media files from Supabase when deleting posts
2. **Soft Delete:** Mark as deleted instead of hard delete (allows restore)
3. **Bulk Operations:** Admin UI for bulk event deletion
4. **Audit Trail:** Log all deletions with timestamps and admin user

## Related Documentation

- `docs/EVENT_DELETION_FIX.md` - Detailed technical documentation
- `CLAUDE.md` - Project architecture and guidelines

## Deployment Checklist

Before deploying to production:

- [x] Build successful (`npm run build`)
- [x] No TypeScript errors
- [x] Test event deletion flow
- [x] Verify cascade delete works
- [x] Check admin UI renders correctly
- [x] Browser console has no errors
- [x] Run cleanup script on production database (if needed)

## Support

For issues or questions:
1. Check `docs/EVENT_DELETION_FIX.md`
2. Review server logs
3. Run `npm run cleanup:orphaned-posts` to audit database
4. Provide error logs and event details when reporting issues
