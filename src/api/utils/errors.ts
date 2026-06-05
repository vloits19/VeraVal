/* ============================
   VeraVal — API Error Utilities
   ============================ */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Extract a user-friendly error message from any error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred. Please try again.";
}

/**
 * Format a Supabase error into a standardized ApiError.
 */
export function formatSupabaseError(error: {
  message?: string;
  code?: string;
  status?: number;
}): ApiError {
  const messageMap: Record<string, string> = {
    invalid_credentials: "Invalid email or password.",
    user_already_exists: "An account with this email already exists.",
    email_not_confirmed: "Please verify your email before logging in.",
    weak_password: "Password must be at least 8 characters.",
  };

  return {
    message:
      (error.code && messageMap[error.code]) ||
      error.message ||
      "Something went wrong.",
    code: error.code,
    status: error.status,
  };
}

/**
 * Check if an error is a network error.
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError && error.message.includes("Failed to fetch")
  );
}
