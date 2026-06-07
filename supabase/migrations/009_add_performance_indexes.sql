-- 009_add_performance_indexes.sql

-- Add B-tree indexes for foreign keys to speed up joins and filtered queries

-- anime_lists table
CREATE INDEX IF NOT EXISTS idx_anime_lists_user_id ON public.anime_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_anime_lists_anime_id ON public.anime_lists(anime_id);

-- friends table
CREATE INDEX IF NOT EXISTS idx_friends_user1_id ON public.friends(user1_id);
CREATE INDEX IF NOT EXISTS idx_friends_user2_id ON public.friends(user2_id);

-- profile_showcase table
CREATE INDEX IF NOT EXISTS idx_profile_showcase_user_id ON public.profile_showcase(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_showcase_anime_id ON public.profile_showcase(anime_id);
