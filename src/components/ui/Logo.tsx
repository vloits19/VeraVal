import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Logo mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer ring */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="url(#logo-gradient)"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Play triangle / tracking arrow */}
        <path
          d="M16 12L30 20L16 28V12Z"
          fill="url(#logo-gradient)"
          opacity="0.9"
        />
        {/* Inner accent dot */}
        <circle cx="20" cy="20" r="3" fill="var(--accent)" opacity="0.6" />
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      {showText && (
        <span className={`font-bold tracking-tight ${text}`}>
          <span className="text-text-primary">Ani</span>
          <span className="text-accent">Track</span>
        </span>
      )}
    </div>
  );
}
