import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAnimeById, getCoverImage, formatScore, formatStatus, formatMediaFormat } from "@/lib/anilist/client";
import { getAnimeStatus } from "@/lib/anime/actions";
import { AnimeStatusDropdown } from "@/components/anime/AnimeStatusDropdown";
import { AnimeProgressTracker } from "@/components/anime/AnimeProgressTracker";
import { AnimeShowcasePin } from "@/components/anime/AnimeShowcasePin";

export default async function AnimeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const animeId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(animeId)) {
    notFound();
  }

  let anime;
  let userStatus;

  try {
    // Parallel fetching
    [anime, userStatus] = await Promise.all([
      getAnimeById(animeId),
      getAnimeStatus(animeId),
    ]);
  } catch (error) {
    console.error(error);
    notFound();
  }

  const title = anime.title.english || anime.title.romaji || "Unknown Title";
  const nativeTitle = anime.title.native;
  const coverImage = getCoverImage(anime.coverImage);
  const bannerImage = anime.bannerImage || coverImage;
  const score = formatScore(anime.averageScore);
  
  // Simple HTML strip for description since AniList sends HTML
  const cleanDescription = anime.description?.replace(/<[^>]*>?/gm, '') || "No description available.";

  return (
    <div className="animate-fade-in pb-20">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 w-full bg-bg-secondary overflow-hidden">
        {bannerImage && (
          <>
            <Image
              src={bannerImage}
              alt="Banner"
              fill
              sizes="100vw"
              quality={75}
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main to-transparent" />
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8 -mt-24 relative z-10">
          
          {/* Sidebar (Poster & Actions) */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="relative aspect-[2/3] w-48 md:w-full rounded-[var(--radius-lg)] overflow-hidden shadow-xl border-4 border-bg-main bg-bg-secondary mx-auto md:mx-0">
              {coverImage ? (
                <Image src={coverImage} alt={title} fill sizes="(max-width: 768px) 192px, 256px" quality={85} className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
              )}
            </div>

            {/* User Actions */}
            <div className="space-y-3">
              <AnimeStatusDropdown animeId={animeId} initialStatus={userStatus?.status || null} />
              
              {userStatus && (
                <>
                  <AnimeProgressTracker 
                    animeId={animeId} 
                    initialProgress={userStatus.progress || 0} 
                    totalEpisodes={anime.episodes} 
                  />
                  <AnimeShowcasePin 
                    animeId={animeId}
                    initialFavorite={userStatus.is_favorite || false}
                    initialPinned={userStatus.is_pinned || false}
                    hasListEntry={true}
                  />
                </>
              )}
            </div>

            {/* Info Grid */}
            <div className="bg-bg-card rounded-[var(--radius-lg)] p-4 border border-border space-y-4">
              <div>
                <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Format</h4>
                <p className="text-sm text-text-primary">{formatMediaFormat(anime.format)}</p>
              </div>
              <div>
                <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Episodes</h4>
                <p className="text-sm text-text-primary">{anime.episodes || "Unknown"}</p>
              </div>
              <div>
                <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Status</h4>
                <p className="text-sm text-text-primary">{formatStatus(anime.status)}</p>
              </div>
              <div>
                <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Season</h4>
                <p className="text-sm text-text-primary">
                  {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "Unknown"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Studios</h4>
                <p className="text-sm text-text-primary">
                  {anime.studios?.nodes.filter(n => n.isAnimationStudio).map(n => n.name).join(", ") || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6 pt-0 md:pt-24">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-text-primary leading-tight">
                {title}
              </h1>
              {nativeTitle && (
                <p className="text-lg text-text-muted">{nativeTitle}</p>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {score && (
                <div className="flex items-center gap-2 bg-bg-card px-3 py-1.5 rounded-[var(--radius-full)] border border-border">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-sm font-bold text-text-primary">{score}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {anime.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-[var(--radius-full)]"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Synopsis</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {cleanDescription}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
