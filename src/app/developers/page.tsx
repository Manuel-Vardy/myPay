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
  Smartphone,
  CreditCard,
  Landmark,
  Coins,
  Link2,
  Scan,
  CheckCircle2,
  BookOpen,
  ArrowRight,
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
        <section className="animate-on-scroll bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="animate-on-scroll stagger-1 text-3xl font-bold text-black">Developer Resources</h2>
              <p className="animate-on-scroll stagger-2 text-sm font-bold text-[#22c55e] uppercase tracking-widest">Everything you need to build</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Server className="h-8 w-8" />,
                  title: "REST APIs",
                  description: "Powerful, simple REST APIs for all your payment needs."
                },
                {
                  icon: <Database className="h-8 w-8" />,
                  title: "Webhooks",
                  description: "Real-time event notifications to keep your systems in sync."
                },
                {
                  icon: <Terminal className="h-8 w-8" />,
                  title: "SDKs",
                  description: "Official SDKs for multiple programming languages and platforms."
                },
                {
                  icon: <Code2 className="h-8 w-8" />,
                  title: "Sandbox Environment",
                  description: "Test your integrations in a safe, isolated environment."
                },
                {
                  icon: <ShieldCheck className="h-8 w-8" />,
                  title: "Authentication",
                  description: "Secure, token-based authentication for all requests."
                },
                {
                  icon: <BookOpen className="h-8 w-8" />,
                  title: "Payment Guides",
                  description: "Step-by-step guides to help you get started quickly."
                },
                {
                  icon: <Terminal className="h-8 w-8" />,
                  title: "API Reference",
                  description: "Comprehensive documentation for all endpoints."
                },
                {
                  icon: <Code2 className="h-8 w-8" />,
                  title: "Sample Code",
                  description: "Ready-to-use code examples to accelerate development."
                },
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: "Status Dashboard",
                  description: "Real-time status updates for our platform and APIs."
                }
              ].map((item, index) => (
                <Link
                  key={item.title}
                  href="/api-docs"
                  className="animate-on-scroll group bg-white rounded-[1.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${0.1 * (index + 2)}s` }}
                >
                  <div className="h-14 w-14 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] mb-6 transition-colors duration-300 group-hover:bg-[#22c55e] group-hover:text-white">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
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
              {[
                { icon: <Smartphone className="h-7 w-7" />, title: "Mobile Money" },
                { icon: <CreditCard className="h-7 w-7" />, title: "Cards" },
                { icon: <Landmark className="h-7 w-7" />, title: "Bank Transfers" },
                { icon: <Coins className="h-7 w-7" />, title: "Stablecoin Payments" },
                { icon: <Link2 className="h-7 w-7" />, title: "Payment Links" },
                { icon: <Scan className="h-7 w-7" />, title: "QR Payments" }
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="animate-on-scroll flex items-center gap-4 p-6 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md group"
                  style={{ animationDelay: `${0.1 * (index + 2)}s` }}
                >
                  <div className="h-12 w-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] transition-colors duration-300 group-hover:bg-[#22c55e] group-hover:text-white">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">{item.title}</h3>
                  </div>
                </div>
              ))}
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

                <div className="animate-on-scroll pt-6" style={{ animationDelay: '0.7s' }}>
                  <Link
                    href="/get-started"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#22c55e] text-white text-base font-bold hover:bg-[#16a34a] transition-colors shadow-lg shadow-[#22c55e]/20"
                  >
                    Build once. Scale everywhere.
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Right: Image */}
              <div className="animate-on-scroll lg:col-span-5 relative h-[400px] sm:h-[500px] flex items-center justify-center" style={{ animationDelay: '0.4s' }}>
                <div className="bg-slate-900 rounded-[2rem] p-6 w-full h-full shadow-2xl">
                  <div className="bg-slate-800 rounded-lg p-4 h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <pre className="text-left text-sm text-green-400 font-mono">
{`// Initialize Trite
const trite = new Trite({
  apiKey: process.env.TRITE_KEY
});

// Create payment
const payment = await trite.payments.create({
  amount: 1000,
  currency: 'USD',
  customer: 'cus_123'
});`}
                      </pre>
                    </div>
                  </div>
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
