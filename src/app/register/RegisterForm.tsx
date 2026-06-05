"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerUser } from "@/lib/auth/actions";
import { useToast } from "@/components/ui/Toast";

export function RegisterForm() {
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
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const result = await registerUser({ username, email, password, confirmPassword });

    if (result.success) {
      showToast("Account created successfully!", "success");
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
        name="username"
        label="Username"
        type="text"
        placeholder="animefan42"
        autoComplete="username"
        error={fieldErrors.username}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />

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

      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        helperText="Must be at least 8 characters"
        error={fieldErrors.password}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        }
      />

      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
      />

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          required
          type="checkbox"
          className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
        />
        <span className="text-xs text-text-secondary leading-relaxed">
          I agree to the{" "}
          <a href="#" className="text-accent hover:text-accent-hover">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-accent hover:text-accent-hover">
            Privacy Policy
          </a>
        </span>
      </label>

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Create Account
      </Button>
    </form>
  );
}
