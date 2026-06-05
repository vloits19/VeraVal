"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

const NO_SIDEBAR_ROUTES = ["/login", "/register"];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main
        className={`
          flex-1 mt-[var(--navbar-height)]
          transition-all duration-[var(--transition-base)]
          ${showSidebar ? "lg:ml-[var(--sidebar-width)]" : ""}
        `}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      <div className={showSidebar ? "lg:ml-[var(--sidebar-width)]" : ""}>
        <Footer />
      </div>
    </div>
  );
}
