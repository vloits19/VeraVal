import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Akun di-Banned — VeraVal",
};

export default async function BannedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_banned, ban_reason")
    .eq("id", user.id)
    .single();

  if (!profile?.is_banned) {
    redirect("/");
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center animate-fade-in p-4">
      <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-danger">Akun Anda di-Banned</h1>
      
      <div className="max-w-md bg-bg-card border border-border rounded-[var(--radius-md)] p-6 space-y-4">
        <p className="text-text-secondary text-sm">
          Akses Anda ke VeraVal telah dicabut oleh Administrator karena alasan berikut:
        </p>
        <div className="bg-danger/5 border border-danger/20 p-4 rounded text-danger font-medium text-left break-words">
          {profile.ban_reason || "Pelanggaran pedoman komunitas."}
        </div>
      </div>

      <form action={async () => {
        "use server";
        const supabaseClient = await createClient();
        await supabaseClient.auth.signOut();
        redirect("/login");
      }}>
        <Button variant="secondary" size="lg" type="submit">
          Logout
        </Button>
      </form>
    </div>
  );
}
