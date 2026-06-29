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

// Animation hook for scroll-based reveals
const useScrollAnimation = () => {
  const [elements, setElements] = useState<Set<Element>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

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

  // Initialize scroll animations
  useScrollAnimation();

  return (
    <>
      {/* CSS Animation Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up  { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-scale-in    { animation: scaleIn  0.8s ease-out forwards; }
        .animate-on-scroll   { opacity: 0; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stagger-7 { animation-delay: 0.7s; }
        .stagger-8 { animation-delay: 0.8s; }
      `}</style>
    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main>
        {/* SECTION 5: PRODUCTS */}
        <section
          id="products"
          className="animate-on-scroll relative z-10 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16 overflow-hidden"
          style={{ backgroundColor: "rgba(247, 247, 247, 1)" }}
        >
          {/* SVG Background */}
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            {/* Desktop Background SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1423 560" className="hidden sm:block w-full h-full opacity-50"> 
                <g mask="url(#SvgjsMask1034)" fill="none"> 
                    <rect width="1423" height="560" x="0" y="0" fill="rgba(243, 243, 243, 1)"></rect> 
                    <path d="M 0,97 C 95,116.2 285,192.2 475,193 C 665,193.8 760.4,100.6 950,101 C 1139.6,101.4 1328.4,176.2 1423,195L1423 560L0 560z" fill="rgba(255, 255, 255, 1)"></path> 
                    <path d="M 0,439 C 142.4,411.4 427.4,281.6 712,301 C 996.6,320.4 1280.8,489 1423,536L1423 560L0 560z" fill="rgba(247, 247, 247, 1)"></path> 
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

          <div className="animate-on-scroll stagger-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Top Row: Heading and Image on Left, Paragraph on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-16 sm:mb-24">
              
              {/* Left Column: Heading & Image */}
              <div className="lg:col-span-5 space-y-6">
                <div className="animate-on-scroll stagger-2 space-y-3">
                  <p className="animate-on-scroll stagger-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    PRODUCTS
                  </p>
                  <h2 className="animate-on-scroll stagger-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-black leading-tight">
                    Our Suite of <br className="hidden sm:inline" /> Payment Products
                  </h2>
                </div>

                {/* Image happy.png */}
                <div className="animate-on-scroll stagger-5 max-w-md pt-4">
                  <img
                    src="/images/happy-1.png"
                    alt="Happy customer"
                    className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Right Column: Paragraph Text */}
              <div className="animate-on-scroll stagger-6 lg:col-span-7 lg:self-end lg:pb-16">
                <p className="pt-4 text-base sm:text-lg leading-relaxed text-gray-600 font-medium">
                  Trite provides a comprehensive suite of payment solutions designed to empower businesses with seamless, secure, and scalable payment infrastructure across Africa and beyond. Our products are built to handle the complexities of modern commerce, from stablecoin settlements to traditional banking rails.
                </p>
              </div>
              
            </div>
            {/* Layout Grid: 4 Cards Surrounding Center Student Image */}
            <div className="animate-on-scroll stagger-7 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
              
              {/* Left Column: Cards 1 & 3 (Trite Gateway & Trite Merchant Dashboard) */}
              <div className="lg:col-span-4 flex flex-col gap-12 sm:gap-16 order-2 lg:order-1">
                
                {/* Product 1: Trite Gateway */}
                <div className="animate-on-scroll stagger-8 flex flex-col lg:items-end items-start text-left lg:text-right group cursor-pointer transition-all duration-500 hover:translate-y-[-8px]">
                  <div className="flex items-center gap-4 lg:flex-row-reverse flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-500 group-hover:border-[#22c55e] group-hover:shadow-[0_12px_30px_rgba(34,197,94,0.2)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/gateway.png"
                        alt="Trite Gateway Icon"
                        className="max-w-full max-h-full object-contain translate-y-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                      Trite Gateway
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed lg:text-right text-left transition-colors duration-300 group-hover:text-gray-700">
                    Complete online payment solution for web & mobile businesses.
                  </p>
                </div>

                {/* Product 3: Trite Merchant Dashboard */}
                <div className="animate-on-scroll stagger-8 flex flex-col lg:items-end items-start text-left lg:text-right group cursor-pointer transition-all duration-500 hover:translate-y-[-8px]" style={{ animationDelay: '1.0s' }}>
                  <div className="flex items-center gap-4 lg:flex-row-reverse flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-500 group-hover:border-[#22c55e] group-hover:shadow-[0_12px_30px_rgba(34,197,94,0.2)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/mockup7.png"
                        alt="Trite Merchant Dashboard Icon"
                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                      Trite Merchant Dashboard
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed lg:text-right text-left transition-colors duration-300 group-hover:text-gray-700">
                    Advanced reporting, reconciliation, settlement tracking, and business insights.
                  </p>
                </div>

              </div>

              {/* Center Column: Middle Student Showcase */}
              <div className="animate-on-scroll animate-scale-in lg:col-span-4 flex items-center justify-center order-1 lg:order-2" style={{ animationDelay: '0.6s' }}>
                <div className="relative flex items-center justify-center py-8 lg:py-0">
                  {/* Background gradient glow only */}
                  <div className="absolute w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-tr from-[#22c55e]/5 to-transparent pointer-events-none blur-xl transition-all duration-1000 hover:from-[#22c55e]/10" />
                  
                  {/* Student Image Showcase - Expanded */}
                  <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full overflow-hidden border-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-[#22c55e]/5 transition-all duration-700 hover:scale-[1.05] hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] group">
                    <Image
                      src="/images/student.jpg"
                      alt="Student"
                      fill
                      className="object-cover object-center scale-100 group-hover:scale-110 transition-all duration-700 ease-out"
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
                <div className="animate-on-scroll stagger-8 flex flex-col items-start text-left group cursor-pointer transition-all duration-500 hover:translate-y-[-8px]" style={{ animationDelay: '0.8s' }}>
                  <div className="flex items-center gap-4 flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-500 group-hover:border-[#22c55e] group-hover:shadow-[0_12px_30px_rgba(34,197,94,0.2)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/stablecoin-logo.png"
                        alt="Trite Stable-Pay Icon"
                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                      Trite Stable-Pay
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed text-left transition-colors duration-300 group-hover:text-gray-700">
                    Stablecoin acceptance with automatic fiat conversion and settlement.
                  </p>
                </div>

                {/* Product 4: Trite API */}
                <div className="animate-on-scroll stagger-8 flex flex-col items-start text-left group cursor-pointer transition-all duration-500 hover:translate-y-[-8px]" style={{ animationDelay: '1.2s' }}>
                  <div className="flex items-center gap-4 flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-500 group-hover:border-[#22c55e] group-hover:shadow-[0_12px_30px_rgba(34,197,94,0.2)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/trite-api.png"
                        alt="Trite API Icon"
                        className="max-w-full max-h-full object-contain translate-y-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                      Trite API
                    </h3>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed text-left transition-colors duration-300 group-hover:text-gray-700">
                    Developer-first RESTful APIs with comprehensive documentation.
                  </p>
                </div>

              </div>

            </div>

            {/* CTA Button - Now under the cards */}
            <div className="animate-on-scroll stagger-8 mt-20 flex justify-center" style={{ animationDelay: '1.4s' }}>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-10 py-5 font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] rounded-full transition-all duration-500 gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.05] hover:translate-y-[-4px]"
              >
                Explore Product Suite <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6: WHY TRITE */}
        <section
          id="why-trite"
          className="animate-on-scroll relative z-10 pt-10 sm:pt-16 md:pt-20 pb-20 sm:pb-28 md:pb-36 overflow-hidden"
          style={{ backgroundColor: "rgba(247, 247, 247, 1)" }}
        >
          <div className="animate-on-scroll stagger-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Text content */}
              <div className="lg:col-span-7 space-y-12 relative text-left order-2 lg:order-1">
                <div className="animate-on-scroll stagger-2 space-y-4">
                  <h3 className="animate-on-scroll stagger-3 text-3xl font-extrabold text-black tracking-tight sm:text-4xl lg:text-5xl">
                    Why Trite
                  </h3>
                  <p className="animate-on-scroll stagger-4 text-xl sm:text-2xl text-gray-600 leading-relaxed font-medium max-w-2xl lg:mx-0">
                    We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly.
                  </p>
                </div>

                <div className="animate-on-scroll stagger-5 flex flex-col space-y-5">
                  {/* Tab navigation */}
                  <div className="animate-on-scroll stagger-6 grid w-full max-w-full grid-cols-2 gap-1 rounded-2xl border border-gray-200 bg-white p-1 sm:inline-flex sm:w-fit sm:items-center sm:overflow-x-auto sm:rounded-full sm:p-1.5 no-scrollbar transition-all duration-300 hover:shadow-lg">
                    {whyTriteItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWhyTriteIndex(idx)}
                        className={cn(
                          "w-full rounded-full px-2 py-1.5 text-center text-[10px] font-bold leading-tight transition-all duration-500 sm:w-auto sm:min-w-[120px] sm:whitespace-nowrap sm:px-6 sm:py-2.5 sm:text-sm transform hover:scale-105",
                          whyTriteIndex === idx
                            ? "bg-[#0c1e43] text-white shadow-sm scale-105"
                            : "text-[#22c55e] hover:text-[#16a34a] hover:bg-gray-50"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>

                  {/* Carousel card */}
                  <div className="animate-on-scroll stagger-7 relative w-full">
                    <div className="relative min-h-[200px] overflow-hidden border border-gray-200 bg-[#f6f9fc] sm:min-h-[220px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500">
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
                              <div className="mb-3 flex items-center gap-2.5 transform transition-transform duration-300 hover:translate-x-1">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-white/90 animate-pulse" />
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
                                    <li key={sIdx} className="flex items-center gap-2 transform transition-transform duration-300 hover:translate-x-1">
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
                          className="h-full bg-gradient-to-r from-[#22c55e] to-[#86efac] shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="animate-on-scroll stagger-8 lg:col-span-5 relative order-1 lg:order-2">
                <div className="relative z-10 w-full h-auto group">
                  <img 
                    src="/images/girl-copy.png" 
                    alt="Why Trite" 
                    className="w-full h-auto object-contain drop-shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:drop-shadow-3xl"
                  />
                  {/* Subtle background glow */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-[#22c55e]/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: HOW TRITE WORKS & ABOUT */}
        <section
          className="animate-on-scroll relative z-10 overflow-hidden bg-white pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-28 md:py-36"
        >
          <div className="animate-on-scroll stagger-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* How Trite Works */}
            <div className="space-y-16 lg:space-y-24">
              <div className="animate-on-scroll stagger-2 mx-auto max-w-3xl space-y-4 text-center">
                <h3 className="animate-on-scroll stagger-3 text-3xl font-extrabold tracking-tight text-[#0a2540] sm:text-4xl lg:text-5xl">
                  How Trite Works
                </h3>
                <p className="animate-on-scroll stagger-4 text-lg font-medium text-[#425466]">
                  Our integration process is designed for speed and reliability, allowing you to start accepting payments across multiple channels in just four simple steps.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
                {/* Left Column: Image Container */}
                <div className="lg:col-span-6 animate-on-scroll stagger-5 relative rounded-lg overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.08)] h-[350px] sm:h-[450px] lg:h-[620px] w-full">
                  <Image
                    src="/images/how-it-works.jpg"
                    alt="How Trite Works"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>

                {/* Right Column: Steps */}
                <div className="lg:col-span-6 animate-on-scroll stagger-6 flex flex-col justify-center space-y-8 lg:space-y-12">
                  {howItWorksSteps.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div 
                        key={item.title} 
                        className="relative pl-20 lg:pl-0 group cursor-pointer transition-all duration-300"
                      >
                        {/* Overlapping White Box Indicator */}
                        <div className="absolute left-4 top-0 lg:-left-[92px] flex h-14 w-14 items-center justify-center bg-white border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-none transition-all duration-300 group-hover:border-[#22c55e] group-hover:scale-105 z-20">
                          <IconComponent className="h-6 w-6 text-[#0a2540] group-hover:text-[#22c55e] transition-colors duration-300" />
                        </div>

                        {/* Step text content */}
                        <div className="space-y-2 text-left">
                          <h4 className="text-xl font-bold text-[#0a2540] transition-colors duration-300 group-hover:text-[#22c55e]">
                            {index + 1} — {item.title}
                          </h4>
                          <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium transition-colors duration-300 group-hover:text-gray-700">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* READY TO SCALE YOUR PAYMENTS? */}
        <section className="animate-on-scroll relative bg-white py-20 sm:py-28 md:py-36">
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
                <h2 className="animate-on-scroll stagger-1 text-3xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
                  <span className="sm:hidden">Ready to Scale?</span>
                  <span className="hidden sm:inline">Ready to Scale Your Payments?</span>
                </h2>

                <p className="animate-on-scroll stagger-2 text-lg sm:text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
                  <span className="sm:hidden">Join the future of commerce with Trite.</span>
                  <span className="hidden sm:inline">Join businesses building the future of commerce with Trite.</span>
                </p>

                <div className="animate-on-scroll stagger-3 mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
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
    </>
  );
}
