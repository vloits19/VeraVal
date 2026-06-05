-- 006_create_friends_system.sql

-- Drop the followers table as it's being replaced by the mutual friend system
DROP TABLE IF EXISTS public.followers;

-- Add last_active to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Friend Requests Table
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status friend_request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Friends Table (Mutual connection)
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT enforce_user1_less_than_user2 CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Policies for Friend Requests
CREATE POLICY "Users can view their own requests"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received requests"
  ON public.friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own requests"
  ON public.friend_requests FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policies for Friends
CREATE POLICY "Anyone can view friends"
  ON public.friends FOR SELECT
  USING (true);

-- Insert/Delete friends typically done via trigger or authenticated function.
-- We will allow users to delete their friendship if they are part of it.
CREATE POLICY "Users can remove their friendships"
  ON public.friends FOR DELETE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Wait, users shouldn't insert directly into friends, but since we are using Server Actions with the user's auth token, 
-- we need to allow insertion if the user is user1 or user2 (though in a real production system this is better as a database function).
-- For this MVP, server actions use the user's JWT. 
CREATE POLICY "Users can insert friendships"
  ON public.friends FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
