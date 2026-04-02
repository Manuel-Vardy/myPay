"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Info, Shield, Lock, Check } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[100svh] bg-[#f6f7fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              priority
            />
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-[color:var(--trite-muted)]">
            <Link className="hover:text-[color:var(--trite-ink)]" href="/contact-sales">
              Contact Sales
            </Link>
            <Link className="hover:text-[color:var(--trite-ink)]" href="/admin/login">
              Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="w-full max-w-lg">
            {/* Admin Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--trite-ink)] px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span className="text-xs font-semibold text-white uppercase tracking-wide">New Institutional Account</span>
            </div>

            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[color:var(--trite-ink)]">
              Request Ghana Financial
              <span className="text-[color:var(--trite-lime-strong)]"> Admin Access</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--trite-muted)]">
              Apply for institutional oversight access to the Ghanaian payment infrastructure. 
              Applications are reviewed by the Bank of Ghana compliance team.
            </p>

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
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
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
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
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
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
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
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)]"
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
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min 16 characters"
                    autoComplete="new-password"
                    required
                    minLength={16}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[color:var(--trite-ink)]"
                  >
                    Confirm Passphrase
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter passphrase"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
                  />
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
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2"
                type="submit"
              >
                Submit Access Request
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
                    For urgent access, contact compliance@trite.com.gh
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
