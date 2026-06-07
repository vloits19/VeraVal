"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return [];
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Search users by username (case-insensitive)
  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar, accent_color, created_at")
    .ilike("username", `%${query}%`)
    .limit(20);
    
  if (error) {
    console.error("Error searching users:", error);
    return [];
  }
  
  // Optionally filter out the current user
  return data.filter(u => u.id !== user?.id);
}
