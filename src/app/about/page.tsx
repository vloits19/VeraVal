import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about VeraVal, the simpler alternative to MyAnimeList.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <h1 className="text-3xl font-bold text-text-primary">About VeraVal</h1>
      
      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p>
          Welcome to <strong className="text-text-primary">VeraVal</strong>, your personal hub for tracking, discovering, and managing your anime journey.
        </p>
        
        <h2 className="text-xl font-semibold text-text-primary mt-8">Our Mission</h2>
        <p>
          We built VeraVal because we wanted a cleaner, faster, and more modern alternative to traditional anime tracking sites. The goal is simple: provide all the tools you need to organize your watch list without the clutter.
        </p>

        <h2 className="text-xl font-semibold text-text-primary mt-8">Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Seamlessly search through a massive database powered by AniList.</li>
          <li>Organize anime into customizable categories (Watching, Completed, Plan to Watch, etc).</li>
          <li>Showcase your absolute favorites on your public profile.</li>
          <li>Connect with friends and see what they&apos;re watching.</li>
        </ul>

        <h2 className="text-xl font-semibold text-text-primary mt-8">Open Source</h2>
        <p>
          VeraVal is a passion project built with Next.js, Supabase, and Tailwind CSS.
        </p>
      </div>
    </div>
  );
}
