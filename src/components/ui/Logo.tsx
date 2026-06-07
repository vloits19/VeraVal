import React from "react";

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

  // We use CSS classes 'dark:hidden' and 'hidden dark:block' to handle the theme switch
  // without needing to rely on a useTheme hook which might cause hydration mismatches.
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/VeraVal.svg"
        alt="VeraVal Logo"
        height={height}
        className="dark:hidden object-contain"
        style={{ height: `${height}px`, width: "auto" }}
      />
      <img
        src="/VeraValDark.svg"
        alt="VeraVal Logo"
        height={height}
        className="hidden dark:block object-contain"
        style={{ height: `${height}px`, width: "auto" }}
      />
    </div>
  );
}
