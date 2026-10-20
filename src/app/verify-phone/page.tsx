"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "success">("loading");
  const [error, setError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sent = useRef(false);

  // Load the current user, redirect away if not an unverified merchant, then
  // send the first code exactly once.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!d.user || d.user.role !== "MERCHANT") {
          router.replace("/login");
          return;
        }
        if (d.user.mobile_verified_at) {
          router.replace("/merchant");
          return;
        }
        setPhone(d.user.mobile_number ?? null);
        setStatus("ready");
        if (!sent.current) {
          sent.current = true;
          // Surface send failures — otherwise the page claims a code is on its
          // way while the provider actually rejected it (bad number, unapproved
          // sender ID, no balance) and the merchant waits for an SMS forever.
          fetch("/api/auth/mobile/send", { method: "POST" })
            .then(async (res) => {
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "We couldn't send your code. Try Resend below.");
              }
            })
            .catch(() => setError("We couldn't send your code. Try Resend below."));
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("verifying");
    try {
      const res = await fetch("/api/auth/mobile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        router.replace("/merchant");
      } else {
        setStatus("ready");
        setError(data.error || "Verification failed. Please try again.");
      }
    } catch {
      setStatus("ready");
      setError("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    setResendState("sending");
    setError(null);
    try {
      const res = await fetch("/api/auth/mobile/send", { method: "POST" });
      setResendState(res.ok ? "sent" : "error");
    } catch {
      setResendState("error");
    }
  };

  const maskedPhone = phone
    ? phone.replace(/^(\+\d{2,3})(\d+)(\d{2})$/, (_, a, b, c) => `${a} ${"•".repeat(Math.max(b.length, 3))} ${c}`)
    : "your mobile number";

  return (
    <main className="relative min-h-screen bg-white font-montserrat flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Link href="/">
            <Image src="/tritee-logo.png" alt="Trite logo" width={120} height={28} className="h-7 w-auto" priority />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8">
          <div className="flex flex-col space-y-1 mb-6">
            <h1 className="text-2xl font-black tracking-tight text-black">Verify your number</h1>
            <p className="text-sm text-gray-500 font-medium">
              We sent a 6-digit code to <span className="font-bold text-black">{maskedPhone}</span>. Enter it below to unlock your dashboard.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 mb-4 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider" htmlFor="code">Verification code</label>
              <input
                className="flex h-12 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-center text-lg font-bold tracking-[0.5em] text-black transition-all focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/5 outline-none placeholder:tracking-normal placeholder:text-gray-400"
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                required
              />
            </div>

            <button
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 disabled:opacity-50 active:scale-[0.98]"
              type="submit"
              disabled={status === "verifying" || status === "success" || status === "loading" || code.length < 6}
            >
              {status === "verifying" ? "Verifying..." : status === "success" ? "Verified ✓" : "Verify & Continue"}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-5 font-medium">
            Didn&apos;t get a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending" || resendState === "sent"}
              className="font-bold text-black hover:text-[#22c55e] transition-colors disabled:opacity-50"
            >
              {resendState === "sending"
                ? "Sending..."
                : resendState === "sent"
                ? "Code sent ✓"
                : resendState === "error"
                ? "Retry"
                : "Resend"}
            </button>
          </div>

          {/* Escape hatch — never strand someone on a step they can't clear */}
          <div className="text-center text-xs text-gray-400 mt-3 font-medium">
            <button
              type="button"
              onClick={handleSignOut}
              className="hover:text-black transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
