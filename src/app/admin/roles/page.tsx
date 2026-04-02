"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutGrid,
  Users,
  Receipt,
  ShieldCheck,
  FileText,
  Key,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  Bell,
  ShieldPlus,
  Crown,
  Headphones,
  MoreVertical,
  Plus,
  Eye,
  ChevronRight,
  Pencil,
  Trash2,
  Info
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: string[];
  createdBy: string;
  createdDate: string;
  lastEdited: string;
  activeDuty: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { id: "kyc", label: "KYC Center", href: "/admin/kyc", icon: ShieldCheck },
  { id: "logs", label: "Logs", href: "/admin/logs", icon: FileText },
  { id: "roles", label: "Roles", href: "/admin/roles", icon: Key },
  { id: "support", label: "Support", href: "/admin/support", icon: HelpCircle },
];

const bottomItems = [
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
  { id: "logout", label: "Logout", href: "/admin/login", icon: LogOut },
];

const roles: Role[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Unrestricted platform-wide access",
    icon: Crown,
    permissions: ["all"],
    createdBy: "System",
    createdDate: "Oct 10, 2023",
    lastEdited: "2 days ago",
    activeDuty: true,
  },
  {
    id: "compliance-officer",
    name: "Compliance Officer",
    description: "KYC approval and regulatory monitoring",
    icon: ShieldCheckIcon,
    permissions: ["manage-users", "approve-kyc", "view-logs", "settlement-monitoring"],
    createdBy: "James Wilson",
    createdDate: "Oct 12, 2023",
    lastEdited: "4 days ago",
    activeDuty: true,
  },
  {
    id: "support-agent",
    name: "Support Agent",
    description: "Ticket resolution and transaction view",
    icon: Headphones,
    permissions: ["view-users", "view-transactions"],
    createdBy: "James Wilson",
    createdDate: "Oct 15, 2023",
    lastEdited: "1 week ago",
    activeDuty: true,
  },
  {
    id: "read-only-audit",
    name: "Read-only Audit",
    description: "Observer access for external auditors",
    icon: Eye,
    permissions: ["view-logs", "view-reports"],
    createdBy: "Sarah Jenkins",
    createdDate: "Oct 18, 2023",
    lastEdited: "2 weeks ago",
    activeDuty: false,
  },
];

const permissions: Permission[] = [
  { id: "manage-users", name: "Manage Users", description: "Add, suspend, or terminate corporate accounts and sub-merchants.", checked: true },
  { id: "approve-kyc", name: "Approve KYC", description: "Review identity documents and verify high-risk business profiles.", checked: true },
  { id: "refund-transactions", name: "Refund Transactions", description: "Authorize the reversal of funds for disputed settlement batches.", checked: false },
  { id: "view-logs", name: "View Logs", description: "Access detailed activity history and system performance telemetry.", checked: true },
  { id: "manage-roles", name: "Manage Roles", description: "Create or modify permission groups for other administrative users.", checked: false },
  { id: "settlement-monitoring", name: "Settlement Monitoring", description: "Real-time view of bank transfer flows and liquidity markers.", checked: true },
];

const recentActivity = [
  { id: 1, action: "Super Admin updated Approve KYC permission on Compliance Officer", time: "2h ago", icon: ShieldCheckIcon },
  { id: 2, action: "Support Agent role assigned to 4 new regional managers", time: "Oct 24, 14:02", icon: UsersIcon },
];

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<Role>(roles[1]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>(permissions);

  const handlePermissionToggle = (permId: string) => {
    setRolePermissions(prev =>
      prev.map(p => p.id === permId ? { ...p, checked: !p.checked } : p)
    );
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/tritee-logo.png"
                alt="Trite logo"
                width={120}
                height={28}
                priority
              />
            </Link>
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">Financial Architect</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Search roles or permissions..."
                className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Global Overview
            </button>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Audit Trail
            </button>
            <button className="h-10 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-medium text-white hover:bg-black">
              + Create Report
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <Bell className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <HelpCircle className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JW</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-[color:var(--trite-ink)]">James Wilson</p>
                  <p className="text-xs text-[color:var(--trite-muted)]">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-black/5 bg-white">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)]"
                            : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-black/5 px-3 py-4">
              <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2">
                <p className="text-xs font-medium text-emerald-700">● System Status: Operational</p>
              </div>
              <ul className="space-y-1">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-[color:var(--trite-ink)]">Role Management</h1>
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
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{roles.length} System Roles</span>
                </div>

                <div className="space-y-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole.id === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 shadow-sm"
                            : "border-black/5 bg-white hover:bg-black/[0.02]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold ${isSelected ? "text-blue-700" : "text-[color:var(--trite-ink)]"}`}>
                                {role.name}
                              </p>
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
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">{selectedRole.name}</h2>
                        {selectedRole.activeDuty && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            ● ACTIVE DUTY
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
                        Created by {selectedRole.createdBy} on {selectedRole.createdDate} • Last edited {selectedRole.lastEdited}
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
                    {rolePermissions.map((permission) => (
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
                        Changes to this role will trigger a system-wide re-authentication for all 12 users currently assigned to "{selectedRole.name}".
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                        Discard Changes
                      </button>
                      <button className="rounded-xl bg-[color:var(--trite-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black">
                        Save Role Configuration
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
                    {recentActivity.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <Icon className="h-4 w-4 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-[color:var(--trite-ink)]">{activity.action}</p>
                          </div>
                          <span className="text-xs text-[color:var(--trite-muted)]">{activity.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Icons
function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.392 4.396 9.78 9.829 9.78 1.645.001 3.26-.337 4.78-1.003.657-.283 1.113-.78 1.333-1.423A9.713 9.713 0 0022.083 12.75c0-1.454-.146-2.87-.453-4.236A11.994 11.994 0 003.745 4.986 11.959 11.959 0 0012.499 2.25z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// Icons imported from Lucide React
