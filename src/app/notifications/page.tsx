import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/notifications/actions";
import { NotificationList } from "@/components/notifications/NotificationList";

export const metadata: Metadata = {
  title: "Notifications — VeraVal",
  description: "View your notifications.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await getNotifications();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 animate-fade-in pb-20 mt-8 space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
        <p className="text-text-secondary mt-1">Stay updated with friend activity and requests.</p>
      </div>

      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
