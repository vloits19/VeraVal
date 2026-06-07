-- 010_create_notifications.sql

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'friend_activity', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT,
  reference_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone authenticated can insert notifications (server actions create notifications for other users)
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for live notification updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
