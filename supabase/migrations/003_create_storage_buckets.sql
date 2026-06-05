-- 003_create_storage_buckets.sql

-- Insert avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Insert banners bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for 'avatars'
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Set up storage policies for 'banners'
CREATE POLICY "Banner images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'banners' );

CREATE POLICY "Anyone can upload a banner."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own banner."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'banners' AND auth.role() = 'authenticated' );
