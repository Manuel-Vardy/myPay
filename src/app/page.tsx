"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CanvasAnimation from "./CanvasAnimation";
import WorldMap from "./WorldMap";
import AnimatedHeroHeading from "@/components/AnimatedHeroHeading";
import { Component as AnimatedButton } from "@/components/ui/animated-button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Download, Menu, ArrowRight, X } from "lucide-react";
import mockup3 from "../../images/mockup3.png";
import mockup4 from "../../images/mockup4.png";
import mockup6 from "../../images/mockup6.png";
import stablecoin3d from "../../images/stablecoin_3d.png";
import kyc3d from "../../images/kyc_3d.png";
import omnichannel3d from "../../images/omnichannel_3d.png";
import mockup7 from "../../images/mockup7.png";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ghs = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-[100svh] bg-[#f6f7fb]">
      <header className="relative z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={100}
              height={24}
              className="w-[90px] sm:w-[120px]"
              priority
            />
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[color:var(--trite-muted)] md:flex">
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1 border-r border-black/10 pr-2 mr-1 sm:pr-3 sm:mr-2">
              <button
                className="hidden h-9 w-9 items-center justify-center rounded-full text-[color:var(--trite-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--trite-ink)] sm:flex"
                aria-label="Download App"
              >
                <Download className="h-5 w-5" />
              </button>
              <LanguageSwitcher />
            </div>
            
            <AnimatedButton href="/login" variant="ghost" className="hidden md:inline-flex px-2 sm:px-4">
              Sign in
            </AnimatedButton>
            <AnimatedButton href="/get-started" variant="primary" className="hidden md:inline-flex px-3 sm:px-4">
              Get Started
            </AnimatedButton>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--trite-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--trite-ink)] md:hidden"
              aria-label="Open menu"
              type="button"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 border-b border-black/5 bg-white p-6 shadow-xl md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl bg-black/5 py-4 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-black/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                className="flex items-center justify-center rounded-xl bg-[color:var(--trite-ink)] py-4 text-sm font-semibold text-white hover:bg-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
              <div className="h-px bg-black/5 my-2" />
              <div className="flex items-center justify-between text-[color:var(--trite-muted)]">
                <span className="text-xs font-medium uppercase tracking-widest">Download App</span>
                <Download className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden bg-black">
          <CanvasAnimation />
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-32">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]"
                  aria-hidden="true"
                />
                This new standard is built for real payments
              </div>

              <AnimatedHeroHeading />

              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Bridge the gap between traditional banking and the digital asset
                economy. Trite provides the infrastructure for seamless,
                reliable global settlements.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-11 sm:h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                  href="/login"
                >
                  Merchant Signup
                </Link>
                <Link
                  className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--trite-lime-strong)] px-8 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]"
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

        <section id="solutions" className="bg-black">
          <div className="relative overflow-hidden pt-24 pb-20">
            {/* Background SVG Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='100%25' gradientTransform='rotate(59,960,472)'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%237dff00'/%3E%3C/linearGradient%3E%3Cpattern patternUnits='userSpaceOnUse' id='b' width='1104' height='920' x='0' y='0' viewBox='0 0 1080 900'%3E%3Cg fill-opacity='0.4'%3E%3Cpolygon fill='%230b0f14' points='90 150 0 300 180 300'/%3E%3Cpolygon points='90 150 180 0 0 0'/%3E%3Cpolygon fill='%235b6472' points='270 150 360 0 180 0'/%3E%3Cpolygon fill='%23b6ff3b' points='450 150 360 300 540 300'/%3E%3Cpolygon fill='%237dff00' points='450 150 540 0 360 0'/%3E%3Cpolygon points='630 150 540 300 720 300'/%3E%3Cpolygon fill='%23b6ff3b' points='630 150 720 0 540 0'/%3E%3Cpolygon fill='%230b0f14' points='810 150 720 300 900 300'/%3E%3Cpolygon fill='%23ffffff' points='810 150 900 0 720 0'/%3E%3Cpolygon fill='%235b6472' points='990 150 900 300 1080 300'/%3E%3Cpolygon fill='%230b0f14' points='990 150 1080 0 900 0'/%3E%3Cpolygon fill='%235b6472' points='90 450 0 600 180 600'/%3E%3Cpolygon points='90 450 180 300 0 300'/%3E%3Cpolygon fill='%237dff00' points='270 450 180 600 360 600'/%3E%3Cpolygon fill='%235b6472' points='270 450 360 300 180 300'/%3E%3Cpolygon fill='%23b6ff3b' points='450 450 360 600 540 600'/%3E%3Cpolygon fill='%237dff00' points='450 450 540 300 360 300'/%3E%3Cpolygon fill='%237dff00' points='630 450 540 600 720 600'/%3E%3Cpolygon fill='%23ffffff' points='630 450 720 300 540 300'/%3E%3Cpolygon points='810 450 720 600 900 600'/%3E%3Cpolygon fill='%235b6472' points='810 450 900 300 720 300'/%3E%3Cpolygon fill='%235b6472' points='990 450 900 600 1080 600'/%3E%3Cpolygon fill='%230b0f14' points='990 450 1080 300 900 300'/%3E%3Cpolygon fill='%230b0f14' points='90 750 0 900 180 900'/%3E%3Cpolygon points='270 750 180 900 360 900'/%3E%3Cpolygon fill='%235b6472' points='270 750 360 600 180 600'/%3E%3Cpolygon points='450 750 540 600 360 600'/%3E%3Cpolygon points='630 750 540 900 720 900'/%3E%3Cpolygon fill='%230b0f14' points='630 750 720 600 540 600'/%3E%3Cpolygon fill='%235b6472' points='810 750 720 900 900 900'/%3E%3Cpolygon fill='%237dff00' points='810 750 900 600 720 600'/%3E%3Cpolygon fill='%237dff00' points='990 750 900 900 1080 900'/%3E%3Cpolygon fill='%237dff00' points='180 0 90 150 270 150'/%3E%3Cpolygon fill='%230b0f14' points='360 0 270 150 450 150'/%3E%3Cpolygon fill='%23ffffff' points='540 0 450 150 630 150'/%3E%3Cpolygon points='900 0 810 150 990 150'/%3E%3Cpolygon fill='%230b0f14' points='0 300 -90 450 90 450'/%3E%3Cpolygon fill='%23ffffff' points='0 300 90 150 -90 150'/%3E%3Cpolygon fill='%23ffffff' points='180 300 90 450 270 450'/%3E%3Cpolygon fill='%237dff00' points='180 300 270 150 90 150'/%3E%3Cpolygon fill='%230b0f14' points='360 300 270 450 450 450'/%3E%3Cpolygon fill='%23ffffff' points='360 300 450 150 270 150'/%3E%3Cpolygon fill='%230b0f14' points='540 300 450 450 630 450'/%3E%3Cpolygon fill='%230b0f14' points='540 300 630 150 450 150'/%3E%3Cpolygon fill='%235b6472' points='720 300 630 450 810 450'/%3E%3Cpolygon fill='%237dff00' points='720 300 810 150 630 150'/%3E%3Cpolygon fill='%23ffffff' points='900 300 810 450 990 450'/%3E%3Cpolygon fill='%237dff00' points='900 300 990 150 810 150'/%3E%3Cpolygon points='0 600 -90 750 90 750'/%3E%3Cpolygon fill='%237dff00' points='0 600 90 450 -90 450'/%3E%3Cpolygon fill='%235b6472' points='180 600 90 750 270 750'/%3E%3Cpolygon fill='%230b0f14' points='180 600 270 450 90 450'/%3E%3Cpolygon fill='%230b0f14' points='360 600 270 750 450 750'/%3E%3Cpolygon fill='%237dff00' points='360 600 450 450 270 450'/%3E%3Cpolygon fill='%237dff00' points='540 600 630 450 450 450'/%3E%3Cpolygon fill='%230b0f14' points='720 600 630 750 810 750'/%3E%3Cpolygon fill='%23ffffff' points='900 600 810 750 990 750'/%3E%3Cpolygon fill='%230b0f14' points='900 600 990 450 810 450'/%3E%3Cpolygon fill='%235b6472' points='0 900 90 750 -90 750'/%3E%3Cpolygon fill='%230b0f14' points='180 900 270 750 90 750'/%3E%3Cpolygon fill='%23ffffff' points='360 900 450 750 270 750'/%3E%3Cpolygon fill='%235b6472' points='540 900 630 750 450 750'/%3E%3Cpolygon fill='%23ffffff' points='720 900 810 750 630 750'/%3E%3Cpolygon fill='%230b0f14' points='900 900 990 750 810 750'/%3E%3Cpolygon fill='%230b0f14' points='1080 300 990 450 1170 450'/%3E%3Cpolygon fill='%23ffffff' points='1080 300 1170 150 990 150'/%3E%3Cpolygon points='1080 600 990 750 1170 750'/%3E%3Cpolygon fill='%237dff00' points='1080 600 1170 450 990 450'/%3E%3Cpolygon fill='%235b6472' points='1080 900 1170 750 990 750'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect x='0' y='0' fill='url(%23b)' width='100%25' height='100%25'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover'
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#1f2937] to-transparent pointer-events-none" />
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Built for Scale.
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/60">
                  Thousands of organizations of all sizes trust Trite to grow their business.
                </p>
              </div>

            <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group flex min-h-[380px] flex-col rounded-3xl bg-[#0d0d0d] p-10 border border-white/5 transition-all duration-500 hover:bg-[#161616] hover:border-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                  <svg className="h-6 w-6 text-[color:var(--trite-lime-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="mt-10 text-3xl font-bold tracking-tight text-white leading-tight">
                  Real-time <br/>Settlements
                </div>
                <div className="mt-auto">
                  <p className="text-base leading-relaxed text-white/40">
                    Execute cross-border transactions that settle in seconds using
                    our payments infrastructure.
                  </p>
                </div>
              </div>

              <div className="group flex min-h-[380px] flex-col rounded-3xl bg-[#0d0d0d] p-10 border border-white/5 transition-all duration-500 hover:bg-[#161616] hover:border-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                  <svg className="h-6 w-6 text-[color:var(--trite-lime-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="mt-10 text-3xl font-bold tracking-tight text-white leading-tight">
                  Bank-Grade <br/>Security
                </div>
                <div className="mt-auto">
                  <p className="text-base leading-relaxed text-white/40">
                    Multi-layer encryption and robust compliance so you can scale
                    with confidence.
                  </p>
                </div>
              </div>

              <div className="group flex min-h-[380px] flex-col rounded-3xl bg-[#0d0d0d] p-10 border border-white/5 transition-all duration-500 hover:bg-[#161616] hover:border-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                  <svg className="h-6 w-6 text-[color:var(--trite-lime-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="mt-10 text-3xl font-bold tracking-tight text-white leading-tight">
                  Unified <br/>API
                </div>
                <div className="mt-auto">
                  <p className="text-base leading-relaxed text-white/40">
                    One integration for global rails and crypto payments. Built
                    for developers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Dashboard Preview Section */}
        <div className="relative -mt-16 overflow-hidden rounded-t-[3.5rem] border-t border-white/5 bg-gradient-to-b from-black via-[#111827] to-black py-16 sm:py-24">
          <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Global Operations. <span className="text-[color:var(--trite-lime-strong)]">Single Command.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              The institutional-grade terminal built to bridge traditional banking with the digital asset economy. Monitor performance, manage liquidity, and scale across borders.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--trite-lime-strong)] px-8 text-sm font-semibold text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-lime)]"
                href="/get-started"
              >
                Create Account
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-semibold text-white hover:bg-white/10"
                href="/contact-sales"
              >
                Request a Demo
              </Link>
            </div>
          </div>

            <div className="mt-20 px-4 sm:px-6">
              <div className="mx-auto max-w-7xl">
                <Image
                  src={mockup3}
                  alt="Trite Merchant Terminal"
                  className="w-full h-auto"
                />
              </div>
          </div>
        </div>

        <div className="bg-[#f0f2f5] border-y border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
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
          </div>
        </div>

        <div className="relative -mt-16 overflow-hidden rounded-t-[3.5rem] bg-gradient-to-r from-[#01040a] via-[#0a1120] to-[#01040a] py-24 sm:py-32 border-t border-white/10">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-500/[0.08] blur-[120px]" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-indigo-500/[0.05] blur-[120px]" />
            
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
              <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <div className="max-w-xl">
                  <div className="text-sm font-semibold uppercase tracking-wider text-[color:var(--trite-lime-strong)]">
                    Institutional Oversight
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Comprehensive Financial Analytics
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">
                    Gain a competitive edge with deep insights into your business performance. Track Total Revenue, Average Order Value, Conversion Rates, and Payment Method Mix in real-time.
                  </p>
                  
                  <div className="mt-8 space-y-6">
                    {[
                      { title: "Revenue Insights", desc: "Deep dive into your daily, weekly, and monthly growth patterns with advanced trend analysis." },
                      { title: "Customer Behavior", desc: "Understand spending habits and lifetime value across different regions and demographics." },
                      { title: "Conversion Optimization", desc: "Identify bottlenecks in your payment flows and improve success rates with granular telemetry." },
                      { title: "Method Mix", desc: "Real-time breakdown of Credit Cards, Digital Wallets, and Bank Transfers to optimize your strategy." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 group/item">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--trite-lime-strong)]/10 text-[color:var(--trite-lime-strong)] border border-[color:var(--trite-lime-strong)]/20 transition-colors group-hover/item:bg-[color:var(--trite-lime-strong)]/20">
                          <CheckCircleIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-white">{item.title}</div>
                          <div className="mt-1 text-sm text-white/50">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative group flex items-center justify-center lg:justify-end">
                  <Image
                    src={mockup6}
                    alt="Comprehensive financial analytics preview"
                    className="w-full h-auto drop-shadow-[0_35px_60px_rgba(0,0,0,0.8)] transition duration-700 group-hover:scale-[1.02] group-hover:drop-shadow-[0_35px_60px_rgba(255,255,255,0.05)]"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-b from-black via-[#0a0e1a] to-black py-24 border-y border-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Infrastructure for the <span className="text-[color:var(--trite-lime-strong)]">new economy.</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {/* Card 1 */}
              <div className="group relative aspect-[3/4.2] overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/10 transition-all duration-500 hover:border-white/30 hover:bg-white/[0.02]">
                <Image 
                  src={stablecoin3d} 
                  alt="Stablecoin Balances"
                  fill 
                  className="object-cover transition duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-transparent" />
                
                <div className="absolute inset-x-0 top-0 p-10">
                  <h3 className="text-2xl font-semibold text-white leading-tight">Stablecoin Balances & <br/>Instant Settlements</h3>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <p className="text-sm leading-6 text-white/60">View institutional balances in USDT, track settlement IDs, and execute withdrawals with zero hidden fees.</p>
                  <div className="mt-6 flex justify-end">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white border border-white/10 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <ArrowRight className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative aspect-[3/4.2] overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/10 transition-all duration-500 hover:border-white/30 hover:bg-white/[0.02]">
                <Image 
                  src={kyc3d} 
                  alt="Built-in KYC"
                  fill 
                  className="object-cover transition duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-transparent" />
                
                <div className="absolute inset-x-0 top-0 p-10">
                  <h3 className="text-2xl font-semibold text-white leading-tight">Built-in Customer & <br/>KYC Management</h3>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <p className="text-sm leading-6 text-white/60">Manage customer relationships, track spending patterns, and monitor real-time verification statuses.</p>
                  <div className="mt-6 flex justify-end">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white border border-white/10 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <ArrowRight className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative aspect-[3/4.2] overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/10 transition-all duration-500 hover:border-white/30 hover:bg-white/[0.02]">
                <Image 
                  src={omnichannel3d} 
                  alt="Omnichannel Acceptance"
                  fill 
                  className="object-cover transition duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-transparent" />
                
                <div className="absolute inset-x-0 top-0 p-10">
                  <h3 className="text-2xl font-semibold text-white leading-tight">Omnichannel <br/>Acceptance</h3>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <p className="text-sm leading-6 text-white/60">Accept Web3 wallets, regional Mobile Money (MTN, Telcel), and traditional cards seamlessly.</p>
                  <div className="mt-6 flex justify-end">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white border border-white/10 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <ArrowRight className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Lifecycle Section */}
        <div className="relative -mt-16 overflow-hidden rounded-t-[3.5rem] border-t border-white/10 bg-gradient-to-l from-[#0a0e1a] to-black py-24 border-b border-white/5">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 h-[600px] w-[600px] rounded-full bg-blue-500/[0.15] blur-[160px] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#1f2937] to-transparent pointer-events-none" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="text-sm font-semibold uppercase tracking-wider text-[color:var(--trite-lime-strong)]">
                Transaction Lifecycle
              </div>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                High-Velocity <span className="text-[color:var(--trite-lime-strong)]">Global Settlements.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-white/60">
                Track every transaction with granular telemetry. Our real-time ledger provides institutional-grade visibility into your global liquidity flows across all markets.
              </p>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <Image 
                src={mockup7} 
                alt="Trite Transaction Lifecycle"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Execution Speed", value: "< 2s", desc: "Average settlement time across global stablecoin rails." },
                { label: "Market Success", value: "99.9%", desc: "Reliability rate for high-volume merchant processing." },
                { label: "API Latency", value: "45ms", desc: "Global average response time for our unified payment API." }
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.03] p-6 border border-white/5">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
                  <div className="mt-2 text-3xl font-bold text-[color:var(--trite-lime-strong)]">{stat.value}</div>
                  <div className="mt-2 text-sm text-white/50">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative -mt-16 overflow-hidden rounded-t-[3.5rem] border-t border-white/10 bg-gradient-to-r from-[#0a0e1a] to-black py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-[color:var(--trite-ink)] px-6 py-24 sm:py-32 text-white sm:px-10">
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
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
