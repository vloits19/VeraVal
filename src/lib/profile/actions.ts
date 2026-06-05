"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: Partial<User>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");
  
  const { username, avatar, banner, bio, accent_color } = data;
  const updates = Object.fromEntries(
    Object.entries({ username, avatar, banner, bio, accent_color }).filter(([k, v]) => v !== undefined && k)
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
    revalidatePath(`/user/${username}`);
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
  
  const { count: animeCount } = await supabase
    .from("anime_lists")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", userId);
    
  const { count: friendCount } = await supabase
    .from("friends")
    .select("*", { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    
  return {
    animeCount: animeCount || 0,
    friendCount: friendCount || 0
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
