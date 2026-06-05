import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getFriendsList, getPendingRequests } from "@/lib/friends/actions";
import { createClient } from "@/lib/supabase/server";
import { getAnimeByIds } from "@/lib/anilist/client";
import { Card } from "@/components/ui/Card";
import { FriendActionButton } from "@/components/social/FriendActionButton";

export default async function FriendsPage() {
  const friends = await getFriendsList();
  const requests = await getPendingRequests();

  // Fetch favorite anime for each friend
  const supabase = await createClient();
  const friendAnimeMap = new Map();
  const animeIdsToFetch = new Set<number>();

  for (const f of friends) {
    const { data } = await supabase
      .from("anime_lists")
      .select("anime_id")
      .eq("user_id", f.user.id)
      .eq("is_favorite", true)
      .order("favorite_order", { ascending: true, nullsFirst: false })
      .limit(1)
      .single();

    if (data) {
      friendAnimeMap.set(f.user.id, data.anime_id);
      animeIdsToFetch.add(data.anime_id);
    }
  }

  const animeDataMap = new Map();
  if (animeIdsToFetch.size > 0) {
    const mediaList = await getAnimeByIds(Array.from(animeIdsToFetch));
    mediaList.forEach(m => animeDataMap.set(m.id, m));
  }

  const timeSince = (dateStr?: string) => {
    if (!dateStr) return "Offline";
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 animate-fade-in pb-20 mt-8 space-y-12">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-text-primary">Friends</h1>
        <p className="text-text-secondary mt-1">Manage your friends and social connections.</p>
      </div>

      {requests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary tracking-wide uppercase border-l-4 border-accent pl-3">
            Pending Requests — {requests.length}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <Card key={req.id} padding="sm" className="flex items-center justify-between">
                <Link href={`/user/${req.sender.username}`} className="flex items-center gap-3 group">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-secondary border-2 border-transparent group-hover:border-accent transition-colors" style={{ borderColor: req.sender.accent_color }}>
                    {req.sender.avatar ? (
                      <Image src={req.sender.avatar} alt={req.sender.username} fill sizes="48px" quality={80} className="object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-bg-card">
                        {req.sender.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-text-primary group-hover:text-accent transition-colors">{req.sender.username}</span>
                </Link>
                <div className="flex gap-2">
                  <FriendActionButton targetUserId={req.sender.id} initialStatus="request_received" requestId={req.id} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary tracking-wide uppercase border-l-4 border-accent pl-3">
          All Friends — {friends.length}
        </h2>
        {friends.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center text-text-secondary">
            You have no friends added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map(f => {
              const favAnimeId = friendAnimeMap.get(f.user.id);
              const favAnime = favAnimeId ? animeDataMap.get(favAnimeId) : null;
              const bannerImage = favAnime?.bannerImage || favAnime?.coverImage?.large;

              return (
                <Link key={f.friendId} href={`/user/${f.user.username}`} className="block h-full group">
                  <Card hover glow padding="none" className="overflow-hidden h-full flex flex-col relative border-transparent hover:border-accent/50">
                    
                    {/* Favorite Anime Banner Preview */}
                    <div className="h-24 w-full bg-bg-secondary relative overflow-hidden">
                      {bannerImage ? (
                        <Image src={bannerImage} alt="Favorite Anime" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={60} className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0" style={{ backgroundColor: f.user.accent_color || 'var(--accent)', opacity: 0.2 }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent" />
                    </div>

                    {/* Friend Details */}
                    <div className="px-4 pb-4 -mt-8 relative z-10 flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-bg-card border-4 border-bg-card shadow-md" style={{ borderColor: f.user.accent_color || 'var(--bg-card)' }}>
                        {f.user.avatar ? (
                          <Image src={f.user.avatar} alt={f.user.username} fill sizes="64px" quality={80} className="object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-bg-secondary text-text-primary">
                            {f.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="mt-2 font-bold text-lg text-text-primary group-hover:text-accent transition-colors">
                        {f.user.username}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 font-medium">
                        Last Active: {timeSince(f.user.last_active)}
                      </p>

                      {/* Favorite Anime Tag */}
                      {favAnime && (
                        <div className="mt-4 text-xs flex flex-col items-center gap-1 w-full text-center">
                          <span className="text-text-muted uppercase tracking-wider text-[10px]">Top Favorite</span>
                          <span className="bg-bg-input text-text-secondary px-2 py-1 rounded truncate w-full border border-border">
                            {favAnime.title.english || favAnime.title.romaji}
                          </span>
                        </div>
                      )}
                    </div>
                    
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
