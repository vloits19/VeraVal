import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/server";
import { getAnimeByIds } from "@/lib/anilist/client";
import { AnimeListClient } from "@/components/profile/AnimeListClient";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.username}'s Anime List`,
  };
}

export default async function UserAnimeListPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  const profile = await getUserProfile(username);
  
  if (!profile) {
    notFound();
  }

  const supabase = await createClient();
  const { data: listEntries } = await supabase
    .from("anime_lists")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  let anilistData: any[] = [];
  if (listEntries && listEntries.length > 0) {
    const animeIds = Array.from(new Set(listEntries.map((e) => e.anime_id)));
    // Slice to 50 for now to prevent AniList query errors, ideally we'd chunk this
    anilistData = await getAnimeByIds(animeIds.slice(0, 50));
  }

  const listItems = (listEntries || []).map((entry) => {
    const anime = anilistData.find((a) => a.id === entry.anime_id);
    return { ...entry, anime };
  }).filter((item) => item.anime);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {profile.username}&apos;s Anime List
        </h1>
        <p className="text-sm text-text-muted">Browse all tracked anime</p>
      </div>

      <AnimeListClient initialItems={listItems} />
    </div>
  );
}
