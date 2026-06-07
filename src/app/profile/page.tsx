import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnimeShowcase } from "@/components/profile/AnimeShowcase";
import { createClient } from "@/lib/supabase/server";
import { getUserStats } from "@/lib/profile/actions";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your VeraVal anime profile and statistics.",
};

const STATS = [
  { label: "Watching", value: "—", color: "text-info" },
  { label: "Completed", value: "—", color: "text-success" },
  { label: "On Hold", value: "—", color: "text-warning" },
  { label: "Dropped", value: "—", color: "text-danger" },
  { label: "Plan to Watch", value: "—", color: "text-text-muted" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch full profile from users table
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const stats = await getUserStats(user.id);
  
  const STATS = [
    { label: "Anime", value: stats.animeCount, color: "text-accent" },
    { label: "Friends", value: stats.friendCount, color: "text-text-primary" },
    { label: "Watching", value: stats.watchingCount, color: "text-info" },
    { label: "Completed", value: stats.completedCount, color: "text-success" },
    { label: "Plan to Watch", value: stats.planToWatchCount, color: "text-text-muted" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile header */}
      <Card padding="lg" className="relative overflow-hidden">
        {/* Banner gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-accent/20 via-purple-500/10 to-transparent" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 pt-16">
          <Avatar src={profile?.avatar} fallback={profile?.username || "User"} size="xl" className="ring-4 ring-bg-card" />

          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">{profile?.username || "User"}</h1>
            <p className="text-sm text-text-secondary max-w-xl">
              {profile?.bio || "No bio yet. Update your profile in settings."}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <Link href="/settings">
            <Button variant="secondary" size="sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATS.map((stat) => (
          <Card key={stat.label} padding="md" hover className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Anime list showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Anime Showcase</h2>
        </div>
        <AnimeShowcase userId={user.id} />
      </section>
    </div>
  );
}
