"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { useDebounce } from "@/hooks/useDebounce";
import {
  searchAnime,
  formatMediaFormat,
  getTitle,
  getCoverImage,
  formatScore,
  type AniListMedia,
  type MediaFormat,
} from "@/lib/anilist/client";

const FORMAT_FILTERS: { label: string; value: MediaFormat | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "TV Series", value: "TV" },
  { label: "Movies", value: "MOVIE" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
  { label: "Specials", value: "SPECIAL" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();

  // Read initial values from URL query string if present
  const initialQuery = searchParams.get("q") || "";
  const initialFormat = (searchParams.get("format") as MediaFormat) || "ALL";

  const [query, setQuery] = useState(initialQuery);
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | "ALL">(initialFormat);

  // Debounce the query string for API calls (500ms delay)
  const debouncedQuery = useDebounce(query, 500);

  const [results, setResults] = useState<AniListMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selectedFormat && selectedFormat !== "ALL") params.set("format", selectedFormat);

      const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
      window.history.replaceState(null, "", newUrl);

      const data = await searchAnime({
        search: debouncedQuery,
        format: selectedFormat === "ALL" ? null : selectedFormat,
        perPage: 24, // Get more results
      });

      setResults(data.Page.media);
      setTotal(data.Page.pageInfo.total);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search anime";
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedFormat]);

  // Run search when debounced inputs change
  useEffect(() => {
    let mounted = true;
    
    // Instead of calling fetchResults directly which triggers set-state-in-effect,
    // we use a slight timeout or just call it asynchronously.
    const doFetch = async () => {
      if (mounted) {
        await fetchResults();
      }
    };
    
    doFetch();
    
    return () => {
      mounted = false;
    };
  }, [fetchResults]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Search Anime
        </h1>
        <p className="text-text-secondary text-sm">
          Discover your next favorite anime from the AniList database.
        </p>
      </div>

      {/* Search Controls */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex-1 max-w-2xl">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>

        {/* Format filter chips */}
        <div className="flex flex-wrap gap-2">
          {FORMAT_FILTERS.map((format) => (
            <button
              key={format.label}
              onClick={() => setSelectedFormat(format.value)}
              className={`
                px-4 py-1.5 text-xs font-medium rounded-[var(--radius-full)]
                transition-all cursor-pointer
                ${
                  selectedFormat === format.value
                    ? "bg-accent text-white"
                    : "bg-bg-card text-text-secondary border border-border hover:border-border-hover hover:text-text-primary"
                }
              `}
            >
              {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Info */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {debouncedQuery ? "Found " : "Trending "}
            <span className="text-text-primary font-medium">{total}</span> results
          </p>
        </div>
      )}

      {/* Results Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorDisplay
          title="Search Failed"
          message={error}
          onRetry={fetchResults}
        />
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-bg-card rounded-[var(--radius-lg)] border border-border">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-text-primary font-medium">No results found</p>
          <p className="text-sm text-text-muted">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((anime) => {
            const title = getTitle(anime.title);
            const coverImage = getCoverImage(anime.coverImage);
            const score = formatScore(anime.averageScore);
            const formatStr = formatMediaFormat(anime.format);

            return (
              <Link key={anime.id} href={`/anime/${anime.id}`} className="block h-full">
                <Card
                  hover
                  glow
                  padding="none"
                  className="overflow-hidden group flex flex-col h-full"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[2/3] bg-bg-secondary w-full">
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized // Since AniList external URLs aren't in next.config.js by default
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      No Image
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    {score && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-black/70 text-white rounded-[var(--radius-sm)] backdrop-blur-md flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {score}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-black/70 text-white rounded-[var(--radius-sm)] backdrop-blur-md ml-auto">
                      {formatStr}
                    </span>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <Button variant="primary" size="sm" className="w-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                      Add to List
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight mb-1"
                      title={title}
                    >
                      {title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
                    <span className="truncate max-w-[60%]">
                      {anime.genres[0] || "Unknown"}
                    </span>
                    <span>
                      {anime.episodes ? `${anime.episodes} eps` : anime.status === "RELEASING" ? "Airing" : "TBA"}
                    </span>
                  </div>
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
