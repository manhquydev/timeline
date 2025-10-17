-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER_PROFILES POLICIES
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Everyone can view open and closed events
CREATE POLICY "Anyone can view public events"
  ON events FOR SELECT
  USING (status IN ('open', 'closed'));

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- POSTS POLICIES
-- ============================================

-- Everyone can view approved posts
CREATE POLICY "Anyone can view approved posts"
  ON posts FOR SELECT
  USING (status = 'approved');

-- Authenticated users can upload posts to open events
CREATE POLICY "Authenticated users can upload to open events"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_id
      AND status = 'open'
      AND allow_upload = true
    )
  );

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Create storage buckets (run these in Supabase Dashboard > Storage)
-- Bucket name: event-covers
-- Bucket name: event-media

-- Storage policy for event-covers bucket
-- Anyone can view event covers
CREATE POLICY "Anyone can view event covers"
  ON storage.objects FOR SELECT
  IN storage.bucket('event-covers')
  USING (true);

-- Authenticated users can upload event covers
CREATE POLICY "Authenticated users can upload event covers"
  ON storage.objects FOR INSERT
  IN storage.bucket('event-covers')
  TO authenticated
  WITH CHECK (true);

-- Storage policy for event-media bucket
-- Anyone can view event media
CREATE POLICY "Anyone can view event media"
  ON storage.objects FOR SELECT
  IN storage.bucket('event-media')
  USING (true);

-- Authenticated users can upload event media
CREATE POLICY "Authenticated users can upload event media"
  ON storage.objects FOR INSERT
  IN storage.bucket('event-media')
  TO authenticated
  WITH CHECK (
    -- Check if the path starts with an event ID that exists and is open
    EXISTS (
      SELECT 1 FROM events
      WHERE id::text = split_part(name, '/', 1)
      AND status = 'open'
      AND allow_upload = true
    )
  );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  IN storage.bucket('event-media')
  TO authenticated
  USING (
    -- Extract user_id from path (format: event_id/user_id/filename)
    auth.uid()::text = split_part(name, '/', 2)
  );
