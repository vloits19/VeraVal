"use client";

import { useContext } from "react";
import { ThemeContext } from "@/components/providers/ThemeProvider";
import type { Theme } from "@/components/providers/ThemeProvider";

const defaultValue = {
  theme: "dark" as Theme,
  toggleTheme: () => {},
  setTheme: () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return safe defaults during SSR / static prerendering
  if (!context) {
    return defaultValue;
  }
  return context;
}
