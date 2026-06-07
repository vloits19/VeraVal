import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { searchAnime, getTitle, getCoverImage, formatScore } from "@/lib/anilist/client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "VeraVal — Track Your Anime Journey",
  description:
    "A simpler, cleaner alternative to MyAnimeList. Track, discover, and enjoy anime your way.",
};

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Organize Your List",
    description:
      "Categorize anime into watching, completed, on hold, dropped, and plan to watch.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Discover New Anime",
    description:
      "Search from a vast database and find your next favorite show to binge.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Track Progress",
    description:
      "Keep track of episodes watched, scores, and your viewing stats at a glance.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Share & Connect",
    description:
      "Build your profile and share your anime taste with the community.",
  },
];

export default async function HomePage() {
  // Fetch actual trending anime from AniList (top 4)
  let trendingAnime: any[] = [];
  try {
    const trendingData = await searchAnime({ perPage: 4 });
    trendingAnime = trendingData?.Page?.media || [];
  } catch (error) {
    console.error("Failed to fetch trending anime:", error);
    // Fallback to empty array on network failure
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-16 pb-8 animate-fade-in">
      {/* ── Hero Section ── */}
      <section className="relative py-16 md:py-24 text-center space-y-8">
        {/* Glow background */}
        <div
          className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />
        </div>

        <div className="space-y-4">
          <span className="inline-block px-4 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full">
            Currently in development
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Track.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
              Discover.
            </span>{" "}
            Enjoy.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            A simpler, cleaner alternative to MyAnimeList.
            <br className="hidden sm:block" />
            Your anime journey, beautifully organized.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Get Started
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="ml-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="secondary" size="lg">
              Browse Anime
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 md:gap-16 pt-4">
          {[
            { value: "50K+", label: "Anime Titles" },
            { value: "—", label: "Active Users" },
            { value: "∞", label: "Episodes Tracked" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features-section" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">
            Everything you need
          </h2>
          <p className="text-text-secondary">
            Simple tools to manage your anime watching experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} hover glow padding="lg">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-accent/10 flex items-center justify-center text-accent">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Trending Section ── */}
      <section id="trending-section" className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
            <p className="text-text-secondary text-sm">
              Popular anime this season
            </p>
          </div>
          <Link href="/search">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingAnime.length > 0 ? (
            trendingAnime.map((anime) => {
              const title = getTitle(anime.title);
              const coverImage = getCoverImage(anime.coverImage);
              const score = formatScore(anime.averageScore);
              const genre = anime.genres?.[0] || anime.format || "Anime";

              return (
                <Link href={`/anime/${anime.id}`} key={anime.id}>
                  <Card 
                    padding="none" 
                    className="group overflow-hidden relative cursor-pointer border border-border/50 bg-bg-card hover:border-accent/50 transition-all duration-[400ms] h-full flex flex-col"
                  >
                    {/* Image container with aspect ratio and smooth scale */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-bg-secondary w-full">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-[600ms] group-hover:scale-110 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          No Image
                        </div>
                      )}
                      
                      {/* Dark gradient overlay that shifts on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                      
                      {/* Floating Info on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[400ms] ease-out">
                        <h3 className="text-base font-bold text-text-primary line-clamp-2 drop-shadow-md">
                          {title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] delay-75">
                          <span className="text-xs font-medium px-2 py-1 bg-accent/20 text-accent rounded-full backdrop-blur-sm">
                            {genre}
                          </span>
                          {score && (
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-12 text-center text-text-muted bg-bg-card rounded-[var(--radius-lg)] border border-border border-dashed">
              Failed to load trending anime. Please check your internet connection or try again later.
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ── */}
      {!user && (
        <section className="text-center py-12">
          <Card
            padding="lg"
            glow
            className="bg-gradient-to-br from-bg-card to-accent/5 max-w-2xl mx-auto"
          >
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Ready to start tracking?
              </h2>
              <p className="text-text-secondary">
                Create your free account and begin your organized anime journey today.
              </p>
              <Link href="/register">
                <Button size="lg" className="mt-2">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
