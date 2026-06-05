import React from "react";
import { Button } from "./Button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  fullPage?: boolean;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className = "",
  fullPage = false,
}: ErrorDisplayProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-6 text-center
        ${fullPage ? "min-h-[60vh]" : "py-12"}
        ${className}
      `}
    >
      {/* Error icon */}
      <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-danger"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mr-1.5"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Try Again
        </Button>
      )}
    </div>
  );
}
