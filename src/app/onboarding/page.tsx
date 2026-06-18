import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description: "Complete your VeraVal profile to continue.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify they don't already have a profile
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/");
  }

  // Extract info from Google OAuth user metadata
  const email = user.email || "";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || "";

  return (
    <div className="min-h-[75vh] flex items-center justify-center animate-fade-in">
      <Card padding="lg" className="w-full max-w-md">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome to VeraVal
            </h1>
            <p className="text-sm text-text-secondary">
              Complete your profile to continue
            </p>
          </div>
        </div>

        {/* Form */}
        <OnboardingForm email={email} avatar={avatar} displayName={displayName} />
      </Card>
    </div>
  );
}
