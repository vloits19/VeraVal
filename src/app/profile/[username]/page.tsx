import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile, getUserStats } from "@/lib/profile/actions";
import { getFriendshipStatus } from "@/lib/friends/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FriendActionButton } from "@/components/social/FriendActionButton";
import { AnimeShowcase } from "@/components/profile/AnimeShowcase";
import { createClient } from "@/lib/supabase/server";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  const profile = await getUserProfile(username);
  
  if (!profile) {
    notFound();
  }

  const [stats, friendship, supabase] = await Promise.all([
    getUserStats(profile.id),
    getFriendshipStatus(profile.id),
    createClient(),
  ]);

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div 
      className="animate-fade-in pb-20"
      style={{ '--user-accent': profile.accent_color } as React.CSSProperties}
    >
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full bg-bg-secondary border-b border-border overflow-hidden">
        {profile.banner ? (
          <>
            <Image src={profile.banner} alt={`${profile.username}'s banner`} fill sizes="100vw" className="object-cover" priority unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main to-transparent opacity-60" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--user-accent)', opacity: 0.2 }} />
        )}
      </div>

      {/* Main Content Wrapper */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 -mt-20 md:-mt-24">
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end mb-8 text-center md:text-left">
          {/* Avatar */}
          <div 
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-xl shrink-0 bg-bg-card flex items-center justify-center overflow-hidden"
            style={{ borderColor: 'var(--user-accent)' }}
          >
            {profile.avatar ? (
              <Image src={profile.avatar} alt={profile.username} fill sizes="160px" className="object-cover" priority unoptimized />
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-text-muted">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* User Info & Actions */}
          <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-center md:items-end gap-4 pb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                {profile.username}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-text-muted">
                <span>
                  <strong className="text-text-primary font-bold">{stats.friendCount}</strong> Followers
                </span>
                <span>
                  <strong className="text-text-primary font-bold">{stats.animeCount}</strong> Anime
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/profile/${profile.username}/anime-list`}>
                <Button variant={isOwnProfile ? "primary" : "secondary"}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Anime List
                </Button>
              </Link>

              {isOwnProfile ? (
                <Link href="/settings">
                  <Button variant="secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <FriendActionButton 
                  targetUserId={profile.id}
                  initialStatus={friendship.status}
                  requestId={friendship.requestId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Bio & Info */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <Card padding="lg" className="space-y-4 shadow-sm border-t-4" style={{ borderTopColor: 'var(--user-accent)' }}>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">About</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>
              
              <div className="h-px bg-border my-4" />
              
              <div className="text-xs text-text-muted space-y-2">
                <p>Joined {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </Card>
          </div>

          {/* Right Column: Showcases */}
          <div className="flex-1 space-y-12">
            
            {stats.animeCount === 0 ? (
              <div className="bg-bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center text-text-secondary">
                <p>{profile.username} hasn&apos;t tracked any anime yet.</p>
              </div>
            ) : (
              <AnimeShowcase userId={profile.id} username={profile.username} />
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
