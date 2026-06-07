"use client";

import React, { useState, useRef } from "react";
import { User } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarCropper } from "@/components/profile/AvatarCropper";
import { BannerCropper } from "@/components/profile/BannerCropper";
import { updateProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/client";

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [bannerUrl, setBannerUrl] = useState(user.banner || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cropper states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({
        username,
        bio,
        avatar: avatarUrl,
        banner: bannerUrl,
      });
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setSelectedImage(file);
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Banner must be smaller than 5MB");
      return;
    }

    if (file.type === "image/gif") {
      // Bypass cropper for GIFs to preserve animation
      handleBannerCropComplete(file);
    } else {
      setSelectedBanner(file);
    }
    
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setSelectedImage(null); // Close modal
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileExt = croppedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      
      // Auto save the avatar update
      await updateProfile({ avatar: data.publicUrl });
      setSuccess("Avatar updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl("");
    await updateProfile({ avatar: "" });
    setSuccess("Avatar removed.");
  };

  const handleBannerCropComplete = async (croppedFile: File) => {
    setSelectedBanner(null); // Close modal
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileExt = croppedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-banner-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setBannerUrl(data.publicUrl);
      
      await updateProfile({ banner: data.publicUrl });
      setSuccess("Banner updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload banner");
    } finally {
      setIsUploading(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  };

  const handleRemoveBanner = async () => {
    setBannerUrl("");
    await updateProfile({ banner: "" });
    setSuccess("Banner removed.");
  };


  return (
    <div className="space-y-6">
      {selectedImage && (
        <AvatarCropper
          imageFile={selectedImage}
          onClose={() => setSelectedImage(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      {selectedBanner && (
        <BannerCropper
          imageFile={selectedBanner}
          onClose={() => setSelectedBanner(null)}
          onCropComplete={handleBannerCropComplete}
        />
      )}

      {error && (
        <div className="p-3 bg-danger/10 text-danger border border-danger/20 rounded-[var(--radius-md)] text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-success/10 text-success border border-success/20 rounded-[var(--radius-md)] text-sm">
          {success}
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} fallback={user.username} size="lg" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-primary">Profile Photo</p>
          <div className="flex gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            {avatarUrl && (
              <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} disabled={isUploading}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {(user.role === 'admin' || user.role === 'whitelist') && (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z" />
                </svg>
                Profile Banner (Admin & Whitelist Only)
              </p>
              <p className="text-xs text-text-muted">Upload a custom banner image for your profile header.</p>
            </div>
            
            {bannerUrl && (
              <div className="relative w-full h-24 rounded-[var(--radius-md)] overflow-hidden border border-border">
                <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex gap-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={bannerInputRef}
                onChange={handleBannerSelect}
                disabled={isUploading}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Banner"}
              </Button>
              {bannerUrl && (
                <Button variant="ghost" size="sm" onClick={handleRemoveBanner} disabled={isUploading}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-border" />

      {/* Fields */}
      <div className="space-y-4">
        <Input 
          label="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="animefan42" 
        />
        <Input 
          label="Email" 
          type="email" 
          value={user.email} 
          disabled 
          helperText="Email cannot be changed currently."
        />
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-text-secondary">Bio</label>
          <textarea
            className="w-full px-4 py-2.5 text-sm bg-bg-input text-text-primary border border-border rounded-[var(--radius-md)] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none min-h-[100px]"
            placeholder="Tell us about your anime taste..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-text-muted text-right">{bio.length}/500</p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving || isUploading}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
