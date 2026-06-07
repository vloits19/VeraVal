"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const PRESET_COLORS = [
  "#7c3aed", // Violet
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    accent_color: "#7c3aed",
    avatar: "",
    banner: "",
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Sync with auth profile once loaded
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      if (mounted && profile) {
        setFormData({
          bio: profile.bio || "",
          accent_color: profile.accent_color || "#7c3aed",
          avatar: profile.avatar || "",
          banner: profile.banner || "",
        });
      }
    };
    sync();
    return () => { mounted = false; };
  }, [profile]);

  if (!profile) {
    return <div className="py-20 text-center">Loading profile...</div>;
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, bucket: 'avatars' | 'banners') => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      setLoading(true);
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
        
      if (bucket === 'avatars') {
        setFormData(prev => ({ ...prev, avatar: publicUrlData.publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, banner: publicUrlData.publicUrl }));
      }
      
      showToast(`${bucket === 'avatars' ? 'Avatar' : 'Banner'} uploaded successfully`, "success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error uploading image";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      await refreshProfile();
      showToast("Profile updated successfully", "success");
      router.push(`/profile/${profile.username}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile Customization</h1>
        <p className="text-sm text-text-secondary mt-1">
          Make your profile uniquely yours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg" className="space-y-6">
            
            {/* Banner Upload */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Profile Banner</p>
              <div 
                className="relative h-32 w-full bg-bg-secondary rounded-[var(--radius-lg)] overflow-hidden border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors"
                onClick={() => bannerInputRef.current?.click()}
              >
                {formData.banner ? (
                  <Image src={formData.banner} alt="Banner" fill sizes="100%" quality={75} className="object-cover" />
                ) : (
                  <span className="text-sm text-text-muted">Click to upload banner</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Change Banner</span>
                </div>
              </div>
              <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banners')} />
            </div>

            <div className="h-px bg-border" />

            {/* Avatar Upload */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Avatar</p>
              <div className="flex items-center gap-6">
                <div 
                  className="relative h-24 w-24 bg-bg-secondary rounded-full overflow-hidden border-2 border-border cursor-pointer hover:border-accent transition-colors shrink-0"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {formData.avatar ? (
                    <Image src={formData.avatar} alt="Avatar" fill sizes="96px" quality={85} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-text-muted bg-bg-card">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-text-secondary">
                    Recommended size: 256x256px.<br/>Max file size: 2MB.
                  </p>
                  {formData.avatar && (
                    <button onClick={() => setFormData(p => ({ ...p, avatar: "" }))} className="text-xs text-danger hover:underline">
                      Remove Avatar
                    </button>
                  )}
                </div>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'avatars')} />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Accent Color */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Accent Color</p>
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData(p => ({ ...p, accent_color: color }))}
                    className={`w-8 h-8 rounded-full transition-all ${formData.accent_color === color ? "ring-2 ring-offset-2 ring-offset-bg-card ring-text-primary scale-110" : "hover:scale-110"}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
                <div className="w-px h-6 bg-border mx-2" />
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border cursor-pointer">
                  <input 
                    type="color" 
                    value={formData.accent_color}
                    onChange={(e) => setFormData(p => ({ ...p, accent_color: e.target.value }))}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-mono text-text-secondary uppercase">{formData.accent_color}</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Bio */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">About Me</p>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                placeholder="Write a little bit about yourself..."
                rows={4}
                className="w-full bg-bg-input border border-border rounded-[var(--radius-md)] p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>

          </Card>
          
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => router.push(`/profile/${profile.username}`)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Live Preview</h3>
            
            <div 
              className="bg-bg-secondary rounded-[var(--radius-lg)] overflow-hidden shadow-xl border border-border"
              style={{ '--preview-accent': formData.accent_color } as React.CSSProperties}
            >
              {/* Banner */}
              <div className="h-24 w-full bg-bg-input relative">
                {formData.banner && (
                  <Image src={formData.banner} alt="Banner" fill sizes="320px" quality={60} className="object-cover" />
                )}
              </div>
              
              <div className="px-4 pb-4">
                {/* Avatar */}
                <div className="relative w-16 h-16 -mt-8 mb-3 rounded-full border-4 border-bg-secondary bg-bg-card overflow-hidden" style={{ borderColor: 'var(--preview-accent)' }}>
                  {formData.avatar ? (
                    <Image src={formData.avatar} alt="Avatar" fill sizes="64px" quality={80} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-text-muted">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <h4 className="text-base font-bold text-text-primary">{profile.username}</h4>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1 mb-3">
                  <span><strong className="text-text-primary">12</strong> Friends</span>
                  <span><strong className="text-text-primary">45</strong> Anime</span>
                </div>
                
                {/* Bio */}
                <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                  {formData.bio || "No bio written yet."}
                </p>
                
                <button 
                  className="mt-4 w-full py-1.5 rounded-[var(--radius-full)] text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--preview-accent)' }}
                >
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
