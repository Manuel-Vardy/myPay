"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  ShieldPlus,
  Key,
  MoreVertical,
  Plus,
  Eye,
  ChevronRight,
  Pencil,
  Trash2,
  Info,
} from "lucide-react";

type ApiRole = { id: string; name: string; description: string; is_system_role: boolean; permissions: Array<{ id: string; name: string; description: string }> };
type ApiPermission = { id: string; name: string; description: string };
type RolesResponse = { roles: ApiRole[]; available_permissions: ApiPermission[] };

export default function AdminRolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkedPerms, setCheckedPerms] = useState<Record<string, boolean>>({});

  const { data: rolesData } = useAdminFetch<RolesResponse>("/api/admin/roles");
  const { data: logsData } = useAdminFetch<{ data: Array<{ id: number; timestamp: string; event_description: string }> }>("/api/admin/logs", { source: "AUTH_CORE", per_page: "2" });
  const apiRoles = rolesData?.roles ?? [];
  const availablePermissions = rolesData?.available_permissions ?? [];

  const selectedRole = apiRoles.find((r) => r.id === selectedRoleId) ?? apiRoles[0];

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Role Management</h1>
          <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Define and govern institutional access levels. Ensure security through granular permission-based control across all TRITE PSP systems.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
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

          <div className="space-y-3">
            {apiRoles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => { setSelectedRoleId(role.id); setCheckedPerms({}); }}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
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
                        <p className={`font-semibold ${isSelected ? "text-blue-700" : "text-[color:var(--trite-ink)]"}`}>{role.name}</p>
                        <ChevronRight className={`h-4 w-4 ${isSelected ? "text-blue-500" : "text-[color:var(--trite-muted)]"}`} />
                      </div>
                      <p className="mt-0.5 text-xs text-[color:var(--trite-muted)]">{role.description}</p>
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
              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                  <Pencil className="h-4 w-4 text-[color:var(--trite-muted)]" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="text-sm font-semibold text-[color:var(--trite-muted)] uppercase tracking-wide mb-4">Permissions & Access Control</h3>
            
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

            <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-[color:var(--trite-muted)]">
                  Changes to this role will trigger a system-wide re-authentication for all users assigned to "{selectedRole?.name}".
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                  Discard Changes
                </button>
                <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[color:var(--trite-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60">
                  {saving ? "Saving..." : "Save Role Configuration"}
                </button>
              </div>
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
    </>
  );
}
