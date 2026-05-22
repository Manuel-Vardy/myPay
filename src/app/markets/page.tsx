"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Globe2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Coins,
  ArrowRight
} from "lucide-react";

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#92bd30]/30 selection:text-black">
      <Header transparent={false} />

      <main className="py-16 sm:py-24">
        {/* HERO HEADER */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-black text-white px-3 py-1 text-xs font-bold">
              MARKETS
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl leading-tight">
              Market - Expanding the Future of Payments with Trite
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              At TRITE we are redefining how businesses, merchants, institutions, and individuals move money across both digital and traditional financial ecosystems. Our platform is uniquely designed to support stablecoin transactions and traditional cash payments within one secure, scalable, and intelligent infrastructure.
            </p>
          </div>
        </div>

        {/* COMPLIANCE & LIQUIDITY ROUTING LAYER (KNOWLEDGE EXPANSION) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="border border-black/[0.06] rounded-3xl p-8 sm:p-12 bg-gray-50/50 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-black">Compliance Center & Liquidity Routing</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                By integrating compliant identification pipelines with Sumsub & Appruve, Trite allows secure and seamless transfers across regional compliance jurisdictions.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pt-6 border-t border-black/[0.06]">
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase">Verification Tiers</div>
                <ul className="text-xs text-black font-bold space-y-1.5">
                  <li className="flex items-center gap-1.5 text-gray-500"><CheckCircle2 className="h-3.5 w-3.5 text-[#92bd30]" /> Tier 1: Standard (up to $5,000/mo)</li>
                  <li className="flex items-center gap-1.5 text-gray-500"><CheckCircle2 className="h-3.5 w-3.5 text-[#92bd30]" /> Tier 2: Premium (up to $50,000/mo)</li>
                  <li className="flex items-center gap-1.5 text-gray-500"><CheckCircle2 className="h-3.5 w-3.5 text-[#92bd30]" /> Tier 3: Merchant Unlimited (Sumsub Verified)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase">Settlement Speeds</div>
                <ul className="text-xs text-black font-bold space-y-1.5">
                  <li className="flex items-center gap-1.5 text-gray-500">&bull; Stablecoins (USDT/USDC): Instant 24/7</li>
                  <li className="flex items-center gap-1.5 text-gray-500">&bull; Mobile Money (Ghana): &lt; 5 minutes</li>
                  <li className="flex items-center gap-1.5 text-gray-500">&bull; International Bank Wire: Same-day</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase">Settlement Liquidity</div>
                <ul className="text-xs text-black font-bold space-y-1.5">
                  <li className="flex items-center gap-1.5 text-gray-500">&bull; Low slippage stablecoin-to-fiat engines</li>
                  <li className="flex items-center gap-1.5 text-gray-500">&bull; Direct Bank integrations (ACH/SWIFT)</li>
                  <li className="flex items-center gap-1.5 text-gray-500">&bull; Multi-party escrow protection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 6 CORE MARKETS LISTINGS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="border-b border-black/[0.06] pb-6 mb-12">
            <h2 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">Deep Dive into Markets</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Expanding traditional and digital transaction borders</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* a. Global Digital Payments */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 shadow-sm hover:shadow transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                a
              </div>
              <h3 className="text-lg font-bold text-black">Global Digital Payments</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Infrastructure rails</p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite positions itself as a next-generation payment infrastructure provider capable of serving all your payment needs.
              </p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                By integrating stablecoin support alongside fiat payment rails, Trite enables businesses to transact globally without being limited by currency barriers, banking delays, or high remittance costs.
              </p>
            </div>

            {/* b. Traditional Cash & Banking */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 shadow-sm hover:shadow transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                b
              </div>
              <h3 className="text-lg font-bold text-black">Traditional Cash & Banking</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Financial Rail Integration</p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite maintains strong compatibility with conventional financial systems, allowing customers to transact using:
              </p>
              <ul className="grid grid-cols-2 gap-1.5 text-xs text-black font-bold">
                <li className="flex items-center gap-1.5">&bull; Mobile money services</li>
                <li className="flex items-center gap-1.5">&bull; Bank transfers</li>
                <li className="flex items-center gap-1.5">&bull; Debit and credit cards</li>
                <li className="flex items-center gap-1.5">&bull; USSD Settlements</li>
                <li className="flex items-center gap-1.5">&bull; POS terminals</li>
                <li className="flex items-center gap-1.5">&bull; Local currency settlements</li>
              </ul>
              <p className="text-sm leading-relaxed text-gray-500 font-medium pt-1">
                Trite ensures that users can easily transition between digital assets and traditional money without friction.
              </p>
            </div>

            {/* c. Stablecoin Payment */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 shadow-sm hover:shadow transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                c
              </div>
              <h3 className="text-lg font-bold text-black">Stablecoin Payment</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Blockchain Rails</p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite PSP supports stablecoin-powered transactions to help businesses and users’ access:
              </p>
              <ul className="space-y-1 text-xs text-black font-bold">
                <li className="flex items-center gap-1.5">&bull; Real-time settlements</li>
                <li className="flex items-center gap-1.5">&bull; 24/7 transaction capabilities</li>
                <li className="flex items-center gap-1.5">&bull; Borderless payments</li>
                <li className="flex items-center gap-1.5">&bull; Blockchain transparency</li>
                <li className="flex items-center gap-1.5">&bull; Reduced intermediary dependency</li>
              </ul>
              <p className="text-sm leading-relaxed text-gray-500 font-medium pt-1">
                Trite enables businesses to seamlessly accept USDT/USDC while maintaining compliance, security, and operational efficiency.
              </p>
            </div>

            {/* d. E-Commerce & Merchant Solutions */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 shadow-sm hover:shadow transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                d
              </div>
              <h3 className="text-lg font-bold text-black">E-Commerce & Merchant Solutions</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Merchant suite</p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                We empower merchants with a unified payment ecosystem that supports both stablecoins and fiat currencies.
              </p>
            </div>

            {/* e. Cross-Border Remittance */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 shadow-sm hover:shadow transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                e
              </div>
              <h3 className="text-lg font-bold text-black">Cross-Border Remittance</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Liquidity settlements</p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Cross-border payments remain one of the largest and fastest-growing financial sectors. Traditional remittance systems often involve delays, high fees and limited transparency.
              </p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite PSP solves these challenges through blockchain-enabled settlement systems combined with traditional financial connectivity.
              </p>
            </div>

            {/* f. Enterprise & Institutional Solutions */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 shadow-sm hover:shadow transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                f
              </div>
              <h3 className="text-lg font-bold text-black">Enterprise & Institutional Solutions</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enterprise scale</p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Large organizations require scalable, compliant, and efficient payment infrastructure capable of supporting high transaction volumes and multiple currencies.
              </p>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite PSP delivers enterprise-grade solutions for:
              </p>
              <ul className="grid grid-cols-2 gap-1 text-xs text-black font-bold">
                <li>&bull; Corporations</li>
                <li>&bull; Fintech companies</li>
                <li>&bull; NGOs</li>
                <li>&bull; Government institutions</li>
                <li>&bull; Payment aggregators</li>
                <li>&bull; International businesses</li>
              </ul>
            </div>

          </div>
        </div>

        {/* VISUAL LAYOUT MOCKUP FOR LIQUIDITY ARCHITECTURE */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="border border-black/[0.06] rounded-3xl overflow-hidden bg-white p-6 shadow-sm">
            <div className="text-center pb-6 border-b border-black/[0.06] mb-8">
              <h4 className="font-extrabold text-xl text-black">Stablecoin Settlements & KYC Infrastructure</h4>
              <p className="text-sm text-gray-500">Real-time ledger flow mapping traditional payments directly to global rails</p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/mockup7.png"
                alt="Trite Transactions Architecture"
                width={900}
                height={450}
                className="w-full max-w-4xl h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-black rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Expand Your Market Operations Globally</h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-medium">
              Join leading global enterprises scaling cross-border liquidity and digital payouts with Trite PSP.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/get-started" 
                className="px-6 py-3 font-semibold bg-[#92bd30] text-black rounded-full hover:bg-[#81a72a] transition-all flex items-center gap-2"
              >
                Contact Sales <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
