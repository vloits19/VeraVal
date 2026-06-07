-- Add new fields for Anime Entry Management
ALTER TABLE public.anime_lists
ADD COLUMN score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 10),
ADD COLUMN started_at DATE,
ADD COLUMN finished_at DATE,
ADD COLUMN notes TEXT,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to anime_lists
CREATE TRIGGER update_anime_lists_updated_at
BEFORE UPDATE ON public.anime_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
