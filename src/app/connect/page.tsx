"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

const IconCloud = dynamic(() => import("@/components/ui/interactive-icon-cloud").then(mod => mod.IconCloud), {
  ssr: false,
});

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

const CONNECT_AVATARS = [
  {
    src: "/images/smiling-woman-smartphone.jpg",
    alt: "Trite team member",
    left: "18%",
    top: "14%",
    hidden: "",
  },
  {
    src: "/images/young-man-talking.jpg",
    alt: "Trite team member",
    left: "50%",
    top: "14%",
    hidden: "",
  },
  {
    src: "/images/chief-financial-officer.jpg",
    alt: "Trite team member",
    left: "82%",
    top: "14%",
    hidden: "",
  },
  {
    src: "/images/Happy black woman sitting by big copy.jpg",
    alt: "Trite team member",
    left: "8%",
    top: "50%",
    hidden: "hidden sm:block",
  },
  {
    src: "/images/male-sitting.jpg",
    alt: "Trite team member",
    left: "92%",
    top: "48%",
    hidden: "hidden sm:block",
  },
  {
    src: "/images/People on phone.jpg",
    alt: "Trite team member",
    left: "26%",
    top: "84%",
    hidden: "",
  },
  {
    src: "/images/two-african-businessman.jpg",
    alt: "Trite team member",
    left: "74%",
    top: "82%",
    hidden: "",
  },
];

const CONTACT_CATEGORIES = [
  {
    title: "General Enquiries",
    email: "info@trite.com"
  },
  {
    title: "Sales",
    email: "sales@trite.com"
  },
  {
    title: "Partnerships",
    email: "partnerships@trite.com"
  },
  {
    title: "Support",
    email: "support@trite.com"
  },
  {
    title: "Careers",
    email: "careers@trite.com"
  }
];

const SOCIAL_LINKS = [
  {
    title: "LinkedIn",
    href: "#"
  },
  {
    title: "X (formerly Twitter)",
    href: "https://x.com/trite_pay?s=11"
  },
  {
    title: "GitHub (Developers)",
    href: "#"
  }
];

const slugs = [
  "facebook",
  "x",
  "whatsapp",
  "youtube",
  "instagram",
  "gmail",
  "linkedin",
  "github",
];

export default function ConnectPage() {
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
      `}</style>

    <div className="min-h-screen bg-[#fcfcfc] text-black selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main>
        {/* Hero */}
        <section className="relative -mt-28 sm:-mt-32 pt-72 sm:pt-80 pb-8 lg:pb-12 overflow-hidden bg-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#22c55e]/8 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <h1 className="animate-on-scroll stagger-1 text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-[1.08]">
              Let&apos;s Build the Future of Payments Together
            </h1>
            <p className="animate-on-scroll stagger-2 text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a business looking to simplify payments, a developer building innovative solutions, a financial institution exploring partnerships, or an investor interested in Africa&apos;s digital payments ecosystem, we&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Categories */}
        <section className="pt-8 pb-16 lg:pt-12 lg:pb-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {CONTACT_CATEGORIES.map((category, idx) => (
                <div key={category.title} className="animate-on-scroll stagger-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-black">
                    {category.title}
                  </h3>
                  <a
                    href={`mailto:${category.email}`}
                    className="text-lg font-medium text-black hover:text-[#22c55e] transition-colors flex items-center gap-2"
                  >
                    <Mail className="h-5 w-5" />
                    {category.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Follow Trite */}
        <section className="py-16 lg:py-24 bg-slate-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                  Follow Trite
                </h2>
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                  Stay connected for product updates, industry insights, company news, and thought leadership.
                </p>
                <div className="space-y-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.title}
                      href={social.href}
                      target={social.href !== "#" ? "_blank" : undefined}
                      rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                      className="block text-lg font-semibold text-black hover:text-[#22c55e] transition-colors"
                    >
                      {social.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg px-20 pb-20 pt-8">
                  <IconCloud iconSlugs={slugs} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section (like Support page) */}
        <section className="relative overflow-hidden bg-[#22c55e]">
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.06)_100%)]" />

          {/* Orbit canvas — full width, avatars + text share same coordinate space */}
          <div className="relative mx-auto w-full max-w-[1200px] h-[460px] sm:h-[540px] md:h-[600px] lg:h-[640px] px-6 sm:px-10 md:px-16">
            {/* Orbiting avatars */}
            {CONNECT_AVATARS.map((avatar) => (
              <div
                key={avatar.src}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${avatar.hidden}`}
                style={{ left: avatar.left, top: avatar.top }}
              >
                <div className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] md:w-[72px] md:h-[72px] rounded-[18px] overflow-hidden shadow-xl ring-[3px] ring-white/40">
                  <Image
                    src={avatar.src}
                    alt={avatar.alt}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>
              </div>
            ))}

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-4 sm:space-y-5 px-4 max-w-md">
                <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-white tracking-tight leading-none">
                  Get in Touch
                </h2>

                <div className="space-y-1">
                  <a
                    href="mailto:info@trite.com"
                    className="block text-base sm:text-lg font-bold text-white/95 hover:text-white transition-colors"
                  >
                    info@trite.com
                  </a>
                  <p className="text-xs sm:text-sm font-semibold text-white/75">
                    Monday – Friday · 8:00 AM – 5:00 PM GMT
                  </p>
                </div>

                <a
                  href="mailto:info@trite.com"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-gray-900 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Email us
                </a>
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
