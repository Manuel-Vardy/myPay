"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Mail } from "lucide-react";

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

export default function PrivacyPolicyPage() {
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

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-on-scroll {
          opacity: 0;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
      `}</style>

    <div className="min-h-screen bg-white text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={false} />

      <main className="pt-32 pb-24">
        {/* HERO HEADER */}
        <section className="relative -mt-28 sm:-mt-32 pt-48 sm:pt-56 pb-16 overflow-hidden bg-[#22c55e] text-white">
          {/* Square Mesh Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"></div>
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="animate-on-scroll stagger-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Privacy Policy
            </h1>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Intro */}
              <div className="animate-on-scroll stagger-2 space-y-6">
                <h2 className="text-2xl font-bold text-black">Your Privacy Matters</h2>
                <p className="text-lg leading-relaxed text-slate-600">
                  Trite is committed to protecting your personal and business information. We collect and process data only where necessary to deliver secure payment services, comply with legal obligations, improve our platform, and provide customer support.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Information We Collect</h3>
                <ul className="space-y-3 text-slate-600">
                  {[
                    "Personal information",
                    "Business information",
                    "Transaction data",
                    "Device and browser information",
                    "Technical logs",
                    "Usage analytics"
                  ].map((item, index) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">How We Use Your Information</h3>
                <ul className="space-y-3 text-slate-600">
                  {[
                    "Verify identities",
                    "Process payments",
                    "Prevent fraud",
                    "Meet regulatory obligations",
                    "Improve our products",
                    "Provide customer support"
                  ].map((item, index) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Security */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Data Security</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  We use industry-standard encryption, secure infrastructure, access controls, and monitoring systems to safeguard your information. We do not sell your personal information.
                </p>
              </div>

              {/* Your Rights */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Your Rights</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  Depending on applicable law, you may request to:
                </p>
                <ul className="space-y-3 text-slate-600">
                  {[
                    "Access your personal information",
                    "Correct inaccurate information",
                    "Request deletion where applicable",
                    "Withdraw consent where legally permitted"
                  ].map((item, index) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4 pb-8">
                <h3 className="text-xl font-bold text-black">Questions about privacy?</h3>
                <div className="flex items-center gap-3 text-lg">
                  <Mail className="h-6 w-6 text-[#22c55e]" />
                  <a href="mailto:info@trite.com" className="text-slate-700 font-medium hover:text-[#22c55e] transition-colors">info@trite.com</a>
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
