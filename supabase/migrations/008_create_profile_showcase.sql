-- 008_create_profile_showcase.sql

CREATE TABLE public.profile_showcase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  category anime_status NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id, category)
);

-- Enable RLS
ALTER TABLE public.profile_showcase ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view profile showcases"
  ON public.profile_showcase FOR SELECT USING (true);

CREATE POLICY "Users can insert own showcase items"
  ON public.profile_showcase FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own showcase items"
  ON public.profile_showcase FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own showcase items"
  ON public.profile_showcase FOR DELETE USING (auth.uid() = user_id);
