"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
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

const industriesItems = [
  { name: "E-commerce", image: "/images/1066297649356830535.jpg" },
  { name: "Fintech", image: "/images/fintech.jpg" },
  { name: "Logistics", image: "/images/logistics.jpg" },
  { name: "Real estate", image: "/images/real-estate2.jpg" },
  { name: "Gaming platforms", image: "/images/121532.jpg" },
  { name: "Digital marketplaces", image: "/images/digital-markets.jpg" },
  { name: "SaaS businesses", image: "/images/saas.jpg" },
  { name: "Retail chains", image: "/images/e-commerce2.jpg" },
  { name: "International trade companies", image: "/images/modern-business-center.jpg" },
  { name: "Financial institutions", image: "/images/chief-financial-officer.jpg" }
];

function FeatureCard({ item, idx, total, containerScroll }: { item: any; idx: number; total: number; containerScroll: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isMobile = mounted ? window.innerWidth < 640 : false;

  // For card `idx`, it should stay at scale 1 until the next card starts scrolling over it.
  // On mobile, keep the cards at the same size so the stack stays clean and readable.
  const startScaleTrigger = (idx + 1) / total;
  const desktopTargetScale = 1 - (total - 1 - idx) * 0.025;

  const scaleX = useTransform(
    containerScroll,
    [startScaleTrigger, 1],
    [1, isMobile ? 1 : desktopTargetScale]
  );

  const scaleY = useTransform(
    containerScroll,
    [startScaleTrigger, 1],
    [1, isMobile ? 1 : desktopTargetScale]
  );

  // Stack offset controls the vertical spacing when cards are stuck
  const stackOffset = mounted ? (window.innerWidth < 640 ? 16 : 18) : 18;
  
  // The sticky wrapper has a constant top position for all cards!
  // This ensures they all unstick and scroll away together at the end of the container,
  // preventing them from compressing or covering each other.
  const stickyTop = mounted 
    ? (window.innerWidth < 640 ? 60 : 80) 
    : 80;

  // The staircase stacking offset is applied as a top offset to the inner card instead of the sticky wrapper.
  const cardTopOffset = idx * stackOffset;

  return (
    <div 
      className="sticky w-full h-[85vh] sm:h-[80vh] flex items-center justify-center"
      style={{ 
        top: `${stickyTop}px`,
        zIndex: idx + 10
      }}
    >
      <motion.div 
        className={cn(
          "w-full group overflow-hidden relative origin-top cursor-default shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_-5px_20px_-10px_rgba(0,0,0,0.15)] rounded-none",
          item.bgColor
        )}
        style={{ 
          scaleX,
          scaleY,
          top: `${cardTopOffset}px`
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-10 h-[700px] sm:h-auto sm:min-h-[550px] lg:min-h-[650px]">
          {/* Left Side: Text - 60% */}
          <div className={cn("lg:col-span-6 p-6 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 sm:space-y-8 flex-1", item.bgColor)}>
            <div className="space-y-4 sm:space-y-6">
              <div className={cn("flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm", item.iconBg, item.textColor)}>
                {item.icon}
              </div>
              <h3 className={cn("text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight", item.textColor)}>{item.title}</h3>
              <p className={cn("text-sm sm:text-lg leading-relaxed font-medium", item.textColor === "text-white" ? "text-white/80" : "text-gray-600")}>
                {item.desc}
              </p>
            </div>

            {item.points && (
              <ul className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm font-bold", item.textColor)}>
                {item.points.map((point: string) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className={cn("h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full", item.textColor === "text-white" ? "bg-white/30" : "bg-black/20")} />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {item.footer && (
              <p className={cn("text-[10px] sm:text-sm leading-relaxed font-medium pt-3 sm:pt-4 border-t", item.textColor === "text-white" ? "text-white/60 border-white/10" : "text-gray-500 border-black/5")}>
                {item.footer}
              </p>
            )}
          </div>

          {/* Right Side: Full Image - 40% */}
          <div className="lg:col-span-4 relative h-[320px] sm:h-[300px] lg:h-auto overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover object-top sm:object-center"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function BusinessesPage() {
  const [industriesIndex, setIndustriesIndex] = useState(0);
  const industriesScrollRef = useRef<HTMLDivElement>(null);

  // Carousel timer for the Industries section
  useEffect(() => {
    const timer = setInterval(() => {
      setIndustriesIndex((prev) => (prev + 1) % industriesItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Scroll active industry item into view on mobile (without affecting page scroll)
  useEffect(() => {
    if (industriesScrollRef.current) {
      const container = industriesScrollRef.current;
      const activeItem = container.children[industriesIndex] as HTMLElement;
      
      if (activeItem) {
        const scrollLeft = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.clientWidth / 2);
        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth"
        });
      }
    }
  }, [industriesIndex]);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const features = [
    {
      title: "Merchant Payment Gateway",
      desc: "Trite provides businesses with a secure payment gateway that supports:",
      points: ["Mobile money integration", "Credit and debit cards", "Stablecoin payments", "Bank transfers", "Multi-currency transactions"],
      footer: "Integrate the payment gateway into your websites, mobile apps, online stores, and enterprise systems to start receiving payments.",
      image: "/images/man-shopping.jpg",
      bgColor: "bg-black", 
      textColor: "text-white",
      icon: <Smartphone className="h-5 w-5 text-white" />,
      iconBg: "bg-white/10"
    },
    {
      title: "Business Wallet Infrastructure",
      desc: "We offer secure digital wallets designed for business operations.",
      points: ["Multi-currency storage", "Stablecoin asset management", "Instant transfers", "Treasury management", "Transaction monitoring", "Secure asset custody"],
      footer: "Businesses can manage both crypto-based and traditional financial assets within one unified dashboard.",
      image: "/images/businessman-working-laptop.jpg",
      bgColor: "bg-[#e0f2fe]", // Deeper light blue
      textColor: "text-black",
      icon: <Coins className="h-5 w-5" />,
      iconBg: "bg-white/80"
    },
    {
      title: "API & Developer Solutions",
      desc: "Our robust APIs allow developers and enterprises to integrate our payment infrastructure into their own systems.",
      points: ["Payment processing APIs", "Wallet APIs", "Merchant checkout APIs", "Bulk payout APIs", "Currency conversion APIs", "Subscription billing APIs"],
      image: "/images/payment-3.jpg",
      bgColor: "bg-[#e5e5e5]", // Deeper ash/grey
      textColor: "text-black",
      icon: <Code className="h-5 w-5" />,
      iconBg: "bg-white/80"
    },
    {
      title: "Business Analytics & Reporting",
      desc: "Data-driven insights are critical for business growth. Trite PSP includes advanced reporting and analytics tools that help businesses monitor performance and optimize financial operations.",
      points: ["Transaction tracking", "Revenue monitoring", "Payment history reports", "Financial summaries", "Settlement analysis", "Customer payment insights"],
      footer: "Businesses gain real-time visibility into payment activity across all channels.",
      image: "/images/business-report.jpg",
      bgColor: "bg-[#fef3c7]", // Deeper amber/yellow
      textColor: "text-black",
      icon: <TrendingUp className="h-5 w-5" />,
      iconBg: "bg-white/80"
    },
    {
      title: "Subscription & Recurring Billing",
      desc: "Trite supports automated recurring payment systems for subscription-based businesses.",
      points: ["SaaS platforms", "Streaming services", "Membership platforms", "Digital service providers", "E-learning platforms"],
      image: "/images/payment-5.jpg",
      bgColor: "bg-[#dcfce7]", // Deeper light green
      textColor: "text-black",
      icon: <Repeat className="h-5 w-5" />,
      iconBg: "bg-white/80"
    },
    {
      title: "E-Commerce Integration",
      desc: "Trite seamlessly integrates with modern e-commerce ecosystems.",
      points: ["Online stores", "Digital marketplaces", "Mobile commerce", "Social commerce", "On-demand services"],
      footer: "Businesses can deliver smoother customer payment experiences while expanding payment flexibility.",
      image: "/images/happy-man-with-handbags.jpg",
      bgColor: "bg-[#e5e5e5]", // Deeper light indigo
      textColor: "text-black",
      icon: <ShoppingBag className="h-5 w-5" />,
      iconBg: "bg-white/80"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-clip">
      <Header transparent={true} />

      <main>
        
        {/* HERO HEADER - Redesigned to match Homepage */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/bussines-1.jpg"
              alt="Business Solutions Hero background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-4xl space-y-4 sm:space-y-8 -mt-10 sm:-mt-5">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] sm:leading-[1.1]">
                  Business Solutions - Powering Modern Commerce with Trite.
                </h1>
                <div className="h-px w-full max-w-2xl bg-white/20 mt-3 sm:mt-6"></div>
              </div>
              
              <p className="text-sm sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                Trite is more than a payment gateway - it is a complete financial operations platform designed for modern business growth. Through advanced stablecoin integration, fiat payment support, API connectivity, merchant tools, and financial automation features, businesses can streamline transactions while expanding into global markets.
              </p>
              
              {/* CTA Buttons - Homepage Style */}
              <div className="flex flex-wrap gap-2 sm:gap-4 pt-1 sm:pt-4">
                <Link
                  className="px-5 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-base font-semibold bg-[#22c55e] text-black hover:bg-[#16a34a] rounded-full transition-all flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
                  href="/contact-sales"
                >
                  Request a Demo <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
                <Link
                  className="px-5 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-base font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-full transition-all flex items-center gap-2 hover:scale-[1.02]"
                  href="/contact-sales"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6 BUSINESS SUB-SECTIONS - Redesigned */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Overlapping Header Card */}
          <div className="relative -mt-16 sm:-mt-20 mb-16 z-20">
            <div className="inline-block bg-white px-8 pt-10 pb-16 sm:px-12 sm:pt-12 sm:pb-20">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Business Solutions
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Comprehensive Business Features
              </h2>
              <p className="text-base text-gray-500 font-medium mt-2">
                Operational support tailored for scale and global liquidity
              </p>
            </div>
          </div>

          <div 
            ref={containerRef} 
            className="relative mb-24 sm:mb-32 lg:mb-40"
          >
            {features.map((item, idx) => (
              <FeatureCard 
                key={idx} 
                item={item} 
                idx={idx} 
                total={features.length}
                containerScroll={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* ENTERPRISE SECURITY & COMPLIANCE - Redesigned */}
        <section className="relative mt-8 pb-24 pt-16 overflow-hidden bg-gradient-to-t from-[#22c55e]/10 via-white to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-black/[0.06] pt-16">
            <div className="space-y-16">
              <div className="max-w-4xl">
                <h2 className="text-4xl lg:text-6xl font-black text-black tracking-tight leading-[1.1]">
                  Security is at the core of Trite PSP’s infrastructure.
                </h2>
              </div>

              {/* Security Image */}
              <div className="relative w-full h-[400px] sm:h-[550px] lg:h-[650px] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/two-african-businessman.jpg"
                  alt="Secure Business Operations"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "End-to-end encryption", desc: "Data encryption in transit and at rest." },
                  { title: "Secure wallet protection", desc: "Custodial and multi-sig storage layers." },
                  { title: "Fraud detection systems", desc: "AI telemetry flags anomalous payments." },
                  { title: "AML/KYC compliance", desc: "Integrated Sumsub identity verification workflows." },
                  { title: "Risk management protocols", desc: "Granular risk auditing controls." },
                  { title: "Multi-layer authentication", desc: "MFA required for admin oversight." }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-4 pt-8 border-t border-black/10">
                    <h4 className="text-xl font-bold text-black">{item.title}</h4>
                    <p className="text-base text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES WE SERVE - Redesigned to match Homepage Built For section */}
        <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-center">

              {/* Mobile View Heading & Horizontal List (Visible only on small screens) */}
              <div className="lg:hidden w-full mb-8 space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Industries We Serve
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-black leading-tight">
                  Trite PSP is designed for businesses across multiple sectors:
                </h2>
                
                {/* Horizontal Scrollable List */}
                <div className="relative">
                  <div 
                    ref={industriesScrollRef}
                    className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x snap-mandatory scroll-smooth"
                  >
                    {industriesItems.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setIndustriesIndex(idx)}
                        className={cn(
                          "px-6 py-3 rounded-full border transition-all duration-300 text-center flex items-center justify-center shrink-0 snap-start cursor-pointer",
                          idx === industriesIndex 
                            ? "bg-black text-white border-black shadow-md" 
                            : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <span className="text-sm font-bold whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Left Side - Image Container */}
              <div className="w-full lg:w-[53%] h-[350px] sm:h-[480px] lg:h-[660px] relative z-10 shrink-0 overflow-hidden group shadow-md order-2 lg:order-1">
                {industriesItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === industriesIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
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

              {/* Right Side - Overlapping White Card (Desktop only vertical list) */}
              <div className="hidden lg:block lg:w-[54%] lg:-ml-24 mt-24 bg-white p-8 sm:p-12 lg:p-16 z-20 relative rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] order-1 lg:order-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Industries We Serve
                </p>

                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-black leading-tight">
                  Trite PSP is designed for businesses across multiple sectors including:
                </h2>

                {/* Horizontal line under the title */}
                <div className="h-[2px] w-24 bg-[#22c55e] mt-6 mb-8" />

                <div className="space-y-4">
                  {industriesItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 group py-0.5 cursor-pointer"
                      onMouseEnter={() => setIndustriesIndex(idx)}
                    >
                      <span className={`text-lg sm:text-xl font-medium transition-colors duration-300 min-w-[40px] sm:min-w-[48px] ${idx === industriesIndex ? "text-[#22c55e]" : "text-gray-300 group-hover:text-[#22c55e]"
                        }`}>
                        {String(idx + 1).padStart(2, '0')}/
                      </span>
                      <span className={`text-sm sm:text-base font-medium transition-colors duration-300 pt-0.5 sm:pt-1 ${idx === industriesIndex ? "text-black font-semibold" : "text-gray-400 group-hover:text-black"
                        }`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 font-medium italic pt-8 mt-8 border-t border-black/5">
                  Our scalable infrastructure adapts to businesses of all sizes - from startups to large enterprises.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* WHY CHOOSE TRITE PSP - Staggered Layout like reference */}
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pb-32">
          <div className="pt-12 border-t border-black/[0.06] space-y-16">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-3xl font-extrabold text-black tracking-tight sm:text-5xl">
                Why Businesses Choose Trite PSP
              </h3>
              <p className="text-lg text-gray-500 font-medium mt-4">
                The standard for high-velocity global settlements and institutional liquidity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Column 1 */}
              <div className="space-y-8 md:mt-16">
                {[
                  {
                    title: "Unified Financial Ecosystem",
                    desc: "One platform supporting both stablecoins and traditional payment systems.",
                    icon: <Check className="h-4 w-4" />
                  },
                  {
                    title: "Reduced Costs",
                    desc: "Lower payment processing and cross-border transaction fees.",
                    icon: <Check className="h-4 w-4" />
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl bg-[#f2f2f2] p-10 space-y-6 min-h-[320px] flex flex-col justify-start transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <div className="text-[#22c55e]">{item.icon}</div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-black text-xl leading-tight">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-8">
                {[
                  {
                    title: "Faster Global Transactions",
                    desc: "Real-time transaction processing with reduced delays.",
                    icon: <Check className="h-4 w-4" />
                  },
                  {
                    title: "Developer-Friendly APIs",
                    desc: "Flexible integration tools for custom business solutions.",
                    icon: <Check className="h-4 w-4" />
                  },
                  {
                    title: "Future-Ready Technology",
                    desc: "Built to support blockchain innovation and evolving financial ecosystems.",
                    icon: <Check className="h-4 w-4" />
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl bg-[#f2f2f2] p-10 space-y-6 min-h-[280px] flex flex-col justify-start transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <div className="text-[#22c55e]">{item.icon}</div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-black text-xl leading-tight">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-8 md:mt-8">
                {[
                  {
                    title: "Scalable Infrastructure",
                    desc: "Designed for businesses with growing operational demands.",
                    icon: <Check className="h-4 w-4" />
                  },
                  {
                    title: "Enhanced Security",
                    desc: "Enterprise-grade protection and compliance systems.",
                    icon: <Check className="h-4 w-4" />
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl bg-[#f2f2f2] p-10 space-y-6 min-h-[350px] flex flex-col justify-start transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <div className="text-[#22c55e]">{item.icon}</div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-black text-xl leading-tight">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
