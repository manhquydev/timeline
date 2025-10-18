# Event Deletion & Orphaned Posts Fix

## Problem Summary

Previously, when deleting an event via `/admin/events/[slug]/edit`, only the event was removed from the database. This caused two critical issues:

### Issue 1: 404 Error on `/admin/posts`
- **Symptom**: Browser console showed `GET /events?_rsc=1vdoj 404 (Not Found)`
- **Root Cause**:
  - Posts from deleted events still existed in database (orphaned posts)
  - The `/admin/posts` page tried to display these posts with empty event slugs
  - Next.js Link component with `href="/events/"` triggered prefetch to `/events` (route doesn't exist)
  - Only `/events/[slug]` route exists, causing 404

### Issue 2: Orphaned Posts in Database
- Posts belonging to deleted events remained in MongoDB
- Admin dashboard showed confusing "Unknown Event" entries
- Database integrity compromised

## Solutions Implemented

### 1. Cascade Delete (app/api/admin/events/route.ts:218-281)

When an admin deletes an event, the system now:
1. Verifies event exists
2. **Deletes all posts related to that event** (cascade delete)
3. Deletes the event itself
4. Returns count of deleted posts for confirmation

```typescript
// Before deletion
const event = await eventRepository.findById(id)
if (!event) return 404

// CASCADE DELETE: Delete all posts
const deletedPostsCount = await postRepository.deleteByEvent(id)
console.log(`Cascade delete: Removed ${deletedPostsCount} posts`)

// Delete the event
await eventRepository.delete(id)
```

**Benefits:**
- ✅ No orphaned posts left in database
- ✅ Complete cleanup when removing events
- ✅ Maintains database integrity

### 2. Orphaned Posts Filter (app/admin/posts/page.tsx:37-59)

The `/admin/posts` page now filters out orphaned posts during render:

```typescript
const posts = mongoPosts
  .map((post: any) => {
    const eventData = eventsMap.get(post.event_id)

    // Skip posts with deleted events (orphaned posts)
    if (!eventData) {
      console.warn(`Orphaned post detected: ${post.id}`)
      return null
    }

    return { ...post, events: eventData }
  })
  .filter(post => post !== null)
```

**Benefits:**
- ✅ Prevents 404 errors from empty slugs
- ✅ Clean admin UI without "Unknown Event" entries
- ✅ Logs orphaned posts for monitoring

### 3. Cleanup API Endpoint (app/api/admin/cleanup/route.ts)

New admin-only endpoint to clean up existing orphaned posts:

**Endpoint:** `POST /api/admin/cleanup`

**What it does:**
1. Gets all valid event IDs
2. Finds posts referencing non-existent events
3. Deletes orphaned posts
4. Returns count and IDs of deleted posts

**Usage:**
```bash
curl -X POST https://your-domain.com/api/admin/cleanup \
  -H "Cookie: your-auth-cookie"
```

### 4. Cleanup CLI Script (scripts/cleanup-orphaned-posts.ts)

Interactive script to identify and remove orphaned posts:

**Run:**
```bash
npm run cleanup:orphaned-posts
```

**What it does:**
1. Connects to MongoDB
2. Lists all orphaned posts with details
3. Waits 5 seconds for confirmation (Ctrl+C to cancel)
4. Deletes orphaned posts
5. Shows summary of deleted records

**Output Example:**
```
🔍 Starting orphaned posts cleanup...
✅ Connected to MongoDB
📊 Found 15 valid events
📊 Found 127 total posts

⚠️  Found 3 orphaned posts:

1. Post ID: abc123
   Event ID: deleted-event-1 (DELETED)
   Status: approved
   Uploaded: 2024-10-15
   User: John Doe

2. Post ID: def456
   ...

🗑️  These posts will be permanently deleted.
   Press Ctrl+C to cancel, or wait 5 seconds to continue...

✅ Successfully deleted 3 orphaned posts
🎉 Cleanup complete!
```

## Migration Guide

### For Existing Installations

If you already have orphaned posts in your database from previous event deletions:

#### Option 1: Use CLI Script (Recommended)
```bash
npm run cleanup:orphaned-posts
```

#### Option 2: Use API Endpoint
```bash
# Make authenticated request to cleanup endpoint
curl -X POST https://your-domain.com/api/admin/cleanup \
  -H "Cookie: $(cat cookies.txt)"
```

### For Future Event Deletions

No action needed! All future event deletions will automatically:
1. Delete all related posts
2. Maintain database integrity
3. Show deletion count in response

## Technical Details

### Database Operations

**EventRepository.delete()**
- Deletes single event by ID
- Returns boolean success status

**PostRepository.deleteByEvent()**
- Deletes all posts with matching `event_id`
- Returns count of deleted documents
- Uses MongoDB `deleteMany()` for efficiency

### Performance Considerations

- Cascade delete is efficient using MongoDB bulk operations
- Filter operation uses Map lookup (O(1) complexity)
- No additional database queries during post listing
- Minimal performance impact on admin dashboard

### Error Handling

All operations include:
- Try-catch blocks for MongoDB errors
- Transaction-like behavior (event only deleted if posts deletion succeeds)
- Detailed error logging
- Graceful degradation (UI continues working even with orphaned posts)

## Testing

### Verify the Fix

1. **Create test event**:
   ```
   Go to /admin/events/create
   Create event "Test Event"
   ```

2. **Upload test posts**:
   ```
   Go to /events/test-event
   Upload 2-3 photos
   ```

3. **Delete event**:
   ```
   Go to /admin/events/test-event/edit
   Click "Xóa" button
   Confirm deletion
   ```

4. **Verify cascade delete**:
   ```
   Check console logs: Should show "Cascade delete: Removed X posts"
   Go to /admin/posts
   Should NOT see "Unknown Event" entries
   Browser console should have NO 404 errors
   ```

### Edge Cases Tested

- ✅ Deleting event with 0 posts
- ✅ Deleting event with 100+ posts
- ✅ Concurrent post uploads during deletion
- ✅ Network failure during deletion
- ✅ Posts with mixed statuses (pending/approved/rejected)

## Monitoring

### Check for Orphaned Posts

Run the cleanup script to audit your database:
```bash
npm run cleanup:orphaned-posts
```

If found, it will list them. Press Ctrl+C if you want to investigate first.

### Server Logs

Monitor these log messages:
```
Cascade delete: Removed X posts for event Y
Orphaned post detected: <post-id> references non-existent event <event-id>
```

## Rollback Plan

If issues occur, you can temporarily disable cascade delete:

1. Comment out the cascade delete section in `app/api/admin/events/route.ts:249-253`
2. Rebuild: `npm run build`
3. Report issue to development team

**Note:** This will bring back orphaned posts issue, use only as emergency measure.

## Future Improvements

Potential enhancements (not yet implemented):

1. **Media File Cleanup**: Also delete associated images from Supabase storage
2. **Soft Delete**: Mark events as deleted instead of hard delete
3. **Bulk Event Deletion**: Admin UI for deleting multiple events
4. **Restore Functionality**: Undo event deletion within 30 days
5. **Audit Trail**: Log all deletion operations with admin user info

## Related Files

- `app/api/admin/events/route.ts` - Event deletion API
- `app/admin/posts/page.tsx` - Posts management UI
- `app/api/admin/cleanup/route.ts` - Cleanup API endpoint
- `scripts/cleanup-orphaned-posts.ts` - CLI cleanup script
- `lib/mongodb/repositories/EventRepository.ts` - Event data access
- `lib/mongodb/repositories/PostRepository.ts` - Post data access

## Support

If you encounter issues:

1. Check server logs for error messages
2. Run cleanup script: `npm run cleanup:orphaned-posts`
3. Verify MongoDB connection: `npm run test:mongodb`
4. Report issue with:
   - Error message
   - Event ID
   - Number of posts affected
   - Browser console logs
