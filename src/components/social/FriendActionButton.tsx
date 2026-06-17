"use client";

import React, { useState, useTransition } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { sendFriendRequest, removeFriend, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, FriendshipStatus } from "@/lib/friends/actions";
import { useToast } from "@/components/ui/Toast";

interface Props {
  targetUserId: string;
  initialStatus: FriendshipStatus;
  requestId?: string;
}

export function FriendActionButton({ targetUserId, initialStatus, requestId }: Props) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<FriendshipStatus | 'rejected'>(initialStatus);
  const [currentRequestId, setCurrentRequestId] = useState(requestId);

  if (!profile || profile.id === targetUserId) return null;

  const handleAction = () => {
    startTransition(async () => {
      try {
        if (status === "none") {
          await sendFriendRequest(targetUserId);
          setStatus("request_sent");
          showToast("Friend request sent", "success");
        } else if (status === "request_received" && currentRequestId) {
          await acceptFriendRequest(currentRequestId, targetUserId);
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

  const handleReject = () => {
    startTransition(async () => {
      if (!currentRequestId) return;
      try {
        await rejectFriendRequest(currentRequestId);
        setStatus("rejected");
        showToast("Friend request rejected", "success");
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Action failed";
        showToast(msg, "error");
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      if (!currentRequestId) return;
      try {
        await cancelFriendRequest(currentRequestId);
        setStatus("none");
        setCurrentRequestId(undefined);
        showToast("Friend request cancelled", "success");
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Action failed";
        showToast(msg, "error");
      }
    });
  };

  if (status === "request_sent") {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" size="md" disabled className="opacity-70 cursor-not-allowed border-dashed">
          Request Sent
        </Button>
        <Button variant="ghost" size="md" onClick={handleCancel} disabled={isPending} className="border border-border hover:bg-danger/10 hover:text-danger hover:border-danger transition-colors">
          Cancel
        </Button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <Button variant="ghost" size="md" disabled className="opacity-50 cursor-not-allowed">
        Rejected
      </Button>
    );
  }

  if (status === "request_received") {
    return (
      <div className="flex gap-2">
        <Button variant="primary" size="md" onClick={handleAction} disabled={isPending}>
          Accept
        </Button>
        <Button variant="ghost" size="md" onClick={handleReject} disabled={isPending} className="border border-border hover:bg-danger/10 hover:text-danger hover:border-danger transition-colors">
          Decline
        </Button>
      </div>
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
