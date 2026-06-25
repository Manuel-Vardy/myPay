"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
} from "lucide-react";

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

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "KYC Pending Review",
      message: "Merchant 'Gala Venture' uploaded new identity document.",
      time: "10m ago",
      read: false,
    },
    {
      id: "2",
      title: "Liquidity Alert",
      message: "USD outbound gateway node exceeds warning threshold (80%).",
      time: "1h ago",
      read: false,
    },
    {
      id: "3",
      title: "System Update",
      message: "Gateway adapter for Ghanaian Mobile Money successfully upgraded.",
      time: "2d ago",
      read: true,
    },
  ]);

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
                src="/tritee-logo.png"
                alt="Trite logo"
                width={75}
                height={18}
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
              <div className="h-8 w-8 rounded-full bg-[color:var(--trite-lime)] flex items-center justify-center text-[10px] font-bold text-white">
                AD
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
                  src="/tritee-logo.png"
                  alt="Trite logo"
                  width={80}
                  height={20}
                />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)] transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pt-10 pb-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
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
    </div>
  );
}
