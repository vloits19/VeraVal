"use client";

import React from "react";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <ErrorDisplay
        fullPage
        title="Something went wrong"
        message={error.message || "An unexpected error occurred. Please try again."}
        onRetry={reset}
      />
    </div>
  );
}
