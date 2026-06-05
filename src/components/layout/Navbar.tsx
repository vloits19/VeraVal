"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/components/providers/AuthProvider";

interface NavbarProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onMenuToggle, isSidebarOpen }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header
      id="main-navbar"
      className="
        fixed top-0 left-0 right-0 z-50 h-[var(--navbar-height)]
        glass border-b border-border
      "
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            id="sidebar-toggle"
            onClick={onMenuToggle}
            className="
              lg:hidden p-2 rounded-[var(--radius-md)]
              text-text-secondary hover:text-text-primary
              hover:bg-bg-card transition-colors cursor-pointer
            "
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {isSidebarOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
        </div>

        {/* Center: Search (hidden on mobile & auth pages) */}
        {!isAuthPage && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="navbar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search anime..."
                className="
                  w-full pl-10 pr-4 py-2 text-sm
                  bg-bg-input text-text-primary
                  border border-border rounded-[var(--radius-full)]
                  placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                  transition-all duration-[var(--transition-fast)]
                "
              />
            </div>
          </div>
        )}

        {/* Right: Theme toggle + Auth */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="
              p-2 rounded-[var(--radius-md)]
              text-text-secondary hover:text-text-primary
              hover:bg-bg-card transition-all cursor-pointer
            "
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {/* Auth buttons / Avatar */}
          {!isAuthPage && (
            <div className="flex items-center gap-2 ml-1">
              {profile ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none rounded-full ring-2 ring-transparent focus:ring-accent/50 transition-all cursor-pointer"
                  >
                    <Avatar
                      src={profile.avatar || undefined}
                      fallback={profile.username}
                      size="sm"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-[var(--radius-md)] shadow-lg py-1 animate-fade-in z-50">
                      <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {profile.username}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {profile.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
                      >
                        Settings
                      </Link>
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
