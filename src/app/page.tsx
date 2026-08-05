"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroHeadingCard from "@/components/HeroHeadingCard";
import WhyTriteCarouselAccent from "@/components/WhyTriteCarouselAccent";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  CarouselIndicator,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
  Building2,
  Coins,
  Wallet,
  Code2,
  BarChart3,
  Globe,
  ArrowLeftRight,
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

const whyTriteTestimonials = [
  {
    name: "Built for Africa",
    designation: "Financial Infrastructure",
    quote: "Africa’s payment ecosystem is fragmented. Trite simplifies complexity by integrating local payment rails and digital asset infrastructure into a single secure layer.",
    src: "/images/built-for-africa.jpg"
  },
  {
    name: "Security First",
    designation: "Bank-Grade Protection",
    quote: "Our high-security compliance standard includes AI-powered fraud detection and real-time monitoring. PCI-aligned architecture. AML & KYC automation.",
    src: "/images/businessman-working-laptop.jpg"
  },
  {
    name: "Compliance-Driven",
    designation: "Regulatory Standard",
    quote: "We operate within regulatory frameworks and embed compliance directly into our systems.",
    src: "/images/traders.jpg"
  },
  {
    name: "Scalable by Design",
    designation: "Enterprise Growth",
    quote: "From local SMEs to cross-border enterprises, Trite grows with your business.",
    src: "/images/real-estate.jpg"
  }
];

function HeroCarousel() {
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const totalSlides = 2;
  const DURATION = 6000;
  const TICK = 50;

  const goToSlide = (i: number) => {
    setSlide(i);
    setProgress(0);
    setAnimKey((k) => k + 1);
  };

  // Progress bar + auto-advance — stops when paused
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    setAnimKey((k) => k + 1);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (TICK / DURATION) * 100;
      });
    }, TICK);
    const advance = setTimeout(() => {
      setSlide((prev) => (prev + 1) % totalSlides);
    }, DURATION);
    return () => {
      clearInterval(interval);
      clearTimeout(advance);
    };
  }, [slide, paused]);

  return (
    <div className="relative min-h-[750px] sm:min-h-[650px] lg:min-h-screen">
      {/* ── Sliding track (overflow hidden only on this inner div) ── */}
      <div className="relative min-h-[750px] sm:min-h-[650px] lg:min-h-screen overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
        {/* ── Slide 1: Original Hero ── */}
        <div className="relative min-h-[750px] sm:min-h-[650px] lg:min-h-screen w-full shrink-0">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/tri-1.jpg"
              alt="Hero background"
              className="w-full h-full object-cover object-[70%_center] sm:object-center"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>
          <div key={animKey} className="hero-slide-anim relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-44 lg:pt-52 pb-24 sm:pb-32">
            <div className="max-w-5xl">
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="hero-heading text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl sm:font-extrabold leading-[1.1] sm:leading-[1.08]">
                    Powering the Future of Payments in Africa
                  </h1>
                  <div className="mt-6 h-px w-full max-w-2xl bg-white/20" />
                </div>
                <p className="hero-subtext max-w-2xl text-base sm:text-xl leading-relaxed text-white/80 sm:text-white/90">
                  Seamless bank, mobile money, and stablecoin payment - Pay and get PAID with Trite!
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="group h-12 px-7 sm:px-8 rounded-full bg-white text-[#22c55e] hover:bg-[#22c55e] hover:text-white shadow-lg border border-white/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer inline-flex items-center justify-center select-none">
                  <span className="text-sm font-extrabold uppercase tracking-wider transition-colors duration-300">INNOVATIVE</span>
                </div>
                <div className="group h-12 px-7 sm:px-8 rounded-full bg-[#22c55e] text-white hover:bg-white hover:text-[#22c55e] shadow-lg border border-[#22c55e] hover:border-white transition-all duration-300 hover:-translate-y-0.5 cursor-pointer inline-flex items-center justify-center select-none">
                  <span className="text-sm font-extrabold uppercase tracking-wider transition-colors duration-300">TRUST</span>
                </div>
                <div className="group h-12 px-7 sm:px-8 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/25 shadow-lg border border-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer inline-flex items-center justify-center select-none">
                  <span className="text-sm font-extrabold uppercase tracking-wider transition-colors duration-300">GROWTH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slide 2: TMOS / Trite App ── */}
        <div className="relative min-h-[750px] sm:min-h-[650px] lg:min-h-screen w-full shrink-0">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/shopkeeper.jpg"
              alt="Trite App shopkeeper background"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div key={animKey} className="hero-slide-anim relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-44 lg:pt-52 pb-24 sm:pb-32">
            <div className="max-w-5xl">
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="hero-heading text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl sm:font-extrabold leading-[1.1] sm:leading-[1.08]">
                    Manage Your TMOS with ease with Trite App
                  </h1>
                  <div className="mt-6 h-px w-full max-w-2xl bg-white/20" />
                </div>
                <p className="hero-subtext max-w-2xl text-base sm:text-xl leading-relaxed text-white/80 sm:text-white/90">
                  You’re in control to track your everyday sales with Trite App
                  <br />
                  On your TMOS dashboard you sell, get paid and know your customers.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="#"
                  className="hero-cta-btn-primary inline-flex items-center justify-center gap-2 h-12 px-7 sm:px-8 rounded-full bg-[#22c55e] text-white text-sm font-extrabold uppercase tracking-wider shadow-lg hover:bg-[#16a34a] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Download App
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#"
                  className="hero-cta-btn-secondary inline-flex items-center justify-center gap-2 h-12 px-7 sm:px-8 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-extrabold uppercase tracking-wider shadow-lg border border-white/30 hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5"
                >
                  Find Out More
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── Slide indicators + pause — bottom right, outside overflow-hidden ── */}
      <div className="absolute bottom-44 sm:bottom-28 lg:bottom-32 right-6 sm:right-12 flex flex-row items-center gap-3 z-30">
        {/* Progress bar — single unified bar */}
        <div
          style={{ display: 'block', width: '64px', height: '5px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.35)' }}
        >
          <span
            style={{
              display: 'block',
              height: '100%',
              borderRadius: '9999px',
              backgroundColor: '#22c55e',
              width: `${(slide / totalSlides) * 100 + (progress / totalSlides)}%`,
              transition: 'none',
            }}
          />
        </div>

        {/* Pause / Play button */}
        <button
          type="button"
          aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
          onClick={() => setPaused((p) => !p)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {paused ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [builtForIndex, setBuiltForIndex] = useState(0);

  // Carousel timer for the Built For section
  useEffect(() => {
    const timer = setInterval(() => {
      setBuiltForIndex((prev) => (prev + 1) % builtForItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Initialize scroll animations
  useScrollAnimation();

  return (
    <>
      {/* CSS Animation Styles */}
      <style jsx global>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-slide-anim {
          opacity: 0;
          animation: heroFadeIn 0.75s ease-out forwards;
        }
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

        /* 125% display scale on laptops — reduce hero text & buttons slightly */
        @media screen and (min-resolution: 120dpi) and (max-resolution: 144dpi) and (min-width: 1024px) {
          .hero-heading {
            font-size: 2.75rem !important;
            line-height: 1.1 !important;
          }
          .hero-subtext {
            font-size: 0.95rem !important;
            line-height: 1.6 !important;
          }
          .hero-cta-btn-primary {
            height: 2.5rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            font-size: 0.8rem !important;
          }
          .hero-cta-btn-secondary {
            height: 2.5rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            font-size: 0.8rem !important;
          }
          .hero-cta-btn-ghost {
            height: 2.5rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>

    <div className="min-h-screen bg-white text-black selection:bg-[#92bd30]/30 selection:text-black">

      <Header transparent={true} />

      {/* MAIN CONTENT AREA */}
      <main>

        {/* SECTION 1: HOME (HERO) */}
        <section
          id="home"
          className="relative min-h-[750px] sm:min-h-[650px] lg:min-h-screen bg-white sm:pb-20"
        >
          <HeroCarousel /></section>

        {/* Unified Payment Gateway Section */}
        <section className="relative bg-white pt-10 pb-4 sm:pt-12 sm:pb-6 rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[40px] -mt-32 sm:-mt-16 md:-mt-20 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Heading Card - Overlaps hero */}
            <div className="relative -mt-16 sm:-mt-20 lg:-mt-32 mb-8 sm:mb-10 flex justify-start z-20">
              <HeroHeadingCard
                className="lg:w-5/12"
                label="Payment Solutions"
                title={
                  <>
                    Unified Payment
                    <br />
                    Gateway
                  </>
                }
              />
            </div>

            {/* Content - On section background */}
            <div className="max-w-6xl mx-auto">
              <div className="animate-on-scroll flex flex-col items-center justify-center gap-6 mb-12">
                <p className="text-lg sm:text-xl text-gray-600 font-medium text-center">
                  Trite enables you, your business and anyone to receive payments through;
                </p>
              </div>

              {/* Desktop: Single row layout */}
              <div className="animate-on-scroll stagger-2 hidden md:flex items-center justify-center gap-6 lg:gap-10">
                {/* Card Payments */}
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

                {/* Mobile Money */}
                <div className="flex items-center gap-4">
                  <img
                    src="/images/Telecel-logo.png"
                    alt="Telecel"
                    className="h-14 w-auto object-contain"
                  />
                  <img
                    src="/images/mtn-logo.png"
                    alt="MTN"
                    className="h-14 w-auto object-contain"
                  />
                  <img
                    src="/images/AirtelTigo-logo.png"
                    alt="AT Money"
                    className="h-14 w-auto object-contain"
                  />
                </div>

                {/* Stablecoins */}
                <div className="flex flex-col items-center gap-1">
                  <img
                    src="/images/stablecoin-logo1.png"
                    alt="Stablecoins"
                    className="h-14 w-auto object-contain"
                  />
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Stablecoins</span>
                </div>

                {/* Bank Transfers */}
                <div className="flex flex-col items-center gap-1">
                  <img src="/images/bank-transfer-icon.png" alt="Bank Transfers" className="h-16 w-auto object-contain" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Bank Transfers</span>
                </div>
              </div>

              {/* Mobile: 2 → 3 → 2 row layout */}
              <div className="animate-on-scroll stagger-2 flex flex-col items-center gap-8 md:hidden">
                {/* Row 1: Card payments */}
                <div className="animate-on-scroll stagger-1 flex items-center justify-center gap-6">
                  <img src="/images/mastercard-logo.png" alt="Mastercard" className="h-10 w-auto object-contain" />
                  <img src="/images/visa-logo.png" alt="Visa" className="h-10 w-auto object-contain" />
                </div>

                {/* Row 2: Mobile money */}
                <div className="animate-on-scroll stagger-2 flex items-center justify-center gap-5">
                  <img src="/images/Telecel-logo.png" alt="Telecel" className="h-11 w-auto object-contain" />
                  <img src="/images/mtn-logo.png" alt="MTN" className="h-11 w-auto object-contain" />
                  <img src="/images/AirtelTigo-logo.png" alt="AT Money" className="h-11 w-auto object-contain" />
                </div>

                {/* Row 3: Stablecoins & bank transfers */}
                <div className="animate-on-scroll stagger-3 flex items-center justify-center gap-10">
                  <div className="flex flex-col items-center gap-1">
                    <img src="/images/stablecoin-logo1.png" alt="Stablecoins" className="h-12 w-auto object-contain" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stablecoins</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img src="/images/bank-transfer-icon.png" alt="Bank Transfers" className="h-16 w-auto object-contain" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Bank Transfers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built For Section */}
        <section className="relative bg-white pt-4 pb-4 sm:pt-6 sm:pb-6 overflow-hidden">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-center">

              {/* Left Side - Image Container */}
              <div className="w-full lg:w-[53%] h-[380px] sm:h-[480px] lg:h-[660px] relative z-10 shrink-0 overflow-hidden group shadow-md rounded-2xl lg:rounded-none">
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
                      className="object-cover object-center grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover:scale-105"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-[#000]/5 mix-blend-overlay pointer-events-none z-20" />
              </div>

              {/* Right Side - Overlapping White Card */}
              <div className="w-full lg:w-[54%] lg:-ml-24 mt-8 lg:mt-24 bg-white p-8 sm:p-12 lg:p-16 z-20 relative rounded-xl">
                <p className="animate-on-scroll text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Built For
                </p>

                <h2 className="animate-on-scroll stagger-1 text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-black leading-tight">
                  Designed specifically to power financial flows and digital growth for:
                </h2>

                {/* Horizontal line under the title */}
                <div className="animate-on-scroll stagger-2 h-[2px] w-24 bg-black mt-6 mb-8" />

                <div className="space-y-4">
                  {builtForItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`animate-on-scroll stagger-${Math.min(idx + 3, 4)} flex items-start gap-4 group py-0.5 cursor-pointer`}
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

        {/* SECTION 2: PAYMENTS & SETTLEMENT */}
        <section
          id="payments"
          className="relative bg-gradient-to-t from-[#22c55e]/12 via-[#22c55e]/2 to-white pt-4 pb-4 sm:pt-6 sm:pb-6 md:pb-8"
        >
          {/* Subtle gradient accent */}
          <div className="absolute top-10 right-0 -z-10 h-[400px] w-[300px] bg-[#22c55e]/5 blur-[100px] pointer-events-none" />

          {/* Bottom Background SVG - MOVED BEHIND CARDS */}
          <div className="absolute bottom-0 left-0 w-full h-auto z-0 pointer-events-none opacity-[0.15]">
            <img 
              src="/images/payment&settlement.svg" 
              alt="" 
              className="w-full h-auto object-bottom"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 max-w-3xl pt-8 sm:pt-12">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  PAYMENTS & SETTLEMENT
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl lg:text-5xl leading-tight">
                  Get paid Faster, <br /> Anywhere, from Anyone.
                </h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Trite gives your business everything you need to collect payments - online, in-store, and across borders - without stress or technical complexity.
              </p>
              <p className="text-base font-bold text-slate-500">
                One integration, multiple payment options, zero headaches.
              </p>
            </div>

            {/* Concise overview summary styled like reference image */}
            <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">

              {/* Left Column (Cards 1 and 3) */}
              <div className="space-y-8 lg:space-y-10">
                {/* Card 1: Mobile Money & USSD */}
                <div className="animate-on-scroll stagger-1 relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  {/* Top-left corner curve gradient */}
                  <div 
                    className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none z-0 transition-all duration-500 ease-out group-hover:scale-110 origin-top-left" 
                    style={{
                      background: 'radial-gradient(circle at 0% 0%, #22c55e 0%, #22c55e 30%, #4ade80 30%, #4ade80 55%, #86efac 55%, #86efac 75%, transparent 75%)',
                      borderBottomRightRadius: '100%',
                    }}
                  />
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

                  <img
                    src="/images/man-momo.png"
                    alt="Mobile Money & USSD"
                    className="absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-6 w-[55%] sm:w-[50%] h-auto max-h-[85%] object-contain object-bottom pointer-events-none select-none z-10"
                  />
                </div>

                {/* Card 3: Stablecoin Gateway */}
                <div className="animate-on-scroll stagger-3 relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  {/* Top-left corner curve gradient */}
                  <div 
                    className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none z-0 transition-all duration-500 ease-out group-hover:scale-110 origin-top-left" 
                    style={{
                      background: 'radial-gradient(circle at 0% 0%, #22c55e 0%, #22c55e 30%, #4ade80 30%, #4ade80 55%, #86efac 55%, #86efac 75%, transparent 75%)',
                      borderBottomRightRadius: '100%',
                    }}
                  />
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

                  <img
                    src="/images/stablecoin.png"
                    alt="Stablecoin Gateway"
                    className="absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-6 w-[55%] sm:w-[50%] h-auto max-h-[85%] object-contain object-bottom pointer-events-none select-none z-10"
                  />
                </div>
              </div>

              {/* Right Column (Cards 2 and 4 - Staggered higher on desktop) */}
              <div className="space-y-8 lg:space-y-10 md:-mt-24 lg:-mt-32">
                {/* Card 2: Card Collections */}
                <div className="animate-on-scroll stagger-2 relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  {/* Top-left corner curve gradient */}
                  <div 
                    className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none z-0 transition-all duration-500 ease-out group-hover:scale-110 origin-top-left" 
                    style={{
                      background: 'radial-gradient(circle at 0% 0%, #22c55e 0%, #22c55e 30%, #4ade80 30%, #4ade80 55%, #86efac 55%, #86efac 75%, transparent 75%)',
                      borderBottomRightRadius: '100%',
                    }}
                  />
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
                    className="absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-6 w-[55%] sm:w-[50%] h-auto max-h-[85%] object-contain object-bottom pointer-events-none select-none z-10"
                  />
                </div>

                {/* Card 4: Bank Settlements */}
                <div className="animate-on-scroll stagger-4 relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[380px] sm:min-h-[440px] flex flex-col justify-between group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  {/* Top-left corner curve gradient */}
                  <div 
                    className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none z-0 transition-all duration-500 ease-out group-hover:scale-110 origin-top-left" 
                    style={{
                      background: 'radial-gradient(circle at 0% 0%, #22c55e 0%, #22c55e 30%, #4ade80 30%, #4ade80 55%, #86efac 55%, #86efac 75%, transparent 75%)',
                      borderBottomRightRadius: '100%',
                    }}
                  />
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
                    className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-[58%] sm:w-[54%] h-auto max-h-[85%] object-contain object-bottom pointer-events-none select-none z-10"
                  />
                </div>
              </div>

            </div>

            <div className="mt-16 flex justify-center">
              <Link
                href="/payments"
                className="px-8 py-4 font-semibold bg-[#22c55e] text-white hover:bg-[#16a34a] rounded-full transition-all flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
              >
                Learn More About Payments <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3: MARKETS */}
        <section
          id="markets"
          className="relative bg-gradient-to-b from-[#c4c4c4]/15 via-[#c4c4c4]/5 to-white pt-12 pb-4 sm:pt-16 sm:pb-6 md:pt-20 md:pb-8"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Centered Heading */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <p className="animate-on-scroll text-sm font-semibold uppercase tracking-wider text-gray-500">
                Markets
              </p>
              <h2 className="animate-on-scroll stagger-1 text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl leading-tight">
                Expanding the Future of Payments with Trite
              </h2>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

              {/* Left Column: Image with Glass Card Overlay */}
              <div className="animate-on-scroll stagger-2 lg:col-span-6 xl:col-span-7 relative rounded-2xl overflow-hidden group min-h-[500px] lg:min-h-[580px] shadow-lg">
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
              <div className="animate-on-scroll stagger-3 lg:col-span-6 xl:col-span-5 relative rounded-2xl p-6 sm:p-8 flex flex-col gap-6 justify-center overflow-hidden">
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

                {[
                  {
                    icon: Globe,
                    title: "Global Digital Infrastructure",
                    desc: "Supporting global settlements by bridging stablecoins and traditional fiat assets.",
                  },
                  {
                    icon: Building2,
                    title: "Traditional Banking Integrations",
                    desc: "Direct compatibility with local bank accounts, mobile wallets, and USSD systems.",
                  },
                  {
                    icon: ArrowLeftRight,
                    title: "Cross-Border Remittances",
                    desc: "Empowering merchants to transfer funds across regional borders instantly.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className={`animate-on-scroll stagger-${index + 1} relative z-10 rounded-2xl bg-white p-6 transition-transform duration-300 hover:scale-105`}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-white shadow-sm">
                      <item.icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="border-l-2 border-[#22c55e] pl-3">
                      <h3 className="text-base font-bold leading-snug text-[#0a2540] sm:text-[17px]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-[1.65] text-[#425466] sm:text-[15px]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* CTA Button */}
            <div className="animate-on-scroll stagger-4 mt-16 flex justify-center">
              <Link
                href="/markets"
                className="px-8 py-4 font-semibold bg-[#22c55e] text-white hover:bg-[#16a34a] rounded-full transition-all flex items-center gap-2 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
              >
                Learn More About Markets <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Curved Divider */}
        <div className="relative -mt-1">
          <svg 
            className="w-full h-12 sm:h-16" 
            viewBox="0 0 1200 120" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 C300,80 900,80 1200,0 L1200,120 L0,120 Z" 
              fill="#e7e7e7" 
              fillOpacity="0.5"
            />
          </svg>
        </div>

        {/* SECTION 4: BUSINESSES */}
        <section id="businesses" className="relative overflow-hidden bg-[#e7e7e7]/50">
          {/* Decorative spiral — background */}
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible md:block"
            aria-hidden
          >
            <div className="absolute top-1/2 right-0 aspect-square h-[50%] w-[50%] min-h-[280px] min-w-[280px] translate-x-1/2 -translate-y-1/2 bg-[url('/images/spiral.svg')] bg-contain bg-center bg-no-repeat opacity-90 lg:min-h-[360px] lg:min-w-[360px]" />
          </div>

          {/* Hero banner — heading & CTAs overlaid on image */}
          <div className="animate-on-scroll relative z-10 mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14">
            <div className="animate-on-scroll stagger-1 relative min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[400px] lg:min-h-[440px]">
              <Image
                src="/images/StockSnap.jpg"
                alt="Business professionals collaborating"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"
                aria-hidden
              />
              <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-center px-6 py-14 sm:min-h-[400px] sm:px-10 sm:py-16 lg:min-h-[440px] lg:px-12">
              <p className="animate-on-scroll stagger-2 mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Businesses
              </p>
              <h3 className="animate-on-scroll stagger-3 max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Business Solutions — Powering Modern Commerce with Trite.
              </h3>
              <div className="animate-on-scroll stagger-4 mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-[#22c55e] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#16a34a]"
                  href="/contact-sales"
                >
                  Request a Demo
                </Link>
                <Link
                  href="/businesses"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                >
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            </div>
          </div>

          {/* Body — intro paragraph + feature columns */}
          <div className="animate-on-scroll relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="animate-on-scroll stagger-1 max-w-4xl text-left pl-4">
              <h3 className="animate-on-scroll stagger-2 text-2xl sm:text-3xl font-bold text-black mb-6 leading-tight">
                Trite is more than a payment gateway
              </h3>
              <p className="animate-on-scroll stagger-3 text-base leading-[1.75] text-[#425466] sm:text-lg">
                it is a complete financial operations platform designed for modern business growth. Through advanced stablecoin integration, fiat payment support, API connectivity, merchant tools, and financial automation features, businesses can streamline transactions while expanding into global markets.
              </p>
            </div>

            <div className="animate-on-scroll stagger-4 mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
              {[
                {
                  image: "/images/brand-building.jpg",
                  title: "Business Wallet Infrastructure",
                  desc: "Secure multi-currency custody and stablecoin asset management.",
                },
                {
                  image: "/images/ladyy.jpg",
                  title: "API & Developer Solutions",
                  desc: "Flexible endpoints to deploy checkout layers and bulk payout workflows.",
                },
                {
                  image: "/images/business-report.jpg",
                  title: "Advanced Reporting & Analytics",
                  desc: "Gain real-time visibility into transactions and settlement analytics.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`group animate-on-scroll stagger-${index + 5} relative overflow-hidden rounded-3xl h-80 transition-all duration-500 hover:shadow-2xl hover:shadow-black/20 hover:scale-[1.02]`}
                >
                  {/* Background Image */}
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8 text-white">
                    <h4 className="text-xl sm:text-2xl font-bold leading-snug transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                      {item.title}
                    </h4>
                    
                    <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      
                      <Link 
                        href="/businesses" 
                        className="inline-flex items-center text-sm font-semibold text-white group-hover:translate-x-2 transition-transform duration-300"
                      >
                        Learn More 
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
              
              {/* Left Column: Cards 1 & 3 (Trite Gateway & Trite Merchant Operating System (TMOS)) */}
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

                {/* Product 3: Trite Merchant Operating System (TMOS) */}
                <div id="trite-mos" className="animate-on-scroll stagger-8 flex flex-col lg:items-end items-start text-left lg:text-right group cursor-pointer transition-all duration-500 hover:translate-y-[-8px]" style={{ animationDelay: '1.0s' }}>
                  <div className="flex items-center gap-4 lg:flex-row-reverse flex-row">
                    {/* Reduced Image Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-2 overflow-hidden transition-all duration-500 group-hover:border-[#22c55e] group-hover:shadow-[0_12px_30px_rgba(34,197,94,0.2)] group-hover:scale-110 shrink-0">
                      <img
                        src="/images/mockup7.png"
                        alt="Trite Merchant Operating System (TMOS) Icon"
                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                      Trite Merchant Operating System (TMOS)
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
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h3 className="animate-on-scroll stagger-3 text-3xl font-extrabold text-black tracking-tight sm:text-4xl lg:text-5xl">
                Why Trite
              </h3>
              <p className="animate-on-scroll stagger-4 text-xl sm:text-2xl text-gray-600 leading-relaxed font-medium max-w-2xl mx-auto">
                We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly.
              </p>
            </div>

            <div className="flex justify-center items-center">
              <CircularTestimonials
                testimonials={whyTriteTestimonials}
                autoplay={true}
                colors={{
                  name: "#0c1e43",
                  designation: "#6b7280",
                  testimony: "#4b5563",
                  arrowBackground: "#0c1e43",
                  arrowForeground: "#f1f1f7",
                  arrowHoverBackground: "#22c55e",
                }}
                fontSizes={{
                  name: "1.75rem",
                  designation: "0.95rem",
                  quote: "1.125rem",
                }}
              />
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

        {/* ABOUT TRITE */}
        <section
          id="about"
          className="animate-on-scroll relative z-10 bg-[#fdfcf6] py-12 sm:py-16 overflow-hidden"
        >
          {/* Decorative spiral - Left side background */}
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden md:block"
            aria-hidden
          >
            <div
              className="absolute top-1/2 -left-[20%] aspect-square h-full w-[80%] -translate-y-1/2 bg-[url('/images/spiral.svg')] bg-contain bg-center bg-no-repeat opacity-60 mix-blend-multiply"
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
    </>
  );
}
