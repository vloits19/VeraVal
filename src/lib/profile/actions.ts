"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: Partial<User>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");
  
  const { username, avatar, banner, bio, accent_color, preferences } = data;
  
  // Strict Validation to prevent database bloat
  if (bio && bio.length > 500) throw new Error("Bio must be 500 characters or less");
  if (username && username.length > 20) throw new Error("Username must be 20 characters or less");
  if (username && username.length < 3) throw new Error("Username must be at least 3 characters");

  const updates = Object.fromEntries(
    Object.entries({ username, avatar, banner, bio, accent_color, preferences }).filter(([k, v]) => v !== undefined && k)
  );
  
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);
    
  if (error) {
    console.error("Error updating profile:", error);
    throw new Error(error.message);
  }
  
  if (username) {
    revalidatePath(`/profile/${username}`);
  }
  revalidatePath("/settings/profile");
}

export async function getUserProfile(username: string): Promise<User | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
    
  if (error) {
    return null;
  }
  
  return data as User;
}

export async function getUserStats(userId: string) {
  const supabase = await createClient();
  
  const [
    { count: animeCount },
    { count: friendCount },
    { count: watchingCount },
    { count: completedCount },
    { count: ptwCount },
    { count: droppedCount },
    { count: notInterestedCount },
    { data: scoredAnime }
  ] = await Promise.all([
    supabase.from("anime_lists").select("*", { count: 'exact', head: true }).eq("user_id", userId),
    supabase.from("friends").select("*", { count: 'exact', head: true }).or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
    supabase.from("anime_lists").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("status", "watching"),
    supabase.from("anime_lists").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("status", "completed"),
    supabase.from("anime_lists").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("status", "plan_to_watch"),
    supabase.from("anime_lists").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("status", "dropped"),
    supabase.from("anime_lists").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("status", "not_interested"),
    supabase.from("anime_lists").select("score").eq("user_id", userId).gt("score", 0)
  ]);
    
  let meanScore = 0;
  if (scoredAnime && scoredAnime.length > 0) {
    const total = scoredAnime.reduce((sum, item) => sum + (item.score || 0), 0);
    meanScore = Number((total / scoredAnime.length).toFixed(2));
  }

  return {
    animeCount: animeCount || 0,
    friendCount: friendCount || 0,
    watchingCount: watchingCount || 0,
    completedCount: completedCount || 0,
    planToWatchCount: ptwCount || 0,
    droppedCount: droppedCount || 0,
    notInterestedCount: notInterestedCount || 0,
    meanScore
  };
}

export async function getUserShowcases(userId: string) {
  const supabase = await createClient();
  
  const fetchCategory = async (filter: Record<string, string | boolean>) => {
    let query = supabase.from("anime_lists").select("*").eq("user_id", userId).limit(5);
    
    // Apply filters
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
    
    // Order by pin_order or favorite_order if applicable, then created_at
    if (filter.is_favorite) {
      query = query.order("favorite_order", { ascending: true, nullsFirst: false });
    } else {
      query = query.order("pin_order", { ascending: true, nullsFirst: false });
    }
    query = query.order("created_at", { ascending: false });

    const { data } = await query;
    return data || [];
  };

  const [favorites, ptw, dropped, ni] = await Promise.all([
    fetchCategory({ is_favorite: true }),
    fetchCategory({ status: "plan_to_watch", is_pinned: true }),
    fetchCategory({ status: "dropped", is_pinned: true }),
    fetchCategory({ status: "not_interested", is_pinned: true }),
  ]);

  return { favorites, planToWatch: ptw, dropped, notInterested: ni };
}

export async function getUserCategoryList(userId: string, category: string) {
  const supabase = await createClient();
  
  let query = supabase.from("anime_lists").select("*").eq("user_id", userId);
  
  if (category === "favorites") {
    query = query.eq("is_favorite", true).order("favorite_order", { ascending: true, nullsFirst: false });
  } else {
    query = query.eq("status", category).order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching category list:", error);
    return [];
  }
  return data;
}

export async function updateUserRole(targetUserId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  // Verify the requesting user is an admin
  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUserProfile?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can manage roles.");
  }

  // Update target user's role
  const { error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }

  // Revalidate to update UI
  revalidatePath("/", "layout");
}
