"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GetStartedPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    legalEntity: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          business_name: formData.businessName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          legal_entity: formData.legalEntity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/merchant");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
            Start accepting payments across Africa.
          </h1>
          <div className="mt-6 w-full relative">
            <Image
              src="/images/login-pics.png"
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

        <div className="w-full max-w-md relative z-10 py-8">
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
              Create Account
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Start accepting payments in Ghana Cedis (GHS) today.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 mb-5 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First + Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="firstName"
                >
                  First name
                </label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Kay"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="lastName"
                >
                  Last name
                </label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Trite"
                  required
                />
              </div>
            </div>

            {/* Business name + legal entity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="businessName"
                >
                  Business name
                </label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Trite Stores"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="legalEntity"
                >
                  Legal entity
                </label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                  id="legalEntity"
                  name="legalEntity"
                  value={formData.legalEntity}
                  onChange={handleChange}
                  placeholder="Trite Limited"
                  required
                />
              </div>
            </div>

            {/* Business email */}
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
                value={formData.email}
                onChange={handleChange}
                placeholder="you@business.com"
                required
              />
            </div>

            {/* Password + confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 pr-12 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    value={formData.password}
                    onChange={handleChange}
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
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold text-gray-700 uppercase tracking-wider"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 pr-12 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
            </div>

            {/* Submit */}
            <button
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/80 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center text-xs text-gray-500 font-medium">
              Already have an account?{" "}
              <Link
                className="font-bold text-black hover:text-[#22c55e] transition-colors"
                href="/login"
              >
                Sign in
              </Link>
            </div>
          </form>

          <p className="text-gray-400 mt-6 text-[10px] text-center leading-relaxed max-w-xs mx-auto">
            By clicking continue, you agree to our{" "}
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
