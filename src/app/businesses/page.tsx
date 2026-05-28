"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

export default function BusinessesPage() {
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32">
          <div className="border-b border-black/[0.06] pb-6 mb-16">
            <h2 className="text-3xl font-extrabold text-black tracking-tight sm:text-4xl">Comprehensive Business Features</h2>
            <p className="text-lg text-gray-500 font-medium mt-2">Operational support tailored for scale and global liquidity</p>
          </div>

          <div className="relative flex flex-col gap-12 lg:gap-16 pb-24">
            {[
              {
                title: "Merchant Payment Gateway",
                desc: "Trite provides businesses with a secure payment gateway that supports:",
                points: ["Mobile money integration", "Credit and debit cards", "Stablecoin payments", "Bank transfers", "Multi-currency transactions"],
                footer: "Integrate the payment gateway into your websites, mobile apps, online stores, and enterprise systems to start receiving payments.",
                image: "/images/payment-1.jpg",
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
                image: "/images/payment-2.jpg",
                bgColor: "bg-[#f0f9ff]", // Light blue
                textColor: "text-black",
                icon: <Coins className="h-5 w-5" />,
                iconBg: "bg-white/80"
              },
              {
                title: "API & Developer Solutions",
                desc: "Our robust APIs allow developers and enterprises to integrate our payment infrastructure into their own systems.",
                points: ["Payment processing APIs", "Wallet APIs", "Merchant checkout APIs", "Bulk payout APIs", "Currency conversion APIs", "Subscription billing APIs"],
                image: "/images/payment-3.jpg",
                bgColor: "bg-[#f2f2f2]", // Ash / Grey
                textColor: "text-black",
                icon: <Code className="h-5 w-5" />,
                iconBg: "bg-white/80"
              },
              {
                title: "Business Analytics & Reporting",
                desc: "Data-driven insights are critical for business growth. Trite PSP includes advanced reporting and analytics tools that help businesses monitor performance and optimize financial operations.",
                points: ["Transaction tracking", "Revenue monitoring", "Payment history reports", "Financial summaries", "Settlement analysis", "Customer payment insights"],
                footer: "Businesses gain real-time visibility into payment activity across all channels.",
                image: "/images/payment-4.jpg",
                bgColor: "bg-[#fffbeb]", // Light yellow (Maintained)
                textColor: "text-black",
                icon: <TrendingUp className="h-5 w-5" />,
                iconBg: "bg-white/80"
              },
              {
                title: "Subscription & Recurring Billing",
                desc: "Trite supports automated recurring payment systems for subscription-based businesses.",
                points: ["SaaS platforms", "Streaming services", "Membership platforms", "Digital service providers", "E-learning platforms"],
                image: "/images/payment-5.jpg",
                bgColor: "bg-[#f0fdf4]", // Light green
                textColor: "text-black",
                icon: <Repeat className="h-5 w-5" />,
                iconBg: "bg-white/80"
              },
              {
                title: "E-Commerce Integration",
                desc: "Trite seamlessly integrates with modern e-commerce ecosystems.",
                points: ["Online stores", "Digital marketplaces", "Mobile commerce", "Social commerce", "On-demand services"],
                footer: "Businesses can deliver smoother customer payment experiences while expanding payment flexibility.",
                image: "/images/payment-6.jpg",
                bgColor: "bg-[#f5f3ff]", // Light indigo (Maintained)
                textColor: "text-black",
                icon: <ShoppingBag className="h-5 w-5" />,
                iconBg: "bg-white/80"
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                className="group lg:sticky relative overflow-hidden bg-white transition-all border-b border-black/[0.03] origin-top cursor-default"
                style={{ 
                  zIndex: idx + 10,
                  top: `${130 + (idx * 20)}px`,
                  transform: `scale(${0.9 + (idx * 0.02)})`
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
                        {item.points.map((point) => (
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
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ENTERPRISE SECURITY & COMPLIANCE - Redesigned */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 py-24 border-t border-black/[0.06]">
          <div className="space-y-16">
            <div className="max-w-4xl">
              <h2 className="text-4xl lg:text-6xl font-black text-black tracking-tight leading-[1.1]">
                Security is at the core of Trite PSP’s infrastructure.
              </h2>
            </div>

            {/* Security Image */}
            <div className="relative w-full h-[400px] sm:h-[550px] lg:h-[650px] overflow-hidden">
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
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#16a34a]">
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
          <div className="bg-[#22c55e] rounded-3xl p-8 sm:p-12 text-center space-y-6">
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
