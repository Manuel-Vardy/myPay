"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MfaDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisabled: () => void;
}

export function MfaDisableModal({ isOpen, onClose, onDisabled }: MfaDisableModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable 2FA");
      setPassword("");
      onDisabled();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to disable 2FA");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Disable Two-Factor Authentication</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-black/5 transition-colors">
            <X className="h-5 w-5 text-[color:var(--trite-muted)]" />
          </button>
        </div>

        <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
          This lowers your account&apos;s security. Enter your password to confirm.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            autoFocus
            className="w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm text-[color:var(--trite-ink)] outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10"
          />

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {submitting ? "Disabling..." : "Disable 2FA"}
          </button>
        </form>
      </div>
    </div>
  );
}
