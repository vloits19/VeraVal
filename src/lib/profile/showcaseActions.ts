"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ShowcaseItem {
  id: string;
  user_id: string;
  anime_id: number;
  category: string;
  display_order: number;
}

export async function getShowcase(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_showcase")
    .select("*")
    .eq("user_id", userId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching showcase:", error);
    return [];
  }

  return data as ShowcaseItem[];
}

export async function addShowcaseItem(animeId: number, category: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get current max display_order for this category
  const { data: currentItems } = await supabase
    .from("profile_showcase")
    .select("display_order")
    .eq("user_id", user.id)
    .eq("category", category)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = currentItems && currentItems.length > 0 ? currentItems[0].display_order + 1 : 0;

  const { error } = await supabase
    .from("profile_showcase")
    .insert({
      user_id: user.id,
      anime_id: animeId,
      category,
      display_order: nextOrder,
    });

  if (error) {
    if (error.code === '23505') {
      throw new Error("Anime is already in this showcase category");
    }
    throw new Error("Failed to add anime to showcase");
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${user.user_metadata?.username}`);
  revalidatePath("/profile");
}

export async function removeShowcaseItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profile_showcase")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to remove anime from showcase");

  revalidatePath("/settings");
  revalidatePath(`/profile/${user.user_metadata?.username}`);
  revalidatePath("/profile");
}

export async function updateShowcaseOrder(category: string, itemIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");



  // Supabase JS doesn't have a direct batch update easily without upserting with all required columns.
  // We can do it sequentially since max is 5 items, which is very fast.
  for (let i = 0; i < itemIds.length; i++) {
    await supabase
      .from("profile_showcase")
      .update({ display_order: i })
      .eq("id", itemIds[i])
      .eq("user_id", user.id);
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${user.user_metadata?.username}`);
  revalidatePath("/profile");
}
