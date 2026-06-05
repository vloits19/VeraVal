import React from "react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="main-footer"
      className="
        border-t border-border bg-bg-secondary
        py-8 px-6
      "
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size="sm" />
          <p className="text-xs text-text-muted">
            A simpler way to track your anime journey.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-text-primary transition-colors">
            About
          </a>
          <a href="#" className="hover:text-text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-text-primary transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-text-primary transition-colors">
            GitHub
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-text-muted">
          © {currentYear} AniTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
