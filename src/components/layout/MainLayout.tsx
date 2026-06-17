"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

const NO_SIDEBAR_ROUTES = ["/login", "/register"];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("veraval-sidebar-minimized");
    if (saved === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMinimized(true);
    }
  }, []);

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      localStorage.setItem("veraval-sidebar-minimized", String(next));
      return next;
    });
  };

  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col" data-sidebar-minimized={isMinimized ? "true" : "false"}>
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMinimized={isMinimized}
          onToggleMinimize={handleToggleMinimize}
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
