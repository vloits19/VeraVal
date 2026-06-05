"use client";

import React, { useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { sendFriendRequest, removeFriend, acceptFriendRequest, FriendshipStatus } from "@/lib/friends/actions";
import { useToast } from "@/components/ui/Toast";

interface Props {
  targetUserId: string;
  initialStatus: FriendshipStatus;
  requestId?: string;
  friendId?: string;
}

export function FriendActionButton({ targetUserId, initialStatus, requestId, friendId }: Props) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<FriendshipStatus>(initialStatus);

  if (!profile || profile.id === targetUserId) return null;

  const handleAction = () => {
    startTransition(async () => {
      try {
        if (status === "none") {
          await sendFriendRequest(targetUserId);
          setStatus("request_sent");
          showToast("Friend request sent", "success");
        } else if (status === "request_received" && requestId) {
          await acceptFriendRequest(requestId, targetUserId);
          setStatus("friends");
          showToast("Friend request accepted", "success");
        } else if (status === "friends") {
          await removeFriend(targetUserId);
          setStatus("none");
          showToast("Removed from friends", "success");
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Action failed";
        showToast(msg, "error");
      }
    });
  };

  if (status === "request_sent") {
    return (
      <Button variant="secondary" size="md" disabled className="opacity-70 cursor-not-allowed border-dashed">
        Request Sent
      </Button>
    );
  }

  if (status === "request_received") {
    return (
      <Button variant="primary" size="md" onClick={handleAction} disabled={isPending}>
        Accept Request
      </Button>
    );
  }

  if (status === "friends") {
    return (
      <Button variant="ghost" size="md" onClick={handleAction} disabled={isPending} className="border border-border hover:border-danger hover:text-danger hover:bg-danger/10 transition-colors">
        Friends
      </Button>
    );
  }

  return (
    <Button variant="secondary" size="md" onClick={handleAction} disabled={isPending}>
      Add Friend
    </Button>
  );
}
