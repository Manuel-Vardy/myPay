"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroHeadingCard from "@/components/HeroHeadingCard";
import { Scroll01 } from "@/components/ui/scroll-01";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Package,
  CreditCard,
  Building2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Store,
  Utensils,
  Pill,
  GraduationCap,
  Church,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

// Scroll animation hook
const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const animateElements = document.querySelectorAll(".animate-on-scroll");
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

// ── Industry block with entrance animation ────────────────────────────────
function IndustryBlock({
  ind,
  isEven,
  textX,
  imageX,
}: {
  ind: {
    id: string;
    headline: string;
    description: string;
    image: string;
    monitorPoints?: string[];
    features?: string[];
  };
  isEven: boolean;
  textX: number;
  imageX: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  const transition = { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center"
    >
      {/* Text column */}
      <motion.div
        initial={{ opacity: 0, x: textX }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: textX }}
        transition={{ ...transition, delay: 0.05 }}
        className={cn(
          "lg:col-span-6 space-y-5 sm:space-y-6",
          isEven ? "lg:order-1" : "lg:order-2"
        )}
      >
        <h3 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-black tracking-tight leading-[1.1]">
          {ind.headline}
        </h3>
        <p className="text-base sm:text-lg lg:text-[19px] text-gray-600 font-medium leading-relaxed max-w-xl">
          {ind.description}
        </p>

        {ind.monitorPoints && (
          <div className="space-y-2.5 pt-1">
            <p className="text-xs font-extrabold text-black uppercase tracking-wider pt-1">
              Key Monitoring Metrics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ind.monitorPoints.map((pt) => (
                <div key={pt} className="flex items-center gap-2.5 text-sm sm:text-base text-gray-700 font-medium">
                  <svg className="h-[18px] w-[18px] text-[#16a34a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {ind.features && !ind.monitorPoints && (
          <div className="space-y-2.5 pt-1">
            {ind.features.map((feat) => (
              <div key={feat} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700 font-medium">
                <svg className="h-[18px] w-[18px] text-[#16a34a] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Image column */}
      <motion.div
        initial={{ opacity: 0, x: imageX }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: imageX }}
        transition={{ ...transition, delay: 0.15 }}
        className={cn(
          "lg:col-span-5",
          isEven ? "lg:order-2" : "lg:order-1"
        )}
      >
        <div className="relative w-full mx-auto lg:max-w-[520px] aspect-[5/4] sm:aspect-[16/13] lg:aspect-[6/5] rounded-[28px] overflow-hidden border border-gray-200 bg-gray-100 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)]">
          <Image
            src={ind.image}
            alt={ind.headline}
            fill
            className="object-cover object-center"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function TriteAppPage() {
  useScrollAnimation();

  // 6 Core Value Propositions
  const coreFeatures = [
    {
      title: "Manage Sales",
      description:
        "Track your sales and business activity with ease. Monitor daily revenue, transaction counts, and average order values across every touchpoint in real time.",
      icon: TrendingUp,
      tag: "Real-Time Tracking",
    },

    {
      title: "Manage Inventory",
      description:
        "Know what you have in stock and what needs your attention. Receive automated low-stock alerts and expiration reminders so you never miss a reorder window.",
      icon: Package,
      tag: "Stock Alerts",
    },
    {
      title: "Manage Payments",
      description:
        "Collect payments securely with Trite and keep track of your settlements. Accept Mobile Money, cards, and bank transfers with instant reconciliation and zero manual work.",
      icon: CreditCard,
      tag: "Unified Settlements",
    },
    {
      title: "Manage Staff & Branches",
      description:
        "Manage your team, locations and business operations from one platform. Assign roles, track cashier performance, and compare branch-side metrics in a unified view.",
      icon: Building2,
      tag: "Multi-Location",
    },
    {
      title: "Track Your Business",
      description:
        "Get clear reports and insights to understand how your business is performing. Visualize trends, compare periods, and make faster, data-backed decisions every week.",
      icon: BarChart3,
      tag: "Insights & Reports",
    },
  ];

  // 5 Purpose-built Industries
  const industries = [
    {
      id: "retail",
      label: "Retail Shops",
      headline: "Retail Shops",
      tagline: "Sell, Track, Restock, Get paid.",
      icon: Store,
      image: "/images/tmos-page/retail.jpg",
      description:
        "Run your shop with greater visibility and control. Manage sales, inventory, customers, branches, staff and payments from one platform. Track gross sales, transactions, settlements and stock levels while getting alerts when inventory reaches critical levels.",
      features: [
        "Point of sale with multi-cashier management",
        "Automated alerts for reorder and minimum stock levels",
        "Inter-branch stock transfers and audits",
        "Immediate payment reconciliation through Trite",
      ],
    },
    {
      id: "eateries",
      label: "Eateries",
      headline: "Eateries",
      tagline: "Serve customers. Manage operations. Get paid.",
      icon: Utensils,
      image: "/images/tmos-page/eatery.jpg",
      description:
        "Keep your food business moving. TMOS helps eateries organize their operations, manage inventory, monitor sales and collect payments through Trite.",
      features: [
        "Built-in point of sale to browse items, build and charge orders.",
        "Accept Mobile Money and card payments in one place.",
        "Track daily sales trends, volumes, and top-selling items.",
        "Automated daily settlement summaries keep cash flow clear.",
      ],
    },
    {
      id: "pharmacies",
      label: "Pharmacies",
      headline: "Pharmacies",
      tagline: "Manage your pharmacy with confidence and control.",
      icon: Pill,
      image: "/images/tmos-page/pharmacy.jpg",
      description:
        "Bring your pharmacy operations and payments together. Manage your business activity, customers, sales, inventory and payment collections while maintaining visibility across your operations.",
      features: [
        "Batch number and expiration date tracking",
        "Customer purchase logs and recurring medication notes",
        "Fast prescription checkout with verified receipts",
        "Real-time branch inventory status and audit trails",
      ],
    },
    {
      id: "academic",
      label: "Academic Institutions",
      headline: "Academic Institutions",
      tagline: "Manage students, Collect fees, Stay in control.",
      icon: GraduationCap,
      image: "/images/tmos-page/school.jpg",
      description:
        "Simplify student and fee management. TMOS gives academic institutions tools to manage students, fee structures, collections, arrears, campuses and staff, while connecting fee collection to Trite payments.",
      monitorPoints: [
        "Fees collected",
        "Fee arrears",
        "Collection rates",
        "Payment activity",
        "Departmental collections",
        "Receipts and reports",
      ],
      features: [
        "Student enrollment and campus directory",
        "Flexible fee breakdown by grade or faculty",
        "Digital payment links for parent bank and MoMo transfers",
        "Automated digital receipts with zero reconciliation delays",
      ],
    },
    {
      id: "churches",
      label: "Churches",
      headline: "Churches",
      tagline: "Manage your community, Simplify operations, Get paid.",
      icon: Church,
      image: "/images/tmos-page/church-1.jpg",
      description:
        "Manage your church's operations and payments from one place. TMOS provides a centralized platform to help churches manage their community, operations and payment activities while using Trite to collect payments.",
      features: [
        "Managing dues and offerings from members.",
        "Digital tithes, offerings, and special project pledges",
        "Multi-branches and staff management.",
        "Instant transaction receipts for donors and members",
      ],
    },
  ];

  // 6 Dashboard Telemetry Metrics
  const dashboardMetrics = [
    {
      title: "Gross Sales",
      description: "See how much your business is selling.",
      icon: TrendingUp,
      value: "GHS 128,450.00",
      subtext: "+14.2% from last month",
      cardBg: "#d4ecff",
      cardImage: "/images/tmos-page/gross_sales-Photoroom.png",
    },
    {
      title: "Settled by Trite",
      description: "Track payments processed and settled through Trite.",
      icon: ShieldCheck,
      value: "GHS 128,450.00",
      subtext: "100% settled • Next run at 17:00",
      cardBg: "#b0ffd9",
      cardImage: "/images/tmos-page/settled_by_trite_silver-Photoroom.png",
    },
    {
      title: "Transactions",
      description: "Monitor transaction volumes and values.",
      icon: Activity,
      value: "1,842 txns",
      subtext: "Avg. order value: GHS 69.73",
      cardBg: "#ffd5bc",
      cardImage: "/images/tmos-page/transactions_silver-Photoroom.png",
    },
    {
      title: "Stock at Risk",
      description: "Identify products approaching or below their reorder levels.",
      icon: AlertTriangle,
      value: "4 Products",
      subtext: "Immediate reorder recommended",
      alert: true,
      cardBg: "#ffd6d6",
      cardImage: "/images/tmos-page/stock_at_risk_silver-Photoroom.png",
    },
    {
      title: "Sales vs Settlement",
      description: "Compare your sales activity with settlements over time.",
      icon: BarChart3,
      value: "99.98% Parity",
      subtext: "Zero unresolved discrepancies",
      cardBg: "#fffec7",
      cardImage: "/images/tmos-page/sales_vs_settlement_silver-Photoroom.png",
    },
    {
      title: "Branch Performance",
      description: "Compare revenue, stock value and staff across branches.",
      icon: Layers,
      value: "3 Active Branches",
      subtext: "Accra Central, Osu & Kumasi",
      cardBg: "#ecfeff",
      cardImage: "/images/tmos-page/branch_performance_silver-Photoroom.png",
    },
  ];

  return (
    <>
      {/* Global CSS animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }
        .animate-on-scroll {
          opacity: 0;
        }
        .stagger-1 {
          animation-delay: 0.1s;
        }
        .stagger-2 {
          animation-delay: 0.2s;
        }
        .stagger-3 {
          animation-delay: 0.3s;
        }
        .stagger-4 {
          animation-delay: 0.4s;
        }
      `}</style>

      <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/20 selection:text-black">
        <Header transparent={true} darkLogo={false} hideBorder={true} />

        <main>
          {/* ── 1. HERO SECTION (Full Width Background Image, Dark Overlay, White Text) ── */}
          <section className="relative w-full bg-black min-h-[750px] sm:min-h-[650px] lg:min-h-screen pt-24 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 lg:pb-40 overflow-hidden">
            {/* Background Image: hero-image-3.jpg from public/images/tmos-page */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src="/images/tmos-page/hero-image-3.jpg"
                alt="TMOS Hero background"
                fill
                className="object-cover object-[center_30%]"
                priority
              />
              {/* Uniform dark overlay matching the left side across the entire hero */}
              <div className="absolute inset-0 bg-black/55" />
            </div>

            {/* Content Container: Centered text */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center min-h-[600px] sm:min-h-[650px] lg:min-h-[720px] py-16 sm:py-20 lg:py-24">
                {/* ── Centered Content ── */}
                <div className="w-full max-w-2xl text-center space-y-5">


                  {/* Headline in White */}
                  <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.15]">
                    Run your business, <br />
                    <span className="text-[#22c55e]">Get paid</span>, Stay in control.
                  </h1>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/get-started"
                      className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#22c55e] text-white text-xs sm:text-sm font-bold tracking-wide hover:bg-[#16a34a] transition-all duration-200 shadow-sm"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-bold tracking-wide hover:bg-white hover:text-black border border-white/30 transition-all duration-200"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. SECTION: EVERYTHING YOU NEED TO MANAGE YOUR BUSINESS ── */}
          <section className="relative bg-white pt-10 pb-0 sm:pt-12 sm:pb-0 rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[40px] -mt-32 sm:-mt-16 md:-mt-20 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Heading Card - Overlaps hero */}
              <div className="relative -mt-16 sm:-mt-20 lg:-mt-32 mb-8 sm:mb-10 flex justify-start z-20">
                <HeroHeadingCard
                  className="lg:w-6/12 xl:w-5/12"
                  label="Business Operations"
                  title={
                    <>
                      Everything you need to
                      <br />
                      manage your business
                    </>
                  }
                  titleClassName="text-base sm:text-lg lg:text-xl xl:text-2xl"
                />
              </div>

              {/* Content - On section background */}
              <div className="max-w-6xl mx-auto">
                <div className="animate-on-scroll flex flex-col items-center justify-center gap-6 mb-12">
                  <p className="text-lg sm:text-xl text-gray-600 font-medium text-center">
                    Running a business is easier when everything is in one place. With TMOS, you can:
                  </p>
                </div>

              {/* Scroll-driven Sticky Image + Text pairs */}
              <Scroll01
                items={coreFeatures.map((feat, idx) => ({
                  title: feat.title,
                  description: feat.description,
                  media: [
                    "/images/tmos-page/sales-laptop-mockup.png",
                    "/images/tmos-page/inventory-laptop.png",
                    "/images/tmos-page/payment-laptop.png",
                    "/images/tmos-page/staff-laptop.png",
                    "/images/tmos-page/report-laptop.png",
                  ][idx],
                  ...(idx === 0 && { mediaExtra: "/images/tmos-page/sales-phone-mockup.png" }),
                  ...(idx === 1 && { mediaExtra: "/images/tmos-page/inventory-phone.png" }),
                  ...(idx === 2 && { mediaExtra: "/images/tmos-page/payment-phone.png" }),
                  ...(idx === 3 && { mediaExtra: "/images/tmos-page/staff-phone.png" }),
                  ...(idx === 4 && { mediaExtra: "/images/tmos-page/report-phone.png" }),
                }))}
              />
              </div>
            </div>
          </section>

          {/* ── 3. SECTION: BUILT FOR YOUR BUSINESS ── */}
          <section className="relative bg-white pt-40 sm:pt-10 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-14 sm:mb-16 lg:mb-20 text-center max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold text-black tracking-tight leading-[1.08]">
                  Built for your business
                </h2>
                <p className="mt-5 text-base sm:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                  TMOS provides purpose-built experiences for different types of businesses and institutions.
                </p>
              </div>

              {/* Alternating side-by-side industry blocks */}
              <div className="space-y-20 sm:space-y-24 lg:space-y-28">
                {industries.map((ind, idx) => {
                  const isEven = idx % 2 === 0;
                  // Text is on the left for even, right for odd
                  // So text slides from left for even, right for odd
                  // Image slides from right for even, left for odd
                  const textX = isEven ? -56 : 56;
                  const imageX = isEven ? 56 : -56;

                  return (
                    <IndustryBlock
                      key={ind.id}
                      ind={ind}
                      isEven={isEven}
                      textX={textX}
                      imageX={imageX}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── 4. SECTION: KNOW WHAT IS HAPPENING IN YOUR BUSINESS (TELEMETRY & DASHBOARD) ── */}
          <section className="relative bg-[#f8fafc] py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Real-Time Visibility
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight mt-4 mb-4">
                  Know what is happening in your business
                </h2>
                <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                  Your TMOS dashboard gives you a real-time view of the numbers that matter. For businesses such as retail
                  shops, eateries and pharmacies, you can monitor:
                </p>
              </div>

              {/* 6 Metrics Grid — Text on top, image below, light pastel card backgrounds */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-14 sm:mb-16">
                {dashboardMetrics.map((metric, idx) => {
                  return (
                    <div
                      key={metric.title}
                      className="animate-on-scroll rounded-[28px] overflow-hidden border border-black/[0.06] flex flex-col transition-all duration-300 hover:shadow-[0_22px_60px_-28px_rgba(0,0,0,0.22)] hover:-translate-y-1"
                      style={{
                        animationDelay: `${idx * 0.08}s`,
                        backgroundColor: metric.cardBg,
                      }}
                    >
                      {/* Top: Text content */}
                      <div className="p-6 sm:p-8 flex-1 space-y-4">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight leading-[1.15]">
                          {metric.title}
                        </h3>

                        <p className="text-[15px] sm:text-base text-gray-700 font-medium leading-relaxed">
                          {metric.description}
                        </p>
                      </div>

                      {/* Bottom: Image area — larger, flush against bottom-right corner */}
                      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-[96%] h-[96%]">
                          <Image
                            src={metric.cardImage}
                            alt={metric.title}
                            fill
                            className="object-contain object-right-bottom"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── 5. CALL TO ACTION SECTION (Dark Card with Background Image) ── */}
          <section className="relative bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white px-6 py-12 sm:py-20 text-center sm:px-12 shadow-2xl">

                {/* Background image and overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <Image
                    src="/images/african-man-touching.png"
                    alt="Ready to scale"
                    fill
                    className="object-cover opacity-40 mix-blend-luminosity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
                </div>

                {/* Green glow accents */}
                <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#22c55e]/20 blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#22c55e]/20 blur-[80px] pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-4xl space-y-6 sm:space-y-8">
                  <span className="animate-on-scroll stagger-1 inline-flex text-xs font-bold uppercase tracking-wider text-gray-300 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                    Empower Your Business
                  </span>

                  <h2 className="animate-on-scroll stagger-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    Ready to run your business with TMOS?
                  </h2>

                  <p className="animate-on-scroll stagger-3 text-base sm:text-lg text-gray-200 font-medium leading-relaxed max-w-2xl mx-auto">
                    Join modern retail shops, eateries, pharmacies, academic institutions and churches managing operations
                    and collecting payments with confidence.
                  </p>

                  <div className="animate-on-scroll stagger-4 pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
                    <Link
                      href="/get-started"
                      className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-[#22c55e] text-white text-base font-bold hover:bg-[#16a34a] shadow-lg hover:shadow-[#22c55e]/20 transition-all duration-300 hover:scale-105"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-base font-semibold hover:bg-white/20 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
