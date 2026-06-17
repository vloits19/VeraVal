"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getAdminUsersList, updateUserRoleAdmin, banUser, unbanUser } from "@/lib/admin/actions";

export function AdminUserPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsersList();
      setUsers(data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRoleAdmin(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      showToast("Role updated", "success");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBanClick = (user: any) => {
    setSelectedUser(user);
    setBanReason("");
    setBanModalOpen(true);
  };

  const submitBan = async () => {
    if (!selectedUser || !banReason.trim()) {
      showToast("Reason is required", "error");
      return;
    }
    try {
      await banUser(selectedUser.id, banReason.trim());
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, is_banned: true, ban_reason: banReason.trim() } : u));
      showToast(`User ${selectedUser.username} has been banned`, "success");
      setBanModalOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u));
      showToast("User unbanned", "success");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return <Card padding="lg" className="animate-pulse"><div className="h-32 bg-bg-secondary rounded"></div></Card>;
  }

  const activeUsers = users.filter((u) => !u.is_banned);
  const bannedUsers = users.filter((u) => u.is_banned);

  return (
    <>
      <div className="space-y-6">
        {/* Active Users Table */}
        <Card padding="lg" className="space-y-4">
          <h3 className="font-semibold text-text-primary">Active Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-bg-secondary/50">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex flex-col">
                        <span className="text-text-primary">{u.username}</span>
                        <span className="text-xs text-text-muted">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="bg-bg-secondary border border-border text-text-primary text-sm rounded focus:ring-accent focus:border-accent block w-full p-2 outline-none"
                        value={u.role || "user"}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.role === "admin"}
                      >
                        <option value="user">User</option>
                        <option value="whitelist">Whitelist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== "admin" && (
                        <Button variant="danger" size="sm" onClick={() => handleBanClick(u)}>Ban</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {activeUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-text-muted">No active users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Banned Users Table */}
        <Card padding="lg" className="space-y-4 border-t-4" style={{ borderTopColor: "var(--danger)" }}>
          <h3 className="font-semibold text-danger">Banned Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Ban Reason</th>
                  <th className="px-4 py-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bannedUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-bg-secondary/50">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex flex-col">
                        <span className="text-text-primary">{u.username}</span>
                        <span className="text-xs text-text-muted">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs break-words max-w-[200px]">
                      {u.ban_reason || "No reason provided"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="secondary" size="sm" onClick={() => handleUnban(u.id)}>Unban</Button>
                    </td>
                  </tr>
                ))}
                {bannedUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-text-muted">No banned users.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Ban Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card padding="lg" className="w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-bold text-text-primary mb-2">Ban User: {selectedUser.username}</h3>
            <p className="text-sm text-text-secondary mb-4">
              Please provide a reason for banning this user. This reason will be shown to them when they try to login.
            </p>
            <textarea
              className="w-full bg-bg-secondary border border-border text-text-primary rounded-md p-3 min-h-[100px] focus:ring-1 focus:ring-danger focus:border-danger outline-none mb-4 resize-none"
              placeholder="Reason for ban..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setBanModalOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={submitBan}>Confirm Ban</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
