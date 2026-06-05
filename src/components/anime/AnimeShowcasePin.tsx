"use client";

import React, { useTransition, useState } from "react";
import { toggleFavorite, togglePinned } from "@/lib/anime/actions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

interface Props {
  animeId: number;
  initialFavorite: boolean;
  initialPinned: boolean;
  hasListEntry: boolean; // Must be in a list to pin/favorite
}

export function AnimeShowcasePin({ animeId, initialFavorite, initialPinned, hasListEntry }: Props) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [fav, setFav] = useState(initialFavorite);
  const [pin, setPin] = useState(initialPinned);

  if (!profile || !hasListEntry) return null;

  const handleFavorite = () => {
    const newVal = !fav;
    setFav(newVal);
    startTransition(async () => {
      try {
        await toggleFavorite(animeId, newVal);
        showToast(newVal ? "Added to Favorites" : "Removed from Favorites", "success");
      } catch {
        setFav(!newVal);
        showToast("Failed to update favorite status", "error");
      }
    });
  };

  const handlePin = () => {
    const newVal = !pin;
    setPin(newVal);
    startTransition(async () => {
      try {
        await togglePinned(animeId, newVal);
        showToast(newVal ? "Pinned to Showcase" : "Unpinned from Showcase", "success");
      } catch {
        setPin(!newVal);
        showToast("Failed to update pin status", "error");
      }
    });
  };

  return (
    <div className="flex gap-2 w-full mt-2">
      <button 
        onClick={handleFavorite}
        disabled={isPending}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border rounded-[var(--radius-md)] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          fav ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-bg-input text-text-secondary border-border hover:bg-bg-card hover:text-text-primary"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <button 
        onClick={handlePin}
        disabled={isPending}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border rounded-[var(--radius-md)] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          pin ? "bg-accent/10 text-accent border-accent/20" : "bg-bg-input text-text-secondary border-border hover:bg-bg-card hover:text-text-primary"
        }`}
        title={pin ? "Unpin from profile showcase" : "Pin to profile showcase"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={pin ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </button>
    </div>
  );
}
