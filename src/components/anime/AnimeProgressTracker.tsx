"use client";

import React, { useState, useTransition } from "react";
import { updateAnimeProgress } from "@/lib/anime/actions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

interface Props {
  animeId: number;
  initialProgress: number;
  totalEpisodes: number | null;
}

export function AnimeProgressTracker({ animeId, initialProgress, totalEpisodes }: Props) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(initialProgress);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialProgress.toString());

  if (!profile) return null;

  const handleUpdate = (newVal: number) => {
    if (newVal < 0) newVal = 0;
    if (totalEpisodes && newVal > totalEpisodes) newVal = totalEpisodes;
    if (newVal === progress) return;

    const prev = progress;
    setProgress(newVal);
    
    startTransition(async () => {
      try {
        await updateAnimeProgress(animeId, newVal);
      } catch (err: unknown) {
        setProgress(prev);
        const message = err instanceof Error ? err.message : "Failed to update progress";
        showToast(message, "error");
      }
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      handleUpdate(val);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-1 bg-bg-input border border-border rounded-[var(--radius-md)] px-1 py-1 w-full justify-between">
      <button 
        onClick={() => handleUpdate(progress - 1)}
        disabled={isPending || progress <= 0}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-bg-card text-text-secondary disabled:opacity-50 cursor-pointer"
        title="Decrease progress"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      
      <div className="text-sm font-bold text-text-primary text-center flex-1">
        {isEditing ? (
          <form onSubmit={handleManualSubmit} className="inline-block">
            <input 
              type="number" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleManualSubmit}
              autoFocus
              className="w-12 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-accent rounded px-1"
            />
          </form>
        ) : (
          <span 
            onClick={() => { setIsEditing(true); setInputValue(progress.toString()); }} 
            className="cursor-pointer hover:text-accent border-b border-dashed border-transparent hover:border-accent"
            title="Edit progress manually"
          >
            {progress}
          </span>
        )}
        <span className="text-text-muted font-normal ml-1">
          / {totalEpisodes || "?"}
        </span>
      </div>

      <button 
        onClick={() => handleUpdate(progress + 1)}
        disabled={isPending || (totalEpisodes !== null && progress >= totalEpisodes)}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-bg-card text-text-secondary disabled:opacity-50 cursor-pointer"
        title="Increase progress"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
}
