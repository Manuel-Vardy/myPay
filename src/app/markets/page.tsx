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
              sizes="100vw"
              className="object-cover"
              priority
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 flex justify-end w-full">
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
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* REMAINING MARKET LISTINGS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 mb-32">
          <div className="space-y-32">
            {/* d. E-Commerce & Merchant Solutions - Redesigned as per reference */}
            <div className="space-y-16">
              {/* Centered Text Content */}
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-black">E-Commerce & Merchant Solutions</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Merchant suite</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-2xl mx-auto">
                  We empower merchants with a unified payment ecosystem that supports both stablecoins and fiat currencies.
                </p>
              </div>

              {/* Image Container Card */}
              <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                  {/* Image 1: business-1.jpg */}
                  <div className="relative h-[400px] lg:h-[550px] rounded-[1.5rem] overflow-hidden">
                    <Image
                      src="/images/business.avif"
                      alt="Merchant Business Owner"
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Image 2: imac-Desk-Mockup.jpg */}
                  <div className="relative h-[400px] lg:h-[550px] rounded-[1.5rem] overflow-hidden">
                    <Image
                      src="/images/imac-Desk-Mockup.jpg"
                      alt="Trite Dashboard Mockup"
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Image 3: man-shopping.jpg */}
                  <div className="relative h-[400px] lg:h-[550px] rounded-[1.5rem] overflow-hidden">
                    <Image
                      src="/images/man-shopping.jpg"
                      alt="Customer Shopping"
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* e. Cross-Border Remittance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              <div className="lg:col-span-8 space-y-6">
                <h3 className="text-2xl font-bold text-black">Cross-Border Remittance</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Liquidity settlements</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium">
                  Cross-border payments remain one of the largest and fastest-growing financial sectors. Traditional remittance systems often involve delays, high fees and limited transparency.
                </p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium">
                  Trite PSP solves these challenges through blockchain-enabled settlement systems combined with traditional financial connectivity.
                </p>
              </div>
              <div className="lg:col-span-4 relative h-[300px] sm:h-[400px] flex items-center justify-center">
                <Image
                  src="/images/mtn-man1.png"
                  alt="Cross-Border Remittance"
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* f. Enterprise & Institutional Solutions - Full Width */}
        <section className="bg-[#f0fdf4] py-24 sm:py-32 overflow-hidden border-y border-green-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Image */}
              <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
                <Image
                  src="/images/woman-point-hands.png"
                  alt="Enterprise Solutions"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>

              {/* Right: Text */}
              <div className="space-y-8 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20">
                  <Building2 className="h-6 w-6" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight">
                    Enterprise & Institutional Solutions
                  </h3>
                  <p className="text-sm font-bold text-[#22c55e] uppercase tracking-widest">
                    Enterprise scale
                  </p>
                </div>

                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-gray-600 font-medium">
                    Large organizations require scalable, compliant, and efficient payment infrastructure capable of supporting high transaction volumes and multiple currencies.
                  </p>
                  <p className="text-lg leading-relaxed text-gray-600 font-medium">
                    Trite PSP delivers enterprise-grade solutions for:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-black font-bold">
                    {[
                      "Corporations",
                      "Fintech companies",
                      "NGOs",
                      "Government institutions",
                      "Payment aggregators",
                      "International businesses"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
