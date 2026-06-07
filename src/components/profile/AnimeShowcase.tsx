import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAnimeByIds, getTitle, getCoverImage } from "@/lib/anilist/client";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

interface AnimeShowcaseProps {
  userId: string;
  username?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  favorites: "Favorites",
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
  dropped: "Dropped",
  not_interested: "Not Interested",
};

export async function AnimeShowcase({ userId, username }: AnimeShowcaseProps) {
  const supabase = await createClient();
  
  // Fetch pinned and favorite items directly from anime_lists
  const { data: showcaseData, error } = await supabase
    .from("anime_lists")
    .select("anime_id, status, is_pinned, is_favorite, score, updated_at")
    .eq("user_id", userId)
    .or("is_pinned.eq.true,is_favorite.eq.true");

  if (error) {
    console.error("Error fetching showcase items:", error);
  }

  if (!showcaseData || showcaseData.length === 0) {
    return (
      <Card padding="lg" className="flex flex-col items-center justify-center py-16">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted/30 mb-4">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <div className="text-center space-y-2">
          <p className="text-text-secondary font-medium">No showcase items</p>
          <p className="text-sm text-text-muted">Pin or Favorite anime to see them here.</p>
        </div>
      </Card>
    );
  }

  // Fetch data from AniList
  const animeIds = Array.from(new Set(showcaseData.map((e) => e.anime_id)));
  const anilistData = await getAnimeByIds(animeIds);

  const animeMap = new Map();
  for (const a of anilistData) {
    animeMap.set(a.id, a);
  }

  // Categories to display
  const categories = ["favorites", "watching", "completed", "plan_to_watch", "dropped", "not_interested"];

  // Sort function to order items by recently updated
  const sortByRecent = (a: any, b: any) => {
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        let items = [];
        
        if (category === "favorites") {
          items = showcaseData.filter((s) => s.is_favorite).sort(sortByRecent).slice(0, 5);
        } else {
          items = showcaseData.filter((s) => s.is_pinned && s.status === category).sort(sortByRecent).slice(0, 5);
        }

        if (items.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="font-semibold text-text-primary">
                {CATEGORY_LABELS[category]}
              </h3>
              {category === "favorites" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {items.map((item) => {
                const anime = animeMap.get(item.anime_id);
                if (!anime) return null;

                const title = getTitle(anime.title);
                const cover = getCoverImage(anime.coverImage);
                const userScore = item.score;

                return (
                  <Link key={`${category}-${item.anime_id}`} href={`/anime/${anime.id}`} className="group relative rounded-[var(--radius-md)] overflow-hidden aspect-[3/4] block bg-bg-card border border-border">
                    <Image src={cover} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 inset-x-0 p-2">
                      <p className="text-xs font-medium text-white line-clamp-2 leading-tight">
                        {title}
                      </p>
                      {userScore > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-[10px] font-bold text-white">{userScore}/10</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
