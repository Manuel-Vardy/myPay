"use client";

import { Toaster } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Users,
  Receipt,
  Banknote,
  HandCoins,
  ShieldCheck,
  FileText,
  Key,
  TrendingUp,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { id: "merchants", label: "Merchants", href: "/admin/merchants", icon: Users, permission: "manage-merchants" },
  { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: Receipt, permission: "view-logs" },
  { id: "settlements", label: "Settlements", href: "/admin/settlements", icon: Banknote, permission: "settlement-monitoring" },
  { id: "withdrawals", label: "Withdrawals", href: "/admin/withdrawals", icon: HandCoins, permission: "settlement-monitoring" },
  { id: "revenue", label: "Revenue", href: "/admin/revenue", icon: TrendingUp, permission: "settlement-monitoring" },
  { id: "kyc", label: "KYC Center", href: "/admin/kyc", icon: ShieldCheck, permission: "approve-kyc" },
  { id: "logs", label: "Logs", href: "/admin/logs", icon: FileText, permission: "view-logs" },
  { id: "roles", label: "Roles", href: "/admin/roles", icon: Key, permission: "manage-roles" },
  { id: "support", label: "Support", href: "/admin/support", icon: HelpCircle, permission: "view-logs" },
];

/** Compact "10m ago" style stamp for the notification feed. */
function formatRelativeTime(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const bottomItems = [
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
  { id: "logout", label: "Logout", href: "/admin/login", icon: LogOut },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; message: string; time: string; read: boolean }[]
  >([]);
  const [adminAuth, setAdminAuth] = useState<{
    isSuperAdmin?: boolean;
    permissions?: string[];
    roles?: Array<{ id: string; name: string }>;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (active) setAdminAuth(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Poll the admin notification feed so alerts (delivery failures, etc.) show
  // up without a page reload. Cheap query, and the bell is always mounted.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setNotifications(
          (data.notifications ?? []).map((n: {
            id: string | number;
            title: string;
            message: string;
            created_at: string;
            read_at: string | null;
          }) => ({
            id: String(n.id),
            title: n.title,
            message: n.message,
            time: formatRelativeTime(n.created_at),
            read: Boolean(n.read_at),
          }))
        );
      } catch {
        // Feed is best-effort — never break the portal chrome over it.
      }
    };

    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  /** Derive active tab from the current pathname */
  const activeTab = (() => {
    if (pathname === "/admin") return "dashboard";
    const segment = pathname.split("/")[2]; // e.g. "users", "kyc"
    return segment || "dashboard";
  })();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] admin-portal">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/logos/trite-logo-black.png"
                alt="Trite logo"
                width={75}
                height={18}
                className="h-5 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Search system..."
                className="h-9 w-40 rounded-xl border border-black/10 bg-white pl-9 pr-3 text-xs text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            {/* Notifications bell */}
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02] transition-colors focus:outline-none"
              aria-label="System Notifications"
            >
              <Bell className="h-4 w-4 text-[color:var(--trite-ink)] hover:scale-110 transition-transform" />
              {notifications.some(n => !n.read) && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse ring-1 ring-white" />
              )}
            </button>
            <div className="flex items-center gap-2 border-l border-black/10 pl-2 sm:gap-3 sm:pl-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[color:var(--trite-lime)] flex items-center justify-center text-[10px] font-bold text-white">
                  {(adminAuth?.roles?.[0]?.name || "Super Admin").slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden text-xs font-semibold text-slate-700 sm:inline-block">
                  {adminAuth?.roles?.[0]?.name || (adminAuth?.isSuperAdmin ? "Super Admin" : "Admin")}
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03] lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-[70] h-screen w-64 border-r border-black/5 bg-white transition-transform duration-300 lg:top-16 lg:h-[calc(100vh-64px)] lg:w-56 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Branding - Visible on Mobile Only */}
            <div className="flex items-center justify-between border-b border-black/5 p-5 lg:hidden">
              <div className="flex items-center gap-3">
                <Image
                  src="/logos/trite-logo-black.png"
                  alt="Trite logo"
                  width={80}
                  height={20}
                  className="h-5 w-auto object-contain"
                />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)] transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pt-10 pb-4">
              <ul className="space-y-2">
                {sidebarItems
                  .filter((item) => {
                    if (!item.permission || adminAuth?.isSuperAdmin) return true;
                    return adminAuth?.permissions?.includes(item.permission);
                  })
                  .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[color:var(--trite-lime)] text-white"
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
              <div className="mb-4 rounded-lg bg-[color:var(--trite-lime)] px-3 py-2">
                <p className="text-xs font-semibold text-white">
                  SYSTEM STATUS: ACTIVE
                </p>
              </div>
              <ul className="space-y-1">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      {item.id === "logout" ? (
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 lg:ml-56 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/20" 
            onClick={() => setNotificationsOpen(false)}
          />
          
          {/* Full space mobile panel & full-height desktop drawer */}
          <div className="fixed top-0 bottom-0 right-0 z-[110] flex flex-col bg-white p-6 w-full h-full md:top-16 md:bottom-0 md:h-[calc(100vh-64px)] md:w-96 md:border-l md:border-black/5 md:shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-lg text-[color:var(--trite-ink)] whitespace-nowrap">Notifications</h3>
                {notifications.some(n => !n.read) && (
                  <span className="inline-flex items-center h-5 rounded-full bg-red-100 px-2 text-[10px] font-bold text-red-700 whitespace-nowrap">
                    {notifications.filter(n => !n.read).length} alerts
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {notifications.some(n => !n.read) && (
                  <button 
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                      fetch("/api/admin/notifications", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ all: true }),
                      }).catch(() => {});
                    }}
                    className="text-xs font-semibold text-[color:var(--trite-lime)] hover:text-[color:var(--trite-lime-strong)] transition-colors whitespace-nowrap"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--trite-muted)] hover:bg-black/5 hover:text-[color:var(--trite-ink)] transition-all shrink-0"
                  aria-label="Close panel"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto space-y-0 pr-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 mb-3 text-[color:var(--trite-muted)]">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[color:var(--trite-ink)]">All caught up!</h4>
                  <p className="text-xs text-[color:var(--trite-muted)] mt-1">No new alerts at this time.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                      if (!n.read) {
                        fetch("/api/admin/notifications", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ids: [n.id] }),
                        }).catch(() => {});
                      }
                    }}
                    className={`group relative py-4 px-1 border-b border-black/[0.08] last:border-b-0 text-left transition-all cursor-pointer flex gap-3 ${
                      n.read 
                        ? "bg-transparent" 
                        : "bg-red-50/15"
                    }`}
                  >
                    {/* Status Icon Indicator */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      {n.read ? (
                        <svg className="h-5 w-5 text-green-600 bg-green-50 rounded-full p-1 border border-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className={`text-xs font-bold truncate ${n.read ? "text-[color:var(--trite-ink)]" : "text-red-950"}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-[color:var(--trite-muted)] shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[color:var(--trite-muted)] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
      <Toaster position="top-right" richColors />
    </div>
  );
}
