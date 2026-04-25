"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock, Shield, Check } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin");
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
              Secure oversight platform. Monitor performance, manage KYC, and oversee operations.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
                />
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
                  placeholder="Enter your secure passphrase"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 block h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-black/30 focus:border-[color:var(--trite-lime-strong)]"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[color:var(--trite-muted)]">
                  <input type="checkbox" className="h-4 w-4 rounded border-black/20" />
                  Remember this device
                </label>
                <Link href="#" className="font-medium text-[color:var(--trite-ink)] hover:underline">
                  Reset credentials
                </Link>
              </div>

              <button
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2"
                type="submit"
              >
                Enter Admin Dashboard
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

            {/* Security Notice */}
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--trite-lime)]">
                  <Lock className="h-4 w-4 text-[color:var(--trite-ink)]" />
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

// Icons imported from Lucide React
