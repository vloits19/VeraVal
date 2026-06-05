"use client";

import React, { useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateAnimeStatus } from "@/lib/anime/actions";
import { useToast } from "@/components/ui/Toast";

interface Props {
  animeId: number;
  initialStatus: string | null;
}

const STATUS_OPTIONS = [
  { value: "watching", label: "Watching", color: "text-blue-500 bg-blue-500/10" },
  { value: "completed", label: "Completed", color: "text-emerald-500 bg-emerald-500/10" },
  { value: "plan_to_watch", label: "Plan to Watch", color: "text-purple-500 bg-purple-500/10" },
  { value: "dropped", label: "Dropped", color: "text-red-500 bg-red-500/10" },
  { value: "not_interested", label: "Not Interested", color: "text-gray-500 bg-gray-500/10" },
];

export function AnimeStatusDropdown({ animeId, initialStatus }: Props) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [isOpen, setIsOpen] = useState(false);

  if (!profile) {
    return (
      <div className="w-full bg-bg-card border border-border rounded-[var(--radius-md)] px-4 py-3 text-center text-sm text-text-secondary">
        <a href="/login" className="text-accent hover:underline font-medium">Log in</a> to track this anime
      </div>
    );
  }

  const handleSelect = (newStatus: string) => {
    setIsOpen(false);
    
    // Optimistic update
    const prevStatus = status;
    setStatus(newStatus);

    startTransition(async () => {
      try {
        await updateAnimeStatus(animeId, newStatus);
        const option = STATUS_OPTIONS.find((o) => o.value === newStatus);
        showToast(`Moved to ${option?.label}`, "success");
      } catch (err: unknown) {
        setStatus(prevStatus); // Revert
        const message = err instanceof Error ? err.message : "Failed to update status";
        showToast(message, "error");
      }
    });
  };

  const currentOption = STATUS_OPTIONS.find((o) => o.value === status);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-sm font-medium
          border rounded-[var(--radius-md)] transition-all
          ${currentOption ? "border-transparent " + currentOption.color : "bg-bg-input border-border text-text-primary hover:border-border-hover"}
          ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2">
          {currentOption ? (
            <>
              <div className="w-2 h-2 rounded-full bg-current opacity-80" />
              {currentOption.label}
            </>
          ) : (
            "Add to List"
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-bg-secondary border border-border rounded-[var(--radius-md)] shadow-xl overflow-hidden animate-fade-in">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                  hover:bg-bg-card transition-colors cursor-pointer
                  ${status === option.value ? "bg-bg-card font-medium" : "text-text-secondary"}
                `}
              >
                <div className={`w-2 h-2 rounded-full ${option.color.split(" ")[0]}`} />
                {option.label}
                {status === option.value && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-text-primary">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
