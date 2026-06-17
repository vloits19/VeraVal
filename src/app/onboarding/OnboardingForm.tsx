"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { completeOnboarding } from "@/lib/auth/actions";
import Image from "next/image";

interface OnboardingFormProps {
  email: string;
  avatar: string;
  displayName: string;
}

export function OnboardingForm({ email, avatar, displayName }: OnboardingFormProps) {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time validation states
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setIsAvailable(data.available);
      } catch {
        setIsAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isAvailable === false) return;

    setLoading(true);
    setError(null);

    const result = await completeOnboarding({ username, email, avatar });

    if (result.success) {
      showToast("Profile created successfully!", "success");
      // Force hard navigation to clear cache and reload session
      window.location.href = "/";
    } else {
      setError(result.error || result.fieldErrors?.username || "Failed to create profile");
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-[var(--radius-md)] text-sm text-danger text-center">
          {error}
        </div>
      )}

      {/* Auto-imported Profile Info Display */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-bg-surface border border-border">
        {avatar ? (
          <Image src={avatar} alt="Avatar" width={48} height={48} className="rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xl">
            {displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div>
          <p className="font-medium text-text-primary">{displayName || "Welcome"}</p>
          <p className="text-sm text-text-muted">{email}</p>
        </div>
      </div>

      <div>
        <Input
          name="username"
          label="Choose a Username"
          type="text"
          placeholder="animefan42"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          helperText="3-20 characters, letters, numbers, and underscores only."
          error={
            username.length > 0 && !/^[a-zA-Z0-9_]+$/.test(username)
              ? "Only letters, numbers, and underscores are allowed."
              : username.length > 0 && username.length < 3
              ? "Username is too short."
              : isAvailable === false
              ? "✗ Username is already taken."
              : undefined
          }
        />
        {isAvailable === true && !checkingUsername && (
          <p className="text-success text-xs mt-1 font-medium">✓ Username is available!</p>
        )}
        {checkingUsername && (
          <p className="text-text-muted text-xs mt-1">Checking availability...</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        disabled={!username || isAvailable === false || checkingUsername}
      >
        Complete Profile
      </Button>
    </form>
  );
}
