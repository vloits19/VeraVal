"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function DangerZoneSection() {
  const handleDelete = () => {
    alert("This feature is currently disabled for your safety during the beta. If you need to delete your account, please contact support.");
  };

  return (
    <Card padding="lg" className="border-danger/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-primary">
            Delete Account
          </p>
          <p className="text-xs text-text-muted">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          Delete Account
        </Button>
      </div>
    </Card>
  );
}
