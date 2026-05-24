"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicator,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
  Building2,
  Coins
} from "lucide-react";

const builtForItems = [
  { name: "E-commerce platforms", image: "/images/e-commerce.jpg" },
  { name: "Marketplaces", image: "/images/market.jpg" },
  { name: "SaaS companies", image: "/images/saas.jpg" },
  { name: "Fintech startups", image: "/images/fintech.jpg" },
  { name: "Cross-border traders", image: "/images/traders.jpg" },
  { name: "Digital service providers", image: "/images/digital-service.jpg" },
  { name: "Educational institutions", image: "/images/student.jpg" },
  { name: "NGOs & International remittance platforms", image: "/images/tri-2.jpg" }
];

const whyTriteItems = [
  {
    title: "Built for Africa",
    content: "Africa’s payment ecosystem is fragmented. Trite simplifies complexity by integrating local payment rails and digital asset infrastructure into a single secure layer."
  },
  {
    title: "Security First",
    content: "Our high-security compliance standard includes AI-powered fraud detection and real-time monitoring.",
    subPoints: ["PCI-aligned architecture", "AML & KYC automation"]
  },
  {
    title: "Compliance-Driven",
    content: "We operate within regulatory frameworks and embed compliance directly into our systems."
  },
  {
    title: "Scalable by Design",
    content: "From local SMEs to cross-border enterprises, Trite grows with your business."
  }
];

export default function Home() {
  const [builtForIndex, setBuiltForIndex] = useState(0);
  const [whyTriteIndex, setWhyTriteIndex] = useState(0);

  // Carousel timer for the Built For section
  useEffect(() => {
    const timer = setInterval(() => {
      setBuiltForIndex((prev) => (prev + 1) % builtForItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Carousel timer for the Why Trite section
  useEffect(() => {
    const timer = setInterval(() => {
      setWhyTriteIndex((prev) => (prev + 1) % whyTriteItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#92bd30]/30 selection:text-black">

      <Header transparent={true} />

      {/* MAIN CONTENT AREA */}
      <main>

        {/* SECTION 1: HOME (HERO) */}
        <section
          id="home"
          className="relative min-h-screen overflow-hidden bg-white"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/tri-1.jpg"
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-48 sm:pt-56 lg:pt-64">
            <div className="max-w-2xl pb-20">

              {/* Hero Texts */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
                    Powering the Future of Payments in Africa
                  </h1>
                  <div className="mt-6 h-px w-full max-w-2xl bg-white/20"></div>
                </div>

                <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-white/90">
                  Seamless bank, mobile money, and stablecoin payments - built for businesses and institutions scaling across Ghana and the continent – pay and get paid with Trite!
                </p>

                {/* Hero CTA Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#22c55e] px-8 text-sm font-semibold text-black hover:bg-[#16a34a] shadow transition-all duration-200"
                    href="/get-started"
                  >
                    Get Started
                  </Link>
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-8 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
                    href="/contact-sales"
                  >
                    Talk to Sales
                  </Link>
                  <Link
                    className="inline-flex h-12 items-center justify-center gap-1 rounded-full px-5 text-sm font-semibold text-white hover:underline group transition-all duration-200"
                    href="/api-docs"
                  >
                    View API Docs
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Unified Payment Gateway Section */}
        <section className="relative bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Heading Card - Overlaps hero */}
            <div className="relative -mt-32 sm:-mt-40 mb-16">
              <div className="inline-block bg-white px-8 pt-10 pb-16 sm:px-12 sm:pt-8 sm:pb-20">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Payment Solutions
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-black">
                  Unified Payment Gateway
                </h3>
              </div>
            </div>

            {/* Content - On section background */}
            <div className="max-w-6xl mx-auto">
              <p className="text-lg sm:text-xl text-gray-600 font-medium mb-12 text-center">
                Trite enables you, your business and anyone to receive payments through;
              </p>

              {/* Desktop: Single row layout */}
              <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
                {/* Card Payments */}
                <div className="flex items-center gap-4">
                  <img
                    src="/images/mastercard-logo.png"
                    alt="Mastercard"
                    className="h-16 w-auto object-contain"
                  />
                  <img
                    src="/images/visa-logo.png"
                    alt="Visa"
                    className="h-16 w-auto object-contain"
                  />
                </div>

                {/* Mobile Money */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/Telecel-logo.png"
                    alt="Telecel"
                    className="h-16 w-auto object-contain"
                  />
                  <img
                    src="/images/mtn-logo.png"
                    alt="MTN"
                    className="h-18 w-auto object-contain"
                  />
                  <img
                    src="/images/AirtelTigo-logo.png"
                    alt="AirtelTigo"
                    className="h-16 w-auto object-contain"
                  />
                </div>

                {/* Stablecoins */}
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/images/stablecoin-logo1.png"
                    alt="Stablecoins"
                    className="h-16 w-auto object-contain"
                  />
                  <span className="text-sm font-bold text-gray-400">Stablecoins</span>
                </div>

                {/* Bank Transfers */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                    <Building2 className="h-8 w-8 text-orange-500" />
                  </div>
                  <span className="text-sm font-bold text-blue-600">Bank Transfers</span>
                </div>
              </div>

              {/* Mobile: Grid layout */}
              <div className="grid grid-cols-1 md:hidden gap-12">
                {/* Card Payments */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <img
                      src="/images/mastercard-logo.png"
                      alt="Mastercard"
                      className="h-12 w-auto object-contain"
                    />
                    <img
                      src="/images/visa-logo.png"
                      alt="Visa"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                </div>

                {/* Mobile Money */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                    <img
                      src="/images/Telecel-logo.png"
                      alt="Telecel"
                      className="h-12 w-auto object-contain"
                    />
                    <img
                      src="/images/mtn-logo.png"
                      alt="MTN"
                      className="h-14 w-auto object-contain"
                    />
                    <img
                      src="/images/AirtelTigo-logo.png"
                      alt="AirtelTigo"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                </div>

                {/* Stablecoins */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <img
                      src="/images/stablecoin-logo1.png"
                      alt="Stablecoins"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-gray-400">Stablecoins</h4>
                </div>

                {/* Bank Transfers */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                      <Building2 className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-blue-600">Bank Transfers</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built For Section */}
        <section className="relative bg-white py-16 sm:py-24 overflow-hidden">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-center">

              {/* Left Side - Image Container */}
              <div className="w-full lg:w-[53%] h-[350px] sm:h-[480px] lg:h-[660px] relative z-10 shrink-0 overflow-hidden group shadow-md">
                {builtForItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === builtForIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-[#000]/5 mix-blend-overlay pointer-events-none z-20" />
              </div>

              {/* Right Side - Overlapping White Card */}
              <div className="w-full lg:w-[54%] lg:-ml-24 mt-8 lg:mt-24 bg-white p-8 sm:p-12 lg:p-16 z-20 relative rounded-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Built For
                </p>

                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-black leading-tight">
                  Designed specifically to power financial flows and digital growth for:
                </h2>

                {/* Horizontal line under the title */}
                <div className="h-[2px] w-24 bg-black mt-6 mb-8" />

                <div className="space-y-4">
                  {builtForItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 group py-0.5 cursor-pointer"
                      onMouseEnter={() => setBuiltForIndex(idx)}
                    >
                      <span className={`text-lg sm:text-xl font-medium transition-colors duration-300 min-w-[40px] sm:min-w-[48px] ${idx === builtForIndex ? "text-[#22c55e]" : "text-gray-300 group-hover:text-[#22c55e]"
                        }`}>
                        {String(idx + 1).padStart(2, '0')}/
                      </span>
                      <span className={`text-sm sm:text-base font-medium transition-colors duration-300 pt-0.5 sm:pt-1 ${idx === builtForIndex ? "text-black font-semibold" : "text-gray-400 group-hover:text-black"
                        }`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4 dots divider */}
        <div className="flex items-center justify-center gap-2.5 py-6 bg-white">
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
        </div>

        {/* SECTION 2: PAYMENTS & SETTLEMENT */}
        <section
          id="payments"
          className="relative bg-gradient-to-t from-[#22c55e]/12 via-[#22c55e]/2 to-[#f8fafc] py-20 sm:py-28 md:py-36"
        >
          {/* Subtle gradient accent */}
          <div className="absolute top-10 right-0 -z-10 h-[400px] w-[300px] bg-[#22c55e]/5 blur-[100px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                PAYMENTS & SETTLEMENT
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl lg:text-5xl leading-tight">
                Get paid Faster, <br /> Anywhere, from Anyone.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Trite gives your business everything you need to collect payments - online, in-store, and across borders - without stress or technical complexity.
              </p>
              <p className="text-base font-bold text-slate-500">
                --- One integration, multiple payment options, zero headaches.
              </p>
            </div>

            {/* Concise overview summary styled like reference image */}
            <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">

              {/* Left Column (Cards 1 and 3) */}
              <div className="space-y-8 lg:space-y-10">
                {/* Card 1: Mobile Money & USSD */}
                <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="max-w-[55%] relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] mb-4 tracking-tight">Mobile Money & USSD</h3>
                      <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                        Integrated MTN & Telecel billing rails for the West African market. Settle transactions rapidly and accept payments from anyone through customized USSD codes and mobile wallets.
                      </p>
                    </div>
                    <div className="mt-8">
                      <Link href="/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#22c55e] transition-colors">
                        Learn more
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Decorative curved outlined circles & glow background */}
                  <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -right-6 -bottom-10 w-64 h-64 rounded-full border-2 border-dashed border-violet-400/30 pointer-events-none transition-transform duration-1000 group-hover:rotate-45 group-hover:scale-105 z-0" />
                  <div className="absolute -right-2 -bottom-6 w-48 h-48 rounded-full border border-violet-300/40 pointer-events-none transition-transform duration-700 group-hover:scale-110 z-0" />

                  <div className="absolute -bottom-8 -right-4 w-[48%] h-[78%] pointer-events-none select-none overflow-hidden flex items-end justify-end z-10">
                    <img
                      src="/images/man-momo.png"
                      alt="Mobile Money & USSD"
                      className="w-full h-full object-contain object-bottom object-right"
                    />
                  </div>
                </div>

                {/* Card 3: Stablecoin Gateway */}
                <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="max-w-[55%] relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] mb-4 tracking-tight">Stablecoin Gateway</h3>
                      <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                        Frictionless checkouts in USDT and USDC with zero gas fees. Give your users the freedom to pay using digital assets while we handle gas limits and network conversions.
                      </p>
                    </div>
                    <div className="mt-8">
                      <Link href="/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#22c55e] transition-colors">
                        Learn more
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Decorative curved outlined circles & glow background */}
                  <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -right-6 -bottom-10 w-64 h-64 rounded-full border-2 border-dashed border-yellow-400/30 pointer-events-none transition-transform duration-1000 group-hover:rotate-45 group-hover:scale-105 z-0" />
                  <div className="absolute -right-2 -bottom-6 w-48 h-48 rounded-full border border-yellow-300/40 pointer-events-none transition-transform duration-700 group-hover:scale-110 z-0" />

                  <div className="absolute -bottom-20 -right-4 w-[48%] h-[78%] pointer-events-none select-none overflow-hidden flex items-end justify-end z-10">
                    <img
                      src="/images/stablecoin.png"
                      alt="Stablecoin Gateway"
                      className="w-full h-full object-contain object-bottom object-right"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (Cards 2 and 4 - Staggered higher on desktop) */}
              <div className="space-y-8 lg:space-y-10 md:-mt-24 lg:-mt-32">
                {/* Card 2: Card Collections */}
                <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="max-w-[55%] relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] mb-4 tracking-tight">Card Collections</h3>
                      <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                        Accept major debit and credit cards globally with ease. Connect international card processing networks directly to your digital shop front or platform checkout.
                      </p>
                    </div>
                    <div className="mt-8">
                      <Link href="/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#22c55e] transition-colors">
                        Learn more
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Decorative curved outlined circles & glow background */}
                  <div className="absolute -right-14 -bottom-18 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -right-8 -bottom-12 w-64 h-64 rounded-full border-2 border-dashed border-orange-300/40 pointer-events-none transition-transform duration-1000 group-hover:rotate-45 group-hover:scale-105 z-0" />
                  <div className="absolute -right-4 -bottom-8 w-48 h-48 rounded-full border border-orange-200/50 pointer-events-none transition-transform duration-700 group-hover:scale-110 z-0" />

                  <img
                    src="/images/woman-with-card-Photoroom.png"
                    alt="Card Collections"
                    className="absolute -bottom-8 -right-6 w-[50%] h-auto max-h-[80%] object-contain object-bottom pointer-events-none select-none z-10"
                  />
                </div>

                {/* Card 4: Bank Settlements */}
                <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="max-w-[55%] relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] mb-4 tracking-tight">Bank Settlements</h3>
                      <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                        Direct payouts to local bank accounts and wallets securely. Automate your settlements, optimize cash flows, and manage banking integrations in a unified workflow.
                      </p>
                    </div>
                    <div className="mt-8">
                      <Link href="/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#22c55e] transition-colors">
                        Learn more
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Decorative curved outlined circles & glow background */}
                  <div className="absolute -right-14 -bottom-18 w-80 h-80 rounded-full bg-gray-400/5 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -right-8 -bottom-12 w-64 h-64 rounded-full border-2 border-dashed border-gray-300/40 pointer-events-none transition-transform duration-1000 group-hover:rotate-45 group-hover:scale-105 z-0" />
                  <div className="absolute -right-4 -bottom-8 w-48 h-48 rounded-full border border-gray-200/50 pointer-events-none transition-transform duration-700 group-hover:scale-110 z-0" />

                  <img
                    src="/images/tri-5-Photoroom.png"
                    alt="Bank Settlements"
                    className="absolute -bottom-6 -right-6 w-[54%] h-auto max-h-[80%] object-contain object-bottom pointer-events-none select-none z-10"
                  />
                </div>
              </div>

            </div>

            <div className="mt-16 flex justify-center">
              <Link
                href="/payments"
                className="px-8 py-4 font-semibold bg-[#22c55e] text-black hover:bg-[#16a34a] rounded-full transition-all flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
              >
                Learn More About Payments <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3: MARKETS */}
        <section
          id="markets"
          className="relative bg-gradient-to-b from-[#92bd30]/12 via-[#92bd30]/2 to-white py-12 sm:py-16 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Centered Heading */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Markets
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl leading-tight">
                Expanding the Future of Payments with Trite
              </h2>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

              {/* Left Column: Image with Glass Card Overlay */}
              <div className="lg:col-span-6 xl:col-span-7 relative rounded-[2rem] overflow-hidden group min-h-[500px] lg:min-h-[580px] shadow-lg">
                <Image
                  src="/images/market-women.jpg"
                  alt="Market Women"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-102"
                  priority
                />
                {/* Subtle dark overlay for contrast */}
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-black/15" />

                {/* Glass Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/75 rounded-2xl p-6 sm:p-8 border border-white/30 shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/80">
                  <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-semibold">
                    At TRITE we are redefining how businesses, merchants, institutions, and individuals move money across both digital and traditional financial ecosystems. Our platform is uniquely designed to support stablecoin transactions and traditional cash payments within one secure, scalable, and intelligent infrastructure.
                  </p>
                </div>
              </div>

              {/* Right Column: Soft Container with 3 Cards arranged vertically */}
              <div className="lg:col-span-6 xl:col-span-5 relative rounded-[2rem] p-6 sm:p-8 flex flex-col gap-6 justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/market.jpg"
                    alt="Market background"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* Black Overlay to make the image less visible */}
                <div className="absolute inset-0 bg-black/70 z-[1]" />

                {/* Card 1 */}
                <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-100/50 transition-transform duration-300 hover:scale-105">
                  <h3 className="font-bold text-black text-lg mb-2">
                    Global Digital Infrastructure
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Supporting global settlements by bridging stablecoins and traditional fiat assets.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-100/50 transition-transform duration-300 hover:scale-105">
                  <h3 className="font-bold text-black text-lg mb-2">
                    Traditional Banking Integrations
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Direct compatibility with local bank accounts, mobile wallets, and USSD systems.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-100/50 transition-transform duration-300 hover:scale-105">
                  <h3 className="font-bold text-black text-lg mb-2">
                    Cross-Border Remittances
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Empowering merchants to transfer funds across regional borders instantly.
                  </p>
                </div>
              </div>

            </div>

            {/* CTA Button */}
            <div className="mt-16 flex justify-center">
              <Link
                href="/markets"
                className="px-8 py-4 font-semibold bg-black text-white hover:bg-black/90 rounded-full transition-all flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] hover:scale-[1.02]"
              >
                Learn More About Markets <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* 4 dots divider — between Markets & Businesses */}
        <div className="flex items-center justify-center gap-2.5 py-6 bg-white">
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="h-2 w-2 rounded-full bg-gray-300" />
        </div>

        {/* SECTION 4: BUSINESSES */}
        <section
          id="businesses"
          className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[#e7e7e7]/50 py-16 sm:py-20 lg:py-24"
        >
          {/* Decorative curve — full bleed so left arcs are not clipped */}
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible md:block"
            aria-hidden
          >
            <div
              className="absolute bottom-0 left-[70%] aspect-square h-[105%] w-[105%] min-h-[440px] min-w-[440px] -translate-x-1/2 translate-y-[54%] bg-[url('/images/curve.png')] bg-contain bg-center bg-no-repeat opacity-90 lg:left-[78%] lg:min-h-[520px] lg:min-w-[520px] lg:translate-y-[52%]"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
              {/* Copy — standalone */}
              <div className="lg:col-span-7">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                  BUSINESSES
                </h2>
                <h3 className="max-w-xl text-2xl font-extrabold leading-[1.15] tracking-tight text-[#0c1e43] sm:text-3xl lg:text-[2.35rem]">
                  Business Solutions - Powering Modern Commerce with Trite.
                </h3>

                <p className="mt-6 max-w-xl text-sm leading-[1.85] text-gray-500 sm:text-[15px]">
                  Trite is more than a payment gateway - it is a complete financial operations platform designed for modern business growth. Through advanced stablecoin integration, fiat payment support, API connectivity, merchant tools, and financial automation features, businesses can streamline transactions while expanding into global markets.
                </p>

                <div className="mt-8 space-y-5 border-t border-gray-100 pt-8">
                  <div className="space-y-1.5">
                    <div className="text-base font-bold text-[#0c1e43]">Business Wallet Infrastructure</div>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Secure multi-currency custody and stablecoin asset management.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-base font-bold text-[#0c1e43]">API & Developer Solutions</div>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Flexible endpoints to deploy checkout layers and bulk payout workflows.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-base font-bold text-[#0c1e43]">Advanced Reporting & Analytics</div>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Gain real-time visibility into transactions and settlement analytics.
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#22c55e] px-6 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-[#16a34a]"
                    href="/demo"
                  >
                    Request a Demo
                  </Link>
                  <Link
                    href="/businesses"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-6 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-50"
                  >
                    Learn More About Business Solutions <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Image — standalone */}
              <div className="relative min-h-[360px] w-full overflow-hidden rounded-2xl sm:rounded-3xl sm:min-h-[420px] lg:col-span-5 lg:ml-auto lg:min-h-[600px] lg:max-w-[30rem]">
                <Image
                  src="/images/traders.jpg"
                  alt="Business traders"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="rounded-2xl object-cover sm:rounded-3xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: PRODUCTS */}
        <section
          id="products"
          className="relative z-10 bg-white pt-20 sm:pt-28 md:pt-36 pb-10 sm:pb-16 md:pb-20 overflow-hidden"
        >
          {/* SVG Background */}
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1423 560" className="w-full h-full"> 
                <g mask="url(#SvgjsMask1034)" fill="none"> 
                    <rect width="1423" height="560" x="0" y="0" fill="rgba(231, 231, 231, 1)"></rect> 
                    <path d="M 0,97 C 95,116.2 285,192.2 475,193 C 665,193.8 760.4,100.6 950,101 C 1139.6,101.4 1328.4,176.2 1423,195L1423 560L0 560z" fill="rgba(241, 241, 241, 1)"></path> 
                    <path d="M 0,439 C 142.4,411.4 427.4,281.6 712,301 C 996.6,320.4 1280.8,489 1423,536L1423 560L0 560z" fill="rgba(255, 255, 255, 1)"></path> 
                </g> 
                <defs> 
                    <mask id="SvgjsMask1034"> 
                        <rect width="1423" height="560" fill="#ffffff"></rect> 
                    </mask> 
                </defs> 
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Top Row: Heading/Image/Button on Left, Paragraph on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-12">
              
              {/* Left Column: Heading, Image and Button */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    PRODUCTS
                  </p>
                  <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl lg:text-5xl leading-tight">
                    Our Suite of Payment Products
                  </h2>
                </div>

                {/* Image */}
                <div className="max-w-md">
                  <img
                    src="/images/happy.png"
                    alt="Happy customer"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right Column: Paragraph Description */}
              <div className="lg:col-span-7">
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
                  Trite provides a comprehensive suite of payment solutions designed to empower businesses with seamless, secure, and scalable payment infrastructure across Africa and beyond. Our products are built to handle the complexities of modern commerce, from stablecoin settlements to traditional banking rails.
                </p>
              </div>
            </div>

            {/* Bottom Row: Product Cards Grid - Staggered Layout */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                {/* Left Column Cards - Offset with margin-top */}
                <div className="space-y-12 sm:mt-20">
                  {[
                    {
                      title: "Trite Gateway",
                      desc: "Complete online payment solution for web & mobile businesses.",
                      rail: "01",
                      blockColor: "bg-[#2563eb]",
                      image: "/images/gateway.png",
                      layout: "left",
                      imgPos: "-bottom-6"
                    },
                    {
                      title: "Trite Merchant Dashboard",
                      desc: "Advanced reporting, reconciliation, settlement tracking, and business insights.",
                      rail: "03",
                      blockColor: "bg-[#affc41]",
                      image: "/images/mockup7.png",
                      layout: "right",
                      imgPos: "bottom-4",
                      imgSide: "left-6"
                    }
                  ].map((prod, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[1.3/1] overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.02] bg-white rounded-xl border border-gray-100"
                    >
                      {/* Secondary Color Block - Vibrant Base */}
                      <div className={`absolute bottom-0 w-full h-[35%] z-0 ${prod.blockColor}`} />
                      
                      {/* Content Overlay - Top White Part */}
                      <div className="relative z-20 p-7 h-full flex flex-col justify-between">
                        <div className={`w-[60%] ${prod.layout === 'right' ? 'ml-auto text-right' : ''}`}>
                          <h3 className="text-2xl font-black leading-tight mb-2 text-black">
                            {prod.title}
                          </h3>
                          <p className="text-lg font-medium leading-relaxed text-gray-600">
                            {prod.desc}
                          </p>
                        </div>
                        
                        {/* White accent line on the vibrant block */}
                        <div className={`h-1.5 w-14 bg-white/40 ${prod.layout === 'left' ? 'mb-2' : 'ml-auto mb-2'}`} />
                      </div>

                      {/* Product Image - Pushed to corners */}
                      <div className={`absolute ${prod.imgPos} w-[55%] h-[80%] z-10 ${prod.layout === 'left' ? '-right-4' : (prod.imgSide || '-left-4')}`}>
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105 ${prod.layout === 'left' ? 'object-right-bottom' : 'object-left-bottom'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column Cards */}
                <div className="space-y-12">
                  {[
                    {
                      title: "Trite Stable-Pay",
                      desc: "Stablecoin acceptance with automatic fiat conversion and settlement.",
                      rail: "02",
                      blockColor: "bg-[#10b981]",
                      image: "/images/stablecoin-logo.png",
                      layout: "left",
                      imgPos: "bottom-4"
                    },
                    {
                      title: "Trite API",
                      desc: "Developer-first RESTful APIs with comprehensive documentation.",
                      rail: "04",
                      blockColor: "bg-[#334155]",
                      image: "/images/trite-api.png",
                      layout: "left",
                      imgPos: "-bottom-6"
                    }
                  ].map((prod, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[1.3/1] overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.02] bg-white rounded-xl border border-gray-100"
                    >
                      {/* Secondary Color Block - Vibrant Base */}
                      <div className={`absolute bottom-0 w-full h-[35%] z-0 ${prod.blockColor}`} />
                      
                      {/* Content Overlay - Top White Part */}
                      <div className="relative z-20 p-7 h-full flex flex-col justify-between">
                        <div className={`w-[60%] ${prod.layout === 'right' ? 'ml-auto text-right' : ''}`}>
                          <h3 className="text-2xl font-black leading-tight mb-2 text-black">
                            {prod.title}
                          </h3>
                          <p className="text-lg font-medium leading-relaxed text-gray-600">
                            {prod.desc}
                          </p>
                        </div>
                        
                        {/* White accent line on the vibrant block */}
                        <div className={`h-1.5 w-14 bg-white/40 ${prod.layout === 'left' ? 'mb-2' : 'ml-auto mb-2'}`} />
                      </div>

                      {/* Product Image - Pushed to corners */}
                      <div className={`absolute ${prod.imgPos} w-[55%] h-[80%] z-10 ${prod.layout === 'left' ? '-right-4' : '-left-4'}`}>
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105 ${prod.layout === 'left' ? 'object-right-bottom' : 'object-left-bottom'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button - Now under the cards */}
            <div className="mt-20 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-10 py-5 font-bold bg-[#22c55e] text-black hover:bg-[#16a34a] rounded-full transition-all gap-2 shadow-xl hover:shadow-2xl"
              >
                Explore Product Suite <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6: WHY TRITE */}
        <section
          id="why-trite"
          className="relative z-10 bg-white pt-10 sm:pt-16 md:pt-20 pb-20 sm:pb-28 md:pb-36 overflow-hidden"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Text content */}
              <div className="lg:col-span-7 space-y-12 relative">
                <div className="space-y-4">
                  <h3 className="text-3xl font-extrabold text-black tracking-tight sm:text-4xl lg:text-5xl">
                    Why Trite
                  </h3>
                  <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-medium max-w-2xl">
                    We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="w-full">
                    <div className="bg-white rounded-2xl p-8 border border-black/[0.03] min-h-[320px] flex flex-col justify-center relative overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
                      <div className="relative h-full flex flex-col justify-center">
                        {whyTriteItems.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{
                              opacity: whyTriteIndex === idx ? 1 : 0,
                              x: whyTriteIndex === idx ? 0 : -40,
                              pointerEvents: whyTriteIndex === idx ? "auto" : "none"
                            }}
                            transition={{ 
                              duration: 0.6, 
                              ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a smoother swipe
                            }}
                            className={cn(
                              "space-y-4",
                              whyTriteIndex === idx ? "relative" : "absolute inset-0 flex flex-col justify-center"
                            )}
                          >
                            <div className="text-2xl font-extrabold text-black flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                              {item.title}
                            </div>
                            <p className="text-lg text-gray-500 leading-relaxed font-medium">
                              {item.content}
                            </p>
                            {item.subPoints && (
                              <ul className="text-sm text-black font-bold space-y-2 pl-6 list-disc opacity-70">
                                {item.subPoints.map((sub, sIdx) => (
                                  <li key={sIdx}>{sub}</li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {/* Progress Bar (Moving Line) */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            key={whyTriteIndex}
                            className="h-full bg-[#22c55e]"
                          />
                      </div>
                    </div>
                  </div>

                  {/* Custom Indicators */}
                  <div className="flex flex-wrap gap-3">
                    {whyTriteItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWhyTriteIndex(idx)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border",
                          whyTriteIndex === idx
                            ? "bg-black text-white border-black shadow-md scale-105"
                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600"
                        )}
                      >
                        {idx + 1}. {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decorative background element (Orange) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/5 rounded-full blur-3xl -z-10" />
              </div>

              {/* Right Column: Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative z-10 w-full h-auto">
                  <img 
                    src="/images/girl-copy.png" 
                    alt="Why Trite" 
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>
                {/* Decorative background element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#22c55e]/5 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: HOW TRITE WORKS & ABOUT */}
        <section
          className="relative z-10 bg-white pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-28 md:py-36 overflow-hidden"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* How Trite Works */}
            <div className="space-y-20">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h3 className="text-3xl font-extrabold text-black tracking-tight sm:text-4xl lg:text-5xl">
                  How Trite Works
                </h3>
                <p className="text-lg text-gray-500 font-medium">
                  Our integration process is designed for speed and reliability, allowing you to start accepting payments across multiple channels in just four simple steps.
                </p>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                  {[
                    {
                      step: "1",
                      title: "Integrate",
                      text: "Integrate Trite via API or hosted checkout."
                    },
                    {
                      step: "2",
                      title: "Accept",
                      text: "Accept payments via mobile money, fiat or stablecoins."
                    },
                    {
                      step: "3",
                      title: "Receive",
                      text: "Receive payments in local currency or digital assets."
                    },
                    {
                      step: "4",
                      title: "Monitor",
                      text: "Monitor performance in real-time via dashboard analytics."
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center space-y-8 group relative"
                    >
                      {/* Number Circle */}
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-[#f97316] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-orange-200/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ea580c]">
                          {item.step}
                        </div>

                        {/* Connecting Line - Desktop (Horizontal) */}
                        {idx < 3 && (
                          <div className="hidden lg:block absolute top-10 left-20 w-[calc(100vw/4-80px)] xl:w-[220px] h-0.5 pointer-events-none">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                              <line x1="0" y1="1" x2="50%" y2="1" stroke="#e5e7eb" strokeWidth="2" />
                              <line x1="50%" y1="1" x2="100%" y2="1" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="8, 6" />
                            </svg>
                          </div>
                        )}

                        {/* Connecting Line - Mobile (Vertical) */}
                        {idx < 3 && (
                          <div className="absolute left-1/2 top-20 w-0.5 h-12 -translate-x-1/2 lg:hidden pointer-events-none">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                              <line x1="1" y1="0" x2="1" y2="50%" stroke="#e5e7eb" strokeWidth="2" />
                              <line x1="1" y1="50%" x2="1" y2="100%" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="8, 6" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-[#22c55e]">
                          {item.title}
                        </h4>
                        <p className="text-base text-gray-500 font-medium leading-relaxed max-w-[240px]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT TRITE */}
        <section
          id="about"
          className="relative z-10 bg-[#fdfcf6] py-24 sm:py-32 overflow-hidden"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    About Us
                  </h2>
                  <h3 className="text-4xl sm:text-5xl font-extrabold text-[#0c1e43] tracking-tight leading-[1.1]">
                    Building Africa’s Payment Infrastructure Layer
                  </h3>
                </div>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
                  Trite was founded to solve a fundamental problem: Africa’s payment systems are fragmented, expensive and not built for digital scale.
                </p>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-7 space-y-10 text-slate-600">
                <p className="text-lg sm:text-xl leading-relaxed">
                  We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly. Our mission is to empower businesses across Africa with frictionless, borderless payment solutions.
                </p>
                <div className="space-y-8">
                  <p className="text-lg sm:text-xl leading-relaxed">
                    Trite is a next-generation Payment Service Provider (PSP) designed to bridge traditional finance and digital assets. We enable businesses to accept mobile money, cards, bank transfers, and stablecoins - all through a single unified platform.
                  </p>
                  <p className="text-lg sm:text-xl leading-relaxed">
                    Whether you’re a startup, enterprise, marketplace, or fintech, Trite provides secure, compliant, and scalable payment infrastructure across Africa. We are the infrastructure layer for modern African commerce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* READY TO SCALE YOUR PAYMENTS? */}
        <section className="relative bg-white py-20 sm:py-28 md:py-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white px-6 py-16 sm:py-20 text-center sm:px-12 shadow-2xl">

              {/* background image and overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                  src="/images/african-man-touching.png"
                  alt="Ready to scale"
                  fill
                  className="object-cover opacity-40 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
              </div>

              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#22c55e]/20 blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#22c55e]/20 blur-[80px] pointer-events-none" />

              <div className="relative z-10 mx-auto max-w-4xl space-y-8">
                <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
                  Ready to Scale Your Payments?
                </h2>

                <p className="text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
                  Join businesses building the future of commerce with Trite.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
                  <Link
                    className="inline-flex h-14 items-center justify-center rounded-full bg-[#22c55e] px-10 text-base font-bold text-black hover:bg-[#16a34a] shadow-lg hover:shadow-[#22c55e]/20 transition-all duration-300 hover:scale-105"
                    href="/get-started"
                  >
                    Start Accepting Payments
                  </Link>
                  <Link
                    className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-10 text-base font-semibold text-white hover:bg-white/20 transition-all duration-300"
                    href="/demo"
                  >
                    Request Demo
                  </Link>
                  <Link
                    className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-10 text-base font-semibold text-white hover:bg-white/20 transition-all duration-300"
                    href="/contact-sales"
                  >
                    Contact Sales
                  </Link>
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
