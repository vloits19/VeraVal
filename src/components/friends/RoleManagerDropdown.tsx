"use client";

import React, { useState } from "react";
import { updateUserRole } from "@/lib/profile/actions";

interface RoleManagerDropdownProps {
  targetUserId: string;
  initialRole?: string;
}

export function RoleManagerDropdown({ targetUserId, initialRole = "user" }: RoleManagerDropdownProps) {
  const [role, setRole] = useState(initialRole);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setIsUpdating(true);
    try {
      await updateUserRole(targetUserId, newRole);
      setRole(newRole);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role. You might not have permission.");
      // Revert selection on error
      e.target.value = role;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Role:</label>
      <select
        value={role}
        onChange={handleRoleChange}
        disabled={isUpdating}
        className="bg-bg-input text-text-primary text-xs border border-border rounded-[var(--radius-sm)] px-2 py-1 outline-none focus:border-accent disabled:opacity-50"
      >
        <option value="user">User</option>
        <option value="whitelist">Whitelist</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}
