import Image from "next/image";
import Link from "next/link";
import CanvasAnimation from "./CanvasAnimation";
import WorldMap from "./WorldMap";

export default function Home() {
  const ghs = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-[100svh] bg-[#f6f7fb]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              priority
            />
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[color:var(--trite-muted)] md:flex">
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/5 sm:inline-flex"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--trite-ink)] px-5 text-sm font-semibold text-white hover:bg-black"
              href="/get-started"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-black">
          <CanvasAnimation />
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]"
                  aria-hidden="true"
                />
                This new standard is built for real payments
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Financial
                <span className="text-[color:var(--trite-lime-strong)]"> Architecture</span>
                <br />
                for the Modern Enterprise.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Bridge the gap between traditional banking and the digital asset
                economy. Trite provides the infrastructure for seamless,
                reliable global settlements.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                  href="/login"
                >
                  Merchant Signup
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--trite-lime-strong)] px-8 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]"
                  href="/connect"
                >
                  <WalletIcon className="h-5 w-5" />
                  Connect Wallet
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-10 text-xs font-semibold text-white/60 sm:px-6">
              <span className="uppercase tracking-[0.22em]">Native web3 integration</span>
              <span className="text-white/30">|</span>
              <span>MetaMask</span>
              <span>WalletConnect</span>
              <span>Ledger</span>
              <span>Coinbase Wallet</span>
            </div>
          </div>
        </section>

        <section id="solutions" className="bg-[#f6f7fb]">
          <div className="relative overflow-hidden pt-16 pb-8">
            {/* Background SVG Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='100%25' gradientTransform='rotate(59,960,472)'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%237dff00'/%3E%3C/linearGradient%3E%3Cpattern patternUnits='userSpaceOnUse' id='b' width='1104' height='920' x='0' y='0' viewBox='0 0 1080 900'%3E%3Cg fill-opacity='0.4'%3E%3Cpolygon fill='%230b0f14' points='90 150 0 300 180 300'/%3E%3Cpolygon points='90 150 180 0 0 0'/%3E%3Cpolygon fill='%235b6472' points='270 150 360 0 180 0'/%3E%3Cpolygon fill='%23b6ff3b' points='450 150 360 300 540 300'/%3E%3Cpolygon fill='%237dff00' points='450 150 540 0 360 0'/%3E%3Cpolygon points='630 150 540 300 720 300'/%3E%3Cpolygon fill='%23b6ff3b' points='630 150 720 0 540 0'/%3E%3Cpolygon fill='%230b0f14' points='810 150 720 300 900 300'/%3E%3Cpolygon fill='%23ffffff' points='810 150 900 0 720 0'/%3E%3Cpolygon fill='%235b6472' points='990 150 900 300 1080 300'/%3E%3Cpolygon fill='%230b0f14' points='990 150 1080 0 900 0'/%3E%3Cpolygon fill='%235b6472' points='90 450 0 600 180 600'/%3E%3Cpolygon points='90 450 180 300 0 300'/%3E%3Cpolygon fill='%237dff00' points='270 450 180 600 360 600'/%3E%3Cpolygon fill='%235b6472' points='270 450 360 300 180 300'/%3E%3Cpolygon fill='%23b6ff3b' points='450 450 360 600 540 600'/%3E%3Cpolygon fill='%237dff00' points='450 450 540 300 360 300'/%3E%3Cpolygon fill='%237dff00' points='630 450 540 600 720 600'/%3E%3Cpolygon fill='%23ffffff' points='630 450 720 300 540 300'/%3E%3Cpolygon points='810 450 720 600 900 600'/%3E%3Cpolygon fill='%235b6472' points='810 450 900 300 720 300'/%3E%3Cpolygon fill='%235b6472' points='990 450 900 600 1080 600'/%3E%3Cpolygon fill='%230b0f14' points='990 450 1080 300 900 300'/%3E%3Cpolygon fill='%230b0f14' points='90 750 0 900 180 900'/%3E%3Cpolygon points='270 750 180 900 360 900'/%3E%3Cpolygon fill='%235b6472' points='270 750 360 600 180 600'/%3E%3Cpolygon points='450 750 540 600 360 600'/%3E%3Cpolygon points='630 750 540 900 720 900'/%3E%3Cpolygon fill='%230b0f14' points='630 750 720 600 540 600'/%3E%3Cpolygon fill='%235b6472' points='810 750 720 900 900 900'/%3E%3Cpolygon fill='%237dff00' points='810 750 900 600 720 600'/%3E%3Cpolygon fill='%237dff00' points='990 750 900 900 1080 900'/%3E%3Cpolygon fill='%237dff00' points='180 0 90 150 270 150'/%3E%3Cpolygon fill='%230b0f14' points='360 0 270 150 450 150'/%3E%3Cpolygon fill='%23ffffff' points='540 0 450 150 630 150'/%3E%3Cpolygon points='900 0 810 150 990 150'/%3E%3Cpolygon fill='%230b0f14' points='0 300 -90 450 90 450'/%3E%3Cpolygon fill='%23ffffff' points='0 300 90 150 -90 150'/%3E%3Cpolygon fill='%23ffffff' points='180 300 90 450 270 450'/%3E%3Cpolygon fill='%237dff00' points='180 300 270 150 90 150'/%3E%3Cpolygon fill='%230b0f14' points='360 300 270 450 450 450'/%3E%3Cpolygon fill='%23ffffff' points='360 300 450 150 270 150'/%3E%3Cpolygon fill='%230b0f14' points='540 300 450 450 630 450'/%3E%3Cpolygon fill='%230b0f14' points='540 300 630 150 450 150'/%3E%3Cpolygon fill='%235b6472' points='720 300 630 450 810 450'/%3E%3Cpolygon fill='%237dff00' points='720 300 810 150 630 150'/%3E%3Cpolygon fill='%23ffffff' points='900 300 810 450 990 450'/%3E%3Cpolygon fill='%237dff00' points='900 300 990 150 810 150'/%3E%3Cpolygon points='0 600 -90 750 90 750'/%3E%3Cpolygon fill='%237dff00' points='0 600 90 450 -90 450'/%3E%3Cpolygon fill='%235b6472' points='180 600 90 750 270 750'/%3E%3Cpolygon fill='%230b0f14' points='180 600 270 450 90 450'/%3E%3Cpolygon fill='%230b0f14' points='360 600 270 750 450 750'/%3E%3Cpolygon fill='%237dff00' points='360 600 450 450 270 450'/%3E%3Cpolygon fill='%237dff00' points='540 600 630 450 450 450'/%3E%3Cpolygon fill='%230b0f14' points='720 600 630 750 810 750'/%3E%3Cpolygon fill='%23ffffff' points='900 600 810 750 990 750'/%3E%3Cpolygon fill='%230b0f14' points='900 600 990 450 810 450'/%3E%3Cpolygon fill='%235b6472' points='0 900 90 750 -90 750'/%3E%3Cpolygon fill='%230b0f14' points='180 900 270 750 90 750'/%3E%3Cpolygon fill='%23ffffff' points='360 900 450 750 270 750'/%3E%3Cpolygon fill='%235b6472' points='540 900 630 750 450 750'/%3E%3Cpolygon fill='%23ffffff' points='720 900 810 750 630 750'/%3E%3Cpolygon fill='%230b0f14' points='900 900 990 750 810 750'/%3E%3Cpolygon fill='%230b0f14' points='1080 300 990 450 1170 450'/%3E%3Cpolygon fill='%23ffffff' points='1080 300 1170 150 990 150'/%3E%3Cpolygon points='1080 600 990 750 1170 750'/%3E%3Cpolygon fill='%237dff00' points='1080 600 1170 450 990 450'/%3E%3Cpolygon fill='%235b6472' points='1080 900 1170 750 990 750'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect x='0' y='0' fill='url(%23b)' width='100%25' height='100%25'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover'
              }}
            />
            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
              <div className="max-w-xl">
                <h2 className="text-3xl font-semibold text-[color:var(--trite-ink)] sm:text-4xl">
                  Built for Scale.
                </h2>
                <p className="mt-3 text-sm text-[color:var(--trite-muted)] sm:text-base">
                  Thousands of organizations of all sizes trust Trite to grow their business.
                </p>
              </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--trite-lime)]/20">
                  <svg className="h-7 w-7 text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="mt-6 text-lg font-semibold text-[color:var(--trite-ink)]">
                  Real-time Settlements
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--trite-muted)]">
                  Execute cross-border transactions that settle in seconds using
                  our payments infrastructure.
                </p>
              </div>

              <div className="rounded-lg bg-white p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--trite-lime)]/20">
                  <svg className="h-7 w-7 text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="mt-6 text-lg font-semibold text-[color:var(--trite-ink)]">
                  Bank-Grade Security
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--trite-muted)]">
                  Multi-layer encryption and robust compliance so you can scale
                  with confidence.
                </p>
              </div>

              <div className="rounded-lg bg-white p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--trite-lime)]/20">
                  <svg className="h-7 w-7 text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="mt-6 text-lg font-semibold text-[color:var(--trite-ink)]">
                  Unified API
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--trite-muted)]">
                  One integration for global rails and crypto payments. Built
                  for developers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-16">
            {/* Global Payments Section */}
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="max-w-lg">
                <div className="text-sm font-semibold uppercase tracking-wider text-[color:var(--trite-lime-strong)]">
                  Global Reach
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-[color:var(--trite-ink)] sm:text-4xl">
                  Hundreds of markets. <span className="text-[color:var(--trite-lime-strong)]">One platform.</span>
                </h2>
                <p className="mt-4 text-sm leading-6 text-[color:var(--trite-muted)] sm:text-base">
                  Accept payments from customers across Africa and beyond. Trite
                  automatically routes transactions through the optimal local
                  infrastructure for maximum success rates.
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--trite-muted)] sm:text-base">
                  From Lagos to London, Accra to Amsterdam—process payments in
                  multiple currencies with real-time conversion and settlement.
                </p>
              </div>

              {/* World Map Visualization */}
              <WorldMap />
            </div>

            <div className="mt-12 relative overflow-hidden rounded-3xl bg-[color:var(--trite-ink)] px-6 py-24 sm:py-32 text-white sm:px-10">
              {/* Background Image */}
              <div 
                className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity"
                style={{
                  backgroundImage: 'url("/african-man-touching.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Ready to evolve your stack?
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                  Join forward-looking teams building faster payments,
                  settlements, and merchant experiences with Trite.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--trite-lime-strong)] px-6 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]"
                    href="/get-started"
                  >
                    Start Now
                  </Link>
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
                    href="/contact-sales"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-black/5 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <Image
                  src="/tritee-logo.png"
                  alt="Trite logo"
                  width={120}
                  height={28}
                />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[color:var(--trite-muted)]">
                Modern payment infrastructure that connects fiat rails and
                digital assets for global settlement.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-ink)]">
                Product
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--trite-muted)]">
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  Cross-border Payments
                </a>
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  Merchant Tools
                </a>
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  API Status
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-ink)]">
                Resources
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--trite-muted)]">
                <a className="hover:text-[color:var(--trite-ink)]" href="#developers">
                  Documentation
                </a>
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  Security
                </a>
                <a className="hover:text-[color:var(--trite-ink)]" href="#contact">
                  Contact
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--trite-ink)]">
                Connect
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--trite-muted)]">
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  X (Twitter)
                </a>
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  LinkedIn
                </a>
                <a className="hover:text-[color:var(--trite-ink)]" href="#">
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-black/5">
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
          </div>
        </footer>
      </main>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );
}
