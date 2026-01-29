-- Create updates table for admin announcements
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for updates
CREATE INDEX idx_updates_created ON public.updates(created_at DESC);
CREATE INDEX idx_updates_author ON public.updates(author_id);

-- Enable RLS on updates
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Updates policies
CREATE POLICY "Anyone can view updates" ON updates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create updates" ON updates
  FOR INSERT TO authenticated 
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update their updates" ON updates
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete updates" ON updates
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);