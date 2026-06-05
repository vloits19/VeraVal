import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function LoadingSpinner({
  size = "md",
  className = "",
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div
          className={`
            absolute inset-0 rounded-full
            border-2 border-border
          `}
        />
        {/* Spinning arc */}
        <div
          className={`
            absolute inset-0 rounded-full
            border-2 border-transparent border-t-accent
            animate-spin
          `}
        />
      </div>
      {label && (
        <p className="text-sm text-text-secondary animate-pulse">{label}</p>
      )}
    </div>
  );
}
