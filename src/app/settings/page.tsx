import React from "react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ThemeToggleSection } from "@/components/profile/ThemeToggleSection";
import { DangerZoneSection } from "@/components/profile/DangerZoneSection";
import { NotificationSettings } from "@/components/profile/NotificationSettings";
import { SettingsForm } from "@/components/profile/SettingsForm";
import { ShowcaseManager } from "@/components/profile/ShowcaseManager";
import { getShowcase } from "@/lib/profile/showcaseActions";
import { getAnimeByIds } from "@/lib/anilist/client";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
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

  const [showcaseData, { data: userAnimeList }] = await Promise.all([
    getShowcase(user.id),
    supabase.from("anime_lists").select("anime_id, status").eq("user_id", user.id),
  ]);

  const allIds = Array.from(new Set([
    ...(showcaseData.map(s => s.anime_id)),
    ...(userAnimeList?.map(a => a.anime_id) || [])
  ]));

  let anilistData: any[] = [];
  if (allIds.length > 0) {
    // Note: AniList pagination might be needed if allIds > 50
    // But for beta, slicing to 50 is fine to prevent errors
    anilistData = await getAnimeByIds(allIds.slice(0, 50));
  }

  const animeDetails: Record<number, any> = {};
  for (const anime of anilistData) {
    animeDetails[anime.id] = {
      id: anime.id,
      title: anime.title.english || anime.title.romaji || anime.title.native,
      coverImage: anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium,
      score: anime.averageScore ? Number((anime.averageScore / 10).toFixed(1)) : null,
    };
  }

  if (!profile) {
    // If the profile wasn't created properly, we should handle this gracefully
    // But for now, we just pass what we can or show an error
    return (
      <div className="max-w-2xl p-4 bg-danger/10 text-danger rounded-[var(--radius-md)] border border-danger/20">
        <h2 className="font-bold">Profile not found.</h2>
        <p className="text-sm">Please make sure you have run the database migrations in Supabase and your profile was created successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account preferences and appearance.
        </p>
      </div>

      {/* ── Account Section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Account
        </h2>

        <Card padding="lg">
          <SettingsForm user={profile as any} />
        </Card>
      </section>

      {/* ── Appearance Section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          Appearance
        </h2>

        <ThemeToggleSection />
      </section>

      {/* ── Profile Showcase ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          Profile Showcase
        </h2>

        <ShowcaseManager 
          initialShowcase={showcaseData}
          userAnimeList={userAnimeList || []}
          animeDetails={animeDetails}
        />
      </section>

      {/* ── Notifications Section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          Notifications
        </h2>

        <NotificationSettings 
          initialPreferences={profile.preferences || {
            notify_episodes: true,
            notify_recommendations: true,
            notify_social: true
          }} 
        />
      </section>

      {/* ── Danger Zone ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-danger flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Danger Zone
        </h2>

        <DangerZoneSection />
      </section>
    </div>
  );
}
