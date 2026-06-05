/* ============================
   AniTrack — AniList GraphQL API Client
   ============================ */

const ANILIST_API_URL = "https://graphql.anilist.co";

/** AniList media type from API */
export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
    color: string | null;
  };
  bannerImage: string | null;
  format: string | null;
  episodes: number | null;
  status: string | null;
  averageScore: number | null;
  meanScore: number | null;
  genres: string[];
  studios?: {
    nodes: {
      name: string;
      isAnimationStudio: boolean;
    }[];
  };
  season: string | null;
  seasonYear: number | null;
  description: string | null;
  siteUrl: string | null;
}

export interface AniListSearchResult {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: AniListMedia[];
  };
}

/** Search query with filters */
const SEARCH_QUERY = `
query SearchAnime($search: String, $format: MediaFormat, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(search: $search, type: ANIME, format: $format, sort: $sort, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      format
      episodes
      status
      averageScore
      meanScore
      genres
      studios(isMain: true) {
        nodes {
          name
          isAnimationStudio
        }
      }
      season
      seasonYear
      description
      siteUrl
    }
  }
}
`;

/** Trending query (no search term) */
const TRENDING_QUERY = `
query TrendingAnime($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      format
      episodes
      status
      averageScore
      meanScore
      genres
      studios(isMain: true) {
        nodes {
          name
          isAnimationStudio
        }
      }
      season
      seasonYear
      description
      siteUrl
    }
  }
}
`;

export type MediaFormat = "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL" | "MUSIC" | null;

interface SearchOptions {
  search?: string;
  format?: MediaFormat;
  page?: number;
  perPage?: number;
  sort?: string[];
}

/**
 * Search anime on AniList using their public GraphQL API.
 * No API key needed — AniList's API is public.
 */
export async function searchAnime(
  options: SearchOptions = {}
): Promise<AniListSearchResult> {
  const {
    search,
    format = null,
    page = 1,
    perPage = 20,
    sort = ["POPULARITY_DESC"],
  } = options;

  const isSearch = search && search.trim().length > 0;
  const query = isSearch ? SEARCH_QUERY : TRENDING_QUERY;

  const variables: Record<string, unknown> = {
    page,
    perPage,
  };

  if (isSearch) {
    variables.search = search.trim();
    variables.sort = ["SEARCH_MATCH"];
    if (format) variables.format = format;
  } else {
    variables.sort = sort;
  }

  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "AniList API returned errors");
  }

  return json.data as AniListSearchResult;
}

const GET_ANIME_QUERY = `
query GetAnime($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    format
    episodes
    status
    averageScore
    meanScore
    genres
    studios(isMain: true) {
      nodes {
        name
        isAnimationStudio
      }
    }
    season
    seasonYear
    description
    siteUrl
  }
}
`;

/**
 * Fetch a single anime by its AniList ID.
 */
export async function getAnimeById(id: number): Promise<AniListMedia> {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: GET_ANIME_QUERY,
      variables: { id },
    }),
    next: { revalidate: 3600 }, // Cache for 1 hour since historical data rarely changes
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "AniList API returned errors");
  }

  return json.data.Media as AniListMedia;
}

const GET_ANIME_BY_IDS_QUERY = `
query GetAnimeByIds($ids: [Int]!) {
  Page(page: 1, perPage: 50) {
    media(id_in: $ids, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      format
      episodes
      status
      averageScore
      meanScore
      genres
      season
      seasonYear
      description
      siteUrl
    }
  }
}
`;

/**
 * Fetch multiple anime by their AniList IDs.
 */
export async function getAnimeByIds(ids: number[]): Promise<AniListMedia[]> {
  if (!ids || ids.length === 0) return [];

  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: GET_ANIME_BY_IDS_QUERY,
      variables: { ids },
    }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json = await response.json();
  return json.data.Page.media as AniListMedia[];
}

/** Format AniList status string to user-friendly text */
export function formatStatus(status: string | null): string {
  const map: Record<string, string> = {
    FINISHED: "Finished",
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
  };
  return status ? map[status] || status : "Unknown";
}

/** Format AniList format string to user-friendly text */
export function formatMediaFormat(format: string | null): string {
  const map: Record<string, string> = {
    TV: "TV Series",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
  };
  return format ? map[format] || format : "Unknown";
}

/** Get the best available title */
export function getTitle(title: AniListMedia["title"]): string {
  return title.english || title.romaji || title.native || "Unknown Title";
}

/** Get the best available cover image */
export function getCoverImage(coverImage: AniListMedia["coverImage"]): string {
  return coverImage.extraLarge || coverImage.large || coverImage.medium || "";
}

/** Format score from 0-100 to displayable string */
export function formatScore(score: number | null): string | null {
  if (score === null || score === 0) return null;
  return (score / 10).toFixed(1);
}
