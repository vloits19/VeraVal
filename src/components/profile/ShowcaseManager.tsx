"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShowcaseItem, updateShowcaseOrder, removeShowcaseItem, addShowcaseItem } from "@/lib/profile/showcaseActions";
import Image from "next/image";

interface AnimeData {
  id: number;
  title: string;
  coverImage: string;
  score: number | null;
}

interface ShowcaseManagerProps {
  initialShowcase: ShowcaseItem[];
  userAnimeList: { anime_id: number; status: string }[];
  animeDetails: Record<number, AnimeData>;
}

const CATEGORIES = [
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "plan_to_watch", label: "Plan to Watch" },
  { id: "dropped", label: "Dropped" },
  { id: "not_interested", label: "Not Interested" },
];

export function ShowcaseManager({ initialShowcase, userAnimeList, animeDetails }: ShowcaseManagerProps) {
  const [showcase, setShowcase] = useState(initialShowcase);
  const [activeCategory, setActiveCategory] = useState("watching");
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Group showcase items by category
  const currentCategoryItems = showcase
    .filter((item) => item.category === activeCategory)
    .sort((a, b) => a.display_order - b.display_order);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(currentCategoryItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state instantly for smooth UI
    const updatedShowcase = showcase.filter(item => item.category !== activeCategory).concat(items.map((item, index) => ({ ...item, display_order: index })));
    setShowcase(updatedShowcase);

    try {
      await updateShowcaseOrder(activeCategory, items.map(i => i.id));
    } catch (e) {
      console.error(e);
      // Revert on error
      setShowcase(initialShowcase);
    }
  };

  const handleRemove = async (id: string) => {
    setIsProcessing(true);
    try {
      await removeShowcaseItem(id);
      setShowcase(showcase.filter(item => item.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = async (animeId: number) => {
    setIsProcessing(true);
    try {
      await addShowcaseItem(animeId, activeCategory);
      // We should ideally fetch the updated list or just trigger a reload
      // But Server Action revalidatePath will refresh the page props soon
      setIsAdding(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter available anime to add
  const availableToAdd = userAnimeList.filter(
    (a) => !showcase.find((s) => s.anime_id === a.anime_id && s.category === activeCategory)
  ).map(a => animeDetails[a.anime_id]).filter(Boolean).filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Card padding="lg" className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setIsAdding(false); }}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === cat.id
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!isAdding ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Drag and drop to reorder. Max 5 items per category.
            </p>
            {currentCategoryItems.length < 5 && (
              <Button size="sm" onClick={() => setIsAdding(true)}>+ Add Anime</Button>
            )}
          </div>

          {currentCategoryItems.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-[var(--radius-md)] text-text-muted text-sm">
              No anime selected for this category.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="showcase-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {currentCategoryItems.map((item, index) => {
                      const anime = animeDetails[item.anime_id];
                      if (!anime) return null;

                      return (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                flex items-center gap-4 p-3 rounded-[var(--radius-md)] border border-border bg-bg-card
                                ${snapshot.isDragging ? "shadow-lg border-accent/50 z-50" : ""}
                              `}
                            >
                              <div className="text-text-muted cursor-grab active:cursor-grabbing">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="8" y1="6" x2="21" y2="6" />
                                  <line x1="8" y1="12" x2="21" y2="12" />
                                  <line x1="8" y1="18" x2="21" y2="18" />
                                  <line x1="3" y1="6" x2="3.01" y2="6" />
                                  <line x1="3" y1="12" x2="3.01" y2="12" />
                                  <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                              </div>
                              <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                                <Image src={anime.coverImage} alt={anime.title} fill className="object-cover" unoptimized />
                              </div>
                              <div className="flex-1 truncate">
                                <p className="font-medium text-text-primary truncate">{anime.title}</p>
                                {anime.score && <p className="text-xs text-text-muted">Score: {anime.score}</p>}
                              </div>
                              <button
                                onClick={() => handleRemove(item.id)}
                                disabled={isProcessing}
                                className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAdding(false)} className="p-2 text-text-muted hover:text-text-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search your anime list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-bg-input border border-border rounded-[var(--radius-md)] text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {availableToAdd.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-4">No anime found.</p>
            ) : (
              availableToAdd.map((anime) => (
                <div key={anime.id} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-bg-input transition-colors">
                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                    <Image src={anime.coverImage} alt={anime.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium text-text-primary text-sm truncate">{anime.title}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(anime.id)} disabled={isProcessing}>
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
