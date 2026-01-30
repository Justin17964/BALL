-- Add banned field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Create messages table for DMs
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for messages
CREATE INDEX idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, recipient_id, created_at DESC);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'message', 'user')),
  content_id UUID,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for reports
CREATE INDEX idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON public.reports(reported_user_id);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT TO authenticated 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark their received messages as read" ON messages
  FOR UPDATE TO authenticated 
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT TO authenticated 
  USING (auth.uid() = reporter_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

-- Function to ban user
CREATE OR REPLACE FUNCTION ban_user(
  user_id_to_ban UUID,
  reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;

  -- Update user profile
  UPDATE profiles
  SET 
    banned = TRUE,
    banned_at = NOW(),
    banned_by = auth.uid(),
    ban_reason = reason
  WHERE id = user_id_to_ban;
END;
$$;

-- Function to unban user
CREATE OR REPLACE FUNCTION unban_user(user_id_to_unban UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can unban users';
  END IF;

  -- Update user profile
  UPDATE profiles
  SET 
    banned = FALSE,
    banned_at = NULL,
    banned_by = NULL,
    ban_reason = NULL
  WHERE id = user_id_to_unban;
END;
$$;