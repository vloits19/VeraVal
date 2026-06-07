"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NotificationType = "friend_request" | "friend_accepted" | "friend_activity" | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string | null;
  reference_url: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Create a notification for a user.
 * This is an internal helper — called by other server actions.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  referenceId?: string,
  referenceUrl?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    reference_id: referenceId || null,
    reference_url: referenceUrl || null,
  });

  if (error) {
    console.error("Error creating notification:", error);
    // Don't throw — notifications are non-critical
  }
}

/**
 * Fetch notifications for the current user, optionally filtered by type.
 */
export async function getNotifications(filter?: NotificationType): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter) {
    query = query.eq("type", filter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data as Notification[];
}

/**
 * Get unread notification count for the current user.
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
}

/**
 * Delete a single notification.
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
}
