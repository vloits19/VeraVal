"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Checks if current user is admin */
async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: Requires admin role");
  }
  return supabase;
}

export async function getAdminUsersList() {
  const supabase = await ensureAdmin();
  
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, is_banned, ban_reason, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUserRoleAdmin(userId: string, newRole: string) {
  const supabase = await ensureAdmin();
  
  // Prevent changing roles to arbitrary values
  if (!["user", "whitelist", "admin"].includes(newRole)) {
    throw new Error("Invalid role");
  }

  const { error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}

export async function banUser(userId: string, reason: string) {
  const supabase = await ensureAdmin();

  // Prevent admin from banning another admin to avoid lockouts
  const { data: targetUser } = await supabase.from("users").select("role").eq("id", userId).single();
  if (targetUser?.role === "admin") {
    throw new Error("Cannot ban another admin");
  }

  const { error } = await supabase
    .from("users")
    .update({ is_banned: true, ban_reason: reason })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}

export async function unbanUser(userId: string) {
  const supabase = await ensureAdmin();
  const { error } = await supabase
    .from("users")
    .update({ is_banned: false, ban_reason: null })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}
