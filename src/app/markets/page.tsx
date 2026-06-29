"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroHeadingCard from "@/components/HeroHeadingCard";
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

export default function MarketsPage() {
  // Initialize scroll animations
  useScrollAnimation();

  return (
    <>
      {/* CSS Animation Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.8s ease-out forwards;
        }

        .animate-on-scroll {
          opacity: 0;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stagger-7 { animation-delay: 0.7s; }
        .stagger-8 { animation-delay: 0.8s; }

        /* 125% display scale on laptops — reduce markets hero text slightly */
        @media screen and (min-resolution: 120dpi) and (max-resolution: 144dpi) and (min-width: 1024px) {
          .markets-hero-heading {
            font-size: 2.75rem !important;
            line-height: 1.15 !important;
          }
          .markets-hero-subtext {
            font-size: 0.95rem !important;
            line-height: 1.6 !important;
          }
        }
      `}</style>

    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
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

          <div className="animate-on-scroll stagger-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-40 lg:pt-48 flex justify-center lg:justify-end w-full">
            <div className="max-w-3xl space-y-4 sm:space-y-6 flex flex-col items-center text-center lg:items-end lg:text-right">
              <h1 className="animate-on-scroll stagger-2 markets-hero-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Expanding the Future <br className="hidden sm:block" /> of Payments with Trite
              </h1>
              <div className="animate-on-scroll stagger-3 h-px w-full bg-white/20 my-4 sm:my-6"></div>
              <p className="animate-on-scroll stagger-4 markets-hero-subtext max-w-2xl text-base sm:text-xl text-white/90 leading-relaxed">
                At TRITE we are redefining how businesses, merchants, institutions, and individuals move money across both digital and traditional financial ecosystems. Our platform is uniquely designed to support stablecoin transactions and traditional cash payments within one secure, scalable, and intelligent infrastructure.
              </p>
            </div>
          </div>
        </section>



        {/* MARKET LISTINGS REDESIGN */}
        <section className="animate-on-scroll relative bg-white pt-10 pb-4 rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[40px] -mt-6 sm:-mt-8 md:-mt-10 z-10">
          <div className="animate-on-scroll stagger-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Overlapping Heading Card */}
          <div className="animate-on-scroll stagger-2 relative -mt-16 sm:-mt-20 mb-24 z-20">
            <HeroHeadingCard
              label="Markets"
              title={
                <>
                  Deep Dive into
                  <br />
                  Markets
                </>
              }
            />
            <p className="animate-on-scroll stagger-3 mt-6 max-w-xl px-6 text-lg font-medium leading-relaxed text-gray-500 sm:px-8">
              Expanding traditional and digital transaction borders
            </p>
          </div>

          {/* a. Global Digital Payments - Text Left, Globe Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-32 -mt-8">
            <div className="animate-on-scroll stagger-4 lg:col-span-6 space-y-6 group">
              <h3 className="text-3xl sm:text-4xl font-bold text-black leading-tight transition-colors duration-300 group-hover:text-[#22c55e]">Global Digital Payments</h3>
              <p className="text-sm font-bold text-[#22c55e] uppercase tracking-widest">Infrastructure rails</p>
              <div className="space-y-6">
                <p className="text-lg sm:text-xl leading-relaxed text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-800">
                  Trite positions itself as a next-generation payment infrastructure provider capable of serving all your payment needs.
                </p>
                <p className="text-lg sm:text-xl leading-relaxed text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-800">
                  By integrating stablecoin support alongside fiat payment rails, Trite enables businesses to transact globally without being limited by currency barriers, banking delays, or high remittance costs.
                </p>
              </div>
            </div>
            <div className="animate-on-scroll stagger-5 lg:col-span-6 relative h-[500px] sm:h-[700px] flex items-center justify-center group">
              <div className="scale-125 sm:scale-150 transform-gpu transition-transform duration-700 group-hover:scale-150 sm:group-hover:scale-[1.7]">
                <Globe />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* b. Traditional Cash & Banking - Full Width Section */}
        <section className="animate-on-scroll relative bg-[#fdfcf6] py-24 sm:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/images/dalmatian-spots.svg')] bg-repeat bg-[length:600px_600px]" />
          </div>

          <div className="animate-on-scroll stagger-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Mobile-only heading */}
            <div className="animate-on-scroll stagger-2 lg:hidden mb-2 text-center">
               <h3 className="text-2xl font-extrabold text-black leading-tight">Traditional Cash & Banking</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
              <div className="animate-on-scroll stagger-3 lg:col-span-6 relative h-[400px] sm:h-[600px] flex items-center justify-center group">
                <Image 
                  src="/images/ladies-on-cell4.png" 
                  alt="People on cell" 
                  fill 
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="animate-on-scroll stagger-4 lg:col-span-6 space-y-6 group">
                <h3 className="hidden lg:block text-3xl font-bold text-black transition-colors duration-300 group-hover:text-[#22c55e]">Traditional Cash & Banking</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Financial Rail Integration</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-800">
                  Trite maintains strong compatibility with conventional financial systems, allowing customers to transact using:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-black font-bold">
                  <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-2">&bull; Mobile money services</li>
                  <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-2">&bull; Bank transfers</li>
                  <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-2">&bull; Debit and credit cards</li>
                  <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-2">&bull; USSD Settlements</li>
                  <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-2">&bull; POS terminals</li>
                  <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-2">&bull; Local currency settlements</li>
                </ul>

                {/* Minimized Payment Logos */}
                <div className="animate-on-scroll stagger-5 flex flex-wrap items-center gap-12 pt-12">
                  {/* Card Payments */}
                  <div className="flex items-center gap-6 transition-transform duration-300 hover:scale-110">
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
                  <div className="flex items-center gap-5.5 transition-transform duration-300 hover:scale-110">
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
                  <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-110">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 transition-all duration-300 hover:bg-orange-200">
                      <Building2 className="h-6 w-6 text-orange-500" />
                    </div>
                    <span className="text-sm font-black text-blue-600 uppercase tracking-tight">Bank Transfers</span>
                  </div>
                </div>

                <p className="animate-on-scroll stagger-6 text-lg leading-relaxed text-gray-600 font-medium pt-2 transition-colors duration-300 group-hover:text-gray-800">
                  Trite ensures that users can easily transition between digital assets and traditional money without friction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* c. Stablecoin Payment - Full Width Ash Section */}
        <section className="animate-on-scroll bg-[#f2f2f2] py-24 sm:py-32 overflow-hidden">
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
        <div className="animate-on-scroll mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 mb-32">
          <div className="space-y-32">
            {/* d. E-Commerce & Merchant Solutions - Redesigned as per reference */}
            <div className="animate-on-scroll stagger-1 space-y-16">
              {/* Centered Text Content */}
              <div className="animate-on-scroll stagger-2 text-center space-y-4">
                <h3 className="text-2xl font-bold text-black">E-Commerce & Merchant Solutions</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Merchant suite</p>
                <p className="text-lg leading-relaxed text-gray-600 font-medium max-w-2xl mx-auto">
                  We empower merchants with a unified payment ecosystem that supports both stablecoins and fiat currencies.
                </p>
              </div>

              {/* Image Container Card */}
              <div className="animate-on-scroll stagger-3 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-2 sm:p-6 lg:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_30px_70px_-12px_rgba(0,0,0,0.08)] group">
                <div className="grid grid-cols-3 gap-2 lg:gap-6">
                  {/* Image 1: business-1.jpg */}
                  <div className="relative h-[150px] sm:h-[400px] lg:h-[550px] rounded-xl sm:rounded-[1.5rem] overflow-hidden transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src="/images/business.avif"
                      alt="Merchant Business Owner"
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Image 2: imac-Desk-Mockup.jpg */}
                  <div className="relative h-[150px] sm:h-[400px] lg:h-[550px] rounded-xl sm:rounded-[1.5rem] overflow-hidden transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src="/images/imac-Desk-Mockup.jpg"
                      alt="Trite Dashboard Mockup"
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Image 3: man-shopping.jpg */}
                  <div className="relative h-[150px] sm:h-[400px] lg:h-[550px] rounded-xl sm:rounded-[1.5rem] overflow-hidden transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src="/images/man-shopping.jpg"
                      alt="Customer Shopping"
                      fill
                      sizes="33vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* e. Cross-Border Remittance */}
            <div className="animate-on-scroll stagger-4 relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[0_30px_70px_-12px_rgba(0,0,0,0.2)] group">
              <Image
                src="/images/young-man-talking.jpg"
                alt="Cross-Border Remittance"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#22c55e]/40 via-[#22c55e]/10 to-transparent"
                aria-hidden
              />

              <div className="absolute top-6 left-8 sm:top-10 sm:left-12 lg:top-12 lg:left-14 z-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/Trite-WB.png"
                  alt="Trite"
                  width={90}
                  height={22}
                  className="h-6 w-auto sm:h-7"
                />
              </div>

              <div className="absolute bottom-0 left-0 z-10 flex flex-col justify-end p-6 sm:p-10 lg:p-12 max-w-xl lg:max-w-2xl transition-transform duration-500 group-hover:translate-y-[-8px]">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-white">
                  Send Money
                  <br />
                  Across Borders
                  <br />
                  Instantly
                </h3>
                <p className="mt-4 text-sm sm:text-base font-medium text-white/90 leading-relaxed max-w-md">
                  Get seamless cross-border remittance with Trite — blockchain-enabled settlements with traditional financial connectivity.
                </p>
                <p className="mt-3 text-xs sm:text-sm font-bold text-[#86efac] uppercase tracking-widest">
                  Liquidity settlements
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* f. Enterprise & Institutional Solutions - Full Width */}
        <section className="animate-on-scroll bg-[#f0fdf4] py-24 sm:py-32 overflow-hidden">
          <div className="animate-on-scroll stagger-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Image (Hidden on Mobile) */}
              <div className="animate-on-scroll stagger-2 hidden lg:flex relative h-[600px] items-center justify-center group">
                <Image
                  src="/images/woman-point-hands.png"
                  alt="Enterprise Solutions"
                  fill
                  sizes="50vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Right: Text */}
              <div className="animate-on-scroll stagger-3 space-y-8 text-left group">
                <div className="animate-on-scroll stagger-4 hidden lg:flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20 transition-transform duration-300 group-hover:scale-110">
                  <Building2 className="h-6 w-6" />
                </div>
                
                <div className="animate-on-scroll stagger-5 space-y-4">
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                    Enterprise & Institutional Solutions
                  </h3>
                  <p className="text-sm font-bold text-[#22c55e] uppercase tracking-widest">
                    Enterprise scale
                  </p>
                </div>

                <div className="animate-on-scroll stagger-6 space-y-6">
                  <p className="text-lg leading-relaxed text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-800">
                    Large organizations require scalable, compliant, and efficient payment infrastructure capable of supporting high transaction volumes and multiple currencies.
                  </p>
                  <p className="text-lg leading-relaxed text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-800">
                    Trite PSP delivers enterprise-grade solutions for:
                  </p>
                  <ul className="animate-on-scroll stagger-7 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-black font-bold">
                    {[
                      "Corporations",
                      "Fintech companies",
                      "NGOs",
                      "Government institutions",
                      "Payment aggregators",
                      "International businesses"
                    ].map((item, index) => (
                      <li key={item} className="flex items-center gap-3 transition-transform duration-300 hover:translate-x-2" style={{ animationDelay: `${0.1 * index}s` }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
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
    </>
  );
}
