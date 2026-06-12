/* ============================
   VeraVal — App Constants
   ============================ */

export const APP_NAME = "VeraVal";
export const APP_DESCRIPTION =
  "A simpler, cleaner way to track your anime journey.";
export const APP_TAGLINE = "Track. Discover. Enjoy.";

/** Navigation routes */
export const NAV_ROUTES = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Search", href: "/search", icon: "search" },
  { label: "Anime Roulette", href: "/anime-roulette", icon: "roulette" },
  { label: "Profile", href: "/profile", icon: "user" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;

/** Auth routes */
export const AUTH_ROUTES = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
] as const;

/** Anime status options (future use) */
export const ANIME_STATUS_OPTIONS = [
  { value: "watching", label: "Watching", color: "#3b82f6" },
  { value: "completed", label: "Completed", color: "#22c55e" },
  { value: "on_hold", label: "On Hold", color: "#f59e0b" },
  { value: "dropped", label: "Dropped", color: "#ef4444" },
  { value: "plan_to_watch", label: "Plan to Watch", color: "#a1a1aa" },
] as const;

/** Breakpoints (matching Tailwind defaults) */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
