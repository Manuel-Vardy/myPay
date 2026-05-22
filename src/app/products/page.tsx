"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  ChevronRight,
  ArrowRight,
  Shield,
  Layers,
  Database,
  CheckCircle2
} from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#92bd30]/30 selection:text-black">
      <Header transparent={false} />

      <main className="py-16 sm:py-24">
        
        {/* HERO HEADER */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              PRODUCTS
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl leading-tight">
              Our Suite of Payment Products
            </h1>
          </div>
        </div>

        {/* COMPARATIVE SPECIFICATION TABLE (KNOWLEDGE EXPANSION) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="border border-black/[0.06] rounded-3xl overflow-hidden bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-black">Product Capabilities Matrix</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Select the correct product infrastructure suited to your institutional scope</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] text-xs font-extrabold text-gray-400 uppercase">
                    <th className="py-4">Feature Set</th>
                    <th className="py-4">Trite Gateway</th>
                    <th className="py-4">Trite Stable-Pay</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold text-gray-700">
                  <tr className="border-b border-black/[0.04]">
                    <td className="py-4 font-bold text-black">Settlement Speed</td>
                    <td className="py-4">T+1 (Local Bank & Wallet)</td>
                    <td className="py-4 text-[#81a72a]">Instant 24/7 (Stablecoins)</td>
                  </tr>
                  <tr className="border-b border-black/[0.04]">
                    <td className="py-4 font-bold text-black">Supported Networks</td>
                    <td className="py-4">MTN, Telecel, Visa, Mastercard, Banks</td>
                    <td className="py-4 text-[#81a72a]">TRON, Polygon, Ethereum</td>
                  </tr>
                  <tr className="border-b border-black/[0.04]">
                    <td className="py-4 font-bold text-black">Compliance Checking</td>
                    <td className="py-4">Appruve Verification Suite</td>
                    <td className="py-4 text-[#81a72a]">Sumsub automated KYC/KYT</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-black">Setup Complexity</td>
                    <td className="py-4">Low (Hosted Widget)</td>
                    <td className="py-4 text-[#81a72a]">Medium (Developer API Keys)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4 MAIN PRODUCT CARDS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Trite Gateway",
                desc: "Complete online payment solution for web & mobile businesses."
              },
              {
                title: "Trite Stable-Pay",
                desc: "Stablecoin acceptance with automatic fiat conversion and settlement."
              },
              {
                title: "Trite Merchant Dashboard",
                desc: "Advanced reporting, reconciliation, settlement tracking, and business insights."
              },
              {
                title: "Trite API",
                desc: "Developer-first RESTful APIs with comprehensive documentation."
              }
            ].map((prod, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-[#92bd30]/20 bg-white p-6 space-y-4 shadow-sm hover:border-[#92bd30]/50 transition-colors"
              >
                <div className="text-xl font-bold text-black flex items-center gap-2">
                  <span className="text-[#92bd30]">🔹</span>
                  {prod.title}
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Rail 0{idx + 1}</p>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {prod.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* WHY TRITE VALUE PROPOSITION */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="pt-16 border-t border-black/[0.06] space-y-12">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">
                Why Trite
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              
              {/* Built for Africa */}
              <div className="space-y-3">
                <div className="text-sm font-extrabold text-black flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#92bd30]" />
                  Built for Africa
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Africa’s payment ecosystem is fragmented. Trite simplifies complexity by integrating local payment rails and digital asset infrastructure into a single secure layer.
                </p>
              </div>

              {/* Security First */}
              <div className="space-y-3">
                <div className="text-sm font-extrabold text-black flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#92bd30]" />
                  Security First
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Our high-security compliance standard includes:
                </p>
                <ul className="text-xs text-black font-bold space-y-1 pl-4 list-disc">
                  <li>AI-powered fraud detection</li>
                  <li>Real-time transaction monitoring</li>
                  <li>PCI-aligned architecture</li>
                  <li>AML & KYC automation</li>
                </ul>
              </div>

              {/* Compliance-Driven */}
              <div className="space-y-3">
                <div className="text-sm font-extrabold text-black flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#92bd30]" />
                  Compliance-Driven
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  We operate within regulatory frameworks and embed compliance directly into our systems.
                </p>
              </div>

              {/* Scalable by Design */}
              <div className="space-y-3">
                <div className="text-sm font-extrabold text-black flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#92bd30]" />
                  Scalable by Design
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  From local SMEs to cross-border enterprises, Trite grows with your business.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* HOW IT WORKS CHRONOLOGICAL FLOW */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="pt-16 border-t border-black/[0.06] space-y-12">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">
                How Trite Works
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "Step 1",
                  text: "Integrate Trite via API or hosted checkout."
                },
                {
                  step: "Step 2",
                  text: "Accept payments via mobile money, fiat or stablecoins."
                },
                {
                  step: "Step 3",
                  text: "Receive payments in local currency or digital assets."
                },
                {
                  step: "Step 4",
                  text: "Monitor performance in real-time via dashboard analytics."
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="relative rounded-2xl border border-black/[0.06] bg-white p-6 space-y-2 shadow-sm"
                >
                  <div className="text-xs font-extrabold text-[#81a72a] bg-[#92bd30]/10 px-2 py-0.5 rounded-full inline-block">
                    {item.step}
                  </div>
                  <p className="text-sm text-black font-semibold pt-1">
                    {item.text}
                  </p>
                  
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-gray-300">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ABOUT TRITE */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="pt-16 border-t border-black/[0.06] space-y-8">
            <div className="max-w-3xl space-y-2">
              <span className="inline-flex items-center rounded-full bg-black text-white px-3 py-1 text-xs font-bold">
                About Trite
              </span>
              <h3 className="text-2xl font-extrabold text-black tracking-tight sm:text-3xl">
                Building Africa’s Payment Infrastructure Layer
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Trite was founded to solve a fundamental problem: Africa’s payment systems are fragmented, expensive and not built for digital scale.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  We are building a unified financial infrastructure that connects traditional payments and digital assets - securely and compliantly.
                </p>
                <p className="text-sm font-bold text-black">
                  Our mission is to empower businesses across Africa with frictionless, borderless payment solutions.
                </p>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-black">The Infrastructure Layer for Modern African Commerce</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Trite is a next-generation Payment Service Provider (PSP) designed to bridge traditional finance and digital assets. We enable businesses to accept mobile money, cards, bank transfers, and stablecoins - all through a single unified platform.
                  </p>
                </div>
                <p className="text-sm font-bold text-black border-t border-black/[0.06] pt-4">
                  Whether you’re a startup, enterprise, marketplace, or fintech, Trite provides secure, compliant, and scalable payment infrastructure across Africa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-black rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Scale your digital transactions instantly</h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-medium">
              Start building with Trite Stable-Pay and Gateway options to open new remittance routes.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/get-started" 
                className="px-6 py-3 font-semibold bg-[#92bd30] text-black rounded-full hover:bg-[#81a72a] transition-all flex items-center gap-2"
              >
                Sign Up Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
