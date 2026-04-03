"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/merchant", icon: LayoutGridIcon },
  { id: "analytics", label: "Analytics", href: "/merchant/analytics", icon: BarChartIcon },
  { id: "transactions", label: "Transactions", href: "/merchant/transactions", icon: ReceiptIcon },
  { id: "customers", label: "Customers", href: "/merchant/customers", icon: UsersIcon },
  { id: "settings", label: "Settings", href: "/merchant/settings", icon: SettingsIcon },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settings");
  const [notifications, setNotifications] = useState({
    transactions: true,
    systemUpdates: true,
    marketing: false,
  });

  // Profile form state
  const [fullName, setFullName] = useState("Kwame Asante");
  const [email, setEmail] = useState("kwame.asante@trite.com.gh");
  const [region, setRegion] = useState("Greater Accra (Ghana)");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    // Simulate profile update
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f6f7fb]">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-black/5 bg-white">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-black/5 px-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/tritee-logo.png"
                alt="Trite logo"
                width={120}
                height={28}
                priority
              />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        router.push(item.href);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)]"
                          : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-black/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--trite-ink)]">
                <span className="text-sm font-semibold text-white">KA</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                  Kwame Asante
                </div>
                <div className="text-xs text-[color:var(--trite-muted)]">Admin Access</div>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-3 text-xs font-medium text-red-500 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center justify-end px-6">
            <div className="flex items-center gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                <BellIcon className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03]">
                <HelpCircleIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--trite-ink)]">
                <span>Merchant Dashboard</span>
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--trite-ink)]">
              Account Settings
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Manage your institutional presence, notification protocols, and security layers from one centralized command center.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                {updateSuccess && (
                  <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    Profile updated successfully!
                  </div>
                )}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg cursor-pointer hover:bg-blue-700">
                      <CameraIcon className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                        Merchant ID
                      </label>
                      <div className="mt-1 flex items-center gap-2 rounded-lg border border-black/10 bg-gray-50 px-3 py-2">
                        <span className="text-sm text-[color:var(--trite-ink)]">MID-8832-7710-GH</span>
                        <button className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]">
                          <CopyIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                        Region
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Update Profile
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Email Notifications</h3>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <div className="font-medium text-[color:var(--trite-ink)]">Transactions</div>
                      <div className="text-xs text-[color:var(--trite-muted)]">Instant alerts for all processing activities.</div>
                    </div>
                    <Toggle
                      checked={notifications.transactions}
                      onChange={() => setNotifications((n) => ({ ...n, transactions: !n.transactions }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <div className="font-medium text-[color:var(--trite-ink)]">System Updates</div>
                      <div className="text-xs text-[color:var(--trite-muted)]">Maintenance schedules and security patches.</div>
                    </div>
                    <Toggle
                      checked={notifications.systemUpdates}
                      onChange={() => setNotifications((n) => ({ ...n, systemUpdates: !n.systemUpdates }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <div className="font-medium text-[color:var(--trite-ink)]">Marketing & Insights</div>
                      <div className="text-xs text-[color:var(--trite-muted)]">Quarterly reports and platform tips.</div>
                    </div>
                    <Toggle
                      checked={notifications.marketing}
                      onChange={() => setNotifications((n) => ({ ...n, marketing: !n.marketing }))}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Authentication</h3>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="font-medium text-[color:var(--trite-ink)]">Password</div>
                    <button className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-gray-50">
                      Change Password
                    </button>
                  </div>
                  <div className="border-t border-black/5" />
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[color:var(--trite-ink)]">Two-factor Auth</span>
                      <InfoIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Toggle checked={false} onChange={() => {}} />
                      <span className="text-sm text-[color:var(--trite-muted)]">Disabled</span>
                    </div>
                  </div>
                  <div className="border-t border-black/5" />
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[color:var(--trite-ink)]">Passkeys</span>
                      <InfoIcon className="h-4 w-4 text-[color:var(--trite-muted)]" />
                    </div>
                    <button className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-gray-50">
                      Add a passkey
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Two-Step Verification (2FA)</h3>
                </div>
                <div className="mt-4 rounded-xl bg-blue-50 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                      <LockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[color:var(--trite-ink)]">Two-Factor Auth is Disabled</div>
                      <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                        Add an extra layer of security to your merchant account by requiring a code from your mobile device.
                      </p>
                      <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                        <SmartphoneIcon className="h-4 w-4" />
                        Set up Authenticator
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                      <div className="mt-3 flex items-center gap-2 text-xs text-[color:var(--trite-muted)]">
                        <CheckCircleIcon className="h-3 w-3" />
                        Recommended for high-volume merchant accounts.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-6 text-white">
                <h3 className="text-lg font-semibold">Security Health</h3>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                    <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Identity Verified</div>
                    <div className="text-xs text-white/60">Tier 1 Institutional Access</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Account Strength</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-[color:var(--trite-muted)]">
            <div className="flex gap-4">
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">Documentation</Link>
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">API Privacy</Link>
            </div>
            <div>
              Last updated: Oct 24, 2023 • IP: 102.176.65.1
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
