"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Smartphone, 
  Coins, 
  Code, 
  TrendingUp, 
  Repeat, 
  ShoppingBag,
  Shield,
  Check,
  ArrowRight,
  Terminal,
  Key
} from "lucide-react";

export default function BusinessesPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#92bd30]/30 selection:text-black">
      <Header transparent={false} />

      <main className="py-16 sm:py-24">
        
        {/* HERO HEADER */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-black/[0.06]">
            <div className="space-y-4 max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-[#92bd30]/10 px-3 py-1 text-xs font-bold text-[#81a72a] border border-[#92bd30]/20">
                BUSINESS SOLUTIONS
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl leading-tight">
                Business Solutions - Powering Modern Commerce with Trite.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed font-medium">
                Trite is more than a payment gateway - it is a complete financial operations platform designed for modern business growth. Through advanced stablecoin integration, fiat payment support, API connectivity, merchant tools, and financial automation features, businesses can streamline transactions while expanding into global markets.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-3 shrink-0">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#92bd30] px-6 text-sm font-semibold text-black hover:bg-[#81a72a] shadow transition-all duration-200"
                href="/demo"
              >
                Request a Demo
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white px-6 text-sm font-semibold text-black hover:bg-gray-50 transition-all duration-200"
                href="/contact-sales"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>

        {/* DEVELOPER QUICK-START (KNOWLEDGE EXPANSION) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-black text-white p-8 sm:p-12 rounded-3xl">
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#92bd30]">
                  <Terminal className="h-3.5 w-3.5" /> Developer Quick Start
                </span>
                <h3 className="text-2xl font-extrabold text-white">Integrate in under 10 lines of code</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Use our RESTful API endpoints or custom Webhooks to initialize settlements, monitor ledger transactions, and register customer accounts dynamically. All endpoints are fully secured with header signatures.
                </p>
              </div>
              <div className="space-y-2 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Key className="h-4 w-4 text-[#92bd30]" /> API Sandbox Mode available
                </div>
                <div className="text-xs text-gray-500 font-medium">Webhooks support 256-bit signature validation.</div>
              </div>
            </div>

            {/* Code Block UI */}
            <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">POST /v1/settlements</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#92bd30]" />
              </div>
              <pre className="space-y-1">
                <code>{`curl -X POST https://api.trite.co/v1/settlements \\
  -H "Authorization: Bearer trite_live_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1250.00,
    "currency": "USD",
    "payout_method": "mobile_money",
    "recipient_wallet": "233555987123",
    "network": "MTN_GHANA"
  }'`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* 6 BUSINESS SUB-SECTIONS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="border-b border-black/[0.06] pb-6 mb-12">
            <h2 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">Comprehensive Business Features</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Operational support tailored for scale and global liquidity</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Merchant Payment Gateway */}
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92bd30]/15 text-black border border-[#92bd30]/20">
                <Smartphone className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-black">Merchant Payment Gateway</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite provides businesses with a secure payment gateway that supports:
              </p>
              <ul className="text-xs text-black font-bold space-y-1">
                <li>&bull; Mobile money integration</li>
                <li>&bull; Credit and debit cards</li>
                <li>&bull; Stablecoin payments</li>
                <li>&bull; Bank transfers</li>
                <li>&bull; Multi-currency transactions</li>
              </ul>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Integrate the payment gateway into your websites, mobile apps, online stores, and enterprise systems to start receiving payments.
              </p>
            </div>

            {/* Business Wallet Infrastructure */}
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92bd30]/15 text-black border border-[#92bd30]/20">
                <Coins className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-black">Business Wallet Infrastructure</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                We offer secure digital wallets designed for business operations.
              </p>
              <div className="border-t border-black/[0.06] pt-3 space-y-2">
                <div className="text-xs font-extrabold text-black uppercase tracking-wider">Wallet Capabilities</div>
                <ul className="grid grid-cols-2 gap-1.5 text-xs text-black font-bold">
                  <li>&bull; Multi-currency storage</li>
                  <li>&bull; Stablecoin asset management</li>
                  <li>&bull; Instant transfers</li>
                  <li>&bull; Treasury management</li>
                  <li>&bull; Transaction monitoring</li>
                  <li>&bull; Secure asset custody</li>
                </ul>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Businesses can manage both crypto-based and traditional financial assets within one unified dashboard.
              </p>
            </div>

            {/* API & Developer Solutions */}
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92bd30]/15 text-black border border-[#92bd30]/20">
                <Code className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-black">API & Developer Solutions</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Our robust APIs allow developers and enterprises to integrate our payment infrastructure into their own systems.
              </p>
              <div className="border-t border-black/[0.06] pt-3 space-y-2">
                <div className="text-xs font-extrabold text-black uppercase tracking-wider">API Solutions Include</div>
                <ul className="grid grid-cols-2 gap-1 text-xs text-black font-bold">
                  <li>&bull; Payment processing APIs</li>
                  <li>&bull; Wallet APIs</li>
                  <li>&bull; Merchant checkout APIs</li>
                  <li>&bull; Bulk payout APIs</li>
                  <li>&bull; Currency conversion APIs</li>
                  <li>&bull; Subscription billing APIs</li>
                </ul>
              </div>
            </div>

            {/* Business Analytics & Reporting */}
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92bd30]/15 text-black border border-[#92bd30]/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-black">Business Analytics & Reporting</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Data-driven insights are critical for business growth. Trite PSP includes advanced reporting and analytics tools that help businesses monitor performance and optimize financial operations.
              </p>
              <div className="border-t border-black/[0.06] pt-3 space-y-2">
                <div className="text-xs font-extrabold text-black uppercase tracking-wider">Analytics Features</div>
                <ul className="text-xs text-black font-bold space-y-1">
                  <li>&bull; Transaction tracking</li>
                  <li>&bull; Revenue monitoring</li>
                  <li>&bull; Payment history reports</li>
                  <li>&bull; Financial summaries</li>
                  <li>&bull; Settlement analysis</li>
                  <li>&bull; Customer payment insights</li>
                </ul>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Businesses gain real-time visibility into payment activity across all channels.
              </p>
            </div>

            {/* Subscription & Recurring Billing */}
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92bd30]/15 text-black border border-[#92bd30]/20">
                <Repeat className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-black">Subscription & Recurring Billing</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite supports automated recurring payment systems for subscription-based businesses.
              </p>
              <div className="border-t border-black/[0.06] pt-3 space-y-2">
                <div className="text-xs font-extrabold text-black uppercase tracking-wider">Ideal For</div>
                <ul className="grid grid-cols-2 gap-1 text-xs text-black font-bold">
                  <li>&bull; SaaS platforms</li>
                  <li>&bull; Streaming services</li>
                  <li>&bull; Membership platforms</li>
                  <li>&bull; Digital service providers</li>
                  <li>&bull; E-learning platforms</li>
                </ul>
              </div>
            </div>

            {/* E-Commerce Integration */}
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#92bd30]/15 text-black border border-[#92bd30]/20">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-black">E-Commerce Integration</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Trite seamlessly integrates with modern e-commerce ecosystems.
              </p>
              <div className="border-t border-black/[0.06] pt-3 space-y-2">
                <div className="text-xs font-extrabold text-black uppercase tracking-wider">Supported Business Models</div>
                <ul className="text-xs text-black font-bold space-y-1">
                  <li>&bull; Online stores</li>
                  <li>&bull; Digital marketplaces</li>
                  <li>&bull; Mobile commerce</li>
                  <li>&bull; Social commerce</li>
                  <li>&bull; On-demand services</li>
                </ul>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                Businesses can deliver smoother customer payment experiences while expanding payment flexibility.
              </p>
            </div>

          </div>
        </div>

        {/* ENTERPRISE SECURITY & COMPLIANCE */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="rounded-2xl border border-black/[0.06] bg-black text-white p-8 lg:p-12 space-y-6">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center rounded-full bg-[#92bd30]/20 px-3 py-1 text-xs font-bold text-[#92bd30]">
                Enterprise Security & Compliance
              </span>
              <h3 className="text-2xl font-extrabold text-white">Security is at the core of Trite PSP’s infrastructure.</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6 border-t border-white/10">
              {[
                { title: "End-to-end encryption", desc: "Data encryption in transit and at rest." },
                { title: "Secure wallet protection", desc: "Custodial and multi-sig storage layers." },
                { title: "Fraud detection systems", desc: "AI telemetry flags anomalous payments." },
                { title: "AML/KYC compliance", desc: "Integrated Sumsub identity verification workflows." },
                { title: "Risk management protocols", desc: "Granular risk auditing controls." },
                { title: "Multi-layer authentication", desc: "MFA required for admin oversight." }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#92bd30]" />
                    {item.title}
                  </div>
                  <p className="text-xs text-gray-400 font-medium pl-6">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-300 font-medium">
              Our compliance-focused infrastructure helps businesses operate confidently within regulatory frameworks.
            </p>
          </div>
        </div>

        {/* INDUSTRIES WE SERVE */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="rounded-2xl border border-black/[0.06] bg-gray-50/50 p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-black">Industries We Serve</h3>
              <p className="text-sm text-gray-500 font-medium">
                Trite PSP is designed for businesses across multiple sectors including:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "E-commerce",
                "Fintech",
                "Logistics",
                "Real estate",
                "Gaming platforms",
                "Digital marketplaces",
                "SaaS businesses",
                "Retail chains",
                "International trade companies",
                "Financial institutions"
              ].map((item, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black border border-black/[0.06] shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium italic pt-2">
              Our scalable infrastructure adapts to businesses of all sizes - from startups to large enterprises.
            </p>
          </div>
        </div>

        {/* WHY CHOOSE TRITE PSP */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="pt-16 border-t border-black/[0.06] space-y-10">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">
                Why Businesses Choose Trite PSP
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Unified Financial Ecosystem",
                  desc: "One platform supporting both stablecoins and traditional payment systems."
                },
                {
                  title: "Faster Global Transactions",
                  desc: "Real-time transaction processing with reduced delays."
                },
                {
                  title: "Scalable Infrastructure",
                  desc: "Designed for businesses with growing operational demands."
                },
                {
                  title: "Reduced Costs",
                  desc: "Lower payment processing and cross-border transaction fees."
                },
                {
                  title: "Developer-Friendly APIs",
                  desc: "Flexible integration tools for custom business solutions."
                },
                {
                  title: "Enhanced Security",
                  desc: "Enterprise-grade protection and compliance systems."
                },
                {
                  title: "Future-Ready Technology",
                  desc: "Built to support blockchain innovation and evolving financial ecosystems."
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl border border-black/[0.06] bg-white p-6 space-y-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#92bd30]/20 text-[#81a72a]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <h4 className="font-bold text-black text-sm">{item.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VISUAL DASHBOARD MOCKUP */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="border border-black/[0.06] rounded-3xl overflow-hidden bg-white p-6 shadow-sm">
            <div className="text-center pb-6 border-b border-black/[0.06] mb-8">
              <h4 className="font-extrabold text-xl text-black">Integrated Institutional Portal</h4>
              <p className="text-sm text-gray-500">Full control over payment flows, analytics tracking, and automated stablecoin settlements</p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/mockup3.png"
                alt="Trite Merchant Dashboard Terminal"
                width={900}
                height={450}
                className="w-full max-w-4xl h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-[#92bd30] rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black">Connect your operations to the future of trade</h2>
            <p className="text-sm sm:text-base text-black/70 max-w-xl mx-auto font-medium">
              Start building your custom financial pipeline with our sandbox keys and robust documentation today.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/get-started" 
                className="px-6 py-3 font-semibold bg-black text-white rounded-full hover:bg-black/90 transition-all flex items-center gap-2"
              >
                Get API Keys <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
