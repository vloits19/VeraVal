import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile, getUserCategoryList } from "@/lib/profile/actions";
import { getAnimeByIds } from "@/lib/anilist/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const VALID_CATEGORIES = {
  "favorites": { title: "Favorites", queryVal: "favorites" },
  "plan-to-watch": { title: "Plan To Watch", queryVal: "plan_to_watch" },
  "dropped": { title: "Dropped", queryVal: "dropped" },
  "not-interested": { title: "Not Interested", queryVal: "not_interested" },
};

export default async function CategoryPage({ params }: { params: Promise<{ username: string; category: string }> }) {
  const resolvedParams = await params;
  const { username, category } = resolvedParams;
  
  if (!VALID_CATEGORIES[category as keyof typeof VALID_CATEGORIES]) {
    notFound();
  }
  
  const categoryMeta = VALID_CATEGORIES[category as keyof typeof VALID_CATEGORIES];
  const profile = await getUserProfile(username);
  if (!profile) notFound();

  const list = await getUserCategoryList(profile.id, categoryMeta.queryVal);
  
  const animeDataMap = new Map();
  if (list && list.length > 0) {
    const ids = list.map(e => e.anime_id);
    const mediaList = await getAnimeByIds(ids);
    mediaList.forEach(m => animeDataMap.set(m.id, m));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 animate-fade-in pb-20 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href={`/user/${username}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-text-muted hover:text-text-primary">
              &larr; Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">
            {profile.username}&apos;s {categoryMeta.title}
          </h1>
        </div>
      </div>
      
      {list.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center text-text-secondary">
          No anime in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {list.map(entry => {
            const anime = animeDataMap.get(entry.anime_id);
            if (!anime) return null;
            
            const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
            const title = anime.title.english || anime.title.romaji || "Unknown";
            
            return (
              <Link key={entry.id} href={`/anime/${anime.id}`} className="block h-full">
                <Card hover glow padding="none" className="overflow-hidden h-full flex flex-col group border-transparent hover:border-accent/50">
                  <div className="relative aspect-[2/3] w-full bg-bg-secondary">
                    {coverImage && (
                      <Image src={coverImage} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md p-2">
                      <p className="text-xs font-bold text-white text-center tracking-wider">
                        EP {entry.progress} {anime.episodes ? `/ ${anime.episodes}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h4 className="text-sm font-medium text-text-primary line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                      {title}
                    </h4>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
