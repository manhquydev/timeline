-- ============================================
-- DISPLAY NAME MIGRATION SCRIPT
-- Apply this in Supabase Dashboard > SQL Editor
-- ============================================

-- This script adds display_name feature to allow users to set nicknames
-- Run this once to enable the feature

BEGIN;

-- Step 1: Add display_name column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 2: Create index for display_name lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Step 3: Update the handle_new_user function to also create user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user_roles entry (existing functionality)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user_profiles entry (new functionality)
  INSERT INTO public.user_profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NULL -- display_name starts as NULL, user can set it later
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Backfill existing users who don't have user_profiles
INSERT INTO user_profiles (id, email, full_name, display_name)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' AS full_name,
  NULL AS display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Step 5: Add comment for documentation
COMMENT ON COLUMN user_profiles.display_name IS 'Custom display name/nickname set by user (takes priority over full_name when displaying)';

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify migration success
-- ============================================

-- Check if display_name column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'display_name';

-- Check if all users have profiles
SELECT
  COUNT(*) as total_users,
  COUNT(up.id) as users_with_profiles,
  COUNT(*) - COUNT(up.id) as users_without_profiles
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id;

-- List users and their display info
SELECT
  au.email,
  up.display_name,
  up.full_name,
  COALESCE(up.display_name, up.full_name, split_part(au.email, '@', 1), 'Anonymous') as will_display_as
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ✅ Migration complete!
-- Users can now set their display name via Profile Settings page
