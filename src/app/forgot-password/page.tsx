"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [demoLink, setDemoLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDemoLink("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isAdmin }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        if (data.resetLink) {
          setDemoLink(data.resetLink);
        }
      } else {
        // Fallback for demo/testing when backend API is not yet implemented by colleague
        if (res.status === 404) {
          console.warn("Forgot Password API route (POST /api/auth/forgot-password) returned 404. Simulating success for frontend testing.");
          setSuccess(true);
          // Generate a mockup reset link for local testing
          setDemoLink(`/reset-password?token=demo_token_123&email=${encodeURIComponent(email)}${isAdmin ? "&admin=true" : ""}`);
        } else {
          throw new Error(data.error || "Something went wrong. Please try again.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8">
      <div className="flex flex-col space-y-1 mb-6">
        <h1 className="text-2xl font-black tracking-tight text-black">
          {isAdmin ? "Reset Admin Credentials" : "Forgot Password?"}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 mb-4 font-medium">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 p-4 text-xs text-green-700 border border-green-100 font-medium leading-relaxed">
            Password reset instructions have been sent to your email address if an account exists.
          </div>

          {demoLink && (
            <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Demo Mode Helper
              </span>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Since the backend API is still being developed by your colleague, you can click this simulated link to complete the reset flow locally:
              </p>
              <Link
                href={demoLink}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Simulate Resetting Password
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link
              href={isAdmin ? "/admin/login" : "/login"}
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 active:scale-[0.98]"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider" htmlFor="email">
              {isAdmin ? "Institutional Email" : "Business email"}
            </label>
            <input
              className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/5 outline-none placeholder:text-gray-500"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdmin ? "director@bankofghana.gov.gh" : "you@company.com"}
              required
            />
          </div>

          <button
            className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 disabled:opacity-50 mt-4 active:scale-[0.98]"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white font-montserrat flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo and Back Link */}
        <div className="flex items-center justify-between mb-6">
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
          <Link 
            href="/login"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <svg className="size-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sign In
          </Link>
        </div>

        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </main>
  );
}
