"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { height: 24 },
  md: { height: 32 },
  lg: { height: 40 },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { height } = sizeMap[size];
  const { theme } = useTheme();

  // If theme is not loaded yet (SSR), default to dark logo to prevent layout shift,
  // or use the dark one since the site defaults to dark mode.
  const isLight = theme === "light";
  const logoSrc = isLight ? "/VeraVal.svg" : "/VeraValDark.svg";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoSrc}
        alt="VeraVal Logo"
        height={height}
        className="object-contain"
        style={{ height: `${height}px`, width: "auto" }}
      />
    </div>
  );
}
