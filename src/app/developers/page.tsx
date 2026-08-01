"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Code2,
  Database,
  Terminal,
  ShieldCheck,
  Zap,
  CheckCircle2,
  BookOpen,
  Server
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

export default function DevelopersPage() {
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
            <div className="text-center space-y-8">
              <h1 className="animate-on-scroll stagger-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight leading-[1.08]">
                Build with Trite
              </h1>
              <p className="animate-on-scroll stagger-2 text-lg sm:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
                Create modern payment experiences using our secure and scalable APIs. Whether you're building an e-commerce platform, fintech application, SaaS product, marketplace, or enterprise solution, Trite provides the tools you need to integrate payments quickly.
              </p>
            </div>
          </div>
        </section>

        {/* DEVELOPER RESOURCES */}
        <section className="animate-on-scroll bg-[#22c55e] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="animate-on-scroll stagger-1 text-3xl font-bold text-white">Developer Resources</h2>
              <p className="animate-on-scroll stagger-2 text-sm font-bold text-white/80 uppercase tracking-widest">Everything you need to build</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {[
                {
                  icon: <Server className="h-8 w-8" />,
                  title: "REST APIs",
                  description: "Powerful, simple REST APIs for all your payment needs.",
                  href: "/api-docs#getting-started"
                },
                {
                  icon: <Database className="h-8 w-8" />,
                  title: "Webhooks",
                  description: "Real-time event notifications to keep your systems in sync.",
                  href: "/api-docs#webhooks"
                },
                {
                  icon: <Terminal className="h-8 w-8" />,
                  title: "SDKs",
                  description: "Official SDKs for multiple programming languages and platforms.",
                  href: "/api-docs#sdk"
                },
                {
                  icon: <ShieldCheck className="h-8 w-8" />,
                  title: "Authentication",
                  description: "Secure, token-based authentication for all requests.",
                  href: "/api-docs#authentication"
                },
                {
                  icon: <Terminal className="h-8 w-8" />,
                  title: "API Reference",
                  description: "Comprehensive documentation for all endpoints.",
                  href: "/api-docs#create-session"
                },
                {
                  icon: <Code2 className="h-8 w-8" />,
                  title: "Sample Code",
                  description: "Ready-to-use code examples to accelerate development.",
                  href: "/api-docs#create-session"
                }
              ].map((item, index) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`animate-on-scroll group flex items-start gap-6 py-8 transition-all duration-300 hover:translate-x-2 ${
                    index < 3 ? 'border-b border-white/30' : ''
                  } ${
                    index % 3 !== 2 ? 'border-r border-white/30' : ''
                  } px-4`}
                  style={{ animationDelay: `${0.1 * (index + 2)}s` }}
                >
                  <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 transition-colors duration-300 group-hover:bg-white group-hover:text-[#22c55e]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SUPPORTED INTEGRATIONS */}
        <section className="animate-on-scroll relative bg-[#fdfcf6] py-20 lg:py-28 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/images/dalmatian-spots.svg')] bg-repeat bg-[length:600px_600px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="animate-on-scroll stagger-1 text-3xl font-bold text-black">Supported Integrations</h2>
              <p className="animate-on-scroll stagger-2 text-sm font-bold text-[#22c55e] uppercase tracking-widest">Payments for every use case</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mobile Money */}
              <div
                className="animate-on-scroll flex flex-col items-center justify-between gap-4 p-8 bg-white rounded-[1.5rem] border border-slate-200 transition-all duration-300 min-h-[250px]"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex items-center gap-3 h-32">
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Image
                      src="/images/mtn-logo.png"
                      alt="MTN"
                      width={50}
                      height={50}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Image
                      src="/images/AirtelTigo-logo.png"
                      alt="AirtelTigo"
                      width={50}
                      height={50}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Image
                      src="/images/Telecel-logo.png"
                      alt="Telecel"
                      width={70}
                      height={70}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-black">Mobile Money</h3>
              </div>
              {/* Cards */}
              <div
                className="animate-on-scroll flex flex-col items-center justify-between gap-4 p-8 bg-white rounded-[1.5rem] border border-slate-200 transition-all duration-300 min-h-[250px]"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center gap-3 h-32">
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Image
                      src="/images/mastercard-logo.png"
                      alt="Mastercard"
                      width={50}
                      height={50}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Image
                      src="/images/visa-logo.png"
                      alt="Visa"
                      width={50}
                      height={50}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-black">Cards</h3>
              </div>
              {/* Bank Transfers */}
              <div
                className="animate-on-scroll flex flex-col items-center justify-between gap-4 p-8 bg-white rounded-[1.5rem] border border-slate-200 transition-all duration-300 min-h-[250px]"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="h-32 w-32 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <Image
                    src="/images/bank-transfer-icon.png"
                    alt="Bank Transfers"
                    width={100}
                    height={100}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-black">Bank Transfers</h3>
              </div>
              {/* Stablecoin Payments */}
              <div
                className="animate-on-scroll flex flex-col items-center justify-between gap-4 p-8 bg-white rounded-[1.5rem] border border-slate-200 transition-all duration-300 min-h-[250px]"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="h-32 w-32 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <Image
                    src="/images/stablecoin-logo1.png"
                    alt="Stablecoin Payments"
                    width={100}
                    height={100}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-black">Stablecoin Payments</h3>
              </div>
              {/* Payment Links */}
              <div
                className="animate-on-scroll flex flex-col items-center justify-between gap-4 p-8 bg-white rounded-[1.5rem] border border-slate-200 transition-all duration-300 min-h-[250px]"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="h-32 w-32 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <Image
                    src="/images/payment-link.png"
                    alt="Payment Links"
                    width={100}
                    height={100}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-black">Payment Links</h3>
              </div>
              {/* QR Payments */}
              <div
                className="animate-on-scroll flex flex-col items-center justify-between gap-4 p-8 bg-white rounded-[1.5rem] border border-slate-200 transition-all duration-300 min-h-[250px]"
                style={{ animationDelay: '0.7s' }}
              >
                <div className="h-32 w-32 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <Image
                    src="/images/qr-mockup.png"
                    alt="QR Payments"
                    width={100}
                    height={100}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-black">QR Payments</h3>
              </div>
            </div>
          </div>
        </section>

        {/* WHY DEVELOPERS CHOOSE TRITE */}
        <section className="animate-on-scroll bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="animate-on-scroll stagger-1 text-3xl font-bold text-black">Why Developers Choose Trite</h2>
              <p className="animate-on-scroll stagger-2 text-sm font-bold text-[#22c55e] uppercase tracking-widest">Designed for developers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="lg:col-span-7 space-y-8">
                {[
                  { title: "Simple RESTful APIs", description: "Clean, intuitive API design that makes integration a breeze." },
                  { title: "Modern documentation", description: "Comprehensive, well-structured docs with code examples for every endpoint." },
                  { title: "Fast onboarding", description: "Get up and running in minutes with our quick start guides and sandboxes." },
                  { title: "Secure authentication", description: "Bank-grade security with multiple authentication methods and token-based access." },
                  { title: "Enterprise-grade reliability", description: "99.9% uptime SLA and robust infrastructure you can trust." }
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="animate-on-scroll flex items-start gap-4"
                    style={{ animationDelay: `${0.1 * (index + 2)}s` }}
                  >
                    <div className="h-10 w-10 rounded-full bg-[#22c55e] flex items-center justify-center text-white shrink-0 mt-1">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Right: Image */}
              <div className="animate-on-scroll lg:col-span-5 relative" style={{ animationDelay: '0.4s' }}>
                <div className="relative rounded-[2rem] overflow-hidden">
                  <Image
                    src="/images/girl-in-office.jpg"
                    alt="Girl in office"
                    width={500}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
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
