"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Coins, 
  Code,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2
} from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#92bd30]/30 selection:text-black">
      <Header transparent={false} />

      <main className="py-16 sm:py-24">
        {/* HERO HEADER */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#92bd30]/10 px-3 py-1 text-xs font-bold text-[#81a72a] border border-[#92bd30]/20">
              PAYMENTS & SETTLEMENT
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl leading-tight">
              Get paid Faster, Anywhere, from Anyone.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Trite gives your business everything you need to collect payments - online, in-store, and across borders - without stress or technical complexity.
            </p>
            <div className="inline-block rounded-xl bg-gray-50 border border-black/[0.06] px-4 py-2.5 text-sm font-bold text-black">
              One integration, multiple payment options, zero headaches.
            </div>
          </div>
        </div>

        {/* CORE KNOWLEDGE EXPANSION - HOW SETTLEMENT WORKS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 bg-gray-50 border border-black/[0.06] p-8 sm:p-12 rounded-3xl">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/10 text-[#81a72a]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-extrabold text-black">Instant GHS Payouts</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Connect your checkout flow directly to mobile money systems in West Africa. Converts customer stablecoins or card payments into liquid Ghanaian Cedi (GHS) instantly.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/10 text-[#81a72a]">
                <Globe2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-extrabold text-black">Gas-Free Stablecoin Conversions</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Accept USDT or USDC without requiring gas fees from your end-users. We manage blockchain gas limits internally to deliver frictionless checkout experiences.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/10 text-[#81a72a]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-extrabold text-black">KYT / Compliance Safeguards</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Every digital asset settlement is scrutinized by our KYT (Know Your Transaction) systems, verifying wallet origins and blocking bad actors before funds reach your treasury.
              </p>
            </div>
          </div>
        </div>

        {/* GRID OF THE 7 MAIN PAYMENT RAILS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="border-b border-black/[0.06] pb-6 mb-12">
            <h2 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">Accept Multiple Payment Methods</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Our comprehensive payment rails are optimized for localized checkout flows</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Mobile Money */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-black">Mobile Money</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                In emerging markets and mobile-first economies, mobile money plays a critical role. Trite enables you to pay and get paid with Mobile Money.
              </p>
            </div>

            {/* USSD */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <span className="text-xs font-black font-mono">#123</span>
              </div>
              <h3 className="text-lg font-bold text-black">USSD</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                A single short code to collect all payments. Set up a custom menu to receive payments from all networks. All you need is one code for all payments.
              </p>
            </div>

            {/* Credit Card & Debit Card */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-black">Credit Card & Debit Card</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                We allow businesses to accept card payments from major card providers globally.
              </p>
            </div>

            {/* Invoice */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <span className="font-mono text-sm font-extrabold uppercase">INV</span>
              </div>
              <h3 className="text-lg font-bold text-black">Invoice</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                Generate secure payment links and digital invoices for your customers using Trite.
              </p>
            </div>

            {/* Bank Transfer */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-black">Bank Transfer</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                Businesses can accept direct bank payments through local and international banking networks.
              </p>
            </div>

            {/* Stablecoin Checkout Gateway */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-black">Stablecoin Checkout Gateway</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                Integrate a dedicated stablecoin checkout option into their websites and apps.
              </p>
            </div>

            {/* QR Code Stablecoin Payments */}
            <div className="group rounded-2xl border border-black/[0.06] bg-white p-8 transition-all hover:bg-gray-50 hover:border-black/10 hover:shadow-md lg:col-span-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92bd30]/15 text-black border border-[#92bd30]/20 mb-6">
                <span className="font-mono text-sm font-extrabold uppercase">QR</span>
              </div>
              <h3 className="text-lg font-bold text-black">QR Code Stablecoin Payments</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
                Trite PSP supports blockchain-enabled QR payment systems for fast and easy customer transactions.
              </p>
            </div>
          </div>
        </div>

        {/* INTEGRATION SUBSECTIONS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-gray-50 p-8 space-y-4">
              <h4 className="text-xl font-bold text-black">Integrate Online Check out</h4>
              <div className="space-y-2">
                <div className="text-sm font-bold text-black">Move your money to any bank account or mobile money wallet</div>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Easily transfer funds from your Trite account to any bank account or mobile money wallet. Enjoy quick, secure, and reliable transfers whenever you need them.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-gray-50 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-black">Accept payments online</h4>
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold border border-black/[0.06] text-black">
                  Add Trite to your website and accept payments
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-black/[0.06] flex items-center justify-between">
                <span className="text-sm font-extrabold text-black">Programmable APIs for Businesses.</span>
                <Code className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-black rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to deploy high-velocity payments?</h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-medium">
              Start collecting payments globally with stablecoin rails and local payment methods in under an hour.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/get-started" 
                className="px-6 py-3 font-semibold bg-[#92bd30] text-black rounded-full hover:bg-[#81a72a] transition-all flex items-center gap-2"
              >
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
