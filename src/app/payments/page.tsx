"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroHeadingCard from "@/components/HeroHeadingCard";
import { cn } from "@/lib/utils";
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Coins, 
  Code,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2
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

export default function PaymentsPage() {
  // Initialize scroll animations
  useScrollAnimation();

  return (
    <>
      {/* Animation CSS Styles */}
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

        /* 125% display scale on laptops — reduce payments hero text slightly */
        @media screen and (min-resolution: 120dpi) and (max-resolution: 144dpi) and (min-width: 1024px) {
          .payments-hero-heading {
            font-size: 2.75rem !important;
            line-height: 1.1 !important;
          }
          .payments-hero-subtext {
            font-size: 0.95rem !important;
            line-height: 1.6 !important;
          }
          .payments-hero-badge {
            font-size: 0.8rem !important;
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black">
      <Header transparent={true} />

      <main>
        {/* HERO HEADER */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/payment-4.jpg"
              alt="Payments Hero background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="animate-on-scroll stagger-1 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-8">
                <div className="animate-on-scroll stagger-2">
                  <h1 className="animate-on-scroll stagger-3 payments-hero-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] max-w-3xl mx-auto">
                    Get paid Faster, <br /> Anywhere, from Anyone.
                  </h1>
                  <div className="animate-on-scroll stagger-4 mt-6 h-px w-full max-w-3xl bg-white/20 mx-auto"></div>
                </div>
                <p className="animate-on-scroll stagger-5 payments-hero-subtext max-w-2xl text-lg sm:text-xl leading-relaxed text-white/90 mx-auto">
                  Trite gives your business everything you need to collect payments - online, in-store, and across borders - without stress or technical complexity.
                </p>
                <div className="animate-on-scroll stagger-6 payments-hero-badge inline-block rounded-full bg-white/10 backdrop-blur-xl px-8 py-3 text-base font-bold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105">
                  One integration, multiple payment options, zero headaches.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="animate-on-scroll relative bg-white pt-10 pb-4 rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[40px] -mt-6 sm:-mt-8 md:-mt-10 z-10">
          <div className="animate-on-scroll stagger-1 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 flex justify-start">
            <div className="text-left lg:w-7/12">
              <div className="animate-on-scroll stagger-2">
                <HeroHeadingCard
                  className="max-w-none sm:max-w-none"
                  label="Payments"
                  title={
                    <>
                      Simple & Transparent
                      <br />
                      Pricing
                    </>
                  }
                />
              </div>
              <p className="animate-on-scroll stagger-3 mt-6 max-w-2xl px-6 text-lg font-medium leading-relaxed text-gray-600 sm:px-8 sm:text-xl">
                Pay only <span className="font-bold text-[#16a34a]">1.50%</span> per transaction and enjoy fast, secure, and reliable payments.
              </p>
              <div className="animate-on-scroll stagger-4 mt-8 flex justify-start gap-1.5 px-6 sm:px-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GRID OF THE 7 MAIN PAYMENT RAILS */}
        <div className="animate-on-scroll mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="animate-on-scroll stagger-1 mb-24 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="animate-on-scroll stagger-2 text-3xl font-extrabold text-black tracking-tight sm:text-4xl mb-4">Accept Multiple Payment Methods</h2>
              <p className="animate-on-scroll stagger-3 text-lg text-gray-500 font-medium">Our comprehensive payment rails are optimized for localized checkout flows and global digital settlements.</p>
            </div>
          </div>

          <div className="space-y-24 pb-24">
            {[
              {
                title: "Mobile Money",
                desc: "In emerging markets and mobile-first economies, mobile money plays a critical role. Trite enables you to pay and get paid with Mobile Money.",
                image: "/images/man-momo.png",
                baseColor: "#d4ecff",
                titleColor: "#000",
                badge: "Popular",
                badgeClass: "bg-blue-500 text-white",
                imgClass: "translate-y-8"
              },
              {
                title: "Stablecoin Gateway",
                desc: "Integrate a dedicated stablecoin checkout option into your websites and apps. Settle instantly in USDT or USDC.",
                image: "/images/stablecoin-logo2.png",
                baseColor: "#b0ffd9",
                titleColor: "#000",
                badge: "Web3",
                badgeClass: "bg-[#22c55e] text-white",
              },
              {
                title: "Credit Card & Debit Card",
                desc: "We allow businesses to accept card payments from major card providers globally. Fast, secure, and globally recognized.",
                image: "/images/woman-with-card-Photoroom.png",
                baseColor: "#ffd5bc",
                titleColor: "#000",
                badge: "Global",
                badgeClass: "bg-orange-400 text-white",
              },
              {
                title: "USSD",
                desc: "A single short code to collect all payments. Set up a custom menu to receive payments from all networks. All you need is one code for all payments.",
                image: "/images/ussd1.png",
                baseColor: "#ffd6d6",
                titleColor: "#000",
                badge: "Offline",
                badgeClass: "bg-rose-500 text-white",
              },
              {
                title: "Invoice",
                desc: "Generate secure payment links and digital invoices for your customers using Trite. Perfect for professional service providers.",
                image: "/images/gateway.png",
                baseColor: "#fffec7",
                titleColor: "#000",
                badge: "Business",
                badgeClass: "bg-yellow-500 text-white",
                imgClass: "translate-y-12"
              },
              {
                title: "Bank Transfer",
                desc: "Businesses can accept direct bank payments through local and international banking networks. Secure and high-volume ready.",
                image: "/images/excited-girl1.png",
                baseColor: "#ecfeff",
                titleColor: "#000",
                badge: "Institutional",
                badgeClass: "bg-teal-500 text-white",
              },
              {
                title: "QR Code Payments",
                desc: "Trite PSP supports blockchain-enabled QR payment systems for fast and easy customer transactions. Scan, pay, and go.",
                image: "/images/qr-mockup.png",
                baseColor: "#fce7f3",
                titleColor: "#000",
                badge: "Contactless",
                badgeClass: "bg-fuchsia-500 text-white",
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "animate-on-scroll stagger-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 group transition-all duration-700 hover:transform hover:scale-[1.02]",
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                )}
                style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
              >
                {/* Image Side */}
                <div 
                  className="relative w-full lg:w-[55%] aspect-[16/10] rounded-[2.5rem] overflow-hidden flex items-center justify-center transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-black/10"
                  style={{ backgroundColor: item.baseColor }}
                >
                  {/* Spiral Background */}
                  <div className="absolute inset-0 opacity-60 pointer-events-none mix-blend-multiply transition-transform duration-700 group-hover:scale-110">
                    <Image 
                      src="/images/spiral.svg" 
                      alt="" 
                      fill 
                      className="object-cover scale-110"
                    />
                  </div>

                  <div className="relative h-full w-full z-10">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className={cn(
                        "object-contain scale-110 transition-transform duration-700 group-hover:scale-125",
                        item.imgClass
                      )}
                    />
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full lg:w-[45%] space-y-6 transition-all duration-500 group-hover:translate-y-[-8px]">
                  <div className="transition-transform duration-300 group-hover:scale-110 w-fit">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-300",
                      item.badgeClass
                    )}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                    {item.title}
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed transition-colors duration-300 group-hover:text-gray-800">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INTEGRATION SUBSECTIONS - ABOUT STYLE */}
        <div className="animate-on-scroll mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 mb-24">
          <div className="animate-on-scroll stagger-1 bg-[#fcfaf7] rounded-[2.5rem] p-10 sm:p-16 lg:p-24 transition-all duration-500 hover:shadow-xl group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              {/* Left Column */}
              <div className="animate-on-scroll stagger-2 lg:col-span-5 space-y-8">
                <div>
                  <span className="animate-on-scroll stagger-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 block">
                    INTEGRATION
                  </span>
                  <h2 className="animate-on-scroll stagger-4 text-4xl sm:text-5xl font-extrabold text-black leading-[1.1] tracking-tight transition-colors duration-300 group-hover:text-[#22c55e]">
                    Integrate Online <br /> Check out
                  </h2>
                </div>
                <p className="animate-on-scroll stagger-5 text-lg sm:text-xl text-gray-600 font-medium leading-relaxed transition-colors duration-300 group-hover:text-gray-800">
                  Move your money to any bank account or mobile money wallet.
                </p>
              </div>

              {/* Right Column */}
              <div className="animate-on-scroll stagger-6 lg:col-span-7 space-y-10">
                <p className="animate-on-scroll stagger-7 text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                  Easily transfer funds from your Trite account to any bank account or mobile money wallet. Enjoy quick, secure, and reliable transfers whenever you need them.
                </p>
                
                <div className="animate-on-scroll stagger-8 space-y-4">
                  <h4 className="text-xl font-bold text-black transition-colors duration-300 group-hover:text-[#22c55e]">Accept payments online</h4>
                  <p className="text-lg text-gray-600 font-medium leading-relaxed">
                    Add Trite to your website and accept payments.
                  </p>
                </div>

                <div className="animate-on-scroll stagger-8 pt-10 border-t border-black/[0.08] flex items-center justify-between transition-all duration-300 group-hover:border-[#22c55e]/20">
                  <span className="text-lg font-extrabold text-black transition-colors duration-300 group-hover:text-[#22c55e]">Programmable APIs for Businesses.</span>
                  <Code className="h-6 w-6 text-[#22c55e] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
    </>
  );
}
