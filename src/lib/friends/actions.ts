"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/actions";

export type FriendshipStatus = "none" | "request_sent" | "request_received" | "friends";

export async function getFriendshipStatus(targetUserId: string): Promise<{ status: FriendshipStatus; requestId?: string; friendId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "none" };
  if (user.id === targetUserId) return { status: "none" };

  // Check if they are friends
  const user1 = user.id < targetUserId ? user.id : targetUserId;
  const user2 = user.id < targetUserId ? targetUserId : user.id;

  const { data: friendData } = await supabase
    .from("friends")
    .select("id")
    .eq("user1_id", user1)
    .eq("user2_id", user2)
    .single();

  if (friendData) {
    return { status: "friends", friendId: friendData.id };
  }

  // Check requests
  const { data: reqSent } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("sender_id", user.id)
    .eq("receiver_id", targetUserId)
    .eq("status", "pending")
    .single();

  if (reqSent) {
    return { status: "request_sent", requestId: reqSent.id };
  }

  const { data: reqRecv } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("sender_id", targetUserId)
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .single();

  if (reqRecv) {
    return { status: "request_received", requestId: reqRecv.id };
  }

  return { status: "none" };
}

export async function sendFriendRequest(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get sender's profile for the notification message
  const { data: senderProfile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("friend_requests")
    .insert({ sender_id: user.id, receiver_id: targetUserId, status: "pending" });

  if (error) throw new Error(error.message);

  // Create notification for receiver
  const senderName = senderProfile?.username || "Someone";
  await createNotification(
    targetUserId,
    "friend_request",
    "New Friend Request",
    `${senderName} sent you a friend request.`,
    user.id,
    `/user/${senderName}`
  );

  revalidatePath("/friends");
}

export async function acceptFriendRequest(requestId: string, senderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get accepter's profile for the notification
  const { data: accepterProfile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  // Update request
  const { error: reqError } = await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);

  if (reqError) throw new Error(reqError.message);

  // Insert into friends
  const user1 = user.id < senderId ? user.id : senderId;
  const user2 = user.id < senderId ? senderId : user.id;

  const { error: friendError } = await supabase
    .from("friends")
    .insert({ user1_id: user1, user2_id: user2 });

  if (friendError) throw new Error(friendError.message);

  // Notify the original sender that their request was accepted
  const accepterName = accepterProfile?.username || "Someone";
  await createNotification(
    senderId,
    "friend_accepted",
    "Friend Request Accepted",
    `${accepterName} accepted your friend request!`,
    user.id,
    `/user/${accepterName}`
  );

  revalidatePath("/friends");
}

export async function rejectFriendRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/friends");
}

export async function cancelFriendRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("friend_requests")
    .delete()
    .eq("id", requestId)
    .eq("sender_id", user.id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
  revalidatePath("/friends");
}

export async function removeFriend(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const user1 = user.id < targetUserId ? user.id : targetUserId;
  const user2 = user.id < targetUserId ? targetUserId : user.id;

  // Delete from friends table
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("user1_id", user1)
    .eq("user2_id", user2);

  if (error) throw new Error(error.message);
  
  // Also delete any existing requests between the two just in case
  await supabase
    .from("friend_requests")
    .delete()
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`);

  revalidatePath("/friends");
}

export async function getFriendsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Supabase RPC or dual query. Since it's user1 or user2, we query both.
  const { data: asUser1 } = await supabase
    .from("friends")
    .select(`
      id,
      users!friends_user2_id_fkey(id, username, avatar, accent_color, last_active)
    `)
    .eq("user1_id", user.id);

  const { data: asUser2 } = await supabase
    .from("friends")
    .select(`
      id,
      users!friends_user1_id_fkey(id, username, avatar, accent_color, last_active)
    `)
    .eq("user2_id", user.id);

  // Normalize
  const friends = [];
  if (asUser1) {
    friends.push(...asUser1.map(f => ({ friendId: f.id, user: Array.isArray(f.users) ? f.users[0] : f.users })));
  }
  if (asUser2) {
    friends.push(...asUser2.map(f => ({ friendId: f.id, user: Array.isArray(f.users) ? f.users[0] : f.users })));
  }

  return friends;
}

export async function getPendingRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("friend_requests")
    .select(`
      id,
      sender:users!friend_requests_sender_id_fkey(id, username, avatar, accent_color)
    `)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) return [];
  
  return data.map(req => ({
    id: req.id,
    sender: Array.isArray(req.sender) ? req.sender[0] : req.sender
  }));
}
