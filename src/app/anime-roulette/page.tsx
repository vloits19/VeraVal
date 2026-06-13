"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  getRouletteAnime,
  type RouletteFilters,
} from "@/lib/anime/roulette-actions";
import {
  type AniListMedia,
  type MediaFormat,
  getTitle,
  getCoverImage,
  formatScore,
  formatMediaFormat,
} from "@/lib/anilist/client";
import { playShuffleTick, playRevealChime } from "@/lib/audio";

/* ── Constants ── */
const SHUFFLE_TITLES = [
  "Frieren: Beyond Journey's End",
  "Attack on Titan",
  "Steins;Gate",
  "Your Name",
  "Mob Psycho 100",
  "Spy × Family",
  "Violet Evergarden",
  "Demon Slayer",
  "One Punch Man",
  "Jujutsu Kaisen",
  "Chainsaw Man",
  "Bocchi the Rock!",
  "Vinland Saga",
  "Made in Abyss",
  "Re:Zero",
];

const FORMAT_OPTIONS: { label: string; value: MediaFormat | "ALL" }[] = [
  { label: "Any", value: "ALL" },
  { label: "TV Series", value: "TV" },
  { label: "Movie", value: "MOVIE" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
];

const GENRE_OPTIONS = [
  "Action",
  "Romance",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Slice of Life",
  "Mystery",
];

const EPISODE_LENGTH_OPTIONS = [
  { label: "Any", value: "any" as const },
  { label: "Short (≤ 13)", value: "short" as const },
  { label: "Medium (14–26)", value: "medium" as const },
  { label: "Long (27+)", value: "long" as const },
];

const HISTORY_KEY = "veraval-roulette-history";
const MAX_HISTORY = 10;

/* ── Types ── */
type RouletteState = "idle" | "shuffling" | "result";

interface HistoryEntry {
  id: number;
  title: string;
  coverImage: string;
}

/* ── Helpers ── */
function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

/* ======================================================================== */
/*  MAIN COMPONENT                                                          */
/* ======================================================================== */
export default function AnimeRoulettePage() {
  const { profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  /* State */
  const [state, setState] = useState<RouletteState>("idle");
  const [result, setResult] = useState<AniListMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shuffleTitle, setShuffleTitle] = useState(SHUFFLE_TITLES[0]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  /* Filters */
  const [format, setFormat] = useState<MediaFormat | "ALL">("ALL");
  const [genres, setGenres] = useState<string[]>([]);
  const [episodeLength, setEpisodeLength] = useState<"any" | "short" | "medium" | "long">("any");



  /* Load history on mount */
  useEffect(() => {
    setHistory(loadHistory());
  }, []);



  /* ── Shuffle animation ── */
  const runShuffleAnimation = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      let count = 0;
      const maxTicks = 20;
      let delay = 60;

      const tick = () => {
        count++;
        playShuffleTick();
        setShuffleTitle(SHUFFLE_TITLES[Math.floor(Math.random() * SHUFFLE_TITLES.length)]);

        if (count >= maxTicks) {
          resolve();
          return;
        }

        // Slow down towards the end
        if (count > maxTicks * 0.6) {
          delay += 30;
        }

        setTimeout(tick, delay);
      };

      tick();
    });
  }, []);

  /* ── Randomize ── */
  const handleRandomize = useCallback(
    async (surprise: boolean = false) => {
      setState("shuffling");
      setError(null);
      setResult(null);

      // Start shuffle animation
      const animationPromise = runShuffleAnimation();

      // Fetch in parallel
      const filters: RouletteFilters = {
        format: format !== "ALL" ? format : null,
        genres,
        episodeLength,
      };

      const fetchPromise = getRouletteAnime(filters, surprise);

      // Wait for both animation and fetch
      const [, fetchResult] = await Promise.all([animationPromise, fetchPromise]);

      if (fetchResult.error || !fetchResult.anime) {
        setError(fetchResult.error || "No anime found. Try different filters.");
        setState("idle");
        return;
      }

      const anime = fetchResult.anime;
      setResult(anime);
      playRevealChime();
      setState("result");

      // Add to history
      const entry: HistoryEntry = {
        id: anime.id,
        title: getTitle(anime.title),
        coverImage: getCoverImage(anime.coverImage),
      };

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.id !== entry.id);
        const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
        saveHistory(updated);
        return updated;
      });
    },
    [format, genres, episodeLength, runShuffleAnimation]
  );

  /* ── Share ── */
  const handleShare = useCallback(() => {
    if (!result) return;
    const url = `https://vera-val.fayq.my.id/anime/${result.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy link", "error");
    });
  }, [result, showToast]);

  /* ── Genre toggle ── */
  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  /* ================================================================== */
  /*  AUTH LOADING                                                       */
  /* ================================================================== */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ================================================================== */
  /*  AUTH GATE                                                          */
  /* ================================================================== */
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card padding="lg" className="max-w-md w-full text-center space-y-6">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text-primary">
              Login required to use Anime Roulette
            </h2>
            <p className="text-sm text-text-muted">
              Sign in to discover your next favorite anime.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Register
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  /* ================================================================== */
  /*  MAIN UI                                                            */
  /* ================================================================== */
  const resultTitle = result ? getTitle(result.title) : "";
  const resultCover = result ? getCoverImage(result.coverImage) : "";
  const resultScore = result ? formatScore(result.averageScore) : null;
  const resultFormat = result ? formatMediaFormat(result.format) : "";
  const resultDescription = result?.description?.replace(/<[^>]*>?/gm, "") || "";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-full)] bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          Anime Roulette
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
          {state === "result"
            ? "Your Result"
            : "Can\u2019t decide what to watch?"}
        </h1>
        {state !== "result" && (
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Let fate pick your next anime. Use filters to narrow it down, or go
            fully random with Surprise Me.
          </p>
        )}
      </div>

      {/* ── Filters (only show in idle/shuffling) ── */}
      {state !== "result" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mx-auto cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {showFilters && (
            <Card padding="md" className="space-y-5 animate-fade-in">
              {/* Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || "ALL"}
                      onClick={() => setFormat(opt.value)}
                      className={`px-4 py-1.5 text-xs font-medium rounded-[var(--radius-full)] transition-all cursor-pointer ${
                        format === opt.value
                          ? "bg-accent text-white"
                          : "bg-bg-elevated text-text-secondary border border-border hover:border-border-hover hover:text-text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-full)] transition-all cursor-pointer ${
                        genres.includes(genre)
                          ? "bg-accent/20 text-accent border border-accent/50"
                          : "bg-transparent text-text-secondary border border-border hover:border-border-hover hover:text-text-primary"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Length */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Episode Count
                </label>
                <div className="flex flex-wrap gap-2">
                  {EPISODE_LENGTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEpisodeLength(opt.value)}
                      className={`px-4 py-1.5 text-xs font-medium rounded-[var(--radius-full)] transition-all cursor-pointer ${
                        episodeLength === opt.value
                          ? "bg-accent text-white"
                          : "bg-bg-elevated text-text-secondary border border-border hover:border-border-hover hover:text-text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Main Action Area ── */}
      <div className="flex flex-col items-center gap-6">
        {/* IDLE STATE */}
        {state === "idle" && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            {error && (
              <div className="px-4 py-3 rounded-[var(--radius-md)] bg-danger/10 border border-danger/20 text-danger text-sm max-w-md text-center">
                {error}
              </div>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleRandomize(false)}
              className="text-base px-10 py-4 shadow-lg hover:shadow-[var(--shadow-glow)]"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              }
            >
              Randomize Anime
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleRandomize(true)}
              className="group"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:animate-spin">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
            >
              Surprise Me
            </Button>
          </div>
        )}

        {/* SHUFFLING STATE */}
        {state === "shuffling" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <Card
              padding="lg"
              className="w-full max-w-md text-center relative overflow-hidden"
            >
              {/* Background shimmer */}
              <div className="absolute inset-0 animate-shimmer opacity-30" />

              <div className="relative z-10 space-y-4 py-6">
                {/* Shuffling poster placeholder */}
                <div className="w-32 h-48 mx-auto rounded-[var(--radius-md)] bg-bg-elevated overflow-hidden relative">
                  <div className="absolute inset-0 animate-shimmer" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-accent animate-spin"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="3" />
                      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
                      <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
                      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
                      <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
                      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                </div>

                {/* Cycling title */}
                <div className="h-8 flex items-center justify-center overflow-hidden">
                  <p
                    key={shuffleTitle}
                    className="text-lg font-bold text-text-primary animate-roulette-shuffle"
                  >
                    {shuffleTitle}
                  </p>
                </div>

                <p className="text-sm text-text-muted">
                  Searching the anime multiverse...
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* RESULT STATE */}
        {state === "result" && result && (
          <div className="w-full max-w-3xl animate-roulette-reveal">
            <Card
              padding="none"
              className="overflow-hidden animate-roulette-glow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Poster */}
                <div className="relative w-full md:w-64 aspect-[2/3] md:aspect-auto md:min-h-[400px] flex-shrink-0 bg-bg-secondary">
                  {resultCover ? (
                    <Image
                      src={resultCover}
                      alt={resultTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 256px"
                      quality={85}
                      className="object-cover animate-roulette-poster"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted min-h-[300px]">
                      No Image
                    </div>
                  )}
                  {/* Score badge */}
                  {resultScore && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] bg-black/70 backdrop-blur-md text-white text-sm font-bold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {resultScore}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-6 md:p-8 space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight">
                      {resultTitle}
                    </h2>
                    {result.title.native && (
                      <p className="text-sm text-text-muted">{result.title.native}</p>
                    )}
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-[var(--radius-full)]">
                      {resultFormat}
                    </span>
                    {result.episodes && (
                      <span className="px-3 py-1 text-xs font-medium bg-bg-elevated text-text-secondary rounded-[var(--radius-full)] border border-border">
                        {result.episodes} Episodes
                      </span>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1.5">
                    {result.genres.map((genre) => (
                      <Link
                        key={genre}
                        href={`/search?genres=${encodeURIComponent(genre)}`}
                        className="px-2.5 py-0.5 text-[11px] font-medium bg-bg-elevated text-text-secondary rounded-[var(--radius-full)] border border-border hover:border-accent hover:text-accent transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>

                  {/* Synopsis */}
                  {resultDescription && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                        Synopsis
                      </h4>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-5">
                        {resultDescription}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href={`/anime/${result.id}`}>
                      <Button variant="primary" size="md">
                        View Anime
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => handleRandomize(false)}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="16 3 21 3 21 8" />
                          <line x1="4" y1="20" x2="21" y2="3" />
                          <polyline points="21 16 21 21 16 21" />
                          <line x1="15" y1="15" x2="21" y2="21" />
                          <line x1="4" y1="4" x2="9" y2="9" />
                        </svg>
                      }
                    >
                      Randomize Again
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={handleShare}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      }
                    >
                      Share Result
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick actions below result */}
            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="ghost"
                size="md"
                onClick={() => handleRandomize(true)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                }
              >
                Surprise Me
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setState("idle");
                  setResult(null);
                }}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                }
              >
                Back to Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              Recent Roulette Results
            </h3>
            <span className="text-xs text-text-muted">
              {history.length} / {MAX_HISTORY}
            </span>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
            {history.map((entry) => (
              <Link
                key={entry.id}
                href={`/anime/${entry.id}`}
                className="group flex-shrink-0 w-28 snap-start"
              >
                <div className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden bg-bg-secondary border border-border group-hover:border-accent transition-colors">
                  {entry.coverImage ? (
                    <Image
                      src={entry.coverImage}
                      alt={entry.title}
                      fill
                      sizes="112px"
                      quality={60}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors line-clamp-2 leading-tight">
                  {entry.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
