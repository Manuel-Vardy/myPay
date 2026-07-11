"use client";

import Image from "next/image";
import { 
  Sparkles, 
  Cpu, 
  Users, 
  TrendingUp, 
  Layout
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Benefits / Why Work at Trite
const BENEFITS = [
  {
    icon: Sparkles,
    title: "Solve Real-World Challenges",
    description: "Build payment products that directly solve real-world financial challenges and empower businesses across the African continent.",
    image: "/images/career/solve-real-world-Photoroom.png"
  },
  {
    icon: Cpu,
    title: "Emerging Technologies",
    description: "Work at the absolute cutting edge with emerging technologies including fintech systems, AI integrations, stablecoins, and high-performance cloud infrastructure.",
    image: "/images/career/emerging-technology-Photoroom.png"
  },
  {
    icon: Users,
    title: "Passionate & Diverse Team",
    description: "Collaborate and learn from a passionate, diverse, and world-class team of engineers, designers, compliance experts, and growth leaders.",
    image: "/images/career/diverse-team-Photoroom.png"
  },
  {
    icon: TrendingUp,
    title: "High-Growth Sector",
    description: "Grow your career rapidly within one of Africa's fastest-growing fintech sectors, taking on high-impact responsibilities from day one.",
    image: "/images/career/high-growth-Photoroom.png"
  },
  {
    icon: Layout,
    title: "Innovation-Driven Culture",
    description: "Enjoy a flexible, autonomous, and innovation-driven work environment where unique ideas are valued, tested, and shipped.",
    image: "/images/career/innovation-Photoroom.png"
  }
];

// Department listings
const DEPARTMENTS = [
  {
    id: "engineering",
    name: "Software Engineering"
  },
  {
    id: "product",
    name: "Product Management"
  },
  {
    id: "design",
    name: "UI/UX Design"
  },
  {
    id: "compliance",
    name: "Compliance & Risk"
  },
  {
    id: "business",
    name: "Business Development"
  },
  {
    id: "success",
    name: "Customer Success"
  },
  {
    id: "marketing",
    name: "Marketing & Growth"
  }
];

export default function CareersPage() {

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main className="pt-24 sm:pt-28">
        
        {/* HERO SECTION */}
        <section className="relative py-12 lg:py-20 overflow-hidden bg-white border-b border-black/[0.04]">
          {/* Subtle Grid Lines & Background Blur */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#22c55e]/5 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-[1.08] max-w-4xl mx-auto">
              Join Us in Building the Future of Payments in Africa
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
              Help us lay down the infrastructure that powers modern commerce across the continent. We're bridging borders and stablecoins.
            </p>

            {/* Three-image mosaic */}
            {/* Mobile: 2-col (tall left + two stacked right) | Desktop: 3-col elevated */}
            <div className="pt-6 max-w-5xl mx-auto">
              {/* ── Mobile layout ── */}
              <div className="grid grid-cols-2 gap-3 sm:hidden">
                {/* Left — spans full height */}
                <div className="relative overflow-hidden rounded-2xl row-span-2 h-72 shadow-md group">
                  <img
                    src="/images/brand-building.jpg"
                    alt="Brand Building at Trite"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Right top */}
                <div className="relative overflow-hidden rounded-2xl h-[138px] shadow-md group">
                  <img
                    src="/images/traders.jpg"
                    alt="Traders using Trite"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Right bottom */}
                <div className="relative overflow-hidden rounded-2xl h-[138px] shadow-md group">
                  <img
                    src="/images/business-report.jpg"
                    alt="Business Growth with Trite"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>

              {/* ── Desktop layout (sm and up) ── */}
              <div className="hidden sm:grid grid-cols-3 gap-5">
                {/* Left */}
                <div className="relative overflow-hidden rounded-2xl h-80 shadow-md group">
                  <img
                    src="/images/brand-building.jpg"
                    alt="Brand Building at Trite"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Center — elevated */}
                <div className="relative overflow-hidden rounded-2xl h-96 -mt-8 shadow-xl group">
                  <img
                    src="/images/traders.jpg"
                    alt="Traders using Trite"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Right */}
                <div className="relative overflow-hidden rounded-2xl h-80 shadow-md group">
                  <img
                    src="/images/business-report.jpg"
                    alt="Business Growth with Trite"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION & INTRODUCTION */}
        <section className="py-20 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text Side */}
              <div className="lg:col-span-6 space-y-6">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                  OUR MISSION
                </h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight">
                  Powering commerce with secure, intelligent, and scalable fintech solutions.
                </h3>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                  At Trite, we're building the infrastructure that powers modern commerce across Africa. Our mission is to simplify how businesses collect, move, and settle money by creating secure, intelligent, and scalable payment solutions.
                </p>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                  We believe great technology is built by exceptional people. Whether you're an engineer, product designer, compliance specialist, marketer, or customer success professional, you'll have the opportunity to solve meaningful problems that impact businesses and communities across the continent.
                </p>
              </div>

              {/* Graphic/Image Side */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-black/5 shadow-lg group">
                  <Image 
                    src="/images/two-african-businessman.jpg"
                    alt="Trite Team Collaborating"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-xs font-extrabold tracking-widest uppercase opacity-75">Join the Collective</span>
                    <h4 className="text-lg font-bold mt-1">Accelerate African financial integration</h4>
                  </div>
                </div>
                {/* Decorative absolute blur sphere */}
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
              </div>

            </div>
          </div>
        </section>

        {/* WHY WORK AT TRITE */}
        <section className="relative py-24 sm:py-32 overflow-hidden bg-[#fdfcf6]">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/images/dalmatian-spots.svg')] bg-repeat bg-[length:600px_600px]" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                WHY WORK AT TRITE?
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                Designed to let you do the best work of your life.
              </h3>
            </div>

            <div className="space-y-16">
              {BENEFITS.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                const isEven = idx % 2 === 0; // 0,2,4 → text left, image right; 1,3 → image left, text right
                return (
                  <div 
                    key={idx}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center`}
                  >
                    {/* Left Column */}
                    <div className={`lg:col-span-6 ${isEven ? 'order-1' : 'order-2 lg:order-1'}`}>
                      {isEven ? (
                        <div className="space-y-6">
                          <div className="w-12 h-12 rounded-2xl bg-[#22c55e] flex items-center justify-center text-white">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h4 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
                            {benefit.title}
                          </h4>
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                            {benefit.description}
                          </p>
                        </div>
                      ) : (
                        <div className="relative aspect-square max-w-xs mx-auto lg:mx-0">
                          <Image 
                            src={benefit.image}
                            alt={benefit.title}
                            fill
                            className="object-cover rounded-2xl"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column */}
                    <div className={`lg:col-span-6 ${isEven ? 'order-2' : 'order-1 lg:order-2'}`}>
                      {isEven ? (
                        <div className="relative aspect-square max-w-xs mx-auto lg:mx-auto lg:ml-auto">
                          <Image 
                            src={benefit.image}
                            alt={benefit.title}
                            fill
                            className="object-cover rounded-2xl"
                          />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="w-12 h-12 rounded-2xl bg-[#22c55e] flex items-center justify-center text-white">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h4 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
                            {benefit.title}
                          </h4>
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                            {benefit.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CURRENT OPPORTUNITIES SECTION */}
        <section id="jobs" className="py-24 bg-slate-50/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                OPPORTUNITIES
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                Find your fit at Trite
              </h3>
              <p className="text-sm text-slate-500 font-bold max-w-md mx-auto">
                Explore our department divisions. Even if you don't see an exact matching vacancy, we'd love to hear from you.
              </p>
            </div>

            {/* Department Headings */}
            <div className="space-y-4">
              {DEPARTMENTS.map((dept) => (
                <div 
                  key={dept.id}
                  className="border border-black/[0.04] rounded-2xl bg-white overflow-hidden"
                >
                  <div className="px-6 sm:px-8 py-5 flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <h4 className="text-lg font-bold text-black">{dept.name}</h4>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* HIGH IMPACT BRAND CTA BANNER */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content Left */}
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-black">
                  Together, we're building Africa's payment infrastructure.
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Be a part of a fast-growing, highly technical team redefining settlement processes, multi-asset ledgers, and secure transaction corridors.
                </p>
              </div>
              
              {/* Image Content Right */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/together.jpeg"
                  alt="Together"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
