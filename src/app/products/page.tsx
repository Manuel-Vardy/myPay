"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";

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
          className="relative z-10 bg-white pt-32 sm:pt-40 md:pt-48 pb-10 sm:pb-16 md:pb-20 overflow-hidden"
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
                      className="relative aspect-[1.1/1] sm:aspect-[1.3/1] overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.02] bg-white rounded-xl border border-gray-100"
                    >
                      {/* Secondary Color Block - Vibrant Base */}
                      <div className={`absolute bottom-0 w-full h-[30%] sm:h-[35%] z-0 ${prod.blockColor}`} />
                      
                      {/* Content Overlay - Top White Part */}
                      <div className="relative z-20 p-5 sm:p-7 h-full flex flex-col justify-between">
                        <div className={`w-[85%] sm:w-[60%] ${prod.layout === 'right' ? 'ml-auto text-right' : ''}`}>
                          <h3 className="text-xl sm:text-2xl font-black leading-tight mb-2 text-black">
                            {prod.title}
                          </h3>
                          <p className="text-sm sm:text-lg font-medium leading-relaxed text-gray-600">
                            {prod.desc}
                          </p>
                        </div>
                        
                        {/* White accent line on the vibrant block */}
                        <div className={`h-1.5 w-14 bg-white/40 ${prod.layout === 'left' ? 'mb-2' : 'ml-auto mb-2'}`} />
                      </div>

                      {/* Product Image - Pushed to corners */}
                      <div className={`absolute ${prod.imgPos} w-[50%] sm:w-[55%] h-[70%] sm:h-[80%] z-10 ${prod.layout === 'left' ? '-right-4' : (prod.imgSide || '-left-4')}`}>
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
                      className="relative aspect-[1.1/1] sm:aspect-[1.3/1] overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.02] bg-white rounded-xl border border-gray-100"
                    >
                      {/* Secondary Color Block - Vibrant Base */}
                      <div className={`absolute bottom-0 w-full h-[30%] sm:h-[35%] z-0 ${prod.blockColor}`} />
                      
                      {/* Content Overlay - Top White Part */}
                      <div className="relative z-20 p-5 sm:p-7 h-full flex flex-col justify-between">
                        <div className={`w-[85%] sm:w-[60%] ${prod.layout === 'right' ? 'ml-auto text-right' : ''}`}>
                          <h3 className="text-xl sm:text-2xl font-black leading-tight mb-2 text-black">
                            {prod.title}
                          </h3>
                          <p className="text-sm sm:text-lg font-medium leading-relaxed text-gray-600">
                            {prod.desc}
                          </p>
                        </div>
                        
                        {/* White accent line on the vibrant block */}
                        <div className={`h-1.5 w-14 bg-white/40 ${prod.layout === 'left' ? 'mb-2' : 'ml-auto mb-2'}`} />
                      </div>

                      {/* Product Image - Pushed to corners */}
                      <div className={`absolute ${prod.imgPos} w-[50%] sm:w-[55%] h-[70%] sm:h-[80%] z-10 ${prod.layout === 'left' ? '-right-4' : '-left-4'}`}>
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
              <div className="lg:col-span-7 space-y-12 relative text-left order-2 lg:order-1">
                <div className="space-y-4">
                  <h3 className="text-3xl font-extrabold text-black tracking-tight sm:text-4xl lg:text-5xl">
                    Why Trite
                  </h3>
                  <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-medium max-w-2xl">
                    We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Custom Indicators - Styled as Segmented Control */}
                  <div className="inline-flex items-center p-1.5 bg-white border border-gray-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.03)] w-fit max-w-full overflow-x-auto no-scrollbar">
                    {whyTriteItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWhyTriteIndex(idx)}
                        className={cn(
                          "px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap min-w-[120px]",
                          whyTriteIndex === idx
                            ? "bg-[#0c1e43] text-white shadow-sm"
                            : "text-[#22c55e] hover:text-[#16a34a]"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>

                  <div className="w-full relative">
                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-50 min-h-[260px] flex flex-col justify-center relative overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)]">
                      
                      <div className="relative h-full flex flex-col justify-center w-full">
                        {whyTriteItems.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{
                              opacity: whyTriteIndex === idx ? 1 : 0,
                              y: whyTriteIndex === idx ? 0 : -15,
                              scale: whyTriteIndex === idx ? 1 : 0.98,
                              pointerEvents: whyTriteIndex === idx ? "auto" : "none"
                            }}
                            transition={{ 
                              duration: 0.5, 
                              ease: [0.23, 1, 0.32, 1] 
                            }}
                            className={cn(
                              "space-y-4",
                              whyTriteIndex === idx ? "relative" : "absolute inset-0 flex flex-col justify-center"
                            )}
                          >
                            <div className="text-xl sm:text-2xl font-extrabold text-[#0c1e43] flex items-center gap-3">
                              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                              {item.title}
                            </div>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-medium">
                              {item.content}
                            </p>
                            {item.subPoints && (
                              <ul className="text-sm text-gray-800 font-bold space-y-2 pl-6 list-disc">
                                {item.subPoints.map((sub, sIdx) => (
                                  <li key={sIdx}>{sub}</li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {/* Progress Bar (Moving Line) */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            key={whyTriteIndex}
                            className="h-full bg-gradient-to-r from-[#22c55e] to-[#92bd30]"
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
                        <div className="h-20 w-20 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-green-200/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#16a34a]">
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
