"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="w-full min-h-screen flex">
      {/* ── Left hero panel ── */}
      <div className="flex-1 bg-[#e9ffda] hidden lg:flex items-center justify-center p-14 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[#22c55e]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#22c55e]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 text-black max-w-lg">
          <h1 className="text-5xl font-black leading-tight tracking-tight text-black mb-6">
            Access your global financial infrastructure.
          </h1>
          <div className="mt-6 w-full relative">
            <Image
              src="/images/login-pic.png"
              alt="Trite Illustration"
              width={600}
              height={450}
              className="w-full h-auto object-contain rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-md relative z-10">
          {/* Top nav: logo + home link */}
          <div className="flex items-center justify-between mb-8">
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

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-3xl font-black text-black tracking-tight mb-1.5">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Access your global financial infrastructure.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 mb-5 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                htmlFor="email"
              >
                Business email
              </label>
              <input
                className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="text-[10px] font-bold text-black hover:text-[#22c55e] transition-colors"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 pr-12 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  data-lpignore="true"
                  data-form-type="other"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
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

            {/* Submit */}
            <button
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/80 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Enter Secure Dashboard"}
            </button>

            <div className="text-center text-xs text-gray-500 font-medium">
              Don&apos;t have an enterprise account?{" "}
              <Link
                className="font-bold text-black hover:text-[#22c55e] transition-colors"
                href="/get-started"
              >
                Sign up
              </Link>
            </div>
          </form>



          <p className="text-gray-400 mt-6 text-[10px] text-center leading-relaxed max-w-xs mx-auto">
            By clicking enter, you agree to our{" "}
            <Link href="/legal?tab=general-terms-of-use" className="text-gray-600 font-bold hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal?tab=privacy-policy" className="text-gray-600 font-bold hover:underline">
              Privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
