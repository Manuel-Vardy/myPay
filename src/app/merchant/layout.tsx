"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function LayoutGridIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ReceiptIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BankIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l9 7H3l9-7z" />
    </svg>
  );
}

function BellIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpCircleIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronDownIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function LinkIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/merchant", icon: LayoutGridIcon },
  { id: "analytics", label: "Analytics", href: "/merchant/analytics", icon: BarChartIcon },
  { id: "transactions", label: "Transactions", href: "/merchant/transactions", icon: ReceiptIcon },
  { id: "payment-links", label: "Payment Links", href: "/merchant/payment-links", icon: LinkIcon },
  { id: "settlements", label: "Settlements", href: "/merchant/settlements", icon: BankIcon },
  { id: "customers", label: "Customers", href: "/merchant/customers", icon: UsersIcon },
  { id: "settings", label: "Settings", href: "/merchant/settings", icon: SettingsIcon },
];

function LogOutIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; merchant?: { business_name: string; } } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Payment Received",
      message: "Received 150.00 USDT from customer via WalletConnect.",
      time: "5m ago",
      read: false,
    },
    {
      id: "2",
      title: "Settlement Processed",
      message: "Settlement #SET-901 has been sent to your bank account.",
      time: "2h ago",
      read: false,
    },
    {
      id: "3",
      title: "KYC Tier Upgraded",
      message: "Congratulations! Your account has been upgraded to Premium tier.",
      time: "1d ago",
      read: true,
    },
  ]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setProfile(d.user ? { ...d.user, merchant: d.merchant } : null))
      .catch(() => {});
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const businessName = profile?.merchant?.business_name || "Merchant Access";
  const fullName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : businessName;
  const initials = profile?.first_name 
    ? profile.first_name[0] + (profile.last_name?.[0] || "") 
    : (fullName.slice(0, 2).toUpperCase());

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
      router.push("/");
    }
  };

  // Derive active tab from pathname
  const activeTab = sidebarItems.find(item => {
    if (item.href === "/merchant") return pathname === "/merchant";
    return pathname?.startsWith(item.href);
  })?.id || "dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f6f7fb] merchant-portal">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 h-screen w-56 border-r border-black/5 bg-white transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-black/5 px-5">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/tritee-logo.png" alt="Trite logo" width={85} height={20} priority />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pt-10 pb-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[color:var(--trite-lime)] text-white"
                          : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      }`}
                    >
                      <Icon className="h-5 w-5 hover:scale-110 transition-transform" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-black/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--trite-ink)] shadow-sm">
                <span className="text-sm font-semibold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[color:var(--trite-ink)] truncate" title={fullName}>
                  {fullName}
                </div>
                {fullName !== businessName && (
                  <div className="text-[10px] font-medium text-[color:var(--trite-muted)] uppercase tracking-tight truncate">
                    {businessName}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="transition-all duration-300 lg:ml-56">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="lg:hidden">
                <Image
                  src="/tritee-logo.png"
                  alt="Trite logo"
                  width={90}
                  height={22}
                  priority
                />
              </Link>
              <h1 className="hidden lg:block text-lg sm:text-xl font-semibold text-[color:var(--trite-ink)]">
                {sidebarItems.find(i => i.id === activeTab)?.label || "Merchant"}
              </h1>
            </div>
             <div className="flex items-center gap-3">
              {/* Notifications bell */}
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03] transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5 hover:scale-110 transition-transform" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              <button 
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03] lg:hidden"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>

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
                  <span className="inline-flex items-center h-5 rounded-full bg-green-100 px-2 text-[10px] font-bold text-green-700 whitespace-nowrap">
                    {notifications.filter(n => !n.read).length} new
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
                    <BellIcon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[color:var(--trite-ink)]">All caught up!</h4>
                  <p className="text-xs text-[color:var(--trite-muted)] mt-1">No new notifications at this time.</p>
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
                        : "bg-green-50/15"
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
                        <h4 className={`text-xs font-bold truncate ${n.read ? "text-[color:var(--trite-ink)]" : "text-green-950"}`}>
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
