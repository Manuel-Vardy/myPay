"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Users,
  Package,
  Download,
  Megaphone,
  Handshake,
  CalendarDays,
  Trophy,
  ShieldCheck,
  Mail,
  Newspaper,
  BookOpen,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { featuredStories, pressReleases, ourStories } from "@/lib/newsData";

// ─── Tab definition ────────────────────────────────────────────────────────────
const TABS = [
  { id: "releases",      label: "Press Releases" },
  { id: "stories",       label: "Our Stories" },
  { id: "media",         label: "Media Resources" },
  { id: "enquiries",     label: "Media Enquiries" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Media Resources data ──────────────────────────────────────────────────────
const mediaResources = [
  {
    icon: ImageIcon,
    title: "Brand Assets",
    description: "Official Trite brand guidelines including colour palettes, typography, and usage rules.",
    action: "View",
    href: "/press/brand-assets",
  },
  {
    icon: Package,
    title: "Logos",
    description: "Full-colour, monochrome, and reversed logo variants in PNG, SVG, and EPS formats.",
    action: "View",
    href: "/press/logos",
  },
  {
    icon: ImageIcon,
    title: "Product Images",
    description: "Press-ready screenshots, product mockups, and interface imagery for editorial use.",
    action: "Browse Gallery",
    href: "/press/product-images",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function PressPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("releases");

  // Auto-scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main>
        {/* ── Top White Section: Title + Slider ── */}
        <div className="bg-white pt-32 pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                News &amp; Updates
              </h1>
            </div>

            {/* Featured Story Banner / Interactive Slider */}
            <section className="mb-8 relative">
              <div className="relative overflow-hidden rounded-3xl bg-slate-950 aspect-[3/4] sm:aspect-[21/9.5] border border-slate-200/50 shadow-md group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Link href={`/press/${featuredStories[currentSlide].id}`} className="absolute inset-0 w-full h-full block z-10 cursor-pointer">
                      <Image
                        src={featuredStories[currentSlide].image}
                        alt={featuredStories[currentSlide].title}
                        fill
                        priority
                        className="object-cover object-center brightness-[0.6] group-hover:scale-105 transition-transform duration-[8000ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      {/* Slide indicators — top-left on all screen sizes */}
                      <div className="absolute top-5 left-5 sm:top-8 sm:left-8 flex gap-2 z-20">
                        {featuredStories.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-[#22c55e] w-5 sm:w-4" : "bg-white/40 w-1.5 sm:w-2"}`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-white">
                        <div className="max-w-4xl space-y-3">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                            {featuredStories[currentSlide].title}
                          </h2>
                          <div className="flex items-center gap-4 pt-1 text-xs sm:text-sm text-slate-300 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                              {featuredStories[currentSlide].date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#22c55e]" />
                              {featuredStories[currentSlide].readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </AnimatePresence>

                {/* Nav Arrows */}
                <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 flex items-center gap-2 z-20">
                  <button onClick={prevSlide} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-black/40 hover:bg-black/80 hover:border-white text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm" aria-label="Previous Slide">
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button onClick={nextSlide} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-black/40 hover:bg-black/80 hover:border-white text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm" aria-label="Next Slide">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>


              </div>
            </section>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="bg-white sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide justify-start md:justify-center">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative shrink-0 px-6 py-4 text-sm font-bold transition-colors duration-300 whitespace-nowrap z-10
                    ${activeTab === tab.id
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-700"
                    }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-[#22c55e] rounded-t-2xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    >
                      {/* Left outward curve */}
                      <svg
                        className="absolute bottom-0 right-full w-3.5 h-3.5 text-[#22c55e] fill-current"
                        viewBox="0 0 12 12"
                      >
                        <path d="M 12 0 L 12 12 L 0 12 Q 12 12 12 0 Z" />
                      </svg>
                      {/* Right outward curve */}
                      <svg
                        className="absolute bottom-0 left-full w-3.5 h-3.5 text-[#22c55e] fill-current"
                        viewBox="0 0 12 12"
                      >
                        <path d="M 0 0 L 0 12 L 12 12 Q 0 12 0 0 Z" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="bg-slate-50 pt-12 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >

                {/* ── PRESS RELEASES ── */}
                {activeTab === "releases" && (
                  <section>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-4 flex flex-col justify-start gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black border-b-2 border-black/10 pb-2">
                            Press Releases
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                            Official announcements regarding Trite milestones, platform expansion, and bank-grade integration features.
                          </p>
                          <Link href="/press/releases" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#22c55e] hover:text-[#16a34a] transition-colors">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <Link href={`/press/${pressReleases[0].id}`} className="bg-white rounded-3xl border border-slate-200/50 shadow-none overflow-hidden flex flex-col group cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                            <Image src={pressReleases[0].image} alt={pressReleases[0].title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight line-clamp-3">{pressReleases[0].title}</h4>
                              <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{pressReleases[0].description}</p>
                            </div>
                            <div className="flex items-center gap-3 pt-5 text-[11px] text-slate-400 font-bold border-t border-slate-100 mt-4">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#22c55e]" />{pressReleases[0].date}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#22c55e]" />{pressReleases[0].readTime}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:pt-10">
                        {pressReleases.slice(1, 5).map((release, index) => (
                          <Link key={index} href={`/press/${release.id}`} className="bg-white rounded-3xl border border-slate-200/50 shadow-none overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                              <Image src={release.image} alt={release.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-3">{release.title}</h4>
                              <div className="flex items-center gap-3 pt-4 text-[11px] text-slate-400 font-bold border-t border-slate-100 mt-4">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#22c55e]" />{release.date}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#22c55e]" />{release.readTime}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* ── OUR STORIES ── */}
                {activeTab === "stories" && (
                  <section>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-4 flex flex-col justify-start gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black border-b-2 border-black/10 pb-2">
                            Our Stories
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                            Deep dives into technology, local economic impact, client case studies, and corporate culture at Trite.
                          </p>
                          <Link href="/press/stories" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#22c55e] hover:text-[#16a34a] transition-colors">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <Link href={`/press/${ourStories[0].id}`} className="bg-white rounded-3xl border border-slate-200/50 shadow-none overflow-hidden flex flex-col group cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                            <Image src={ourStories[0].image} alt={ourStories[0].title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight line-clamp-3">{ourStories[0].title}</h4>
                              <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{ourStories[0].description}</p>
                            </div>
                            <div className="flex items-center gap-3 pt-5 text-[11px] text-slate-400 font-bold border-t border-slate-100 mt-4">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#22c55e]" />{ourStories[0].date}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#22c55e]" />{ourStories[0].readTime}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:pt-10">
                        {ourStories.slice(1, 5).map((story, index) => (
                          <Link key={index} href={`/press/${story.id}`} className="bg-white rounded-3xl border border-slate-200/50 shadow-none overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                              <Image src={story.image} alt={story.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                              {story.overlayText && (
                                <div className="absolute bottom-0 left-0 right-0 bg-[#0ea5e9]/95 text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-center backdrop-blur-sm z-10">
                                  {story.overlayText}
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-3">{story.title}</h4>
                              <div className="flex items-center gap-3 pt-4 text-[11px] text-slate-400 font-bold border-t border-slate-100 mt-4">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#22c55e]" />{story.date}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#22c55e]" />{story.readTime}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* ── MEDIA RESOURCES ── */}
                {activeTab === "media" && (
                  <section className="space-y-10">
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-black">Media Resources</h2>
                      <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Everything the press needs to accurately represent Trite — downloadable assets, brand guidelines, executive profiles, and more.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mediaResources.map((resource, index) => {
                        const Icon = resource.icon;
                        return (
                          <div key={index} className="bg-white rounded-xl border border-slate-200/50 p-8 flex flex-col gap-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-[#22c55e] flex items-center justify-center shadow-sm">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <h3 className="text-base font-bold text-black">{resource.title}</h3>
                              <p className="text-sm text-slate-500 font-medium leading-relaxed">{resource.description}</p>
                            </div>
                            <Link href={resource.href} className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] transition-all duration-300 py-3 px-6 rounded-lg w-full text-center">
                              {resource.action} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}



                {/* ── MEDIA ENQUIRIES ── */}
                {activeTab === "enquiries" && (
                  <section className="space-y-10">
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-black">Media Enquiries</h2>
                      <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                        For interviews, speaking engagements, partnership announcements, and press requests — our communications team is ready to assist.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Contact Card */}
                      <div className="bg-white rounded-xl border border-slate-200/50 p-10 flex flex-col gap-8">
                        <div className="w-14 h-14 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-[#22c55e]" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-black">Get In Touch</h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Our media relations team is available Monday to Friday, 9am – 6pm GMT. We aim to respond to all press inquiries within 24 hours.
                          </p>
                        </div>
                        <a
                          href="mailto:info@trite.com"
                          className="inline-flex items-center gap-3 bg-black text-white text-sm font-bold px-6 py-4 rounded-lg hover:bg-[#22c55e] transition-colors duration-300 self-start"
                        >
                          <Mail className="w-4 h-4" />
                          info@trite.com
                        </a>
                      </div>

                      {/* Types of requests */}
                      <div className="bg-white rounded-xl border border-slate-200/50 p-10 flex flex-col gap-6">
                        <h3 className="text-base font-extrabold text-black uppercase tracking-wide border-b border-slate-100 pb-4">
                          We Can Help With
                        </h3>
                        <ul className="space-y-4">
                          {[
                            { icon: Megaphone,    text: "Interviews & Media Appearances" },
                            { icon: Users,        text: "Speaking Engagements & Panels" },
                            { icon: Handshake,    text: "Partnership Announcements" },
                            { icon: BookOpen,     text: "Editorial & Research Requests" },
                            { icon: FileText,     text: "Press Releases & Factsheets" },
                            { icon: ShieldCheck,  text: "Regulatory & Compliance Queries" },
                          ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4 text-[#22c55e]" />
                                </span>
                                {item.text}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </section>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
