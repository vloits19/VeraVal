CREATE TYPE anime_status AS ENUM ('watching', 'completed', 'plan_to_watch', 'dropped', 'not_interested');

CREATE TABLE public.anime_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  status anime_status NOT NULL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Enable RLS
ALTER TABLE public.anime_lists ENABLE ROW LEVEL SECURITY;

-- Policies

-- Anyone can view lists (useful for public profiles later)
CREATE POLICY "Anyone can view anime lists"
  ON public.anime_lists FOR SELECT USING (true);

-- Users can only insert/update/delete their own list items
CREATE POLICY "Users can insert own list items"
  ON public.anime_lists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own list items"
  ON public.anime_lists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own list items"
  ON public.anime_lists FOR DELETE USING (auth.uid() = user_id);
