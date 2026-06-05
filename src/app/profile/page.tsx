import React from "react";
import type { Metadata } from "next";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your AniTrack anime profile and statistics.",
};

const STATS = [
  { label: "Watching", value: "—", color: "text-info" },
  { label: "Completed", value: "—", color: "text-success" },
  { label: "On Hold", value: "—", color: "text-warning" },
  { label: "Dropped", value: "—", color: "text-danger" },
  { label: "Plan to Watch", value: "—", color: "text-text-muted" },
];

const PLACEHOLDER_LIST = [
  { title: "No anime yet", status: "Start adding anime to your list!" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile header */}
      <Card padding="lg" className="relative overflow-hidden">
        {/* Banner gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-accent/20 via-purple-500/10 to-transparent" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 pt-16">
          <Avatar fallback="Guest User" size="xl" className="ring-4 ring-bg-card" />

          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">Guest User</h1>
            <p className="text-sm text-text-secondary">
              No bio yet. Sign in to personalize your profile.
            </p>
            <p className="text-xs text-text-muted">Joined —</p>
          </div>

          <Button variant="secondary" size="sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATS.map((stat) => (
          <Card key={stat.label} padding="md" hover className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Anime list placeholder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Anime List</h2>
          <div className="flex items-center gap-2">
            {["All", "Watching", "Completed", "On Hold", "Dropped", "PTW"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-[var(--radius-full)]
                    transition-colors cursor-pointer
                    ${
                      tab === "All"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-text-muted hover:text-text-secondary hover:bg-bg-card"
                    }
                  `}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        <Card padding="lg" className="flex flex-col items-center justify-center py-16">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-text-muted/30 mb-4"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          {PLACEHOLDER_LIST.map((item) => (
            <div key={item.title} className="text-center space-y-2">
              <p className="text-text-secondary font-medium">{item.title}</p>
              <p className="text-sm text-text-muted">{item.status}</p>
            </div>
          ))}
          <Button variant="primary" size="sm" className="mt-6">
            Browse Anime
          </Button>
        </Card>
      </section>
    </div>
  );
}
