"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Step = "loading" | "scan" | "backup" | "error";

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnabled: () => void;
}

export function MfaSetupModal({ isOpen, onClose, onEnabled }: MfaSetupModalProps) {
  const [step, setStep] = useState<Step>("loading");
  const [secret, setSecret] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setStep("loading");
    setCode("");
    setError("");

    fetch("/api/auth/mfa/enroll", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start setup");
        setSecret(data.secret);
        setOtpauthUri(data.otpauth_uri);
        setStep("scan");
      })
      .catch((err) => {
        setError(err.message || "Failed to start setup");
        setStep("error");
      });
  }, [isOpen]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/mfa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setBackupCodes(data.backup_codes || []);
      setStep("backup");
    } catch (err: any) {
      setError(err.message || "Invalid code");
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    onEnabled();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={step === "backup" ? undefined : onClose} />

      <div className="relative z-50 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--trite-ink)]">Set Up Two-Factor Authentication</h3>
          {step !== "backup" && (
            <button onClick={onClose} className="rounded-full p-1 hover:bg-black/5 transition-colors">
              <X className="h-5 w-5 text-[color:var(--trite-muted)]" />
            </button>
          )}
        </div>

        {step === "loading" && (
          <p className="mt-4 text-sm text-[color:var(--trite-muted)]">Preparing setup...</p>
        )}

        {step === "error" && (
          <div className="mt-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl border border-black/10 py-2.5 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/5"
            >
              Close
            </button>
          </div>
        )}

        {step === "scan" && (
          <form onSubmit={handleConfirm} className="mt-4 space-y-4">
            <p className="text-sm text-[color:var(--trite-muted)]">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.).
            </p>
            <div className="flex justify-center rounded-xl bg-gray-50 p-4">
              <QRCodeSVG value={otpauthUri} size={180} />
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                Can&apos;t scan? Enter this key manually
              </p>
              <p className="mt-1 break-all font-mono text-xs text-[color:var(--trite-ink)]">{secret}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--trite-ink)]">
                Enter the 6-digit code from your app
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-2.5 text-center text-lg font-semibold tracking-[0.3em] text-[color:var(--trite-ink)] outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10"
              />
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="w-full rounded-xl bg-[#22c55e] py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Verify & Enable"}
            </button>
          </form>
        )}

        {step === "backup" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[color:var(--trite-muted)]">
              Save these backup codes somewhere safe. Each one can be used once to sign in if you lose access to your
              authenticator app. They won&apos;t be shown again.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-4 font-mono text-sm text-[color:var(--trite-ink)]">
              {backupCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
              className="w-full rounded-xl border border-black/10 py-2 text-xs font-semibold text-[color:var(--trite-ink)] hover:bg-black/5"
            >
              Copy codes
            </button>
            <button
              onClick={handleDone}
              className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white hover:bg-black/90"
            >
              I&apos;ve saved these — Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
