"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

export default function PaymentsPage() {
  return (
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

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] max-w-3xl mx-auto">
                    Get paid Faster, <br /> Anywhere, from Anyone.
                  </h1>
                  <div className="mt-6 h-px w-full max-w-3xl bg-white/20 mx-auto"></div>
                </div>
                <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-white/90 mx-auto">
                  Trite gives your business everything you need to collect payments - online, in-store, and across borders - without stress or technical complexity.
                </p>
                <div className="inline-block rounded-full bg-white/10 backdrop-blur-xl px-8 py-3 text-base font-bold text-white">
                  One integration, multiple payment options, zero headaches.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 flex justify-start">
          <div className="bg-white p-8 sm:p-12 rounded-none text-left lg:w-7/12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-black mb-4">
              Simple & Transparent Pricing
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed mr-auto max-w-2xl">
              Pay only <span className="text-[#16a34a] font-bold">1.50%</span> per transaction and enjoy fast, secure, and reliable payments.
            </p>
            <div className="flex justify-start gap-1.5 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              ))}
            </div>
          </div>
        </div>

        {/* GRID OF THE 7 MAIN PAYMENT RAILS */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32">
          <div className="mb-16">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-extrabold text-[#474747] tracking-tight sm:text-4xl mb-4">Accept Multiple Payment Methods</h2>
              <p className="text-lg text-gray-500 font-medium max-w-xl">Our comprehensive payment rails are optimized for localized checkout flows and global digital settlements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-12 pb-24">
            {[
              {
                title: "Mobile Money",
                desc: "In emerging markets and mobile-first economies, mobile money plays a critical role. Trite enables you to pay and get paid with Mobile Money.",
                image: "/images/man-momo.png",
                gradient: "linear-gradient(135deg, #d4ecff 0%, #d4ecff 45%, #c0e2ff 45.5%, #c0e2ff 100%)",
                baseColor: "#d4ecff",
                borderColor: "#bfdbfe",
                hoverBorderColor: "#93c5fd",
                titleColor: "#1e3a8a",
                badge: "Popular",
                badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60",
                layout: "lg:col-span-5 lg:translate-y-0"
              },
              {
                title: "Stablecoin Gateway",
                desc: "Integrate a dedicated stablecoin checkout option into your websites and apps. Settle instantly in USDT or USDC.",
                image: "/images/stablecoin-logo2.png",
                gradient: "linear-gradient(225deg, #b0ffd9 0%, #b0ffd9 52%, #82ffc2 52.5%, #82ffc2 100%)",
                baseColor: "#b0ffd9",
                borderColor: "#a7f3d0",
                hoverBorderColor: "#6ee7b7",
                titleColor: "#065f46",
                badge: "Web3",
                badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                layout: "lg:col-span-7 lg:mt-24"
              },
              {
                title: "Credit Card & Debit Card",
                desc: "We allow businesses to accept card payments from major card providers globally. Fast, secure, and globally recognized.",
                image: "/images/woman-with-card-Photoroom.png",
                gradient: "linear-gradient(135deg, #ffd5bc 0%, #ffd5bc 40%, #ffc39e 40.5%, #ffc39e 100%)",
                baseColor: "#ffd5bc",
                borderColor: "#fed7aa",
                hoverBorderColor: "#fdba74",
                titleColor: "#7c2d12",
                badge: "Global",
                badgeClass: "bg-orange-50 text-orange-700 border-orange-200/60",
                layout: "lg:col-span-7 lg:mt-12"
              },
              {
                title: "USSD",
                desc: "A single short code to collect all payments. Set up a custom menu to receive payments from all networks. All you need is one code for all payments.",
                image: "/images/ussd1.png",
                gradient: "linear-gradient(225deg, #ffd6d6 0%, #ffd6d6 55%, #ffc2c2 55.5%, #ffc2c2 100%)",
                baseColor: "#ffd6d6",
                borderColor: "#fecdd3",
                hoverBorderColor: "#fda4af",
                titleColor: "#9f1239",
                badge: "Offline",
                badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60",
                layout: "lg:col-span-5 lg:mt-12",
                imgPadding: "p-2 pb-0"
              },
              {
                title: "Invoice",
                desc: "Generate secure payment links and digital invoices for your customers using Trite. Perfect for professional service providers.",
                image: "/images/gateway.png",
                gradient: "linear-gradient(225deg, #fffec7 0%, #fffec7 50%, #fffca1 50.5%, #fffca1 100%)",
                baseColor: "#fffec7",
                borderColor: "#fef08a",
                hoverBorderColor: "#fde047",
                titleColor: "#713f12",
                badge: "Business",
                badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200/60",
                layout: "lg:col-span-4 lg:mt-0"
              },
              {
                title: "Bank Transfer",
                desc: "Businesses can accept direct bank payments through local and international banking networks. Secure and high-volume ready.",
                image: "/images/excited-girl1.png",
                gradient: "linear-gradient(135deg, #ecfeff 0%, #ecfeff 48%, #c2faff 48.5%, #c2faff 100%)",
                baseColor: "#ecfeff",
                borderColor: "#99f6e4",
                hoverBorderColor: "#5eead4",
                titleColor: "#115e59",
                badge: "Institutional",
                badgeClass: "bg-teal-50 text-teal-700 border-teal-200/60",
                layout: "lg:col-span-4 lg:translate-y-20"
              },
              {
                title: "QR Code Payments",
                desc: "Trite PSP supports blockchain-enabled QR payment systems for fast and easy customer transactions. Scan, pay, and go.",
                image: "/images/qr-mockup.png",
                gradient: "linear-gradient(135deg, #fce7f3 0%, #fce7f3 42%, #fbcfe8 42.5%, #fbcfe8 100%)",
                baseColor: "#fce7f3",
                borderColor: "#fbcfe8",
                hoverBorderColor: "#f9a8d4",
                titleColor: "#86198f",
                badge: "Contactless",
                badgeClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60",
                layout: "lg:col-span-4 lg:-translate-y-8"
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "group flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500",
                  item.layout || ""
                )}
                style={{ 
                  backgroundColor: item.baseColor,
                  borderColor: item.borderColor
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.hoverBorderColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = item.borderColor;
                }}
              >
                {/* Card Image Header with Gradient */}
                <div 
                  className={cn(
                    "relative h-64 sm:h-72 w-full overflow-hidden flex items-center justify-center transition-all duration-500",
                    item.imgPadding || "p-8 pb-0"
                  )}
                  style={{ background: item.gradient }}
                >
                  <div className="relative h-full w-full">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute top-6 left-6 z-20">
                    <span className={cn(
                      "backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm border",
                      item.badgeClass
                    )}>
                      {item.badge}
                    </span>
                  </div>
                  {/* Smooth multi-stop fade to match card background perfectly */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10" 
                    style={{ 
                      background: `linear-gradient(to bottom, 
                        transparent 0%, 
                        transparent 45%, 
                        ${item.baseColor}88 75%, 
                        ${item.baseColor} 100%)` 
                    }} 
                  />
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-grow p-8 sm:p-10 pt-6 pb-12">
                  <h3 
                    className="text-xl sm:text-2xl font-extrabold tracking-tight mb-3"
                    style={{ color: item.titleColor }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[15px] sm:text-base leading-relaxed text-slate-600 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INTEGRATION SUBSECTIONS - ABOUT STYLE */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 mb-24">
          <div className="bg-[#fcfaf7] rounded-[2.5rem] p-10 sm:p-16 lg:p-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 block">
                    INTEGRATION
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-black leading-[1.1] tracking-tight">
                    Integrate Online <br /> Check out
                  </h2>
                </div>
                <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed">
                  Move your money to any bank account or mobile money wallet.
                </p>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-7 space-y-10">
                <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                  Easily transfer funds from your Trite account to any bank account or mobile money wallet. Enjoy quick, secure, and reliable transfers whenever you need them.
                </p>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-black">Accept payments online</h4>
                  <p className="text-lg text-gray-600 font-medium leading-relaxed">
                    Add Trite to your website and accept payments.
                  </p>
                </div>

                <div className="pt-10 border-t border-black/[0.08] flex items-center justify-between">
                  <span className="text-lg font-extrabold text-black">Programmable APIs for Businesses.</span>
                  <Code className="h-6 w-6 text-[#22c55e]" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
