"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Info, Shield, Lock, Check, Loader2, CheckCircle } from "lucide-react";

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    institution: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ message: string; admin_id: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passphrases do not match");
      return;
    }

    if (formData.password.length < 16) {
      setError("Passphrase must be at least 16 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          institution: formData.institution,
          phone: formData.phone,
          designated_role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess({ message: data.message, admin_id: data.admin_id });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      <main className="px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center sm:text-left">
          <div className="w-full max-w-lg">
            {/* Admin Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--trite-ink)] px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest sm:text-xs">Institutional Account</span>
            </div>

            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[color:var(--trite-ink)] sm:text-3xl">
              Request Ghana Financial
              <span className="text-[color:var(--trite-lime-strong)]"> Admin Access</span>
            </h1>
            <p className="mt-3 text-xs leading-5 text-[color:var(--trite-muted)] sm:text-sm sm:leading-6">
              Apply for institutional oversight. Applications are reviewed by the Bank of Ghana.
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <Shield className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success State */}
            {success ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-emerald-900">Application Submitted</h2>
                  <p className="mt-2 text-sm text-emerald-700">{success.message}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5">
                    <span className="text-xs font-medium text-emerald-700">Admin ID:</span>
                    <span className="text-xs font-bold text-emerald-900">{success.admin_id}</span>
                  </div>
                </div>
                <Link
                  href="/admin/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black"
                >
                  Return to Login
                </Link>
              </div>
            ) : (

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="institution"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Institution Name
                  </label>
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    placeholder="e.g., Ghana Commercial Bank Ltd"
                    required
                    value={formData.institution}
                    onChange={handleChange}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/20 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>

                <div className="sm:col-span-2">
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
                    placeholder="director@institution.gov.gh"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/20 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Contact Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/20 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Designated Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-gray-900 outline-none transition-all focus:border-[color:var(--trite-lime-strong)]"
                  >
                    <option value="">Select role...</option>
                    <option value="compliance-officer">Compliance Officer</option>
                    <option value="risk-manager">Risk Manager</option>
                    <option value="institutional-director">Institutional Director</option>
                    <option value="bank-of-ghana">Bank of Ghana Official</option>
                    <option value="regulatory-auditor">Regulatory Auditor</option>
                  </select>
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
                      placeholder="Min 16 characters"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                      minLength={16}
                      value={formData.password}
                      onChange={handleChange}
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Confirm Passphrase
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter passphrase"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1.5 block h-12 w-full rounded-xl border border-black/20 bg-white pr-12 px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[color:var(--trite-lime-strong)]"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-[calc(50%+6px)] -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
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

              <div className="pt-2">
                <label className="flex items-start gap-3 text-sm text-[color:var(--trite-muted)]">
                  <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-black/20" />
                  <span>
                    I confirm that I am authorized to request institutional access on behalf of a 
                    Bank of Ghana regulated entity. I understand that false claims may result in 
                    legal action under Ghanaian law.
                  </span>
                </label>
              </div>

              <button
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Access Request"
                )}
              </button>

              <div className="text-center text-sm text-[color:var(--trite-muted)]">
                Already have admin credentials?{" "}
                <Link
                  className="font-semibold text-[color:var(--trite-ink)] hover:underline"
                  href="/admin/login"
                >
                  Sign in
                </Link>
              </div>
            </form>
            )}

            {/* Info Box */}
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Info className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Application Review Process</h3>
                  <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                    All applications are verified against the Bank of Ghana registry. 
                    Approved applicants receive credentials within 3-5 business days. 
                    For urgent access, contact compliance@trite.tech
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

// Icons imported from Lucide React
