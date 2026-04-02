"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };
  return (
    <div className="min-h-[100svh] bg-[#f6f7fb]">
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
            <a className="hover:text-[color:var(--trite-ink)]" href="#support">
              Support
            </a>
            <a className="hover:text-[color:var(--trite-ink)]" href="#security">
              Security
            </a>
          </nav>
        </div>
      </header>

      <main className="px-4 py-14 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[color:var(--trite-ink)]">
              Merchant
              <span className="text-[color:var(--trite-lime-strong)]"> Login</span>
            </h1>
            <p className="mt-4 text-sm leading-6 text-[color:var(--trite-muted)]">
              Secure access to your global financial architecture and settlement
              infrastructure.
            </p>

            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="h-1 w-full rounded-full bg-gradient-to-r from-[color:var(--trite-lime-strong)] to-[color:var(--trite-ink)]" />

              <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-ink)]"
                    htmlFor="email"
                  >
                    Business email
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-[color:var(--trite-ink)]"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="text-xs font-semibold text-[color:var(--trite-ink)] hover:underline"
                      href="#forgot-password"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2"
                  type="submit"
                >
                  Enter Secure Dashboard
                </button>

                <div className="text-center text-xs text-[color:var(--trite-muted)]">
                  Don't have an enterprise account?{" "}
                  <Link
                    className="font-semibold text-[color:var(--trite-ink)] hover:underline"
                    href="/get-started"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs font-semibold text-[color:var(--trite-muted)]">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                PCI DSS Level 1
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                256-bit AES
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                SOC2 Type II
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-[color:var(--trite-muted)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Trite. All rights reserved.</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <a className="hover:text-[color:var(--trite-ink)]" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-[color:var(--trite-ink)]" href="#">
              Terms of Service
            </a>
            <a className="hover:text-[color:var(--trite-ink)]" href="#">
              Security Audit
            </a>
            <a className="hover:text-[color:var(--trite-ink)]" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
