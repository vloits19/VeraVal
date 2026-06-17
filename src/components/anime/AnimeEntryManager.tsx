"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateAnimeEntry, removeAnimeEntry, AnimeEntryData } from "@/lib/anime/actions";
import type { AnimeListEntry } from "@/types";

interface AnimeEntryManagerProps {
  animeId: number;
  totalEpisodes: number | null;
  initialEntry: AnimeListEntry | null;
}

const STATUS_OPTIONS = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "dropped", label: "Dropped" },
  { value: "not_interested", label: "Not Interested" },
  { value: "none", label: "None (Remove from list)" },
];

export function AnimeEntryManager({ animeId, totalEpisodes, initialEntry }: AnimeEntryManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [status, setStatus] = useState<string>(initialEntry?.status || "plan_to_watch");
  const [progress, setProgress] = useState(initialEntry?.progress || 0);
  // Using 'any' for new fields since AnimeListEntry type might not have them yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [score, setScore] = useState((initialEntry as any)?.score || 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [startedAt, setStartedAt] = useState((initialEntry as any)?.started_at || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [finishedAt, setFinishedAt] = useState((initialEntry as any)?.finished_at || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notes, setNotes] = useState((initialEntry as any)?.notes || "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (status === "none") {
        await removeAnimeEntry(animeId);
        // Reload to completely remove the UI state
        window.location.reload();
        return;
      }

      let finalFinishedAt = finishedAt;
      // Auto-fill finished_at if completed
      if (status === "completed" && !finishedAt) {
        finalFinishedAt = new Date().toISOString().split('T')[0];
        setFinishedAt(finalFinishedAt);
      }

      const data: AnimeEntryData = {
        animeId,
        status,
        progress,
        score,
        started_at: startedAt || null,
        finished_at: finalFinishedAt || null,
        notes: notes || null,
      };

      await updateAnimeEntry(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save entry:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    if (newProgress < 0) return;
    if (totalEpisodes && newProgress > totalEpisodes) return;
    setProgress(newProgress);
  };

  if (!isEditing && initialEntry) {
    return (
      <Card padding="md" className="space-y-4 border border-accent/20 bg-accent/5 relative">
        <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
          <h3 className="font-bold text-text-primary text-base">My Anime Entry</h3>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Status</p>
            <p className="text-sm font-medium text-text-primary capitalize">{status.replaceAll('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Progress</p>
            <p className="text-sm font-medium text-text-primary">{progress} / {totalEpisodes || '?'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Score</p>
            <p className="text-sm font-medium text-amber-400">{score > 0 ? `${score}/10` : 'Not Rated'}</p>
          </div>
        </div>

        {(startedAt || finishedAt) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            {startedAt && (
              <div>
                <p className="text-xs text-text-muted mb-0.5">Started</p>
                <p className="text-xs text-text-primary">{startedAt}</p>
              </div>
            )}
            {finishedAt && (
              <div>
                <p className="text-xs text-text-muted mb-0.5">Finished</p>
                <p className="text-xs text-text-primary">{finishedAt}</p>
              </div>
            )}
          </div>
        )}

        {notes && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-text-muted mb-0.5">Notes</p>
            <p className="text-xs text-text-secondary italic whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card padding="md" className="space-y-4 border border-accent/40 bg-bg-card">
      <h3 className="font-bold text-text-primary text-base border-b border-border pb-2">
        {initialEntry ? "Edit Anime Entry" : "Add to My List"}
      </h3>
      
      <div className="space-y-3">
        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-primary">Status</label>
          <select 
            value={status} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-text-primary focus:border-accent outline-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-primary">Progress (Episodes)</label>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleProgressChange(progress - 1)}>-</Button>
            <input 
              type="number" 
              value={progress}
              onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
              className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] px-2 py-1.5 text-sm text-text-primary focus:border-accent outline-none text-center min-w-[3rem]"
              min="0"
              max={totalEpisodes || undefined}
            />
            <span className="text-xs text-text-muted whitespace-nowrap">/ {totalEpisodes || '?'}</span>
            <Button variant="secondary" size="sm" onClick={() => handleProgressChange(progress + 1)}>+</Button>
          </div>
        </div>

        {/* Score */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-primary">Score (0-10)</label>
          <select 
            value={score} 
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-text-primary focus:border-accent outline-none"
          >
            <option value="0">Not Rated</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {/* Dates */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-primary">Start Date</label>
          <input 
            type="date" 
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-text-primary focus:border-accent outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-primary">Finish Date</label>
          <input 
            type="date" 
            value={finishedAt}
            onChange={(e) => setFinishedAt(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-text-primary focus:border-accent outline-none"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1 pt-1">
        <label className="text-xs font-medium text-text-primary">Personal Notes</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Thoughts..."
          className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-primary focus:border-accent outline-none min-h-[60px] resize-y"
        />
      </div>

      <div className="flex items-center flex-wrap gap-2 pt-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {initialEntry && (
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setIsEditing(false)} disabled={isSaving}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
