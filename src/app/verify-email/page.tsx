"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    if (!token) {
      setStatus("error");
      setError("Verification token is missing. Please use the link from your email.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setError(data.error || "Failed to verify email. Please try again.");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8">
      <div className="flex flex-col space-y-1 mb-6">
        <h1 className="text-2xl font-black tracking-tight text-black">Verify Email</h1>
      </div>

      {status === "verifying" && (
        <p className="text-sm text-gray-500 font-medium">Verifying your email address...</p>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 p-4 text-xs text-green-700 border border-green-100 font-medium leading-relaxed">
            Your email has been verified. You can now continue to your dashboard.
          </div>
          <Link
            href="/merchant"
            className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 font-medium">
            {error}
          </div>
          <Link
            href="/merchant"
            className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-white font-montserrat flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex items-center justify-center mb-6">
          <Link href="/">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>
        </div>

        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}
