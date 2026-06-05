-- 005_add_showcase_and_favorites.sql

ALTER TABLE public.anime_lists ADD COLUMN is_favorite BOOLEAN DEFAULT false;
ALTER TABLE public.anime_lists ADD COLUMN favorite_order INTEGER;
ALTER TABLE public.anime_lists ADD COLUMN is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.anime_lists ADD COLUMN pin_order INTEGER;
