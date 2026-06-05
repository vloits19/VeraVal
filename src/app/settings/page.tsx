"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account preferences and appearance.
        </p>
      </div>

      {/* ── Account Section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Account
        </h2>

        <Card padding="lg" className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar fallback="Guest User" size="lg" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">
                Profile Photo
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Upload
                </Button>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Fields */}
          <div className="space-y-4">
            <Input label="Username" placeholder="animefan42" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input
              label="Bio"
              placeholder="Tell us about your anime taste..."
            />
          </div>

          <Button>Save Changes</Button>
        </Card>
      </section>

      {/* ── Appearance Section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          Appearance
        </h2>

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
                <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                <div className="w-8 h-1.5 rounded bg-[#27273a]" />
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
                <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                <div className="w-8 h-1.5 rounded bg-[#e4e4e7]" />
              </div>
              <p className="text-sm font-medium text-text-primary">Light</p>
              <p className="text-xs text-text-muted">For bright environments</p>
            </button>
          </div>
        </Card>
      </section>

      {/* ── Notifications Section ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          Notifications
        </h2>

        <Card padding="lg" className="space-y-4">
          {[
            {
              title: "Episode Reminders",
              desc: "Get notified when new episodes air",
            },
            {
              title: "Recommendations",
              desc: "Receive anime recommendations based on your list",
            },
            {
              title: "Social Updates",
              desc: "Get notified about friend activity",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {item.title}
                </p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <button className="relative w-10 h-5 rounded-full bg-border-hover transition-colors cursor-pointer">
                <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" />
              </button>
            </div>
          ))}
        </Card>
      </section>

      {/* ── Danger Zone ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-danger flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Danger Zone
        </h2>

        <Card padding="lg" className="border-danger/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Delete Account
              </p>
              <p className="text-xs text-text-muted">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
