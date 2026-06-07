"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from "@/lib/notifications/actions";
import type { Notification } from "@/lib/notifications/actions";

export function NotificationBell() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount
  const fetchCount = useCallback(async () => {
    if (!profile) return;
    const count = await getUnreadCount();
    setUnreadCount(count);
  }, [profile]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Subscribe to realtime notifications for live updates
  useEffect(() => {
    if (!profile) return;

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          // A new notification was inserted for this user
          setUnreadCount((prev) => prev + 1);
          // If dropdown is open, prepend the new notification
          if (isOpen) {
            setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 4)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return null;

  const TYPE_ICONS: Record<string, React.ReactNode> = {
    friend_request: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-info">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
    friend_accepted: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
    friend_activity: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    system: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-1 shadow-sm animate-fade-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border rounded-[var(--radius-lg)] shadow-xl overflow-hidden animate-fade-in z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-bold text-sm text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-40">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-bg-card transition-colors ${
                    !n.is_read ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {TYPE_ICONS[n.type] || TYPE_ICONS.system}
                  </div>
                  <div className="flex-1 min-w-0">
                    {n.reference_url ? (
                      <Link
                        href={n.reference_url}
                        onClick={() => {
                          if (!n.is_read) handleMarkRead(n.id);
                          setIsOpen(false);
                        }}
                        className="block"
                      >
                        <p className={`text-sm leading-snug ${!n.is_read ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                          {n.message}
                        </p>
                      </Link>
                    ) : (
                      <p className={`text-sm leading-snug ${!n.is_read ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                        {n.message}
                      </p>
                    )}
                    <p className="text-[11px] text-text-muted mt-1">
                      {timeSince(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="mt-1 shrink-0 w-2 h-2 rounded-full bg-accent cursor-pointer"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center py-2.5 text-xs font-medium text-accent hover:bg-bg-card transition-colors border-t border-border"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
