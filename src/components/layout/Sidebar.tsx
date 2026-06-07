"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ROUTES } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

/* SVG icons for each nav route */
function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const cls = `w-5 h-5 transition-colors ${
    active ? "text-accent" : "text-text-muted group-hover:text-text-primary"
  }`;

  switch (icon) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "search":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "friends":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar({ isOpen, onClose, isMinimized = false, onToggleMinimize }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when sidebar overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Overlay backdrop (mobile only) */}
      {isOpen && (
        <div
          className="
            fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
            lg:hidden animate-fade-in
          "
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="main-sidebar"
        className={`
          fixed top-[var(--navbar-height)] left-0 z-40
          w-[var(--sidebar-width)] h-[calc(100vh-var(--navbar-height))]
          bg-bg-secondary border-r border-border
          flex flex-col
          transition-transform duration-[var(--transition-base)] ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Navigation links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ROUTES.map((route, index) => {
            const isProfileRoute = route.icon === "user";
            const actualHref = (isProfileRoute && profile?.username) ? `/profile/${profile.username}` : route.href;
            
            // For profile, match exact or sub-routes
            const isActive = isProfileRoute 
              ? pathname === actualHref || pathname.startsWith(`${actualHref}/`)
              : pathname === actualHref;
              
            return (
              <React.Fragment key={route.href}>
                <Link
                  href={actualHref}
                  id={`nav-link-${route.icon}`}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5
                    rounded-[var(--radius-md)] text-sm font-medium
                    transition-all duration-[var(--transition-fast)]
                    ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent"
                    }
                  `}
                >
                  <NavIcon icon={route.icon} active={isActive} />
                  {!isMinimized && (
                    <>
                      <span className="truncate">{route.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      )}
                    </>
                  )}
                  {isMinimized && (
                    <div className="absolute left-full ml-2 hidden group-hover:block bg-bg-elevated border border-border text-text-primary text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] shadow-md z-[60] whitespace-nowrap font-medium">
                      {route.label}
                    </div>
                  )}
                </Link>

                {/* Insert Friends link right after Search (index 1) */}
                {index === 1 && profile && (() => {
                  const friendsActive = pathname === "/friends" || pathname.startsWith("/friends/");
                  return (
                    <Link
                      href="/friends"
                      id="nav-link-friends"
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5
                        rounded-[var(--radius-md)] text-sm font-medium
                        transition-all duration-[var(--transition-fast)]
                        ${
                          friendsActive
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent"
                        }
                      `}
                    >
                      <NavIcon icon="friends" active={friendsActive} />
                      {!isMinimized && (
                        <>
                          <span className="truncate">Friends</span>
                          {friendsActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          )}
                        </>
                      )}
                      {isMinimized && (
                        <div className="absolute left-full ml-2 hidden group-hover:block bg-bg-elevated border border-border text-text-primary text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] shadow-md z-[60] whitespace-nowrap font-medium">
                          Friends
                        </div>
                      )}
                    </Link>
                  );
                })()}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          {profile ? (
            <div className={`relative group/profile flex ${isMinimized ? "flex-col items-center gap-3" : "items-center justify-between"} px-2 py-2 rounded-[var(--radius-md)] bg-bg-card`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  <Avatar
                    src={profile.avatar || undefined}
                    fallback={profile.username}
                    size="sm"
                    className="w-full h-full object-cover"
                  />
                </div>
                {!isMinimized && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {profile.username}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {profile.email}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="group relative flex items-center justify-center w-8 h-8 flex-shrink-0 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-full transition-colors cursor-pointer"
                aria-label="Log Out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {/* Custom Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-bg-elevated border border-border text-text-primary text-xs px-2 py-1 rounded-[var(--radius-sm)] shadow-md z-[60] whitespace-nowrap font-medium pointer-events-none">
                  Logout
                </div>
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] bg-bg-card ${isMinimized ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                ?
              </div>
              {!isMinimized && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    Guest User
                  </p>
                  <Link href="/login" className="text-xs text-accent hover:text-accent-hover transition-colors truncate block">
                    Sign in to track
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimize Toggle Button (Desktop only) */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-bg-card border border-border rounded-full items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-colors z-50 shadow-sm"
            aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-[var(--transition-base)] ${isMinimized ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
      </aside>
    </>
  );
}
