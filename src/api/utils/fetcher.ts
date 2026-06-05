/* ============================
   AniTrack — Generic Fetch Wrapper
   ============================ */

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export class FetchError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Generic fetch wrapper with timeout, error handling, and JSON parsing.
 */
export async function fetcher<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new FetchError(
        `Request failed: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof FetchError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FetchError("Request timed out", 408, "Request Timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
