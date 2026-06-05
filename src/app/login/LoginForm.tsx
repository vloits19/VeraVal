"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/lib/auth/actions";
import { useToast } from "@/components/ui/Toast";

export function LoginForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await loginUser({ email, password });

    if (result.success) {
      showToast("Successfully logged in!", "success");
      // Use window.location to force a full hard reload so the layout components re-render with new auth state
      // router.push("/") combined with router.refresh() sometimes has race conditions with Supabase cookies
      window.location.href = "/";
    } else {
      if (result.error) setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-[var(--radius-md)] text-sm text-danger text-center">
          {error}
        </div>
      )}

      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={fieldErrors.email}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />

      <div className="space-y-1.5">
        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={fieldErrors.password}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          }
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Log In
      </Button>
    </form>
  );
}
