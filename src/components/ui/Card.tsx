import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  style?: React.CSSProperties;
}

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  hover = false,
  glow = false,
  padding = "md",
  onClick,
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        bg-bg-card border border-border
        rounded-[var(--radius-lg)]
        transition-all duration-[var(--transition-base)]
        ${paddingClasses[padding]}
        ${
          hover
            ? "hover:-translate-y-1 hover:shadow-lg hover:border-border-hover cursor-pointer"
            : ""
        }
        ${glow ? "hover:shadow-[var(--shadow-glow)] hover:border-border-accent" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/** Header slot for consistent card headers */
export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

/** Content slot */
export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
