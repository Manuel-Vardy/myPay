"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Globe2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Coins,
  ArrowRight,
  Building2
} from "lucide-react";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black">
      <Header transparent={true} />

      <main>
        {/* HERO HEADER */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/market-women.jpg"
              alt="Markets Hero background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 flex justify-end w-full">
            <div className="max-w-3xl space-y-6 flex flex-col items-end text-right">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Expanding the Future <br /> of Payments with Trite
              </h1>
              <div className="h-px w-full bg-white/20 my-6"></div>
              <p className="max-w-2xl text-lg sm:text-xl text-white/90 leading-relaxed">
                At TRITE we are redefining how businesses, merchants, institutions, and individuals move money across both digital and traditional financial ecosystems. Our platform is uniquely designed to support stablecoin transactions and traditional cash payments within one secure, scalable, and intelligent infrastructure.
              </p>
            </div>
          </div>
        </section>



        {/* MARKET LISTINGS REDESIGN */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Overlapping Heading Card */}
          <div className="relative -mt-16 sm:-mt-20 mb-24 z-20">
            <div className="inline-block bg-white px-8 pt-10 pb-16 sm:px-12 sm:pt-12 sm:pb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
                MARKETS
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight mb-4 leading-tight">
                Deep Dive into Markets
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-xl leading-relaxed">
                Expanding traditional and digital transaction borders
              </p>
            </div>
          </div>

          {/* a. Global Digital Payments - Text Left, Globe Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-32 -mt-8">
            <div className="lg:col-span-6 space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-black leading-tight">Global Digital Payments</h3>
              <p className="text-sm font-bold text-[#22c55e] uppercase tracking-widest">Infrastructure rails</p>
              <div className="space-y-6">
                <p className="text-lg sm:text-xl leading-relaxed text-gray-600 font-medium">
                  Trite positions itself as a next-generation payment infrastructure provider capable of serving all your payment needs.
                </p>
                <p className="text-lg sm:text-xl leading-relaxed text-gray-600 font-medium">
                  By integrating stablecoin support alongside fiat payment rails, Trite enables businesses to transact globally without being limited by currency barriers, banking delays, or high remittance costs.
                </p>
              </div>
            </div>
            <div className="lg:col-span-6 relative h-[500px] sm:h-[700px] flex items-center justify-center">
              <div className="scale-125 sm:scale-150 transform-gpu">
                <Globe />
              </div>
            </div>
          </div>
        </div>

        {/* b. Traditional Cash & Banking - Full Width Section */}
        <section className="bg-[#fdfcf6] py-24 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
              <div className="lg:col-span-6 relative h-[400px] sm:h-[600px] flex items-center justify-center">
                <Image 
                  src="/images/ladies-on-cell4.png" 
                  alt="People on cell" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-3xl font-bold text-black">Traditional Cash & Banking</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Financial Rail Integration</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium">
                  Trite maintains strong compatibility with conventional financial systems, allowing customers to transact using:
                </p>
                <ul className="grid grid-cols-2 gap-4 text-sm text-black font-bold">
                  <li className="flex items-center gap-2">&bull; Mobile money services</li>
                  <li className="flex items-center gap-2">&bull; Bank transfers</li>
                  <li className="flex items-center gap-2">&bull; Debit and credit cards</li>
                  <li className="flex items-center gap-2">&bull; USSD Settlements</li>
                  <li className="flex items-center gap-2">&bull; POS terminals</li>
                  <li className="flex items-center gap-2">&bull; Local currency settlements</li>
                </ul>

                {/* Minimized Payment Logos */}
                <div className="flex flex-wrap items-center gap-12 pt-12">
                  {/* Card Payments */}
                  <div className="flex items-center gap-6">
                    <Image
                      src="/images/mastercard-logo.png"
                      alt="Mastercard"
                      width={64}
                      height={40}
                      className="h-11 w-auto object-contain"
                    />
                    <Image
                      src="/images/visa-logo.png"
                      alt="Visa"
                      width={72}
                      height={28}
                      className="h-9 w-auto object-contain"
                    />
                  </div>

                  {/* Mobile Money */}
                  <div className="flex items-center gap-5.5">
                    <Image
                      src="/images/Telecel-logo.png"
                      alt="Telecel"
                      width={64}
                      height={40}
                      className="h-11 w-auto object-contain"
                    />
                    <Image
                      src="/images/mtn-logo.png"
                      alt="MTN"
                      width={64}
                      height={44}
                      className="h-12 w-auto object-contain"
                    />
                    <Image
                      src="/images/AirtelTigo-logo.png"
                      alt="AirtelTigo"
                      width={64}
                      height={40}
                      className="h-11 w-auto object-contain"
                    />
                  </div>

                  {/* Bank Transfers */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <Building2 className="h-6 w-6 text-orange-500" />
                    </div>
                    <span className="text-sm font-black text-blue-600 uppercase tracking-tight">Bank Transfers</span>
                  </div>
                </div>

                <p className="text-lg leading-relaxed text-gray-600 font-medium pt-2">
                  Trite ensures that users can easily transition between digital assets and traditional money without friction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* c. Stablecoin Payment - Full Width Ash Section */}
        <section className="bg-[#f2f2f2] py-24 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
              {/* Text Content Left */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-3xl font-bold text-black">Stablecoin Payment</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Blockchain Rails</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-2xl">
                  Trite PSP supports stablecoin-powered transactions to help businesses and users’ access:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-black font-bold">
                  <li className="flex items-center gap-2">&bull; Real-time settlements</li>
                  <li className="flex items-center gap-2">&bull; 24/7 transaction capabilities</li>
                  <li className="flex items-center gap-2">&bull; Borderless payments</li>
                  <li className="flex items-center gap-2">&bull; Blockchain transparency</li>
                  <li className="flex items-center gap-2">&bull; Reduced intermediary dependency</li>
                </ul>
                <p className="text-lg leading-relaxed text-gray-600 font-medium pt-2 max-w-2xl">
                  Trite enables businesses to seamlessly accept USDT/USDC while maintaining compliance, security, and operational efficiency.
                </p>
              </div>

              {/* Image Content Right */}
              <div className="lg:col-span-5 relative h-[400px] sm:h-[500px] flex items-center justify-center">
                <Image 
                  src="/images/stablecoin.png" 
                  alt="Stablecoin Payment" 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* REMAINING MARKET LISTINGS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 mb-32">
          <div className="space-y-32">
            {/* d. E-Commerce & Merchant Solutions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-12 space-y-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                  d
                </div>
                <h3 className="text-2xl font-bold text-black">E-Commerce & Merchant Solutions</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Merchant suite</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-3xl">
                  We empower merchants with a unified payment ecosystem that supports both stablecoins and fiat currencies.
                </p>
              </div>
            </div>

            {/* e. Cross-Border Remittance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-12 space-y-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                  e
                </div>
                <h3 className="text-2xl font-bold text-black">Cross-Border Remittance</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Liquidity settlements</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-3xl">
                  Cross-border payments remain one of the largest and fastest-growing financial sectors. Traditional remittance systems often involve delays, high fees and limited transparency.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-3xl">
                  Trite PSP solves these challenges through blockchain-enabled settlement systems combined with traditional financial connectivity.
                </p>
              </div>
            </div>

            {/* f. Enterprise & Institutional Solutions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              <div className="lg:col-span-12 space-y-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-black/[0.06] text-black font-extrabold">
                  f
                </div>
                <h3 className="text-2xl font-bold text-black">Enterprise & Institutional Solutions</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enterprise scale</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-3xl">
                  Large organizations require scalable, compliant, and efficient payment infrastructure capable of supporting high transaction volumes and multiple currencies.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-3xl">
                  Trite PSP delivers enterprise-grade solutions for:
                </p>
                <ul className="grid grid-cols-2 gap-4 text-sm text-black font-bold max-w-4xl">
                  <li className="flex items-center gap-2">&bull; Corporations</li>
                  <li className="flex items-center gap-2">&bull; Fintech companies</li>
                  <li className="flex items-center gap-2">&bull; NGOs</li>
                  <li className="flex items-center gap-2">&bull; Government institutions</li>
                  <li className="flex items-center gap-2">&bull; Payment aggregators</li>
                  <li className="flex items-center gap-2">&bull; International businesses</li>
                </ul>
              </div>
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
                className="px-6 py-3 font-semibold bg-[#22c55e] text-black rounded-full hover:bg-[#16a34a] transition-all flex items-center gap-2"
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
