"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { updateProfile } from "@/lib/profile/actions";

interface NotificationSettingsProps {
  initialPreferences: {
    notify_episodes: boolean;
    notify_recommendations: boolean;
    notify_social: boolean;
  };
}

export function NotificationSettings({ initialPreferences }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const togglePreference = async (key: keyof typeof preferences) => {
    if (isSaving) return;
    
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(newPreferences);
    setIsSaving(true);
    
    try {
      await updateProfile({ preferences: newPreferences });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      // Revert on failure
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  const ITEMS = [
    {
      id: "notify_episodes" as const,
      title: "Episode Reminders",
      desc: "Get notified when new episodes air",
    },
    {
      id: "notify_recommendations" as const,
      title: "Recommendations",
      desc: "Receive anime recommendations based on your list",
    },
    {
      id: "notify_social" as const,
      title: "Social Updates",
      desc: "Get notified about friend activity",
    },
  ];

  return (
    <Card padding="lg" className="space-y-4">
      {ITEMS.map((item) => {
        const isActive = preferences[item.id];
        return (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {item.title}
              </p>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
            <button 
              onClick={() => togglePreference(item.id)}
              disabled={isSaving}
              className={`
                relative w-10 h-5 rounded-full transition-colors cursor-pointer
                ${isActive ? "bg-accent" : "bg-border-hover"}
                ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span 
                className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                  ${isActive ? "left-[calc(100%-1.125rem)]" : "left-0.5"}
                `} 
              />
            </button>
          </div>
        );
      })}
    </Card>
  );
}
