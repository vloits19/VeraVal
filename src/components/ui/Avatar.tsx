import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-lg",
};

const sizePx: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function Avatar({
  src,
  alt = "User avatar",
  fallback,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full overflow-hidden
        bg-accent/20 text-accent font-semibold
        ring-2 ring-border
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={sizePx[size]}
          height={sizePx[size]}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
