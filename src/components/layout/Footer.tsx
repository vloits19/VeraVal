import React from "react";
import Link from "next/link";
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
          <Link href="/about" className="hover:text-text-primary transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">
            Terms
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-text-muted">
          © {currentYear} VeraVal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
