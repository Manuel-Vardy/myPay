"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMerchantFetch } from "@/lib/hooks/useMerchantFetch";


type SettingsData = {
  user: { 
    id: string;
    two_factor_enabled: boolean;
    passkeys: any[];
    first_name: string; 
    last_name: string; 
    full_name: string; 
    email: string; 
    mobile_number?: string; 
    city?: string; 
    country?: string 
  };
  merchant_display_id: string;
  business_name: string;
  notification_email: string | null;
  notification_settings: {
    transactions: boolean;
    systemUpdates: boolean;
    marketing: boolean;
  };
  region: string | null;
  api_keys: { key_id: string; label: string; prefix: string; is_active: boolean; last_used: string | null }[];
  active_key_count: number;
  webhook_config: { url: string | null; events: string[] };
};

type SubTab = "general" | "notifications" | "security" | "integrations";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settings");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("general");
  const [notifications, setNotifications] = useState({
    transactions: true,
    systemUpdates: true,
    marketing: false,
  });
  const [user, setUser] = useState<Partial<SettingsData["user"]>>({});
  const [business_name, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("Greater Accra (Ghana)");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [generatedKey, setGeneratedKey] = useState<{ id: string; key: string } | null>(null);
  const [apiKeys, setApiKeys] = useState<{ key_id: string; label: string; prefix: string; is_active: boolean; last_used: string | null }[]>([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [passwordModal, setPasswordModal] = useState(false);
  const [passkeyModal, setPasskeyModal] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passkeyName, setPasskeyName] = useState("");

  const { data: settings } = useMerchantFetch<SettingsData>("/api/merchant/settings");

  useEffect(() => {
    if (settings) {
      setUser(settings.user);
      setBusinessName(settings.business_name);
      setEmail(settings.notification_email ?? "");
      setRegion(settings.region ?? "Greater Accra (Ghana)");
      setWebhookUrl(settings.webhook_config?.url ?? "");
      setWebhookEvents(settings.webhook_config?.events ?? []);
      if (settings.api_keys) setApiKeys(settings.api_keys);
      if (settings.notification_settings) {
        setNotifications(settings.notification_settings);
      }
    }
  }, [settings]);

  async function handleUpdateProfile() {
    setSaving(true);
    const res = await fetch("/api/merchant/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        notification_email: email,
        business_name: business_name,
        region: region,
        user_data: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          mobile_number: user.mobile_number,
          city: user.city,
          country: user.country
        }
      }),
    });
    const json = await res.json();
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    if (res.ok) setUpdateSuccess(true);
    setTimeout(() => {
      setSaveMsg("");
      setUpdateSuccess(false);
    }, 3000);
  }

  async function handleUpdateNotifications() {
    setSaving(true);
    const res = await fetch("/api/merchant/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        notification_settings: notifications
      }),
    });
    const json = await res.json();
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleUpdate2FA(enabled: boolean) {
    setSaving(true);
    const res = await fetch("/api/merchant/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_data: { two_factor_enabled: enabled }
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setUser(u => ({ ...u, two_factor_enabled: enabled }));
    }
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleUpdatePassword() {
    if (passwords.new !== passwords.confirm) {
      setSaveMsg("Passwords do not match");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/merchant/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        password_change: {
          current_password: passwords.current,
          new_password: passwords.new
        }
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setPasswordModal(false);
      setPasswords({ current: "", new: "", confirm: "" });
    }
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleSaveWebhooks() {
    setSaving(true);
    const res = await fetch("/api/merchant/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        webhook_url: webhookUrl,
        webhook_events: webhookEvents
      }),
    });
    const json = await res.json();
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleGenerateKey() {
    setSaving(true);
    const res = await fetch("/api/merchant/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        generate_api_key: { label: newKeyLabel }
      }),
    });
    const json = await res.json();
    if (res.ok && json.new_api_key) {
      setGeneratedKey({ id: json.new_api_key.key_id, key: json.new_api_key.full_key });
      setApiKeys(prev => [{
        key_id: json.new_api_key.key_id,
        label: newKeyLabel,
        prefix: json.new_api_key.full_key.substring(0, 12),
        is_active: true,
        last_used: null
      }, ...prev]);
      setNewKeyLabel("");
    }
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key? This action is irreversible.")) return;
    
    setSaving(true);
    const res = await fetch(`/api/merchant/settings/keys/${keyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ }),
    });
    const json = await res.json();
    if (res.ok) {
      setApiKeys(prev => prev.map(k => k.key_id === keyId ? { ...k, is_active: false } : k));
    }
    setSaveMsg(json.message ?? json.error ?? "");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

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

  return (
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-[color:var(--trite-ink)] sm:text-2xl">
              Account Settings
            </h1>
            <p className="mt-2 text-xs text-[color:var(--trite-muted)] sm:text-sm">
              Manage your institutional presence, notification protocols, and security layers.
            </p>
          </div>

          <div className="mb-8 flex border-b border-black/5">
            {[
              { id: "general", label: "General" },
              { id: "notifications", label: "Notifications" },
              { id: "security", label: "Security" },
              { id: "integrations", label: "Integrations" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`relative px-4 py-3 text-xs font-medium transition-colors sm:px-6 sm:text-sm ${
                  activeSubTab === tab.id
                    ? "text-[color:var(--trite-ink)]"
                    : "text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                }`}
              >
                {tab.label}
                {activeSubTab === tab.id && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[color:var(--trite-lime-strong)]" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {activeSubTab === "general" && (
                <>
                  <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                    {updateSuccess && (
                      <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        Profile updated successfully!
                      </div>
                    )}
                    <h3 className="mb-6 text-lg font-semibold text-[color:var(--trite-ink)]">Personal Information</h3>
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            user.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
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
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={user.first_name ?? ""}
                              onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={user.last_name ?? ""}
                              onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={user.email ?? ""}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                            Mobile Number
                          </label>
                          <input
                            type="text"
                            value={user.mobile_number ?? ""}
                            onChange={(e) => setUser({ ...user, mobile_number: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                              City
                            </label>
                            <input
                              type="text"
                              value={user.city ?? ""}
                              onChange={(e) => setUser({ ...user, city: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                              Country
                            </label>
                            <input
                              type="text"
                              value={user.country ?? ""}
                              onChange={(e) => setUser({ ...user, country: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                    <h3 className="mb-6 text-lg font-semibold text-[color:var(--trite-ink)]">Business Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={business_name}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                          Notification Email
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
                        <div className="mt-1 flex items-center justify-between rounded-lg border border-black/10 bg-gray-50 px-3 py-2">
                          <span className="text-sm font-mono text-[color:var(--trite-ink)]">{settings?.merchant_display_id ?? "—"}</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(settings?.merchant_display_id ?? "")}
                            className="text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                          >
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

                  <div className="flex items-center justify-end gap-3 pb-4">
                    {saveMsg && <span className="text-xs text-green-600">{saveMsg}</span>}
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Update Profile"}
                    </button>
                  </div>
                </>
              )}

              {activeSubTab === "notifications" && (
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
                  <div className="mt-6 flex justify-end">
                    <button onClick={handleUpdateNotifications} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save Preferences</button>
                  </div>
                </div>
              )}

              {activeSubTab === "security" && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                    <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Authentication</h3>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="font-medium text-[color:var(--trite-ink)]">Password</div>
                        <button 
                          onClick={() => setPasswordModal(true)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-gray-50"
                        >
                          Change Password
                        </button>
                      </div>
                      <div className="border-t border-black/5" />
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[color:var(--trite-ink)]">2-Step Verification</span>
                          <div className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 uppercase">Email Confirmations</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Toggle 
                            checked={user.two_factor_enabled ?? false} 
                            onChange={() => handleUpdate2FA(!user.two_factor_enabled)} 
                          />
                          <span className="text-sm text-[color:var(--trite-muted)]">
                            {user.two_factor_enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-black/5" />
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[color:var(--trite-ink)]">Passkeys</span>
                        </div>
                        <button 
                          onClick={() => setPasskeyModal(true)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-gray-50"
                        >
                          Add Passkey
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                    <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Active Sessions</h3>
                    <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Manage your active instances across high-velocity nodes.</p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                            <SmartphoneIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[color:var(--trite-ink)]">iPhone 14 Pro</div>
                            <div className="text-[10px] text-[color:var(--trite-muted)]">Accra, Ghana • Active Now</div>
                          </div>
                        </div>
                        <button className="text-xs font-semibold text-red-600 hover:text-red-700">Revoke</button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                            <MonitorIcon className="h-5 w-5 text-[color:var(--trite-muted)]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[color:var(--trite-ink)]">MacBook Pro M2</div>
                            <div className="text-[10px] text-[color:var(--trite-muted)]">Accra, Ghana • 2 hours ago</div>
                          </div>
                        </div>
                        <button className="text-xs font-semibold text-red-600 hover:text-red-700">Revoke</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === "integrations" && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 mb-6">
                      <GlobeIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Webhook Configuration</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                          Endpoint URL
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://your-api.com/webhooks"
                            className="flex-1 rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={handleSaveWebhooks}
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            Save
                          </button>
                        </div>
                        <p className="mt-1 text-[10px] text-[color:var(--trite-muted)]">
                          All event payloads will be sent to this URL as POST requests.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                          Event Subscriptions
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {["payment.success", "payment.failed", "payout.success", "payout.failed", "customer.created", "customer.verified"].map((event) => (
                            <label key={event} className="flex items-center gap-2 rounded-lg border border-black/5 bg-gray-50 p-2 cursor-pointer hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={webhookEvents.includes(event)}
                                onChange={(e) => {
                                  if (e.target.checked) setWebhookEvents([...webhookEvents, event]);
                                  else setWebhookEvents(webhookEvents.filter(ev => ev !== event));
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-[color:var(--trite-ink)]">{event}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <KeyIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">API Management</h3>
                      </div>
                    </div>

                    {generatedKey && (
                      <div className="mb-6 rounded-xl bg-amber-50 p-4 border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-amber-900">New API Key Generated!</span>
                          <button onClick={() => setGeneratedKey(null)} className="text-amber-700 hover:text-amber-900">
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-amber-800 mb-3">
                          Copy this key now. For security purposes, it will NOT be shown again.
                        </p>
                        <div className="flex items-center gap-2 rounded-lg bg-white border border-amber-200 p-2">
                          <code className="text-xs font-mono text-amber-700 break-all flex-1">{generatedKey.key}</code>
                          <button 
                            onClick={() => navigator.clipboard.writeText(generatedKey.key)}
                            className="text-amber-700 hover:text-amber-900"
                          >
                            <CopyIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="rounded-xl border border-black/5 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-black/5">
                            <tr className="text-[10px] uppercase tracking-wider text-[color:var(--trite-muted)] font-bold">
                              <th className="px-4 py-3">Label</th>
                              <th className="px-4 py-3">Key Prefix</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Last Used</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs divide-y divide-black/5 text-[color:var(--trite-ink)]">
                            {apiKeys.map((key) => (
                              <tr key={key.key_id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 font-medium">{key.label}</td>
                                <td className="px-4 py-3 font-mono text-gray-500">{key.prefix}...</td>
                                <td className="px-4 py-3">
                                  {key.is_active ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                      <div className="h-1 w-1 rounded-full bg-green-600" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                      Revoked
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-400">
                                  {key.last_used ? new Date(key.last_used).toLocaleDateString() : "Never"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {key.is_active && (
                                    <button 
                                      onClick={() => handleRevokeKey(key.key_id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                          Create New API Key
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={newKeyLabel}
                            onChange={(e) => setNewKeyLabel(e.target.value)}
                            placeholder="e.g. Production Mobile App"
                            className="flex-1 rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm text-[color:var(--trite-ink)] outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={handleGenerateKey}
                            disabled={saving || !newKeyLabel}
                            className="flex items-center gap-2 rounded-lg bg-[color:var(--trite-ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Active API Keys</span>
                    <span className="font-semibold text-sm">{settings?.active_key_count ?? 0}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {apiKeys.filter((k) => k.is_active).slice(0, 3).map((k) => (
                      <div key={k.key_id} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs">
                        <span className="text-white/80">{k.label}</span>
                        <span className="font-mono text-white/60">{k.prefix}…</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[color:var(--trite-muted)]">
            <div className="flex gap-4">
              <Link href="#" className="hover:text-[color:var(--trite-ink)]">Documentation</Link>
              <Link href="/privacy" className="hover:text-[color:var(--trite-ink)]">API Privacy</Link>
            </div>
            <div>
              Last updated: Oct 24, 2023 • IP: 102.176.65.1
            </div>
          </div>

          {/* Password Modal */}
          {passwordModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                <h3 className="text-xl font-bold text-[color:var(--trite-ink)]">Change Password</h3>
                <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Update your institutional access credentials.</p>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new}
                      onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => {
                      setPasswordModal(false);
                      setPasswords({ current: "", new: "", confirm: "" });
                    }}
                    className="flex-1 rounded-lg border border-black/10 bg-white py-2.5 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Passkey Modal */}
          {passkeyModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <KeyIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--trite-ink)]">Add Passkey</h3>
                <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Passkeys enable biometrics or security keys for faster, unhackable logins.</p>
                
                <div className="mt-6">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Device Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Work MacBook, YubiKey"
                    value={passkeyName}
                    onChange={e => setPasskeyName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-gray-50 px-3 py-2 outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => {
                      setPasskeyModal(false);
                      setPasskeyName("");
                    }}
                    className="flex-1 rounded-lg border border-black/10 bg-white py-2.5 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setSaveMsg("Passkey flow coming soon");
                      setPasskeyModal(false);
                      setPasskeyName("");
                      setTimeout(() => setSaveMsg(""), 3000);
                    }}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
       <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
