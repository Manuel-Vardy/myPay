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
  // Each card darkens and scales down as the NEXT card slides over it
  const stackEndTrigger = 0.8;
  
  // The range in which THIS card is being covered by the next one
  const start = ((idx + 1) / total) * stackEndTrigger;
  const end = ((idx + 2) / total) * stackEndTrigger;
  
  // Base scale from the stack effect
  const baseScale = 0.9 + (idx * 0.02);
  // Recede slightly as the next card comes in
  const recedingScale = useTransform(containerScroll, [start, end], [1, 0.98]);
  const combinedScale = useTransform(recedingScale, s => s * baseScale);

  return (
    <motion.div 
      className="group lg:sticky relative overflow-hidden bg-white origin-top cursor-default shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.15)]"
      style={{ 
        zIndex: idx + 10,
        top: `${130 + (idx * 20)}px`,
        scale: combinedScale
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-10 min-h-[700px]">
        {/* Left Side: Text - 60% */}
        <div className={cn("lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-8", item.bgColor)}>
          <div className="space-y-6">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", item.iconBg, item.textColor)}>
              {item.icon}
            </div>
            <h3 className={cn("text-4xl lg:text-5xl font-black tracking-tight leading-tight", item.textColor)}>{item.title}</h3>
            <p className={cn("text-lg leading-relaxed font-medium", item.textColor === "text-white" ? "text-white/80" : "text-gray-600")}>
              {item.desc}
            </p>
          </div>

          {item.points && (
            <ul className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold", item.textColor)}>
              {item.points.map((point: string) => (
                <li key={point} className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", item.textColor === "text-white" ? "bg-white/30" : "bg-black/20")} />
                  {point}
                </li>
              ))}
            </ul>
          )}

          {item.footer && (
            <p className={cn("text-sm leading-relaxed font-medium pt-4 border-t", item.textColor === "text-white" ? "text-white/60 border-white/10" : "text-gray-500 border-black/5")}>
              {item.footer}
            </p>
          )}
        </div>

        {/* Right Side: Full Image - 40% */}
        <div className="lg:col-span-4 relative h-[300px] lg:h-auto overflow-hidden">
             <Image
               src={item.image}
               alt={item.title}
               fill
               className="object-cover"
             />
           </div>
      </div>
    </motion.div>
  );
}

export default function BusinessesPage() {
  const [industriesIndex, setIndustriesIndex] = useState(0);

  // Carousel timer for the Industries section
  useEffect(() => {
    const timer = setInterval(() => {
      setIndustriesIndex((prev) => (prev + 1) % industriesItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black">
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
            <div className="max-w-4xl space-y-8 -mt-5">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                  Business Solutions - Powering Modern Commerce with Trite.
                </h1>
                <div className="h-px w-full max-w-2xl bg-white/20 mt-6"></div>
              </div>
              
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
                Trite is more than a payment gateway - it is a complete financial operations platform designed for modern business growth. Through advanced stablecoin integration, fiat payment support, API connectivity, merchant tools, and financial automation features, businesses can streamline transactions while expanding into global markets.
              </p>
              
              {/* CTA Buttons - Homepage Style */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  className="px-8 py-4 font-semibold bg-[#22c55e] text-black hover:bg-[#16a34a] rounded-full transition-all flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
                  href="/demo"
                >
                  Request a Demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className="px-8 py-4 font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-full transition-all flex items-center gap-2 hover:scale-[1.02]"
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
            className="relative flex flex-col gap-0 pb-0"
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

              {/* Left Side - Image Container */}
              <div className="w-full lg:w-[53%] h-[350px] sm:h-[480px] lg:h-[660px] relative z-10 shrink-0 overflow-hidden group shadow-md">
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

              {/* Right Side - Overlapping White Card */}
              <div className="w-full lg:w-[54%] lg:-ml-24 mt-8 lg:mt-24 bg-white p-8 sm:p-12 lg:p-16 z-20 relative rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
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
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 pb-32">
          <div className="pt-24 border-t border-black/[0.06] space-y-16">
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
