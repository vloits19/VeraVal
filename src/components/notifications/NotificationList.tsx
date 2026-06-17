"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { markAsRead, markAllAsRead, deleteNotification } from "@/lib/notifications/actions";
import type { Notification, NotificationType } from "@/lib/notifications/actions";

interface Props {
  initialNotifications: Notification[];
}

const FILTERS: { id: string; label: string; type?: NotificationType }[] = [
  { id: "all", label: "All" },
  { id: "friend_request", label: "Friend Requests", type: "friend_request" },
  { id: "friend_activity", label: "Friend Activity", type: "friend_activity" },
  { id: "friend_accepted", label: "Accepted", type: "friend_accepted" },
  { id: "system", label: "System", type: "system" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  friend_request: (
    <div className="w-9 h-9 rounded-full bg-info/10 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-info">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    </div>
  ),
  friend_accepted: (
    <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    </div>
  ),
  friend_activity: (
    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </div>
  ),
  system: (
    <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
  ),
};

export function NotificationList({ initialNotifications }: Props) {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now());
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      try {
        await markAsRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      } catch {
        showToast("Failed to mark as read", "error");
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        showToast("All notifications marked as read", "success");
      } catch {
        showToast("Failed to mark all as read", "error");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showToast("Notification deleted", "success");
      } catch {
        showToast("Failed to delete", "error");
      }
    });
  };

  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((now - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-[var(--radius-full)] transition-colors ${
                activeFilter === f.id
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-input border border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-center justify-center py-16">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted/30 mb-4">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <p className="text-text-secondary font-medium">No notifications</p>
          <p className="text-sm text-text-muted mt-1">
            {activeFilter === "all"
              ? "You're all caught up!"
              : "No notifications in this category."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <Card
              key={n.id}
              padding="md"
              className={`flex items-start gap-3 group transition-colors ${
                !n.is_read ? "border-l-2 border-l-accent bg-accent/[0.03]" : ""
              }`}
            >
              {/* Icon */}
              {TYPE_ICONS[n.type] || TYPE_ICONS.system}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {n.reference_url ? (
                  <Link href={n.reference_url} className="hover:underline">
                    <p className={`text-sm leading-snug ${!n.is_read ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                      {n.message}
                    </p>
                  </Link>
                ) : (
                  <p className={`text-sm leading-snug ${!n.is_read ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                    {n.message}
                  </p>
                )}
                <p className="text-[11px] text-text-muted mt-1">{timeSince(n.created_at)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    disabled={isPending}
                    className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={isPending}
                  className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors cursor-pointer"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
