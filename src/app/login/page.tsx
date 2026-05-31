"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.mfa_required) {
        setError("MFA is required for this account. Please use an account without MFA for now.");
        setLoading(false);
        return;
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/merchant");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-montserrat flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo and Home Link */}
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
            href="/"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <svg className="size-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8">
          <div className="flex flex-col space-y-1 mb-6">
            <h1 className="text-2xl font-black tracking-tight text-black">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Access your global financial infrastructure.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 mb-4 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider" htmlFor="email">Business email</label>
              <input
                className="flex h-11 w-full rounded-xl border border-black/[0.08] bg-gray-50/50 px-4 py-2 text-sm font-medium transition-all focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/5 outline-none placeholder:text-gray-400"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider" htmlFor="password">Password</label>
                <a className="text-[10px] font-bold text-black hover:text-[#22c55e] transition-colors" href="#">Forgot password?</a>
              </div>
              <input
                className="flex h-11 w-full rounded-xl border border-black/[0.08] bg-gray-50/50 px-4 py-2 text-sm font-medium transition-all focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/5 outline-none placeholder:text-gray-400"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 disabled:opacity-50 mt-4 active:scale-[0.98]"
              type="submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Enter Secure Dashboard"}
            </button>

            <div className="text-center text-xs text-gray-500 mt-4 font-medium">
              Don't have an enterprise account?{" "}
              <Link className="font-bold text-black hover:text-[#22c55e] transition-colors" href="/get-started">
                Sign up
              </Link>
            </div>
          </form>

          <p className="text-gray-400 mt-6 text-[10px] text-center leading-relaxed max-w-xs mx-auto">
            By clicking enter, you agree to our{' '}
            <a href="#" className="text-gray-600 font-bold hover:underline">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-gray-600 font-bold hover:underline">Privacy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
