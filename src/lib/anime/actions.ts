"use server";

import { createClient } from "@/lib/supabase/server";
import type { AnimeListEntry } from "@/types";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/actions";

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

/** Helper: get all friend user IDs for the current user */
async function getFriendIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  
  const [{ data: asUser1 }, { data: asUser2 }] = await Promise.all([
    supabase.from("friends").select("user2_id").eq("user1_id", userId),
    supabase.from("friends").select("user1_id").eq("user2_id", userId),
  ]);

  const ids: string[] = [];
  if (asUser1) ids.push(...asUser1.map(f => f.user2_id));
  if (asUser2) ids.push(...asUser2.map(f => f.user1_id));
  return ids;
}

const STATUS_LABELS: Record<string, string> = {
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
  dropped: "Dropped",
  not_interested: "Not Interested",
};

export async function updateAnimeStatus(animeId: number, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get user profile for notification
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

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

  // Notify friends about this activity (non-blocking)
  const username = profile?.username || "Someone";
  const statusLabel = STATUS_LABELS[status] || status;
  const friendIds = await getFriendIds(user.id);
  
  // Fire and forget — don't block the response
  Promise.all(
    friendIds.map(friendId =>
      createNotification(
        friendId,
        "friend_activity",
        "Friend Activity",
        `${username} added an anime to ${statusLabel}.`,
        String(animeId),
        `/anime/${animeId}`
      )
    )
  ).catch(console.error);

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

  revalidatePath("/", "layout");
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

  revalidatePath("/", "layout");
}

export interface AnimeEntryData {
  animeId: number;
  status: string;
  progress?: number;
  score?: number;
  started_at?: string | null;
  finished_at?: string | null;
  notes?: string | null;
}

export async function updateAnimeEntry(data: AnimeEntryData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get user profile for notification
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const payload: any = {
    user_id: user.id,
    anime_id: data.animeId,
    status: data.status,
  };

  if (data.progress !== undefined) payload.progress = data.progress;
  if (data.score !== undefined) payload.score = data.score;
  if (data.started_at !== undefined) payload.started_at = data.started_at;
  if (data.finished_at !== undefined) payload.finished_at = data.finished_at;
  if (data.notes !== undefined) payload.notes = data.notes;

  const { error } = await supabase
    .from("anime_lists")
    .upsert(payload, { onConflict: "user_id,anime_id" });

  if (error) {
    console.error("Error updating anime entry:", error);
    throw new Error(error.message);
  }

  // Notify friends about activity (non-blocking)
  const username = profile?.username || "Someone";
  const statusLabel = STATUS_LABELS[data.status] || data.status;
  const friendIds = await getFriendIds(user.id);
  
  Promise.all(
    friendIds.map(friendId =>
      createNotification(
        friendId,
        "friend_activity",
        "Friend Activity",
        `${username} updated an anime entry (${statusLabel}).`,
        String(data.animeId),
        `/anime/${data.animeId}`
      )
    )
  ).catch(console.error);

  revalidatePath("/", "layout");
}

