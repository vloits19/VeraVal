-- 007_add_user_preferences.sql

-- Add preferences JSONB column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferences JSONB 
DEFAULT '{"notify_episodes": true, "notify_recommendations": true, "notify_social": true}'::jsonb;
