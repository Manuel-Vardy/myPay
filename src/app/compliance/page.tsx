"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  ShieldCheck,
  UserCheck,
  Lock,
  AlertTriangle,
  BarChart3,
  Fingerprint,
  Globe,
  Shield,
  CheckCircle2
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

export default function CompliancePage() {
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
      `}</style>

    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main>
        {/* HERO HEADER */}
        <section className="relative -mt-28 sm:-mt-32 pt-64 sm:pt-72 pb-20 lg:pb-32 overflow-hidden bg-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#22c55e]/8 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Image */}
              <div className="animate-on-scroll lg:col-span-5 relative h-[400px] sm:h-[500px] flex items-center justify-center">
                <div className="relative rounded-[2rem] overflow-hidden w-full h-full">
                  <Image
                    src="/images/traders.jpg"
                    alt="Traders"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Right: Content */}
              <div className="lg:col-span-7 space-y-8">
                <h1 className="animate-on-scroll stagger-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight leading-[1.08]">
                  Compliance is at the Core of Everything We Build
                </h1>
                <p className="animate-on-scroll stagger-2 text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
                  Trust is fundamental to every payment. Trite is committed to maintaining the highest standards of compliance, governance, and operational integrity.
                </p>
                <p className="animate-on-scroll stagger-3 text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
                  Our compliance framework is designed to align with the regulatory expectations of the <strong>Bank of Ghana</strong>, international best practices, and evolving financial regulations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLIANCE FRAMEWORK */}
        <section className="animate-on-scroll relative bg-[#fdfcf6] py-20 lg:py-28 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/images/dalmatian-spots.svg')] bg-repeat bg-[length:600px_600px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="lg:col-span-7 space-y-8">
                <div className="animate-on-scroll stagger-1 space-y-4">
                  <h2 className="text-3xl font-bold text-black">Our Compliance Framework</h2>
                  <p className="text-sm font-bold text-[#22c55e] uppercase tracking-widest">Built on trust and security</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: <UserCheck className="h-8 w-8" />, title: "Know Your Customer (KYC)" },
                    { icon: <ShieldCheck className="h-8 w-8" />, title: "Anti-Money Laundering (AML)" },
                    { icon: <AlertTriangle className="h-8 w-8" />, title: "Counter-Terrorist Financing (CFT)" },
                    { icon: <BarChart3 className="h-8 w-8" />, title: "Risk-Based Customer Due Diligence" },
                    { icon: <Fingerprint className="h-8 w-8" />, title: "Transaction Monitoring" },
                    { icon: <Lock className="h-8 w-8" />, title: "Fraud Prevention" },
                    { icon: <Globe className="h-8 w-8" />, title: "Sanctions Screening" },
                    { icon: <Shield className="h-8 w-8" />, title: "Data Protection" },
                    { icon: <CheckCircle2 className="h-8 w-8" />, title: "Internal Controls" }
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="animate-on-scroll flex items-center gap-4 p-2"
                      style={{ animationDelay: `${0.1 * (index + 2)}s` }}
                    >
                      <div className="h-12 w-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-black">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Image */}
              <div className="animate-on-scroll lg:col-span-5 relative h-[400px] sm:h-[500px] flex items-center justify-center" style={{ animationDelay: '0.2s' }}>
                <div className="relative rounded-[2rem] overflow-hidden w-full h-full">
                  <Image
                    src="/images/document.jpg"
                    alt="Our Compliance Framework"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR COMMITMENT */}
        <section className="animate-on-scroll bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Image */}
              <div className="animate-on-scroll lg:col-span-5 relative h-[400px] sm:h-[500px] flex items-center justify-center" style={{ animationDelay: '0.2s' }}>
                <div className="relative rounded-[2rem] overflow-hidden w-full h-full">
                  <Image
                    src="/images/commitment.jpg"
                    alt="Our Commitment"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right: Text Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="animate-on-scroll stagger-2 space-y-4">
                  <h2 className="text-3xl font-bold text-black">Our Commitment</h2>
                </div>

                <div className="animate-on-scroll stagger-3 space-y-6">
                  <p className="text-lg leading-relaxed text-gray-600 font-medium">
                    As we continue our licensing journey, compliance remains central to how we build products, onboard customers, and protect our ecosystem.
                  </p>
                  <p className="text-lg leading-relaxed text-gray-600 font-medium">
                    Responsible innovation begins with responsible compliance.
                  </p>
                </div>

                <div className="animate-on-scroll stagger-4 pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#22c55e] text-white text-base font-bold hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22c55e]/20"
                  >
                    Get in touch
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
