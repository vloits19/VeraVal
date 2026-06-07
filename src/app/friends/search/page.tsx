import React from "react";
import Image from "next/image";
import Link from "next/link";
import { searchUsers } from "@/lib/profile/searchActions";
import { getFriendshipStatus } from "@/lib/friends/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FriendActionButton } from "@/components/social/FriendActionButton";

export default async function UserSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  
  const users = await searchUsers(query);
  
  // Fetch friendship status for each user found
  const userStatuses = await Promise.all(
    users.map(async (u) => {
      const status = await getFriendshipStatus(u.id);
      return { ...u, friendship: status };
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 animate-fade-in pb-20 mt-8 space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href="/friends" className="text-text-muted hover:text-text-primary transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Find Friends</h1>
          <p className="text-text-secondary mt-1">Search for other users by username.</p>
        </div>
      </div>

      {/* Search Form */}
      <form className="relative" action="/friends/search" method="GET">
        <svg className="absolute left-4 top-3.5 text-text-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Enter username to search..."
          className="w-full pl-12 pr-4 py-3 bg-bg-card border border-border rounded-[var(--radius-lg)] text-lg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-sm"
          autoFocus
        />
        <Button type="submit" className="absolute right-2 top-2" size="sm">
          Search
        </Button>
      </form>

      {/* Results */}
      {query && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary tracking-wide uppercase border-l-4 border-accent pl-3">
            Search Results for &quot;{query}&quot;
          </h2>
          
          {userStatuses.length === 0 ? (
            <div className="bg-bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center text-text-secondary">
              No users found matching &quot;{query}&quot;. Try a different username.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStatuses.map(u => (
                <Card key={u.id} padding="sm" className="flex items-center justify-between hover:border-accent/50 transition-colors">
                  <Link href={`/profile/${u.username}`} className="flex items-center gap-3 group">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-secondary border-2 border-transparent group-hover:border-accent transition-colors" style={{ borderColor: u.accent_color }}>
                      {u.avatar ? (
                        <Image src={u.avatar} alt={u.username} fill sizes="48px" quality={80} className="object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-bg-card text-text-primary">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-text-primary group-hover:text-accent transition-colors block leading-tight">
                        {u.username}
                      </span>
                      <span className="text-xs text-text-muted">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <FriendActionButton 
                      targetUserId={u.id} 
                      initialStatus={u.friendship.status} 
                      requestId={u.friendship.requestId} 
                      friendId={u.friendship.friendId} 
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
