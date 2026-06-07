import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileAnimeListRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile to get username
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    redirect(`/profile/${profile.username}/anime-list`);
  } else {
    redirect("/settings");
  }
}
