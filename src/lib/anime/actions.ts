"use server";

import { createClient } from "@/lib/supabase/server";
import type { AnimeListEntry } from "@/types";
import { revalidatePath } from "next/cache";

export async function getAnimeStatus(animeId: number): Promise<AnimeListEntry | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("anime_lists")
    .select("*")
    .eq("user_id", user.id)
    .eq("anime_id", animeId)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
    console.error("Error fetching anime status:", error);
    return null;
  }

  return data as AnimeListEntry | null;
}

export async function updateAnimeStatus(animeId: number, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("anime_lists")
    .upsert(
      { user_id: user.id, anime_id: animeId, status },
      { onConflict: "user_id,anime_id" }
    );

  if (error) {
    console.error("Error updating anime status:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/anime/${animeId}`);
}

export async function updateAnimeProgress(animeId: number, progress: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("anime_lists")
    .update({ progress })
    .eq("user_id", user.id)
    .eq("anime_id", animeId);

  if (error) {
    console.error("Error updating anime progress:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/anime/${animeId}`);
}

export async function toggleFavorite(animeId: number, isFavorite: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("anime_lists")
    .update({ is_favorite: isFavorite })
    .eq("user_id", user.id)
    .eq("anime_id", animeId);

  if (error) {
    console.error("Error toggling favorite:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/anime/${animeId}`);
}

export async function togglePinned(animeId: number, isPinned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("anime_lists")
    .update({ is_pinned: isPinned })
    .eq("user_id", user.id)
    .eq("anime_id", animeId);

  if (error) {
    console.error("Error toggling pinned:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/anime/${animeId}`);
}
