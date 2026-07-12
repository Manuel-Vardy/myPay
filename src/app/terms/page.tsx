"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

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

export default function TermsPage() {
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
              Terms of Service
            </h1>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Intro */}
              <div className="animate-on-scroll stagger-2 space-y-6">
                <h2 className="text-2xl font-bold text-black">Welcome to Trite</h2>
                <p className="text-lg leading-relaxed text-slate-600">
                  These Terms govern your access to and use of our products, website, APIs, and payment services.
                </p>
                <p className="text-lg leading-relaxed text-slate-600">
                  By using Trite, you agree to comply with these Terms.
                </p>
              </div>

              {/* Eligibility */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Eligibility</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  Users must have the legal authority to enter into binding agreements and use our services in accordance with applicable laws.
                </p>
              </div>

              {/* Acceptable Use */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Acceptable Use</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  You agree not to use Trite for:
                </p>
                <ul className="space-y-3 text-slate-600">
                  {[
                    "Fraudulent activities",
                    "Money laundering",
                    "Terrorist financing",
                    "Illegal transactions",
                    "Sanctions violations",
                    "Unauthorized system access"
                  ].map((item, index) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Services */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Payment Services</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  Trite facilitates secure payment processing between customers, merchants, and financial institutions. Settlement timelines may vary depending on the payment method, banking partners, and applicable regulatory requirements.
                </p>
              </div>

              {/* Service Availability */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Service Availability</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  While we strive to maintain uninterrupted service, temporary downtime may occur due to maintenance, upgrades, or circumstances beyond our control.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Limitation of Liability</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  To the extent permitted by law, Trite shall not be liable for indirect, incidental, or consequential damages arising from the use of its services.
                </p>
              </div>

              {/* Changes to These Terms */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4">
                <h3 className="text-xl font-bold text-black">Changes to These Terms</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  We may update these Terms periodically. Continued use of our services constitutes acceptance of any revised Terms.
                </p>
              </div>

              {/* Contact */}
              <div className="animate-on-scroll stagger-2 space-y-6 pt-4 pb-8">
                <h3 className="text-xl font-bold text-black">For questions regarding these Terms</h3>
                <div className="flex items-center gap-3 text-lg">
                  <Mail className="h-6 w-6 text-[#22c55e]" />
                  <a href="mailto:info@trite.tech" className="text-slate-700 font-medium hover:text-[#22c55e] transition-colors">info@trite.tech</a>
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
