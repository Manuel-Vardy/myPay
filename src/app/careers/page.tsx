"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Cpu, 
  Users, 
  TrendingUp, 
  Layout, 
  MapPin, 
  Briefcase, 
  Upload, 
  Check, 
  Loader2, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Mail
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Custom LinkedIn Icon SVG Component (lucide replacement)
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Benefits / Why Work at Trite
const BENEFITS = [
  {
    icon: Sparkles,
    title: "Solve Real-World Challenges",
    description: "Build payment products that directly solve real-world financial challenges and empower businesses across the African continent."
  },
  {
    icon: Cpu,
    title: "Emerging Technologies",
    description: "Work at the absolute cutting edge with emerging technologies including fintech systems, AI integrations, stablecoins, and high-performance cloud infrastructure."
  },
  {
    icon: Users,
    title: "Passionate & Diverse Team",
    description: "Collaborate and learn from a passionate, diverse, and world-class team of engineers, designers, compliance experts, and growth leaders."
  },
  {
    icon: TrendingUp,
    title: "High-Growth Sector",
    description: "Grow your career rapidly within one of Africa's fastest-growing fintech sectors, taking on high-impact responsibilities from day one."
  },
  {
    icon: Layout,
    title: "Innovation-Driven Culture",
    description: "Enjoy a flexible, autonomous, and innovation-driven work environment where unique ideas are valued, tested, and shipped."
  }
];

// Department listings with sample roles
const DEPARTMENTS = [
  {
    id: "engineering",
    name: "Software Engineering",
    openRoles: [
      { title: "Senior Smart Contract Engineer (Solidity/Rust)", type: "Full-Time", location: "Accra, Ghana / Remote" },
      { title: "Full-Stack Engineer (Next.js & Node.js)", type: "Full-Time", location: "Accra, Ghana / Remote" },
      { title: "Infrastructure & DevOps Engineer (AWS/K8s)", type: "Full-Time", location: "Accra, Ghana" }
    ],
    description: "Build the stablecoin-enabled infrastructure layer that powers high-velocity borderless payments. Our tech stack is built on Next.js, Node.js, PostgreSQL, Kubernetes, and blockchain networks."
  },
  {
    id: "product",
    name: "Product Management",
    openRoles: [
      { title: "Lead Product Manager, Settlement Infrastructure", type: "Full-Time", location: "Accra, Ghana / Remote" },
      { title: "Technical Product Manager, APIs", type: "Full-Time", location: "Remote" }
    ],
    description: "Define the roadmap for Africa's most stable payment gateway. Translate regulatory, business, and tech needs into seamless, merchant-first payment products."
  },
  {
    id: "design",
    name: "UI/UX Design",
    openRoles: [
      { title: "Senior Product Designer", type: "Full-Time", location: "Accra, Ghana / Hybrid" }
    ],
    description: "Craft state-of-the-art visual systems and interfaces that simplify complex financial and stablecoin operations for institutional merchants and everyday payers."
  },
  {
    id: "compliance",
    name: "Compliance & Risk",
    openRoles: [
      { title: "Regional Compliance Officer (West Africa)", type: "Full-Time", location: "Accra, Ghana" },
      { title: "KYC / KYT Risk Analyst", type: "Full-Time", location: "Accra, Ghana" }
    ],
    description: "Ensure bank-grade compliance. Partner with Sumsub, Appruve, and local regulators to maintain secure KYC onboarding and secure transactional flow controls."
  },
  {
    id: "business",
    name: "Business Development",
    openRoles: [
      { title: "Strategic Partnerships Director", type: "Full-Time", location: "Accra, Ghana" },
      { title: "Enterprise Account Executive", type: "Full-Time", location: "Accra, Ghana" }
    ],
    description: "Accelerate our merchant acquisition. Partner with financial institutions, large-scale e-commerce players, and regional startups across the continent."
  },
  {
    id: "success",
    name: "Customer Success",
    openRoles: [
      { title: "Technical Support Engineer", type: "Full-Time", location: "Accra, Ghana" },
      { title: "Merchant Success Manager", type: "Full-Time", location: "Accra, Ghana" }
    ],
    description: "Support our merchants as they scale. Provide real-time assistance, resolve gateway queries, and help institutional partners navigate their payment operations."
  },
  {
    id: "marketing",
    name: "Marketing & Growth",
    openRoles: [
      { title: "Growth Marketing Lead", type: "Full-Time", location: "Remote / Hybrid" },
      { title: "Developer Advocate", type: "Full-Time", location: "Accra, Ghana / Remote" }
    ],
    description: "Establish Trite as the leading authority in African payments. Run developer communities, scale outbound marketing channels, and amplify our brand presence."
  }
];

export default function CareersPage() {
  const [expandedDept, setExpandedDept] = useState<string | null>("engineering");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    department: "",
    message: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const formRef = useRef<HTMLDivElement>(null);

  const toggleDept = (id: string) => {
    setExpandedDept(expandedDept === id ? null : id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleApplyClick = (deptName: string) => {
    setFormData(prev => ({ ...prev, department: deptName }));
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department || !file) {
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("submitting");

    // Simulate backend submission API call
    setTimeout(() => {
      setSubmitStatus("success");
      // Reset form
      setFormData({
        name: "",
        email: "",
        linkedin: "",
        department: "",
        message: ""
      });
      setFile(null);
    }, 2000);
  };

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
        <section className="py-24 bg-white border-y border-black/[0.03]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                WHY WORK AT TRITE?
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                Designed to let you do the best work of your life.
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BENEFITS.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div 
                    key={idx}
                    className="bg-[#fdfdfd] border border-black/[0.05] hover:border-[#22c55e]/40 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(34,197,94,0.06)] hover:-translate-y-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mb-6 group-hover:bg-[#22c55e] group-hover:text-white transition-all duration-300 text-[#16a34a]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-black mb-3">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      {benefit.description}
                    </p>
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

            {/* Interactive Department Explorer */}
            <div className="space-y-4">
              {DEPARTMENTS.map((dept) => {
                const isExpanded = expandedDept === dept.id;
                return (
                  <div 
                    key={dept.id}
                    className="border border-black/[0.04] rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleDept(dept.id)}
                      className="w-full px-6 sm:px-8 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                        <h4 className="text-lg font-bold text-black">{dept.name}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          {dept.openRoles.length} role{dept.openRoles.length !== 1 ? 's' : ''}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="px-6 sm:px-8 pb-6 pt-2 border-t border-black/[0.02] space-y-6">
                        <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-3xl">
                          {dept.description}
                        </p>

                        <div className="divide-y divide-black/[0.04]">
                          {dept.openRoles.map((role, rIdx) => (
                            <div key={rIdx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h5 className="text-sm font-bold text-black">{role.title}</h5>
                                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 font-semibold">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-300" /> {role.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-300" /> {role.type}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleApplyClick(dept.name)}
                                className="self-start sm:self-center px-4 py-2 text-xs font-extrabold bg-[#22c55e]/10 text-[#16a34a] hover:bg-[#22c55e] hover:text-white rounded-full transition-all duration-300"
                              >
                                Apply Now
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* HIGH IMPACT BRAND CTA BANNER */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[2.5rem] bg-black text-white px-8 py-16 sm:px-16 sm:py-24 overflow-hidden border border-slate-900 shadow-xl">
              {/* Radial background ambient light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Together, we're building Africa's payment infrastructure.
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed max-w-lg mx-auto">
                  Be a part of a fast-growing, highly technical team redefining settlement processes, multi-asset ledgers, and secure transaction corridors.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="px-8 py-4 rounded-full bg-[#22c55e] text-white hover:bg-[#16a34a] font-bold text-sm transition-all duration-300 shadow-sm hover:shadow"
                  >
                    Submit Spontaneous Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APPLICATION FORM SECTION */}
        <section ref={formRef} className="py-24 bg-slate-50 border-t border-black/[0.04]">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 sm:p-12 shadow-sm">
              <div className="text-center space-y-3 mb-10">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto text-[#16a34a]">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-black">Spontaneous Application</h3>
                <p className="text-xs text-slate-400 font-bold">
                  Submit your details to join our future talent pool lists.
                </p>
              </div>

              {submitStatus === "success" ? (
                <div className="py-12 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mx-auto text-[#16a34a]">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-black">Application Received!</h4>
                    <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                      Thank you for applying to Trite. We've recorded your CV and will reach out if a matching position opens.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitStatus("idle")}
                    className="px-6 py-2.5 rounded-full border border-black/10 hover:bg-slate-50 text-xs font-bold transition-all text-slate-700"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {submitStatus === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl text-red-700 text-xs font-bold">
                      Please fill out all required fields and upload your resume.
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Yao Yao"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email"
                      name="email"
                      required
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Department Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black block">
                      Department of Interest <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full text-slate-800"
                    >
                      <option value="">Select a department...</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                      <option value="General Interest">General Interest / Other</option>
                    </select>
                  </div>

                  {/* LinkedIn Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black block flex items-center gap-1.5">
                      <LinkedinIcon className="w-3.5 h-3.5 text-slate-400" /> LinkedIn Profile
                    </label>
                    <input 
                      type="url"
                      name="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black block">
                      Tell us about yourself
                    </label>
                    <textarea 
                      name="message"
                      rows={4}
                      placeholder="What drives you? Highlight your core skills and alignment with Trite's mission."
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Styled CV Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black block">
                      Resume / CV <span className="text-red-500">*</span>
                    </label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-[#22c55e] transition-colors bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer group">
                      <input 
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#22c55e] transition-colors mb-2" />
                      <span className="text-xs font-bold text-slate-700">
                        {file ? file.name : "Drag & drop or click to upload your resume"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-1">
                        Accepts PDF, DOC, DOCX up to 10MB
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitStatus === "submitting"}
                      className="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#22c55e]/60 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {submitStatus === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Processing Application...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
