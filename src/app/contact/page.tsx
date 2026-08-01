"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail, 
  MapPin, 
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

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
    email: "info@trite.tech"
  }
];

const SOCIAL_LINKS = [
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/company/use-trite/"
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/usetrite?igsh=MXF2amluOGF2MXF3bw%3D%3D&utm_source=qr"
  },
  {
    title: "X (formerly Twitter)",
    href: "https://x.com/usetrite?s=11"
  },
  {
    title: "YouTube",
    href: "https://youtube.com/@usetrite?si=I1QM18cJD0QQA1BQ"
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/share/1DMeRwMSj6/?mibextid=wwXIfr"
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

export default function ContactPage() {
  useScrollAnimation();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    // Simulate API call
    setTimeout(() => {
      setFormState("success");
    }, 1500);
  };

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
    <div className="flex min-h-screen flex-col bg-white">
      <Header transparent={true} darkLogo={true} />

      <main className="flex-grow pb-0">
        {/* HERO WRAP (like Careers page) */}
        <section className="relative -mt-28 sm:-mt-32 pt-56 sm:pt-64 pb-12 lg:pb-20 overflow-hidden bg-[#fdfcf6] border-b border-black/[0.04]">
          
          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Hero Heading ── */}
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: text */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-black leading-tight">
                We&rsquo;d love to{" "}
                <span className="text-[#22c55e]">hear from you</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
                Whether you&rsquo;re scaling a business, exploring partnerships, or just getting started —
                our team is ready to help you move faster.
              </p>

            </div>

            {/* Right: image */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/assistant-call.jpg"
                alt="Trite support team"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left Side: Contact Info, Social */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                  Let&rsquo;s connect
                </h2>
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                  Have questions or need support? We&rsquo;re here to help you scale your business.
                </p>
              </div>

              <div className="divide-y divide-black/10 border-t border-black/10">
                  <div className="flex items-start gap-5 py-5">
                    <div className="shrink-0 pt-1">
                      <Mail className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Email us</p>
                      <p className="text-lg font-medium text-black">support@trite.tech</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 py-5">
                    <div className="shrink-0 pt-1">
                      <MapPin className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Visit us</p>
                      <p className="text-lg font-medium text-black">
                          Ahodwo-Daban, No. Two Street Off Gyamfua Courts<br />
                          GPS AG-2709-3228
                        </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 py-5">
                    <div className="shrink-0 pt-1">
                      <Mail className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">General Enquiries</p>
                      <a
                        href="mailto:info@trite.tech"
                        className="text-lg font-medium text-black hover:text-[#22c55e] transition-colors"
                      >
                        info@trite.tech
                      </a>
                    </div>
                  </div>
                </div>


              {/* CONNECT SECTION - SOCIAL MEDIA */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  {[
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                        </svg>
                      ),
                      href: "https://www.facebook.com/share/1DMeRwMSj6/?mibextid=wwXIfr",
                      label: "Facebook"
                    },
                    {
                      icon: (
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                      href: "https://x.com/usetrite?s=11",
                      label: "X"
                    },
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ),
                      href: "https://www.linkedin.com/company/use-trite/",
                      label: "LinkedIn"
                    },
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ),
                      href: "https://youtube.com/@usetrite?si=I1QM18cJD0QQA1BQ",
                      label: "YouTube"
                    },
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      ),
                      href: "https://www.instagram.com/usetrite?igsh=MXF2amluOGF2MXF3bw%3D%3D&utm_source=qr",
                      label: "Instagram"
                    }
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target={social.href !== "#" ? "_blank" : undefined}
                      rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                      className="h-12 w-12 bg-white border border-black/10 text-black flex items-center justify-center hover:bg-[#22c55e] hover:text-white hover:border-[#22c55e] transition-all duration-300 rounded-xl"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="pt-8 lg:pt-12">
              {formState === "success" ? (
                <div className="bg-gray-50 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[500px] border border-black/[0.03] rounded-[2rem]">
                  <div className="h-20 w-20 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-[#22c55e]" />
                  </div>
                  <h2 className="text-2xl font-black text-black mb-4">Message Sent Successfully!</h2>
                  <p className="text-gray-500 font-medium mb-8 max-w-md">
                    Thank you for reaching out. A Trite specialist will review your inquiry and get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setFormState("idle")}
                    className="px-8 py-4 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] transition-all rounded-full"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <input
                        required
                        type="text"
                        id="first-name"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all rounded-2xl"
                        placeholder="First Name (*)"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        required
                        type="text"
                        id="last-name"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all rounded-2xl"
                        placeholder="Last Name (*)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <input
                        type="tel"
                        id="telephone"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all rounded-2xl"
                        placeholder="Telephone Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        required
                        type="email"
                        id="email"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all rounded-2xl"
                        placeholder="Email (*)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      required
                      id="message"
                      rows={6}
                      className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all rounded-xl"
                      placeholder="Your Message"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={formState === "submitting"}
                      type="submit"
                      className="px-10 py-4 bg-[#22c55e] text-white font-bold text-sm hover:bg-[#16a34a] transition-all flex items-center justify-center gap-3 disabled:opacity-70 rounded-full"
                    >
                      {formState === "submitting" ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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
