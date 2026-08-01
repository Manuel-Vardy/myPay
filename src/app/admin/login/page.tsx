"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ShieldCheck, Lock, Shield, Check, Loader2, KeyRound } from "lucide-react";

type LoginStep = "credentials" | "mfa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaToken, setMfaToken] = useState(["", "", "", "", "", ""]);
  const [mfaUserId, setMfaUserId] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mfaInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      if (data.mfa_required) {
        setMfaUserId(data.user_id);
        setStep("mfa");
        setLoading(false);
        // Auto-focus first MFA input after render
        setTimeout(() => mfaInputRefs.current[0]?.focus(), 100);
        return;
      }

      // Success — redirect to admin dashboard
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = useBackupCode ? backupCode.trim() : mfaToken.join("");
    if (useBackupCode ? !token : token.length !== 6) {
      setError(useBackupCode ? "Enter a backup code" : "Please enter the full 6-digit code");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: mfaUserId, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code");
        setMfaToken(["", "", "", "", "", ""]);
        setBackupCode("");
        mfaInputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // MFA passed — redirect to admin dashboard
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleMfaInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newToken = [...mfaToken];
    newToken[index] = value.slice(-1); // take only last char
    setMfaToken(newToken);

    // Auto-advance to next input
    if (value && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !mfaToken[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#f6f7fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link className="flex items-center gap-3" href="/">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={90}
              height={22}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-medium text-[color:var(--trite-muted)] sm:flex">
            <Link className="hover:text-[color:var(--trite-ink)]" href="/contact-sales">
              Contact Sales
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center sm:text-left">
          <div className="w-full max-w-md">
            {/* Admin Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--trite-ink)] px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest sm:text-xs">Institutional Access</span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[color:var(--trite-ink)] sm:text-4xl">
              Ghana Financial
              <span className="text-[color:var(--trite-lime-strong)]"> Admin</span>
            </h1>
            <p className="mt-4 text-xs leading-5 text-[color:var(--trite-muted)] sm:text-sm sm:leading-6">
              {step === "credentials"
                ? "Secure oversight platform. Monitor performance, manage KYC, and oversee operations."
                : "Enter the 6-digit verification code from your authenticator app."}
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <Shield className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Credentials */}
            {step === "credentials" && (
              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Institutional Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="director@bankofghana.gov.gh"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/20 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Secure Passphrase
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your secure passphrase"
                      autoComplete="current-password"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 block h-12 w-full rounded-xl border border-black/20 bg-white pr-12 px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[color:var(--trite-lime-strong)]"     
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-[calc(50%+6px)] -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[color:var(--trite-muted)]">
                    <input type="checkbox" className="h-4 w-4 rounded border-black/20" />
                    Remember this device
                  </label>
                  <Link href="/forgot-password?admin=true" className="font-medium text-[color:var(--trite-ink)] hover:underline">
                    Reset credentials
                  </Link>
                </div>

                <button
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Enter Admin Dashboard"
                  )}
                </button>

                <div className="text-center text-xs text-[color:var(--trite-muted)]">
                  Need institutional access?{" "}
                  <Link
                    className="font-semibold text-[color:var(--trite-ink)] hover:underline"
                    href="/admin/signup"
                  >
                    Request admin account
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: MFA Verification */}
            {step === "mfa" && (
              <form onSubmit={handleMfaSubmit} className="mt-8 space-y-6">
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <KeyRound className="h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Multi-Factor Authentication</p>
                    <p className="text-xs text-blue-700">A verification code was requested for your account.</p>
                  </div>
                </div>

                {useBackupCode ? (
                  <input
                    type="text"
                    autoFocus
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-center text-lg font-semibold tracking-widest text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:ring-2 focus:ring-[color:var(--trite-lime-strong)]/30"
                  />
                ) : (
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {mfaToken.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { mfaInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleMfaInput(idx, e.target.value)}
                        onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                        className="h-14 w-11 rounded-xl border border-black/10 bg-white text-center text-xl font-semibold text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:ring-2 focus:ring-[color:var(--trite-lime-strong)]/30 sm:h-16 sm:w-14"
                      />
                    ))}
                  </div>
                )}

                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setError("");
                    setMfaToken(["", "", "", "", "", ""]);
                    setBackupCode("");
                  }}
                  className="w-full text-center text-xs font-medium text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                >
                  {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setMfaToken(["", "", "", "", "", ""]);
                    setBackupCode("");
                    setUseBackupCode(false);
                    setError("");
                  }}
                  className="w-full text-center text-xs font-medium text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
                >
                  ← Back to login
                </button>
              </form>
            )}

            {/* Security Notice */}
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--trite-lime)]">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Bank of Ghana Regulated</h3>
                  <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                    This platform operates under the Payment Systems Act, 2003 (Act 662) 
                    and is regulated by the Bank of Ghana. All access is logged and monitored.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs font-semibold text-[color:var(--trite-muted)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Bank of Ghana Approved</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

