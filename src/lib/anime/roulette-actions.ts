"use server";

import { createClient } from "@/lib/supabase/server";
import {
  searchAnime,
  type AniListMedia,
  type MediaFormat,
} from "@/lib/anilist/client";

export interface RouletteFilters {
  format?: MediaFormat | "ALL" | null;
  genres?: string[];
  episodeLength?: "any" | "short" | "medium" | "long";
  excludedIds?: number[];
}

export interface RouletteResult {
  anime: AniListMedia | null;
  error?: string;
}

/**
 * Fetch the user's excluded anime IDs (dropped + not_interested).
 */
async function getExcludedAnimeIds(): Promise<Set<number>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data, error } = await supabase
    .from("anime_lists")
    .select("anime_id")
    .eq("user_id", user.id)
    .in("status", ["dropped", "not_interested"]);

  if (error) {
    console.error("Error fetching excluded anime:", error);
    return new Set();
  }

  return new Set((data || []).map((row) => row.anime_id));
}

/**
 * Filter results by episode length.
 */
function filterByEpisodeLength(
  anime: AniListMedia[],
  length: string
): AniListMedia[] {
  if (length === "any") return anime;

  return anime.filter((a) => {
    if (a.episodes === null || a.episodes === undefined) return false;
    switch (length) {
      case "short":
        return a.episodes <= 13;
      case "medium":
        return a.episodes >= 14 && a.episodes <= 26;
      case "long":
        return a.episodes > 26;
      default:
        return true;
    }
  });
}

/**
 * Get a random anime for the roulette feature.
 */
export async function getRouletteAnime(
  filters: RouletteFilters = {},
  surpriseMode: boolean = false
): Promise<RouletteResult> {
  try {
    const excludedIds = await getExcludedAnimeIds();

    if (filters.excludedIds) {
      filters.excludedIds.forEach((id) => excludedIds.add(id));
    }

    // Random page between 1-8 for variety
    const randomPage = Math.floor(Math.random() * 8) + 1;

    let format: MediaFormat | null = null;
    let genres: string[] = [];
    let sort: string[];

    if (surpriseMode) {
      // Surprise mode: completely random — random sort strategy
      const sortOptions = [
        ["TRENDING_DESC"],
        ["POPULARITY_DESC"],
        ["SCORE_DESC"],
        ["FAVOURITES_DESC"],
        ["START_DATE_DESC"],
      ];
      sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
    } else {
      // Normal mode: apply user filters
      format =
        filters.format && filters.format !== "ALL" ? filters.format : null;
      genres = filters.genres || [];
      sort = ["SCORE_DESC", "POPULARITY_DESC"];
    }

    const data = await searchAnime({
      format,
      genres: genres.length > 0 ? genres : undefined,
      page: randomPage,
      perPage: 50,
      sort,
    });

    let candidates = data.Page.media;

    // Filter out excluded anime
    candidates = candidates.filter((a) => !excludedIds.has(a.id));

    // Filter by episode length
    if (!surpriseMode && filters.episodeLength && filters.episodeLength !== "any") {
      candidates = filterByEpisodeLength(candidates, filters.episodeLength);
    }

    if (candidates.length === 0) {
      // Fallback: try page 1 with fewer restrictions
      const fallbackData = await searchAnime({
        page: 1,
        perPage: 50,
        sort: ["POPULARITY_DESC"],
      });

      candidates = fallbackData.Page.media.filter(
        (a) => !excludedIds.has(a.id)
      );

      if (candidates.length === 0) {
        return { anime: null, error: "No anime found matching your criteria. Try adjusting your filters." };
      }
    }

    // Pick a random anime from candidates
    const picked = candidates[Math.floor(Math.random() * candidates.length)];

    return { anime: picked };
  } catch (err) {
    console.error("Roulette error:", err);
    return {
      anime: null,
      error: err instanceof Error ? err.message : "Failed to fetch anime",
    };
  }
}
