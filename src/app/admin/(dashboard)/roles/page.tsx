"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  ShieldPlus,
  Key,
  ChevronRight,
  Info,
  UserPlus,
  Mail,
  X,
} from "lucide-react";

type ApiRole = { id: string; name: string; description: string; is_system_role: boolean; permissions: Array<{ id: string; name: string; description: string }> };
type ApiPermission = { id: string; name: string; description: string };
type RolesResponse = { roles: ApiRole[]; available_permissions: ApiPermission[] };
type AdminRow = {
  admin_profile_id: string;
  user_id: string;
  email: string;
  status: string;
  admin_id_display: string;
  roles: Array<{ id: string; name: string }>;
};

export default function AdminRolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkedPerms, setCheckedPerms] = useState<Record<string, boolean>>({});

  const { data: rolesData, mutate: refetchRoles } = useAdminFetch<RolesResponse>("/api/admin/roles");
  const { data: logsData } = useAdminFetch<{ data: Array<{ id: number; timestamp: string; event_description: string }> }>("/api/admin/logs", { source: "AUTH_CORE", per_page: "2" });
  const { data: adminsData, mutate: refetchAdmins } = useAdminFetch<{ data: AdminRow[] }>("/api/admin/admins");
  const apiRoles = rolesData?.roles ?? [];
  const availablePermissions = rolesData?.available_permissions ?? [];

  const selectedRole = apiRoles.find((r) => r.id === selectedRoleId) ?? apiRoles[0];

  const admins = adminsData?.data ?? [];
  const roleAdmins = selectedRole
    ? admins.filter((a) => a.roles.some((r) => r.id === selectedRole.id))
    : [];

  // Add-admin modal state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreateAdmin() {
    if (!selectedRole) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword, role_ids: [selectedRole.id] }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCreateError(json.error || "Failed to create admin");
        return;
      }
      setShowAddAdmin(false);
      setNewEmail("");
      setNewPassword("");
      refetchAdmins();
    } catch {
      setCreateError("Failed to create admin");
    } finally {
      setCreating(false);
    }
  }

  // Create-role modal state
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  async function handleCreateRole() {
    setCreatingRole(true);
    setRoleError(null);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName, description: roleDescription }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRoleError(json.error || "Failed to create role");
        return;
      }
      setShowCreateRole(false);
      setRoleName("");
      setRoleDescription("");
      if (json.role?.id) setSelectedRoleId(json.role.id);
      refetchRoles();
    } catch {
      setRoleError("Failed to create role");
    } finally {
      setCreatingRole(false);
    }
  }

  const activePerms: Record<string, boolean> = selectedRole
    ? Object.fromEntries(selectedRole.permissions.map((p) => [p.id, true]))
    : {};
  const displayPerms = availablePermissions.map((p) => ({
    ...p,
    checked: checkedPerms[p.id] !== undefined ? checkedPerms[p.id] : !!activePerms[p.id],
  }));

  const handlePermissionToggle = (permId: string) => {
    setCheckedPerms((prev) => ({ ...prev, [permId]: !(prev[permId] !== undefined ? prev[permId] : !!activePerms[permId]) }));
  };

  async function handleSave() {
    if (!selectedRole) return;
    setSaving(true);
    const permission_ids = displayPerms.filter((p) => p.checked).map((p) => p.id);
    await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_id: selectedRole.id, permission_ids }),
    });
    setSaving(false);
  }


  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Role Management</h1>
          <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">Define and govern institutional access levels. Ensure security through granular permission-based control across all TRITE PSP systems.</p>
        </div>
        <button
          onClick={() => { setShowCreateRole(true); setRoleError(null); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ShieldPlus className="h-4 w-4" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Active Roles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[color:var(--trite-muted)] uppercase tracking-wide">Active Roles</h2>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{apiRoles.length} System Roles</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:flex-col lg:overflow-visible lg:pb-0">
            {apiRoles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => { setSelectedRoleId(role.id); setCheckedPerms({}); }}
                  className={`min-w-[200px] shrink-0 rounded-2xl border p-4 text-left transition-all lg:min-w-0 ${
                    isSelected ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-black/5 bg-white hover:bg-black/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Key className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold truncate ${isSelected ? "text-blue-700" : "text-[color:var(--trite-ink)]"}`}>{role.name}</p>
                        <ChevronRight className={`h-4 w-4 hidden lg:block ${isSelected ? "text-blue-500" : "text-[color:var(--trite-muted)]"}`} />
                      </div>
                      <p className="mt-0.5 text-[10px] text-[color:var(--trite-muted)] line-clamp-1">{role.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Security Audit Card */}
          <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white">
            <h3 className="font-semibold">Security Audit</h3>
            <p className="mt-2 text-xs text-white/70">
              System scan suggests rotating the Compliance Officer role keys every 90 days. Next rotation due in 12 days.
            </p>
            <button className="mt-4 text-xs font-medium text-[color:var(--trite-lime)] hover:text-[color:var(--trite-lime-strong)]">
              VIEW RECOMMENDATIONS →
            </button>
          </div>
        </div>

        {/* Right Column - Role Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role Header */}
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">{selectedRole?.name ?? "—"}</h2>
                  {selectedRole?.is_system_role && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      ● SYSTEM ROLE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
                  {selectedRole?.description ?? ""}
                </p>
              </div>
              {/*<div className="flex items-center gap-2">*/}
              {/*  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">*/}
              {/*    <Pencil className="h-4 w-4 text-[color:var(--trite-muted)]" />*/}
              {/*  </button>*/}
              {/*  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">*/}
              {/*    <Trash2 className="h-4 w-4 text-red-500" />*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>
          </div>

          {/* Permissions */}
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="text-sm font-semibold text-[color:var(--trite-muted)] uppercase tracking-wide mb-4 text-center sm:text-left">Permissions & Access Control</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayPerms.map((permission) => (
                <label key={permission.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permission.checked}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="mt-1 h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--trite-ink)]">{permission.name}</p>
                    <p className="text-xs text-[color:var(--trite-muted)]">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs text-[color:var(--trite-muted)]">
                  Changes to this role will trigger a system-wide re-authentication for all users assigned to <b>{selectedRole?.name}</b>.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-[color:var(--trite-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60 sm:w-auto">
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </div>

          {/* Administrators with this role */}
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[color:var(--trite-muted)] uppercase tracking-wide">Administrators</h3>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">Accounts assigned the <b>{selectedRole?.name}</b> role</p>
              </div>
              <button
                onClick={() => { setShowAddAdmin(true); setCreateError(null); }}
                disabled={!selectedRole}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-3 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                Add Admin
              </button>
            </div>

            <div className="space-y-3">
              {roleAdmins.map((admin) => (
                <div key={admin.admin_profile_id} className="flex items-center gap-3 rounded-xl border border-black/5 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[color:var(--trite-ink)]">{admin.email}</p>
                    <p className="text-[11px] text-[color:var(--trite-muted)]">{admin.admin_id_display}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    admin.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {admin.status}
                  </span>
                </div>
              ))}
              {selectedRole && roleAdmins.length === 0 && (
                <p className="rounded-xl border border-dashed border-black/10 p-4 text-center text-xs text-[color:var(--trite-muted)]">
                  No administrators assigned to this role yet.
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity Trail */}
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[color:var(--trite-muted)] uppercase tracking-wide">Recent Activity Trail</h3>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Full Audit History</button>
            </div>
            
            <div className="space-y-4">
              {logsData?.data?.slice(0, 2).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Key className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[color:var(--trite-ink)]">{log.event_description}</p>
                  </div>
                  <span className="text-xs text-[color:var(--trite-muted)]">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              )) ?? null}
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !creating && setShowAddAdmin(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Add Administrator</h3>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                  Creates an admin account assigned the <b>{selectedRole?.name}</b> role.
                </p>
              </div>
              <button onClick={() => !creating && setShowAddAdmin(false)} className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--trite-muted)]">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@trite.io"
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--trite-muted)]">Temporary Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 12 characters"
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-[color:var(--trite-muted)]">The admin can change this after their first sign-in.</p>
              </div>

              {createError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{createError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddAdmin(false)}
                disabled={creating}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={creating || !newEmail || newPassword.length < 12}
                className="rounded-xl bg-[color:var(--trite-ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !creatingRole && setShowCreateRole(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Create New Role</h3>
                <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                  Add a new access level. You can assign permissions after it&apos;s created.
                </p>
              </div>
              <button onClick={() => !creatingRole && setShowCreateRole(false)} className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--trite-muted)]">Role Name</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Treasury Analyst"
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--trite-muted)]">Description</label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="What can this role do?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {roleError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{roleError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateRole(false)}
                disabled={creatingRole}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={creatingRole || !roleName.trim()}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {creatingRole ? "Creating..." : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
