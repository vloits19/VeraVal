"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface AnimeListClientProps {
  initialItems: any[];
}

const TABS = [
  { id: "all", label: "All Anime" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "plan_to_watch", label: "Plan to Watch" },
  { id: "dropped", label: "Dropped" },
  { id: "not_interested", label: "Not Interested" },
];

export function AnimeListClient({ initialItems }: AnimeListClientProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");

  const filteredAndSortedItems = useMemo(() => {
    let result = [...initialItems];

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter(item => item.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        const title = item.anime.title.english || item.anime.title.romaji || item.anime.title.native || "";
        return title.toLowerCase().includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime();
      }
      if (sortBy === "added") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "highest_score") {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === "lowest_score") {
        const sA = a.score || 0;
        const sB = b.score || 0;
        if (sA === 0) return 1;
        if (sB === 0) return -1;
        return sA - sB;
      }
      if (sortBy === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === "title_az" || sortBy === "title_za") {
        const titleA = a.anime.title.english || a.anime.title.romaji || "";
        const titleB = b.anime.title.english || b.anime.title.romaji || "";
        const comparison = titleA.localeCompare(titleB);
        return sortBy === "title_az" ? comparison : -comparison;
      }
      return 0;
    });

    return result;
  }, [initialItems, activeTab, searchQuery, sortBy]);

  return (
    <Card padding="md" className="space-y-4 shadow-sm border-t-4 border-t-accent">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-2 sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-[var(--radius-full)] transition-colors ${
                activeTab === tab.id
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-input border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-card rounded-[var(--radius-md)]">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-2.5 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search within list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-input border border-border rounded-[var(--radius-md)] text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-sm text-text-muted w-full sm:w-auto">
          <span>Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-input border border-border rounded-[var(--radius-md)] px-2 py-1.5 text-text-primary focus:border-accent outline-none"
          >
            <option value="updated">Recently Updated</option>
            <option value="added">Recently Added</option>
            <option value="highest_score">Highest Score</option>
            <option value="lowest_score">Lowest Score</option>
            <option value="progress">Progress</option>
            <option value="title_az">Title A-Z</option>
            <option value="title_za">Title Z-A</option>
          </select>
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          No anime match your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium text-center">Score</th>
                <th className="pb-3 font-medium text-center">Progress</th>
                <th className="pb-3 font-medium">Started</th>
                <th className="pb-3 font-medium">Finished</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedItems.map((item) => {
                const anime = item.anime;
                const title = anime.title.english || anime.title.romaji || anime.title.native;
                const cover = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;

                return (
                  <tr key={anime.id} className="group hover:bg-bg-input transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/anime/${anime.id}`} className="flex items-center gap-3">
                        <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 border border-border">
                          <Image src={cover} alt={title} fill className="object-cover" unoptimized />
                        </div>
                        <div className="max-w-[200px] sm:max-w-md truncate">
                          <p className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                            {title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`text-xs font-medium capitalize ${
                              item.status === 'watching' ? 'text-info' :
                              item.status === 'completed' ? 'text-success' :
                              item.status === 'on_hold' ? 'text-warning' :
                              item.status === 'dropped' ? 'text-danger' : 'text-text-muted'
                            }`}>
                              {item.status.replaceAll('_', ' ')}
                            </p>
                            <span className="text-text-muted text-xs">•</span>
                            <p className="text-xs text-text-muted capitalize">
                              {anime.format?.replaceAll('_', ' ') || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {item.score > 0 ? (
                        <span className="text-amber-400">{item.score}/10</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary">
                      {item.progress} / {anime.episodes || '?'}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-sm">
                      {item.started_at ? new Date(item.started_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 pl-4 text-text-muted text-sm">
                      {item.finished_at ? new Date(item.finished_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
