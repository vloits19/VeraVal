import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile, getUserStats, getUserShowcases } from "@/lib/profile/actions";
import { getAnimeByIds } from "@/lib/anilist/client";
import { getFriendshipStatus } from "@/lib/friends/actions";
import type { AnimeListEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FriendActionButton } from "@/components/social/FriendActionButton";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  const profile = await getUserProfile(username);
  
  if (!profile) {
    notFound();
  }

  const [stats, showcases, friendship] = await Promise.all([
    getUserStats(profile.id),
    getUserShowcases(profile.id),
    getFriendshipStatus(profile.id),
  ]);

  // Extract unique anime IDs to fetch metadata from AniList
  const allAnimeIds = new Set<number>();
  [showcases.favorites, showcases.planToWatch, showcases.dropped, showcases.notInterested].forEach(list => {
    list.forEach(entry => allAnimeIds.add(entry.anime_id));
  });

  const animeDataMap = new Map();
  if (allAnimeIds.size > 0) {
    const mediaList = await getAnimeByIds(Array.from(allAnimeIds));
    mediaList.forEach(media => animeDataMap.set(media.id, media));
  }

  const renderShowcase = (title: string, list: AnimeListEntry[], linkPath: string) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary border-l-4 pl-3" style={{ borderColor: 'var(--user-accent)' }}>
            {title}
          </h3>
          <Link href={linkPath}>
            <Button variant="ghost" size="sm" style={{ color: 'var(--user-accent)' }}>
              View All &rarr;
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {list.map(entry => {
            const anime = animeDataMap.get(entry.anime_id);
            if (!anime) return null;
            
            const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
            const animeTitle = anime.title.english || anime.title.romaji || "Unknown";

            return (
              <Link key={entry.id} href={`/anime/${anime.id}`} className="block h-full group">
                <div className="relative aspect-[2/3] w-full rounded-[var(--radius-md)] overflow-hidden bg-bg-secondary mb-2 border border-border group-hover:border-accent transition-colors shadow-sm">
                  {coverImage && (
                    <Image src={coverImage} alt={animeTitle} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw" quality={75} className="object-cover" loading="lazy" />
                  )}
                  {/* Progress overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-1.5 text-center">
                    <span className="text-xs font-bold text-white">
                      Ep {entry.progress} {anime.episodes ? `/ ${anime.episodes}` : ""}
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-medium text-text-primary line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                  {animeTitle}
                </h4>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="animate-fade-in pb-20"
      style={{ '--user-accent': profile.accent_color } as React.CSSProperties}
    >
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full bg-bg-secondary border-b border-border overflow-hidden">
        {profile.banner ? (
          <>
            <Image src={profile.banner} alt={`${profile.username}'s banner`} fill sizes="100vw" quality={75} className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main to-transparent opacity-60" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--user-accent)', opacity: 0.2 }} />
        )}
      </div>

      {/* Main Content Wrapper */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 -mt-20 md:-mt-24">
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end mb-8 text-center md:text-left">
          {/* Avatar */}
          <div 
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-xl shrink-0 bg-bg-card flex items-center justify-center overflow-hidden"
            style={{ borderColor: 'var(--user-accent)' }}
          >
            {profile.avatar ? (
              <Image src={profile.avatar} alt={profile.username} fill sizes="160px" quality={85} className="object-cover" priority />
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-text-muted">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* User Info & Actions */}
          <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-center md:items-end gap-4 pb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                {profile.username}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-text-muted">
                <span>
                  <strong className="text-text-primary font-bold">{stats.friendCount}</strong> Followers
                </span>
                <span>
                  <strong className="text-text-primary font-bold">{stats.animeCount}</strong> Anime
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FriendActionButton 
                targetUserId={profile.id}
                initialStatus={friendship.status}
                requestId={friendship.requestId}
                friendId={friendship.friendId}
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Bio & Info */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <Card padding="lg" className="space-y-4 shadow-sm border-t-4" style={{ borderTopColor: 'var(--user-accent)' }}>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">About</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>
              
              <div className="h-px bg-border my-4" />
              
              <div className="text-xs text-text-muted space-y-2">
                <p>Joined {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>

          {/* Right Column: Showcases */}
          <div className="flex-1 space-y-12">
            
            {stats.animeCount === 0 ? (
              <div className="bg-bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center text-text-secondary">
                <p>{profile.username} hasn&apos;t tracked any anime yet.</p>
              </div>
            ) : (
              <>
                {renderShowcase("Favorites", showcases.favorites, `/user/${username}/favorites`)}
                {renderShowcase("Plan To Watch", showcases.planToWatch, `/user/${username}/plan-to-watch`)}
                {renderShowcase("Dropped", showcases.dropped, `/user/${username}/dropped`)}
                {renderShowcase("Not Interested", showcases.notInterested, `/user/${username}/not-interested`)}

                {/* If nothing is pinned */}
                {Object.values(showcases).every(list => list.length === 0) && (
                  <div className="bg-bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center text-text-secondary">
                    <p>No anime pinned to showcases yet.</p>
                  </div>
                )}
              </>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
