-- Create roulette history table
CREATE TABLE IF NOT EXISTS public.roulette_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anime_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, anime_id)
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_roulette_history_user_id ON public.roulette_history(user_id);
CREATE INDEX IF NOT EXISTS idx_roulette_history_created_at ON public.roulette_history(created_at DESC);

-- Set up Row Level Security
ALTER TABLE public.roulette_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own roulette history"
    ON public.roulette_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own roulette history"
    ON public.roulette_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roulette history"
    ON public.roulette_history FOR DELETE
    USING (auth.uid() = user_id);
