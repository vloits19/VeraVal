"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggleSection() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card padding="lg" className="space-y-6">
      {/* Theme toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">Theme</p>
          <p className="text-xs text-text-muted">
            Choose between dark and light mode
          </p>
        </div>
        <button
          id="settings-theme-toggle"
          onClick={toggleTheme}
          className={`
            relative w-14 h-7 rounded-full transition-colors cursor-pointer
            ${theme === "dark" ? "bg-accent" : "bg-border-hover"}
          `}
        >
          <span
            className={`
              absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md
              transition-transform duration-200
              ${theme === "dark" ? "left-[calc(100%-1.625rem)]" : "left-0.5"}
            `}
          />
        </button>
      </div>

      <div className="h-px bg-border" />

      {/* Theme preview */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => theme !== "dark" && toggleTheme()}
          className={`
            p-4 rounded-[var(--radius-md)] border-2 text-left cursor-pointer
            transition-all
            ${
              theme === "dark"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-border-hover"
            }
          `}
        >
          <div className="w-full h-16 rounded bg-[#0a0a0f] mb-3 flex items-center gap-1.5 px-3">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <div className="w-8 h-1.5 rounded bg-[#2A3441]" />
          </div>
          <p className="text-sm font-medium text-text-primary">Dark</p>
          <p className="text-xs text-text-muted">Default theme</p>
        </button>

        <button
          onClick={() => theme !== "light" && toggleTheme()}
          className={`
            p-4 rounded-[var(--radius-md)] border-2 text-left cursor-pointer
            transition-all
            ${
              theme === "light"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-border-hover"
            }
          `}
        >
          <div className="w-full h-16 rounded bg-[#f8f9fc] mb-3 flex items-center gap-1.5 px-3">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <div className="w-8 h-1.5 rounded bg-[#e4e4e7]" />
          </div>
          <p className="text-sm font-medium text-text-primary">Light</p>
          <p className="text-xs text-text-muted">For bright environments</p>
        </button>
      </div>
    </Card>
  );
}
