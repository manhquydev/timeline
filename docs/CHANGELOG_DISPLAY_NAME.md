# Changelog - Display Name Feature

## Version 1.0.0 - 2025-10-18

### ✨ New Features

#### Display Name / Nickname System
Cho phép người dùng đặt biệt danh tùy chỉnh thay vì hiển thị email hoặc tên thật.

**Highlights:**
- 🎯 Thứ tự ưu tiên: `display_name` > `full_name` > `email` > `Anonymous`
- ⚙️ Trang Profile Settings để quản lý tên hiển thị
- 🔄 Tự động tạo user_profiles khi đăng ký (không còn "Anonymous")
- 📸 Tên hiển thị khi hover ảnh trong PhotoGrid
- ✅ Validate độ dài tên (2-50 ký tự)

---

### 🗄️ Database Changes

#### New Column
```sql
ALTER TABLE user_profiles
ADD COLUMN display_name TEXT;
```

#### Updated Trigger
`handle_new_user()` function now creates both:
- `user_roles` entry (role = 'user')
- `user_profiles` entry (email, full_name, display_name = NULL)

#### Backfill
Tự động tạo `user_profiles` cho tất cả user hiện tại.

---

### 🔧 Code Changes

#### Backend

**`app/api/upload/route.ts`**
- Updated user name retrieval logic (lines 48-59)
- Priority: `display_name` > `full_name` > `email.split('@')[0]` > `Anonymous`

**`app/api/profile/update/route.ts`** (NEW)
- PATCH endpoint để cập nhật profile
- Validation: min 2 chars, max 50 chars
- Only users can update their own profile

#### Frontend

**`app/profile/settings/page.tsx`** (NEW)
- Profile settings page
- Server-side rendered
- Redirects to login if not authenticated

**`components/profile/profile-settings-form.tsx`** (NEW)
- Client component with form
- Real-time preview of display name
- Success/error feedback
- Auto-refresh after save

**`components/layout/header.tsx`**
- Added "Cài đặt tên hiển thị" menu item
- Imported `Settings` icon from lucide-react

#### Types

**`lib/types.ts`**
- Added `display_name: string | null` to `UserProfile` interface

---

### 📁 New Files

```
supabase/migrations/
  └── 006_add_display_name_and_auto_profile.sql    [Migration SQL]

app/api/profile/update/
  └── route.ts                                      [Profile Update API]

app/profile/settings/
  └── page.tsx                                      [Settings Page]

components/profile/
  └── profile-settings-form.tsx                     [Form Component]

docs/
  └── DISPLAY_NAME_SETUP.md                         [Full Documentation]

scripts/
  └── apply-display-name-migration.sql              [Manual Migration Script]

DISPLAY_NAME_QUICK_START.md                         [Quick Start Guide]
CHANGELOG_DISPLAY_NAME.md                           [This file]
```

---

### 🔄 Migration Path

#### For New Deployments
1. Run migration: `supabase db push` or apply SQL manually
2. Deploy code
3. Done!

#### For Existing Deployments
1. **Backup database** (recommended)
2. Apply migration SQL in Supabase Dashboard
3. Verify all users have profiles (see verification queries in migration)
4. Deploy updated code
5. Test with existing user

---

### 🐛 Bug Fixes

- Fixed "Anonymous" display issue when `user_profiles` doesn't exist
- Fixed auto-profile creation on user signup
- Improved fallback logic for user name display

---

### 📊 Impact Analysis

**Database:**
- ✅ No breaking changes
- ✅ Backward compatible (NULL display_name = use old logic)
- ✅ No data loss

**User Experience:**
- ✅ Existing users: Name display unchanged until they set display_name
- ✅ New users: Can set display name immediately after signup
- ✅ Photo attribution: Shows proper name instead of "Anonymous"

**Performance:**
- ✅ Added index on `display_name` for fast lookups
- ✅ Single query in upload API (SELECT display_name, full_name, email)
- ⚠️ Minimal overhead: +1 column, +1 index

---

### 🧪 Testing Checklist

- [x] Migration runs without errors
- [x] Trigger creates user_profiles on signup
- [x] Backfill creates profiles for existing users
- [x] Profile settings page loads correctly
- [x] Form validation works (min/max length)
- [x] Display name appears on uploaded photos
- [x] Priority logic works (display_name > full_name > email)
- [x] Header menu shows settings link
- [x] Old photos keep their original user_name

---

### 📝 Known Issues

None at this time.

---

### 🔮 Future Enhancements

**Potential features for v2.0:**
- [ ] Avatar upload in profile settings
- [ ] Display name history/audit log
- [ ] Bulk update tool for admins to rename users
- [ ] Profanity filter for display names
- [ ] Unique display name enforcement
- [ ] Rich text formatting (bold, italic) for display names
- [ ] Custom colors/badges for display names

---

### 📚 Related Documentation

- `docs/DISPLAY_NAME_SETUP.md` - Full setup guide with troubleshooting
- `DISPLAY_NAME_QUICK_START.md` - Quick start for developers
- `scripts/apply-display-name-migration.sql` - Manual migration script
- `CLAUDE.md` - Updated project overview with display name info

---

### 🙏 Credits

**Developed by:** Claude Code AI Assistant
**Requested by:** User (manhq)
**Date:** 2025-10-18
**Version:** 1.0.0

---

### 🔐 Security Notes

- Display names are stored as plain text (no encryption needed)
- Users can only update their own profile (enforced by API)
- No XSS risk (React auto-escapes display names)
- No SQL injection risk (parameterized queries)
- Row Level Security (RLS) policies enforce user ownership

---

### 📞 Support

If you encounter issues:
1. Check `docs/DISPLAY_NAME_SETUP.md` troubleshooting section
2. Verify migration ran successfully
3. Check Supabase logs for errors
4. Test with a new user account

---

**End of Changelog**
