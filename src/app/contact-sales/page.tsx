import Image from "next/image";
import Link from "next/link";

export default function ContactSalesPage() {
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
              Sales inquiry
            </div>

            <h1 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-tight text-[color:var(--trite-ink)] sm:text-4xl">
              Contact Sales
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[color:var(--trite-muted)] sm:text-base">
              Tell us about your business and we’ll recommend the best Trite
              setup for your payments, settlements, and merchant workflows.
            </p>

            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-[color:var(--trite-ink)]">
                    Request a demo / quote
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--trite-muted)]">
                    We typically respond within 24 hours (business days).
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
                      htmlFor="fullName"
                    >
                      Full name
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                      id="fullName"
                      name="fullName"
                      placeholder="Ama Owusu"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="text-xs font-semibold text-[color:var(--trite-ink)]"
                      htmlFor="workEmail"
                    >
                      Work email
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                      id="workEmail"
                      name="workEmail"
                      type="email"
                      placeholder="ama@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="company"
                  >
                    Company / business
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="company"
                    name="company"
                    placeholder="Trite Stores"
                    autoComplete="organization"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="text-xs font-semibold text-[color:var(--trite-ink)]"
                      htmlFor="phone"
                    >
                      Phone / WhatsApp (optional)
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                      id="phone"
                      name="phone"
                      placeholder="+233 20 000 0000"
                      autoComplete="tel"
                    />
                  </div>

                  <div>
                    <label
                      className="text-xs font-semibold text-[color:var(--trite-ink)]"
                      htmlFor="monthlyVolume"
                    >
                      Estimated monthly volume (GHS)
                    </label>
                    <select
                      className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] px-3 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                      id="monthlyVolume"
                      name="monthlyVolume"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select a range
                      </option>
                      <option value="0-10k">₵0 - ₵10,000</option>
                      <option value="10k-50k">₵10,000 - ₵50,000</option>
                      <option value="50k-200k">₵50,000 - ₵200,000</option>
                      <option value="200k-1m">₵200,000 - ₵1,000,000</option>
                      <option value="1m+">₵1,000,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[color:var(--trite-ink)]">
                    What do you want to build?
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-[color:var(--trite-muted)] sm:grid-cols-2">
                    {[
                      { id: "need-online", label: "Online payments" },
                      { id: "need-payouts", label: "Payouts" },
                      { id: "need-subscriptions", label: "Subscriptions" },
                      { id: "need-crossborder", label: "Cross-border" },
                      { id: "need-api", label: "API integration" },
                      { id: "need-pos", label: "POS / agents" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#f6f7fb] px-3 py-2"
                        htmlFor={item.id}
                      >
                        <input
                          id={item.id}
                          name="needs"
                          type="checkbox"
                          value={item.label}
                          className="h-4 w-4 accent-[color:var(--trite-lime-strong)]"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="text-xs font-semibold text-[color:var(--trite-ink)]"
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <textarea
                    className="mt-2 min-h-28 w-full resize-y rounded-xl border border-black/10 bg-[#f6f7fb] px-3 py-3 text-sm text-[color:var(--trite-ink)] outline-none placeholder:text-black/35 focus:border-[color:var(--trite-lime-strong)] focus:bg-white"
                    id="message"
                    name="message"
                    placeholder="Tell us what you’re building, timelines, and any requirements."
                    required
                  />
                </div>

                <button
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-[color:var(--trite-lime-strong)] focus:ring-offset-2"
                  type="submit"
                >
                  Contact Sales
                </button>

                <div className="text-center text-xs text-[color:var(--trite-muted)]">
                  Prefer email? Write us at{" "}
                  <a
                    className="font-semibold text-[color:var(--trite-ink)] hover:underline"
                    href="mailto:sales@trite.com"
                  >
                    sales@trite.com
                  </a>
                </div>
              </form>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold text-[color:var(--trite-ink)]">
                What happens next
              </div>
              <div className="mt-5 grid gap-3 text-sm text-[color:var(--trite-muted)]">
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>We review your requirements and volume.</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>We share pricing and the best integration approach.</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                  <span>We support onboarding, testing, and go-live.</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-[color:var(--trite-lime)]/25 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-ink)]">
                  Fast track
                </div>
                <div className="mt-2 text-sm leading-6 text-[color:var(--trite-muted)]">
                  If you already know what you need, you can create a merchant
                  account to begin onboarding.
                </div>
                <Link
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-4 text-sm font-semibold text-white hover:bg-black"
                  href="/get-started"
                >
                  Create Merchant Account
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
