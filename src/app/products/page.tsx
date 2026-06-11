"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhyTriteCarouselAccent from "@/components/WhyTriteCarouselAccent";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Wallet,
  Coins,
  BarChart3,
  Plug,
  CreditCard,
  ArrowDownToLine,
  Activity,
  type LucideIcon,
} from "lucide-react";

const howItWorksSteps = [
  {
    title: "Integrate",
    text: "Integrate Trite via API or hosted checkout.",
    icon: Code2,
    iconSecondary: Plug,
  },
  {
    title: "Accept",
    text: "Accept payments via mobile money, fiat or stablecoins.",
    icon: Wallet,
    iconSecondary: CreditCard,
  },
  {
    title: "Receive",
    text: "Receive payments in local currency or digital assets.",
    icon: Coins,
    iconSecondary: ArrowDownToLine,
  },
  {
    title: "Monitor",
    text: "Monitor performance in real-time via dashboard analytics.",
    icon: BarChart3,
    iconSecondary: Activity,
  },
];

function HowItWorksIcon({
  icon: Primary,
  iconSecondary: Secondary,
}: {
  icon: LucideIcon;
  iconSecondary: LucideIcon;
}) {
  return (
    <div className="relative mb-6 h-14 w-[4.5rem]" aria-hidden>
      <div className="absolute bottom-0 left-0 flex h-11 w-11 items-center justify-center rounded-xl bg-[#bbf7d0]">
        <Secondary className="h-5 w-5 text-[#22c55e]" strokeWidth={1.75} />
      </div>
      <div className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-xl bg-[#22c55e] shadow-sm">
        <Primary className="h-5 w-5 text-white" strokeWidth={2} />
      </div>
    </div>
  );
}

const whyTriteItems = [
  {
    title: "Built for Africa",
    content: "Africa’s payment ecosystem is fragmented. Trite simplifies complexity by integrating local payment rails and digital asset infrastructure into a single secure layer.",
  },
  {
    title: "Security First",
    content: "Our high-security compliance standard includes AI-powered fraud detection and real-time monitoring.",
    subPoints: ["PCI-aligned architecture", "AML & KYC automation"],
  },
  {
    title: "Compliance-Driven",
    content: "We operate within regulatory frameworks and embed compliance directly into our systems.",
  },
  {
    title: "Scalable by Design",
    content: "From local SMEs to cross-border enterprises, Trite grows with your business.",
  },
];

export default function ProductsPage() {
  const [whyTriteIndex, setWhyTriteIndex] = useState(0);

  // Carousel timer for the Why Trite section
  useEffect(() => {
    const timer = setInterval(() => {
      setWhyTriteIndex((prev) => (prev + 1) % whyTriteItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main>
        {/* SECTION 5: PRODUCTS (from home) */}
        <section
          id="products"
          className="relative z-10 bg-white pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-24 md:pb-32 overflow-hidden"
        >
          {/* SVG Background */}
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            {/* Desktop Background SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1423 560" className="hidden sm:block w-full h-full opacity-50"> 
                <g mask="url(#SvgjsMask1034)" fill="none"> 
                    <rect width="1423" height="560" x="0" y="0" fill="rgba(231, 231, 231, 1)"></rect> 
                    <path d="M 0,97 C 95,116.2 285,192.2 475,193 C 665,193.8 760.4,100.6 950,101 C 1139.6,101.4 1328.4,176.2 1423,195L1423 560L0 560z" fill="rgba(255, 255, 255, 1)"></path> 
                    <path d="M 0,439 C 142.4,411.4 427.4,281.6 712,301 C 996.6,320.4 1280.8,489 1423,536L1423 560L0 560z" fill="rgba(255, 255, 255, 1)"></path> 
                </g> 
                <defs> 
                    <mask id="SvgjsMask1034"> 
                        <rect width="1423" height="560" fill="#ffffff"></rect> 
                    </mask> 
                </defs> 
            </svg>

            {/* Mobile Background - Smoother and less sharp */}
            <div className="block sm:hidden absolute inset-0 bg-[#f4f4f4]">
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% -20%, #ffffff 0%, transparent 70%), 
                                    radial-gradient(circle at 0% 50%, #ffffff 0%, transparent 50%),
                                    radial-gradient(circle at 100% 80%, #ffffff 0%, transparent 60%)`
                }}
              />
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Top Row: Heading and Image on Left, Paragraph on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-16 sm:mb-24">
              
              {/* Left Column: Heading & Image */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    PRODUCTS
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black leading-tight">
                    Our Suite of <br className="hidden sm:inline" /> Payment Products
                  </h2>
                </div>

                {/* Image happy.png */}
                <div className="max-w-md pt-4">
                  <img
                    src="/images/happy.png"
                    alt="Happy customer"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right Column: Paragraph Text */}
              <div className="lg:col-span-7">
                <p className="text-base sm:text-lg leading-relaxed text-gray-600 font-medium">
                  Trite provides a comprehensive suite of payment solutions designed to empower businesses with seamless, secure, and scalable payment infrastructure across Africa and beyond. Our products are built to handle the complexities of modern commerce, from stablecoin settlements to traditional banking rails.
                </p>
              </div>
              
            </div>

            {/* Layout Grid: 4 Cards Surrounding Center Student Image */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
              
              {/* Left Column: Cards 1 & 3 (Trite Gateway & Trite Merchant Dashboard) */}
              <div className="lg:col-span-4 flex flex-col gap-12 sm:gap-16 order-2 lg:order-1">
                
                {/* Product 1: Trite Gateway */}
                <div className="flex flex-col lg:items-end items-start text-left lg:text-right group cursor-pointer transition-all duration-300">
                  <div className="flex items-center gap-4 lg:flex-row-reverse flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-300 group-hover:border-[#22c55e] group-hover:shadow-[0_8px_20px_rgba(34,197,94,0.15)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/gateway.png"
                        alt="Trite Gateway Icon"
                        className="max-w-full max-h-full object-contain translate-y-2 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] tracking-tight group-hover:text-[#22c55e] transition-colors">
                      Trite Gateway
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed lg:text-right text-left">
                    Complete online payment solution for web & mobile businesses.
                  </p>
                </div>

                {/* Product 3: Trite Merchant Dashboard */}
                <div className="flex flex-col lg:items-end items-start text-left lg:text-right group cursor-pointer transition-all duration-300">
                  <div className="flex items-center gap-4 lg:flex-row-reverse flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-300 group-hover:border-[#22c55e] group-hover:shadow-[0_8px_20px_rgba(34,197,94,0.15)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/mockup7.png"
                        alt="Trite Merchant Dashboard Icon"
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] tracking-tight group-hover:text-[#22c55e] transition-colors">
                      Trite Merchant Dashboard
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed lg:text-right text-left">
                    Advanced reporting, reconciliation, settlement tracking, and business insights.
                  </p>
                </div>

              </div>

              {/* Center Column: Middle Student Showcase */}
              <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2">
                <div className="relative flex items-center justify-center py-8 lg:py-0">
                  {/* Decorative Outer Rings */}
                  <div className="absolute w-[370px] h-[370px] sm:w-[440px] sm:h-[440px] rounded-full border border-dashed border-[#22c55e]/30 pointer-events-none animate-spin" style={{ animationDuration: '40s' }} />
                  <div className="absolute w-[330px] h-[330px] sm:w-[395px] sm:h-[395px] rounded-full border border-dashed border-slate-200 pointer-events-none" />
                  <div className="absolute w-[290px] h-[290px] sm:w-[350px] sm:h-[350px] rounded-full bg-gradient-to-tr from-[#22c55e]/5 to-transparent pointer-events-none blur-xl" />
                  
                  {/* Student Image Showcase */}
                  <div className="relative w-[260px] h-[260px] sm:w-[310px] sm:h-[310px] rounded-full overflow-hidden border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-[#22c55e]/5 transition-transform duration-500 hover:scale-[1.03] group">
                    <Image
                      src="/images/student.jpg"
                      alt="Student"
                      fill
                      className="object-cover object-center scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
                      priority
                    />
                    {/* Elegant green tint border overlay */}
                    <div className="absolute inset-0 border border-black/5 rounded-full pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column: Cards 2 & 4 (Trite Stable-Pay & Trite API) */}
              <div className="lg:col-span-4 flex flex-col gap-12 sm:gap-16 order-3">
                
                {/* Product 2: Trite Stable-Pay */}
                <div className="flex flex-col items-start text-left group cursor-pointer transition-all duration-300">
                  <div className="flex items-center gap-4 flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-300 group-hover:border-[#22c55e] group-hover:shadow-[0_8px_20px_rgba(34,197,94,0.15)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/stablecoin-logo.png"
                        alt="Trite Stable-Pay Icon"
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] tracking-tight group-hover:text-[#22c55e] transition-colors">
                      Trite Stable-Pay
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed text-left">
                    Stablecoin acceptance with automatic fiat conversion and settlement.
                  </p>
                </div>

                {/* Product 4: Trite API */}
                <div className="flex flex-col items-start text-left group cursor-pointer transition-all duration-300">
                  <div className="flex items-center gap-4 flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-300 group-hover:border-[#22c55e] group-hover:shadow-[0_8px_20px_rgba(34,197,94,0.15)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/trite-api.png"
                        alt="Trite API Icon"
                        className="max-w-full max-h-full object-contain translate-y-2 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c1e43] tracking-tight group-hover:text-[#22c55e] transition-colors">
                      Trite API
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed text-left">
                    Developer-first RESTful APIs with comprehensive documentation.
                  </p>
                </div>

              </div>

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
              <div className="lg:col-span-7 space-y-12 relative text-left order-2 lg:order-1">
                <div className="space-y-4">
                  <h3 className="text-3xl font-extrabold text-black tracking-tight sm:text-4xl lg:text-5xl">
                    Why Trite
                  </h3>
                  <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-medium max-w-2xl">
                    We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly.
                  </p>
                </div>

                <div className="flex flex-col space-y-5">
                  {/* Tab navigation */}
                  <div className="grid w-full max-w-full grid-cols-2 gap-1 rounded-2xl border border-gray-200 bg-white p-1 sm:inline-flex sm:w-fit sm:items-center sm:overflow-x-auto sm:rounded-full sm:p-1.5 no-scrollbar">
                    {whyTriteItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWhyTriteIndex(idx)}
                        className={cn(
                          "w-full rounded-full px-2 py-1.5 text-center text-[10px] font-bold leading-tight transition-all duration-300 sm:w-auto sm:min-w-[120px] sm:whitespace-nowrap sm:px-6 sm:py-2.5 sm:text-sm",
                          whyTriteIndex === idx
                            ? "bg-[#0c1e43] text-white shadow-sm"
                            : "text-[#22c55e] hover:text-[#16a34a]"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>

                  {/* Carousel card */}
                  <div className="relative w-full">
                    <div className="relative min-h-[200px] overflow-hidden border border-gray-200 bg-[#f6f9fc] sm:min-h-[220px]">
                      <div className="relative h-full min-h-[200px] sm:min-h-[220px]">
                        {whyTriteItems.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{
                              opacity: whyTriteIndex === idx ? 1 : 0,
                              y: whyTriteIndex === idx ? 0 : 12,
                              pointerEvents: whyTriteIndex === idx ? "auto" : "none",
                            }}
                            transition={{
                              duration: 0.45,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className={cn(
                              "flex h-full min-h-[200px] flex-col justify-center sm:min-h-[220px]",
                              whyTriteIndex === idx
                                ? "relative"
                                : "absolute inset-0"
                            )}
                          >
                            {/* Text — left side */}
                            <div className="relative z-10 flex flex-col justify-center px-6 py-5 pr-[38%] sm:px-8 sm:py-6 sm:pr-[42%]">
                              <div className="mb-3 flex items-center gap-2.5">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-white/90" />
                                <h4 className="text-lg font-extrabold text-white sm:text-xl">
                                  {item.title}
                                </h4>
                              </div>
                              <p className="text-sm leading-relaxed text-white/90 sm:text-base">
                                {item.content}
                              </p>
                              {item.subPoints && (
                                <ul className="mt-4 space-y-1.5 pl-4 text-sm font-semibold text-white/90">
                                  {item.subPoints.map((sub, sIdx) => (
                                    <li key={sIdx} className="flex items-center gap-2">
                                      <span className="h-1 w-1 shrink-0 rounded-full bg-white/80" />
                                      {sub}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <WhyTriteCarouselAccent />
                          </motion.div>
                        ))}
                      </div>

                      {/* Auto-advance progress bar */}
                      <div className="absolute bottom-0 left-0 z-20 h-[3px] w-full bg-gray-200/60">
                        <motion.div
                          key={whyTriteIndex}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, ease: "linear" }}
                          className="h-full bg-gradient-to-r from-[#22c55e] to-[#86efac]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="lg:col-span-5 relative order-1 lg:order-2">
                <div className="relative z-10 w-full h-auto">
                  <img 
                    src="/images/girl-copy.png" 
                    alt="Why Trite" 
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: HOW TRITE WORKS & ABOUT */}
        <section
          className="relative z-10 overflow-hidden bg-[#f6f9fc] pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-28 md:py-36"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* How Trite Works */}
            <div className="space-y-14 sm:space-y-16">
              <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h3 className="text-3xl font-extrabold tracking-tight text-[#0a2540] sm:text-4xl lg:text-5xl">
                  How Trite Works
                </h3>
                <p className="text-lg font-medium text-[#425466]">
                  Our integration process is designed for speed and reliability, allowing you to start accepting payments across multiple channels in just four simple steps.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {howItWorksSteps.map((item) => (
                  <div key={item.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <HowItWorksIcon
                      icon={item.icon}
                      iconSecondary={item.iconSecondary}
                    />
                    <div className="border-b-2 border-[#22c55e] pb-1 w-fit mx-auto sm:border-b-0 sm:border-l-2 sm:pb-0 sm:pl-3 sm:mx-0 sm:w-auto">
                      <h4 className="text-lg font-bold text-[#0a2540]">
                        {item.title}
                      </h4>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#425466] sm:text-base">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT TRITE */}
        <section
          id="about"
          className="relative z-10 bg-[#fdfcf6] py-24 sm:py-32 overflow-hidden"
        >
          {/* Decorative spiral - Left side background */}
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden md:block"
            aria-hidden
          >
            <div
              className="absolute top-1/2 -left-[20%] aspect-square h-[80%] w-[80%] -translate-y-1/2 bg-[url('/images/spiral.svg')] bg-contain bg-center bg-no-repeat opacity-60 mix-blend-multiply"
            />
          </div>

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
            <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white px-6 py-12 sm:py-20 text-center sm:px-12 shadow-2xl">

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

              <div className="relative z-10 mx-auto max-w-4xl space-y-6 sm:space-y-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
                  <span className="sm:hidden">Ready to Scale?</span>
                  <span className="hidden sm:inline">Ready to Scale Your Payments?</span>
                </h2>

                <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
                  <span className="sm:hidden">Join the future of commerce with Trite.</span>
                  <span className="hidden sm:inline">Join businesses building the future of commerce with Trite.</span>
                </p>

                <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
                  <Link
                    className="inline-flex h-14 items-center justify-center rounded-full bg-[#22c55e] px-10 text-base font-bold text-white hover:bg-[#16a34a] shadow-lg hover:shadow-[#22c55e]/20 transition-all duration-300 hover:scale-105"
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
