import Image from "next/image";
import Link from "next/link";

export default function GetStartedPage() {
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

          <nav className="hidden items-center gap-6 text-sm font-medium text-[color:var(--trite-muted)] md:flex">
            <Link className="hover:text-[color:var(--trite-ink)]" href="/#solutions">
              Solutions
            </Link>
            <Link className="hover:text-[color:var(--trite-ink)]" href="/#pricing">
              Pricing
            </Link>
            <Link className="hover:text-[color:var(--trite-ink)]" href="/#developers">
              Developers
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/5 sm:inline-flex"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-4 text-sm font-semibold text-white hover:bg-black"
              href="/get-started"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[color:var(--trite-muted)]">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]"
                aria-hidden="true"
              />
              Merchant onboarding
            </div>

            <h1 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-tight text-[color:var(--trite-ink)] sm:text-4xl">
              Architecting the future of global commerce.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[color:var(--trite-muted)] sm:text-base">
              Create your merchant account in minutes and start accepting
              payments in Ghana Cedis (GHS) with secure, scalable infrastructure.
            </p>

            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-[color:var(--trite-ink)]">
                    Create Your Merchant Account
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--trite-muted)]">
                    All fields are required unless marked optional.
                  </div>
                </div>
                <div
                  className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--trite-lime)]/40 sm:flex"
                  aria-hidden="true"
                >
                  <div className="h-3 w-3 rounded-full bg-[color:var(--trite-ink)]" />
                </div>
              </div>

              <form className="mt-6 grid grid-cols-1 gap-4" action="#" method="post">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="text-xs font-semibold text-[color:var(--trite-ink)]"
                      htmlFor="firstName"
                    >
                      First name
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-gray-900 outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                      id="firstName"
                      name="firstName"
                      placeholder="Kwame"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold text-[color:var(--trite-ink)]"
                      htmlFor="lastName"
                    >
                      Last name
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-gray-900 outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                      id="lastName"
                      name="lastName"
                      placeholder="Mensah"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="businessName"
                  >
                    Business name
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="businessName"
                    name="businessName"
                    placeholder="Trite Stores"
                    autoComplete="organization"
                    required
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="legalEntity"
                  >
                    Legal entity name
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="legalEntity"
                    name="legalEntity"
                    placeholder="Trite Limited"
                    required
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="email"
                  >
                    Business email
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@business.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />

                  <label
                    className="mt-4 block text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="confirmPassword"
                  >
                    Confirm password
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none ring-0 placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
                  <div className="mt-2 text-[11px] leading-5 text-[color:var(--trite-muted)]">
                    By creating an account, you agree to our{" "}
                    <a className="font-semibold text-[color:var(--trite-ink)] hover:underline" href="#">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a className="font-semibold text-[color:var(--trite-ink)] hover:underline" href="#">
                      Privacy Policy
                    </a>
                    .
                  </div>
                </div>

                <button
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2"
                  type="submit"
                >
                  Create Account
                </button>

                <div className="text-center text-xs text-[color:var(--trite-muted)]">
                  Already have an account?{" "}
                  <a className="font-semibold text-[color:var(--trite-ink)] hover:underline" href="#">
                    Sign in
                  </a>
                </div>
              </form>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                What you get with Trite
              </div>
              <div className="mt-5 grid gap-3 text-sm text-[color:var(--trite-muted)]">
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>GHS settlement-ready payment flows</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>Unified API for fiat + digital asset rails</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>Bank-grade security and compliance controls</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>Developer-first tooling and documentation</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-[color:var(--trite-lime)]/25 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-ink)]">
                  Need help?
                </div>
                <div className="mt-2 text-sm leading-6 text-[color:var(--trite-muted)]">
                  Contact sales and we’ll help you set up the best flow for your
                  business.
                </div>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-4 text-sm font-semibold text-white hover:bg-black"
                  href="/contact-sales"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </aside>
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
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
