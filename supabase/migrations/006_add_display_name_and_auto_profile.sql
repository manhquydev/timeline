-- Migration: Add display_name to user_profiles and auto-create profiles on signup
-- This enables users to set custom display names/nicknames

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
-- This ensures all current users get a profile entry
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
