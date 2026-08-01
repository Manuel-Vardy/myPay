"use client";

import { useState, useEffect } from "react";
import { User, Shield, Bell, Save, Plug, Percent, Clock } from "lucide-react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import IntegrationsTab from "./_components/IntegrationsTab";
import FeeSchedulesTab, { type FeeSchedulesData } from "./_components/FeeSchedulesTab";
import SettlementScheduleTab from "./_components/SettlementScheduleTab";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { MfaSetupModal } from "@/components/mfa-setup-modal";
import { MfaDisableModal } from "@/components/mfa-disable-modal";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [mfaDisableOpen, setMfaDisableOpen] = useState(false);
  
  // Use any to quickly access user and admin profiles returned from our updated /api/auth/me
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: me, mutate: refreshMe } = useAdminFetch<any>("/api/auth/me");
  const { data: webhooks, mutate: refreshWebhooks } = useAdminFetch<
    { provider: string; id: string; url: string; eventTypes: string[] }[]
  >("/api/admin/webhooks");
  const {
    data: feeSchedules,
    loading: feeSchedulesLoading,
    error: feeSchedulesError,
    mutate: refreshFeeSchedules,
  } = useAdminFetch<FeeSchedulesData>("/api/admin/fee-schedules");

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security & MFA", icon: Shield },
    { id: "notifications", label: "Notification Preferences", icon: Bell },
    { id: "integrations", label: "Integrations & Webhooks", icon: Plug },
    { id: "fees", label: "Fee Schedules", icon: Percent },
    { id: "settlements", label: "Settlement Schedule", icon: Clock },
  ];

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [notificationsForm, setNotificationsForm] = useState({
    systemAlerts: true,
    newRegistrations: true,
    complianceFlags: true,
    largeTransactions: true,
  });

  useEffect(() => {
    if (me?.user) {
      setProfileForm({
        firstName: me.user.first_name || "",
        lastName: me.user.last_name || "",
      });
      if (me.admin?.notification_settings) {
        setNotificationsForm({
          systemAlerts: me.admin.notification_settings.systemAlerts ?? true,
          newRegistrations: me.admin.notification_settings.newRegistrations ?? true,
          complianceFlags: me.admin.notification_settings.complianceFlags ?? true,
          largeTransactions: me.admin.notification_settings.largeTransactions ?? true,
        });
      }
    }
  }, [me]);

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: profileForm.firstName, last_name: profileForm.lastName })
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        refreshMe();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update profile");
      }
    } catch (e) {
      toast.error("Failed to update profile");
    }
  };

  const savePassword = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (!securityForm.currentPassword || !securityForm.newPassword) {
      toast.error("Both current and new passwords are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/settings/security/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: securityForm.currentPassword, newPassword: securityForm.newPassword })
      });
      if (res.ok) {
        toast.success("Password updated successfully");
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update password");
      }
    } catch (e) {
      toast.error("Failed to update password");
    }
  };

  const handle2FAClick = () => {
    if (me?.user?.two_factor_enabled) {
      setMfaDisableOpen(true);
    } else {
      setMfaSetupOpen(true);
    }
  };

  const saveNotifications = async () => {
    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationsForm)
      });
      if (res.ok) {
        toast.success("Notification preferences updated");
        refreshMe();
      } else {
        toast.error("Failed to update notification preferences");
      }
    } catch (e) {
      toast.error("Failed to update notification preferences");
    }
  };

  const handleSaveClick = () => {
    if (activeTab === "security") {
      setIsConfirmModalOpen(true);
      return;
    }

    setSaving(true);
    if (activeTab === "profile") {
      saveProfile().finally(() => setSaving(false));
    } else if (activeTab === "notifications") {
      saveNotifications().finally(() => setSaving(false));
    }
  };

  const handleConfirmPasswordChange = () => {
    setSaving(true);
    savePassword().finally(() => setSaving(false));
  };


  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmPasswordChange}
        title="Confirm Password Change"
        description="Are you sure you want to change your password? You will be signed out from all other active sessions."
        confirmText="Change Password"
        isDestructive={true}
      />

      <MfaSetupModal
        isOpen={mfaSetupOpen}
        onClose={() => setMfaSetupOpen(false)}
        onEnabled={() => {
          toast.success("2FA enabled successfully");
          refreshMe();
        }}
      />

      <MfaDisableModal
        isOpen={mfaDisableOpen}
        onClose={() => setMfaDisableOpen(false)}
        onDisabled={() => {
          toast.success("2FA disabled");
          refreshMe();
        }}
      />

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
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--trite-lime)] text-2xl font-bold text-white uppercase">
                      {me?.user?.first_name?.[0] || 'A'}{me?.user?.last_name?.[0] || 'D'}
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
                        value={profileForm.firstName}
                        onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Email Address</label>
                      <input
                        type="email"
                        value={me?.user?.email || ""}
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
                          value={securityForm.currentPassword}
                          onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">New Password</label>
                          <input
                            type="password"
                            value={securityForm.newPassword}
                            onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[color:var(--trite-ink)]">Confirm New Password</label>
                          <input
                            type="password"
                            value={securityForm.confirmPassword}
                            onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
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
                      <button
                        onClick={handle2FAClick}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${me?.user?.two_factor_enabled ? "bg-red-500 hover:bg-red-600" : "bg-[color:var(--trite-lime)] hover:bg-[color:var(--trite-lime-strong)]"}`}
                      >
                        {me?.user?.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    {[
                      { key: "systemAlerts", title: "System Alerts", desc: "Receive alerts about system downtime or critical issues." },
                      { key: "newRegistrations", title: "New User Registrations", desc: "Get notified when new merchants register on the platform." },
                      { key: "complianceFlags", title: "Compliance Flags", desc: "Alerts for KYC verifications that require manual review." },
                      { key: "largeTransactions", title: "Large Transactions", desc: "Notifications for transactions over $100,000." },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between rounded-xl border border-black/5 p-4">
                        <div>
                          <p className="font-semibold text-[color:var(--trite-ink)] text-sm">{item.title}</p>
                          <p className="text-sm text-[color:var(--trite-muted)]">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={notificationsForm[item.key as keyof typeof notificationsForm]}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, [item.key]: e.target.checked })}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[color:var(--trite-lime-strong)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "integrations" && (
                <IntegrationsTab webhooks={webhooks ?? null} refreshWebhooks={refreshWebhooks} />
              )}

              {activeTab === "fees" && (
                <FeeSchedulesTab
                  data={feeSchedules ?? null}
                  loading={feeSchedulesLoading}
                  loadError={feeSchedulesError}
                  refresh={refreshFeeSchedules}
                />
              )}

              {activeTab === "settlements" && <SettlementScheduleTab />}
            </div>

            {activeTab !== "integrations" && activeTab !== "fees" && activeTab !== "settlements" && (
              <div className="border-t border-black/5 bg-black/[0.01] px-6 py-4 flex justify-end">
                <button
                  onClick={handleSaveClick}
                  disabled={saving || (activeTab === "security" && !securityForm.currentPassword)}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
