import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AnimeCardProps {
  id: number;
  title: string;
  coverImage: string;
  score: string | null;
  formatStr: string;
  primaryGenre?: string;
  episodesOrStatus?: string;
  href?: string;
}

export function AnimeCard({
  id,
  title,
  coverImage,
  score,
  formatStr,
  primaryGenre,
  episodesOrStatus,
  href,
}: AnimeCardProps) {
  const defaultHref = `/anime/${id}`;

  return (
    <Link href={href || defaultHref} className="block h-full">
      <Card
        hover
        glow
        padding="none"
        className="overflow-hidden group flex flex-col h-full"
      >
        {/* Cover Image */}
        <div className="relative aspect-[2/3] bg-bg-secondary w-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              quality={75}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              No Image
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {score && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-black/70 text-white rounded-[var(--radius-sm)] backdrop-blur-md flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {score}
              </span>
            )}
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-black/70 text-white rounded-[var(--radius-sm)] backdrop-blur-md ml-auto">
              {formatStr}
            </span>
          </div>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <Button variant="primary" size="sm" className="w-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
              View Details
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3
              className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight mb-1"
              title={title}
            >
              {title}
            </h3>
          </div>
          {(primaryGenre || episodesOrStatus) && (
            <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
              <span className="truncate max-w-[60%]">
                {primaryGenre || "Unknown"}
              </span>
              <span>
                {episodesOrStatus || "TBA"}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
