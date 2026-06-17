"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
import { AnimeCard } from "@/components/anime/AnimeCard";

const FORMAT_FILTERS: { label: string; value: MediaFormat | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "TV Series", value: "TV" },
  { label: "Movies", value: "MOVIE" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
  { label: "Specials", value: "SPECIAL" },
];

const GENRES_LIST = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller"
];

export default function SearchPage() {
  const searchParams = useSearchParams();

  // Read initial values from URL query string if present
  const initialQuery = searchParams.get("q") || "";
  const initialFormat = (searchParams.get("format") as MediaFormat) || "ALL";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialGenres = searchParams.getAll("genres");

  const [query, setQuery] = useState(initialQuery);
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | "ALL">(initialFormat);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres.length ? initialGenres[0].split(',') : []);
  const [showGenres, setShowGenres] = useState(selectedGenres.length > 0);
  const [page, setPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Debounce the query string for API calls (500ms delay)
  const debouncedQuery = useDebounce(query, 500);

  const [results, setResults] = useState<AniListMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  const handleFormatChange = (val: MediaFormat | "ALL") => {
    setSelectedFormat(val);
    setPage(1);
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
    setPage(1);
  };

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selectedFormat && selectedFormat !== "ALL") params.set("format", selectedFormat);
      if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(','));
      if (page > 1) params.set("page", String(page));

      const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
      window.history.replaceState(null, "", newUrl);

      const data = await searchAnime({
        search: debouncedQuery,
        format: selectedFormat === "ALL" ? null : selectedFormat,
        genres: selectedGenres,
        page: page,
        perPage: 24, // Get more results
      });

      setResults(data.Page.media);
      setTotal(data.Page.pageInfo.total);
      setHasNextPage(data.Page.pageInfo.hasNextPage);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search anime";
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedFormat, selectedGenres, page]);

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
            onChange={(e) => handleQueryChange(e.target.value)}
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
              onClick={() => handleFormatChange(format.value)}
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

        {/* Genre filter chips toggle */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <button
            onClick={() => setShowGenres(!showGenres)}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showGenres ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {showGenres ? "Hide Genre Filters" : "Filter by Genre"}
          </button>
          {!showGenres && selectedGenres.length > 0 && (
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-[var(--radius-full)] font-medium">
                {selectedGenres.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Genre filter chips */}
        {showGenres && (
          <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
            {GENRES_LIST.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-[var(--radius-full)]
                  transition-all cursor-pointer
                  ${
                    selectedGenres.includes(genre)
                      ? "bg-accent/20 text-accent border border-accent/50"
                      : "bg-transparent text-text-secondary border border-border hover:border-border-hover hover:text-text-primary"
                  }
                `}
              >
                {genre}
              </button>
            ))}
            {selectedGenres.length > 0 && (
              <button
                onClick={() => setSelectedGenres([])}
                className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-full)] bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all cursor-pointer"
              >
                Clear Genres
              </button>
            )}
          </div>
        )}
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
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((anime) => {
              const title = getTitle(anime.title);
              const coverImage = getCoverImage(anime.coverImage);
              const score = formatScore(anime.averageScore);
              const formatStr = formatMediaFormat(anime.format);

              return (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={title}
                  coverImage={coverImage}
                  score={score}
                  formatStr={formatStr}
                  primaryGenre={anime.genres[0]}
                  episodesOrStatus={anime.episodes ? `${anime.episodes} eps` : anime.status === "RELEASING" ? "Airing" : "TBA"}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {(page > 1 || hasNextPage) && (
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page <span className="text-text-primary font-medium">{page}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!hasNextPage || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
