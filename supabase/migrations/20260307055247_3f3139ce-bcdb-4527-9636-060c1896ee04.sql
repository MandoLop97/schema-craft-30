-- Create public storage bucket for builder assets (images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('builder-assets', 'builder-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read access for builder assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'builder-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload builder assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'builder-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update builder assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'builder-assets');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete builder assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'builder-assets');