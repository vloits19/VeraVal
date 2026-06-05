import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 animate-fade-in">
      <LoadingSpinner size="lg" label="Loading..." />

      {/* Skeleton placeholders */}
      <div className="w-full max-w-3xl space-y-4">
        <div className="h-8 w-48 rounded-[var(--radius-md)] animate-shimmer" />
        <div className="h-4 w-full rounded-[var(--radius-sm)] animate-shimmer" />
        <div className="h-4 w-3/4 rounded-[var(--radius-sm)] animate-shimmer" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-[var(--radius-lg)] animate-shimmer"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
