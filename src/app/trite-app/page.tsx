"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Zap,
  BarChart3,
  Receipt,
  Users,
  Wallet,
  Building2,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Sparkles,
  SmartphoneNfc,
  Layers,
  FileSpreadsheet,
  KeyRound,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function TriteAppPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "transactions" | "settlements" | "customers" | "security">("analytics");

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("app-features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#22c55e] selection:text-white">
      <Header transparent={true} />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[550px] sm:min-h-[650px] lg:min-h-screen w-full shrink-0 overflow-visible z-0">
        {/* Blurred background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/app-bg3.jpg"
            alt="Trite App background"
            className="w-full h-full object-cover object-center scale-105"
            style={{ filter: 'blur(6px)' }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Hero content — centered column: text on top, image below */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-44 lg:pt-48 pb-0 flex flex-col items-center text-center">

          {/* Text + CTAs */}
          <div className="space-y-6 w-full">
            <div>
              <h1 className="hero-heading text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl sm:font-extrabold leading-[1.1] sm:leading-[1.08]">
                Manage Your Business with ease with Trite App
              </h1>
            </div>
            <p className="hero-subtext text-base sm:text-xl leading-relaxed text-white/80 sm:text-white/90 max-w-xl mx-auto">
              Manage products, sales, invoicing and track the performance of your business in real time.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#download"
              className="hero-cta-btn-primary inline-flex items-center justify-center gap-2 h-12 px-7 sm:px-8 rounded-full bg-[#22c55e] text-white text-sm font-extrabold uppercase tracking-wider shadow-lg hover:bg-[#16a34a] transition-all duration-300 hover:-translate-y-0.5"
            >
              Download App
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              onClick={scrollToFeatures}
              className="hero-cta-btn-secondary inline-flex items-center justify-center gap-2 h-12 px-7 sm:px-8 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-extrabold uppercase tracking-wider shadow-lg border border-white/30 hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Find Out More
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* App mockup — centered below CTAs, bottom overflows into ribbon section */}
          <div className="mt-6 sm:mt-8" style={{ marginBottom: '-320px' }}>
            <img
              src="/images/trite-app-image.png"
              alt="Trite App mockup"
              className="w-[280px] sm:w-[360px] lg:w-[440px] h-auto object-contain drop-shadow-2xl select-none pointer-events-none mx-auto"
            />
          </div>

        </div>
      </section>

      {/* ── HIGHLIGHT BADGES RIBBON ── */}
      <section className="relative bg-slate-950 border-y border-white/10 py-6 pt-80 sm:pt-72 lg:pt-36 text-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-[#22c55e]">99.99%</span>
              <span className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Gateway Uptime</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">Instant</span>
              <span className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Mobile Money Payouts</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-[#22c55e]">Multi-Rail</span>
              <span className="text-xs sm:text-sm text-slate-400 font-medium mt-1">USDC / USDT Stablecoins</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">Bank-Grade</span>
              <span className="text-xs sm:text-sm text-slate-400 font-medium mt-1">End-to-End Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN FEATURES SECTION ── */}
      <section id="app-features" className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-xs font-extrabold uppercase tracking-wider mb-4 border border-[#22c55e]/20">
              <Sparkles className="w-4 h-4" />
              Institutional Merchant Power in Your Pocket
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Designed for High-Velocity Business Operations
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              The Trite App condenses full merchant portal features into a sleek mobile interface. Track global volume, issue invoices, settle to Mobile Money, and manage stablecoins instantly.
            </p>
          </div>

          {/* Feature Navigation Tabs */}
          <div className="flex justify-center mb-12 overflow-x-auto pb-2 scrollbar-none">
            <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-2 border border-slate-300/60">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === "analytics"
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Live Analytics
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === "transactions"
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
                }`}
              >
                <Receipt className="w-4 h-4" />
                Transactions & Ledger
              </button>
              <button
                onClick={() => setActiveTab("settlements")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === "settlements"
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
                }`}
              >
                <Zap className="w-4 h-4" />
                Mobile Payouts & FX
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === "customers"
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
                }`}
              >
                <Users className="w-4 h-4" />
                Customers & Invoices
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === "security"
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/50"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Security & API Keys
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80">
            {activeTab === "analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-[#22c55e] text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" /> Institutional Revenue Telemetry
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                    Real-Time Business Performance & Multi-Period Metrics
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Gain immediate visibility into your store’s financial health. The Trite App presents live daily volume, withdrawable GHS balances, pending settlements, and revenue charts mapped across Day, Week, Month, and Year periods.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Live Gateway Health Monitor:</strong> Instant operational telemetry to ensure zero missed customer checkouts.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Method Mix Analytics:</strong> Deep dive into revenue channels across Credit Cards, Digital Wallets, Mobile Money, and Stablecoins.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Average Order Value (AOV) & Conversion Rates:</strong> Track customer behavior and checkout completion performance in real time.</span>
                    </li>
                  </ul>
                </div>

                {/* Dashboard Graphic Card */}
                <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Merchant Balance</p>
                      <h4 className="text-3xl font-black text-white mt-1">GH₵ 128,450.00</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 text-xs font-bold">
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-slate-400 font-medium">Daily Volume</p>
                      <p className="text-xl font-bold text-white mt-1">GH₵ 24,180.50</p>
                      <span className="text-xs text-[#22c55e] font-semibold inline-flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3" /> +14.2% vs yesterday
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-slate-400 font-medium">Total Transactions</p>
                      <p className="text-xl font-bold text-white mt-1">1,482</p>
                      <span className="text-xs text-[#22c55e] font-semibold inline-flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3" /> 98.4% success rate
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Revenue Trend (7-Day)</span>
                      <span className="text-xs text-[#22c55e] font-bold">Weekly Peak: GH₵ 45k</span>
                    </div>
                    {/* Simulated Chart Bars */}
                    <div className="flex items-end justify-between gap-2 h-24 pt-4">
                      {[{ label: 'Mon', height: '40%' }, { label: 'Tue', height: '65%' }, { label: 'Wed', height: '50%' }, { label: 'Thu', height: '85%' }, { label: 'Fri', height: '70%' }, { label: 'Sat', height: '95%' }, { label: 'Sun', height: '80%' }].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-[#22c55e]/30 hover:bg-[#22c55e] transition-all duration-300 rounded-t" style={{ height: bar.height }} />
                          <span className="text-[10px] text-slate-400 font-medium">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-[#22c55e] text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <Receipt className="w-3.5 h-3.5" /> High-Velocity Ledger
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                    Live Transaction Tracking & Instant Receipts
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Never lose track of a payment. The Trite App provides live transaction streaming with status filters, reference search, date ranges (7d, 30d, 90d, all), and digital receipt downloads directly from your smartphone.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Granular Status Filters:</strong> Easily view `SETTLED`, `AUTHORIZED`, `PENDING`, `FAILED`, and `CANCELLED` transactions.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Multi-Rail Channel breakdown:</strong> Separate breakdown for Fiat Card payments, Mobile Money, and Stablecoins.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Instant Digital Receipts:</strong> Share official settlement receipts with clients via SMS, WhatsApp, or Email.</span>
                    </li>
                  </ul>
                </div>

                {/* Simulated Transaction Ledger UI */}
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h4 className="font-bold text-sm text-white">Recent Transactions</h4>
                    <span className="text-xs text-slate-400">Live Stream</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: "TX-89210", method: "MTN Mobile Money", status: "SETTLED", amount: "GH₵ 1,200.00", time: "2 mins ago" },
                      { id: "TX-89209", method: "USDC (Base Rail)", status: "SETTLED", amount: "$350.00", time: "14 mins ago" },
                      { id: "TX-89208", method: "Visa / Mastercard", status: "AUTHORIZED", amount: "GH₵ 4,850.00", time: "42 mins ago" },
                      { id: "TX-89207", method: "Telecel Cash", status: "SETTLED", amount: "GH₵ 650.00", time: "1 hour ago" },
                    ].map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#22c55e]/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{tx.id}</p>
                            <p className="text-[11px] text-slate-400">{tx.method} • {tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">{tx.amount}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            tx.status === "SETTLED" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settlements" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-[#22c55e] text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <Zap className="w-3.5 h-3.5" /> High-Velocity Settlement Engine
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                    Instant Mobile Money & Bank Payouts
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Convert international revenue directly into local Ghanaian Pesewas or stablecoins. Set up automated settlement schedules, minimum payout thresholds, and receive money in minutes.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Ghanaian Mobile Money Integration:</strong> Instant payouts to MTN MoMo, Telecel Cash, and AirtelTigo.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Automated Payout Rules:</strong> Configure auto-payout timing (e.g. 17:00 GMT daily) with customizable threshold limits.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Stablecoin Liquidity:</strong> Hold USDC/USDT directly or trigger instant off-ramp conversions to local bank accounts.</span>
                    </li>
                  </ul>
                </div>

                {/* Simulated Payout Graphic */}
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h4 className="font-bold text-sm text-white">Settlement & Payout Hub</h4>
                    <span className="px-2.5 py-1 rounded bg-[#22c55e] text-white text-[11px] font-black">AUTO-PAYOUT ON</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Target Account</span>
                      <span className="text-xs font-bold text-white">MTN Mobile Money (*8921)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Daily Payout Time</span>
                      <span className="text-xs font-bold text-[#22c55e]">17:00 GMT (Daily)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Gross Expected Payout</span>
                      <span className="text-sm font-black text-white">GH₵ 18,500.00</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supported Payout Channels</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                        <Smartphone className="w-5 h-5 text-[#22c55e] mx-auto mb-1" />
                        <span className="text-[11px] font-bold block text-white">MTN MoMo</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                        <SmartphoneNfc className="w-5 h-5 text-[#22c55e] mx-auto mb-1" />
                        <span className="text-[11px] font-bold block text-white">Telecel Cash</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                        <Building2 className="w-5 h-5 text-[#22c55e] mx-auto mb-1" />
                        <span className="text-[11px] font-bold block text-white">GH Banks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-[#22c55e] text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <Users className="w-3.5 h-3.5" /> Customer Management & Invoicing
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                    Client CRM, Sales & Digital Invoicing
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Build lasting relationships with your payers. Track client purchase histories, customer spending limits, verification statuses, and issue professional payment links or invoices on the go.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Customer Spending Profiles:</strong> Track individual client spending habits, total lifetime value, and payment method preferences.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Instant Digital Invoicing:</strong> Generate branded invoices with custom payment links for cards, mobile money, and crypto.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>KYC Verification Tracking:</strong> Monitor buyer verification tiers (Standard, Premium, Institutional Merchant).</span>
                    </li>
                  </ul>
                </div>

                {/* Customer Directory Mockup */}
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h4 className="font-bold text-sm text-white">Merchant Customer Directory</h4>
                    <span className="text-xs text-[#22c55e] font-bold">142 Active Clients</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Akua Mensah Enterprise", tier: "Verified Merchant", spent: "GH₵ 42,800", status: "Active" },
                      { name: "Kofi Bio Trading Co.", tier: "Premium Merchant", spent: "GH₵ 128,400", status: "Active" },
                      { name: "Kwame & Sons Logistics", tier: "Standard", spent: "GH₵ 18,900", status: "Verified" },
                    ].map((cust, i) => (
                      <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-black text-sm">
                            {cust.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{cust.name}</p>
                            <p className="text-[11px] text-slate-400">{cust.tier}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#22c55e]">{cust.spent}</p>
                          <p className="text-[10px] text-slate-400">{cust.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-[#22c55e] text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Institutional Security Guardrails
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                    Bank-Grade Security & API Key Center
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Security is built into every layer of the Trite App. Manage multi-factor authentication (MFA), audit real-time admin sessions, and provision active API keys for web store integration.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Mandatory Multi-Factor Authentication:</strong> Time-based OTP & biometric lock protection on every mobile transaction.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>API Key Control Center:</strong> Generate, cycle, or revoke live and sandbox API keys directly from your phone.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span><strong>Anomaly Detection & Session Logs:</strong> Real-time security telemetry watching for unauthorized device attempts.</span>
                    </li>
                  </ul>
                </div>

                {/* Security & API Key Card */}
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h4 className="font-bold text-sm text-white">API Key & Security Center</h4>
                    <span className="flex items-center gap-1.5 text-xs text-[#22c55e] font-bold">
                      <Lock className="w-3.5 h-3.5" /> MFA ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-[#22c55e]" /> Production API Key
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">ACTIVE</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400">trite_live_9f82a173...b902</p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Last Login Security Audit
                        </span>
                        <span className="text-[10px] text-slate-400"> Accra, GH • iOS 17.5</span>
                      </div>
                      <p className="text-xs text-slate-400">Biometric & MFA verified successfully.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── EXPLANATORY FEATURE GRID ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Everything You Need to Scale Across Africa & Beyond
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Built specifically to overcome payment fragmentation in emerging markets through integrated stablecoin liquidity and local settlement rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#22c55e]/50 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center mb-6 group-hover:bg-[#22c55e] group-hover:text-white transition-colors duration-300">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mobile Money First</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Accept and disburse payments across MTN Mobile Money, Telecel Cash, and AirtelTigo with zero friction and sub-minute finality.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#22c55e]/50 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center mb-6 group-hover:bg-[#22c55e] group-hover:text-white transition-colors duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Stablecoin Settlement</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bypass traditional banking delays. Accept USDC & USDT payments on Base, Solana, and Ethereum rails with instant conversion to local fiat.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#22c55e]/50 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center mb-6 group-hover:bg-[#22c55e] group-hover:text-white transition-colors duration-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bank-Grade Protection</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Equipped with hardware security module (HSM) encryption, automated anomaly monitoring, and full compliance auditing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD CTA SECTION ── */}
      <section id="download" className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e]/10 via-transparent to-[#22c55e]/5" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs font-bold uppercase tracking-wider border border-[#22c55e]/40">
                Ready to Experience Trite Mobile?
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Take Control of Your Payments Today
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Download the Trite App on iOS and Android or access your institutional merchant dashboard directly online. Experience frictionless global settlement tailored for the African continent.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/merchant"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#22c55e] text-white font-extrabold text-sm uppercase tracking-wider hover:bg-[#16a34a] shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Launch Merchant Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-white/10 text-white font-extrabold text-sm uppercase tracking-wider hover:bg-white hover:text-black border border-white/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* App Preview Image Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl max-w-sm w-full">
                <img
                  src="/images/trite-app-image.png"
                  alt="Trite Mobile App Showcase"
                  className="w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
