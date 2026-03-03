
-- Create storage bucket for staff profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('staff-photos', 'staff-photos', true);

-- Anyone can view staff photos
CREATE POLICY "Staff photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'staff-photos');

-- Authenticated users can upload their own photo (folder = their user id)
CREATE POLICY "Users can upload their own photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staff-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Authenticated users can update their own photo
CREATE POLICY "Users can update their own photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'staff-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Authenticated users can delete their own photo
CREATE POLICY "Users can delete their own photo"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'staff-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
