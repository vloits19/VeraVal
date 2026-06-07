/* ============================
   VeraVal — Shared TypeScript Types
   ============================ */

/** User profile (matches public.users table) */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  bio: string;
  accent_color: string;
  preferences?: {
    notify_episodes: boolean;
    notify_recommendations: boolean;
    notify_social: boolean;
  };
  created_at: string;
}

/** Auth form state */
export interface AuthFormState {
  success: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

/** Anime entry (future use) */
export interface Anime {
  id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  synopsis?: string;
  cover_image?: string;
  banner_image?: string;
  episodes?: number;
  status: "airing" | "finished" | "upcoming";
  score?: number;
  genres: string[];
  year?: number;
  season?: "winter" | "spring" | "summer" | "fall";
}

/** Anime list entry (future use) */
export interface AnimeListEntry {
  id: string;
  user_id: string;
  anime_id: number;
  status: "watching" | "completed" | "plan_to_watch" | "dropped" | "not_interested";
  progress: number;
  is_favorite: boolean;
  favorite_order?: number;
  is_pinned: boolean;
  pin_order?: number;
  score?: number;
  episodes_watched: number;
  notes?: string;
  created_at: string;
}

/** Navigation item */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Page metadata */
export interface PageMeta {
  title: string;
  description: string;
}

/** Component size variants */
export type Size = "sm" | "md" | "lg";

/** Component style variants */
export type Variant = "primary" | "secondary" | "ghost" | "danger";
