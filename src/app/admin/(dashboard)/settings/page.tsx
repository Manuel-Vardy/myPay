"use client";

import { useState } from "react";
import { User, Shield, Bell, Key, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security & MFA", icon: Shield },
    { id: "notifications", label: "Notification Preferences", icon: Bell },
    { id: "api", label: "API Keys", icon: Key },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
          Manage your personal account settings, security preferences, and administrative notifications.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-[color:var(--trite-ink)] shadow-sm ring-1 ring-black/5"
                      : "text-[color:var(--trite-muted)] hover:bg-black/[0.02] hover:text-[color:var(--trite-ink)]"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-[color:var(--trite-lime-strong)]" : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content area */}
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-black/5 px-6 py-5">
              <h2 className="text-lg font-semibold text-[color:var(--trite-ink)] capitalize">
                {activeTab.replace("-", " ")}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
                Update your {activeTab.replace("-", " ")} configuration and preferences.
              </p>
            </div>

            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--trite-lime)] text-2xl font-bold text-[color:var(--trite-ink)]">
                      AD
                    </div>
                    <div>
                      <button className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
                        Change Avatar
                      </button>
                      <p className="mt-2 text-xs text-[color:var(--trite-muted)]">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--trite-ink)]">First Name</label>
                      <input
                        type="text"
                        defaultValue="Admin"
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Last Name</label>
                      <input
                        type="text"
                        defaultValue="User"
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Email Address</label>
                      <input
                        type="email"
                        defaultValue="admin@trite.io"
                        disabled
                        className="mt-2 w-full rounded-xl border border-black/5 bg-black/[0.02] px-4 py-2.5 text-sm text-[color:var(--trite-muted)] outline-none"
                      />
                      <p className="mt-1 text-xs text-[color:var(--trite-muted)]">Email addresses cannot be changed directly.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Change Password</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Current Password</label>
                        <input
                          type="password"
                          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">New Password</label>
                          <input
                            type="password"
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Confirm New Password</label>
                          <input
                            type="password"
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-black/5" />

                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Two-Factor Authentication</h3>
                        <p className="text-sm text-[color:var(--trite-muted)]">Add an extra layer of security to your account.</p>
                      </div>
                      <button className="rounded-xl bg-[color:var(--trite-lime)] px-4 py-2 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime-strong)]">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    {[
                      { title: "System Alerts", desc: "Receive alerts about system downtime or critical issues." },
                      { title: "New User Registrations", desc: "Get notified when new merchants register on the platform." },
                      { title: "Compliance Flags", desc: "Alerts for KYC verifications that require manual review." },
                      { title: "Large Transactions", desc: "Notifications for transactions over $100,000." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start justify-between rounded-xl border border-black/5 p-4">
                        <div>
                          <p className="font-semibold text-[color:var(--trite-ink)] text-sm">{item.title}</p>
                          <p className="text-sm text-[color:var(--trite-muted)]">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" defaultChecked={i % 2 === 0} className="peer sr-only" />
                          <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[color:var(--trite-lime-strong)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "api" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Key className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">API Keys Managed in Roles</h3>
                  <p className="mt-2 max-w-md text-sm text-[color:var(--trite-muted)]">
                    System-level API keys and access tokens are managed directly through the Roles module. 
                    Please navigate to Roles to configure system access tokens.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-black/5 bg-black/[0.01] px-6 py-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--trite-ink)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
