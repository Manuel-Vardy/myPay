"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail, 
  MapPin, 
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
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
    <div className="flex min-h-screen flex-col bg-white">
      <Header transparent={true} darkLogo={true} />

      <main className="flex-grow pt-40 sm:pt-52 pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left Side: Heading, Contact Info, Social */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#22c55e]">
                  Get in touch
                </h2>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                  CONTACT US
                </h1>
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                  Have questions or need support? We're here to help you scale your business.
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 pt-1">
                      <Mail className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Email us</p>
                      <p className="text-lg font-medium text-black">support@trite.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="shrink-0 pt-1">
                      <MapPin className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Visit us</p>
                      <p className="text-lg font-medium text-black">
                        Ahodwo-Daban, Dei-Kwarteng Street,<br />
                        Near Hill-Top (AK-606-2396)
                      </p>
                    </div>
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
                      href: "https://www.facebook.com/share/1E1xqWNV6o/?mibextid=wwXIfr",
                      label: "Facebook"
                    },
                    {
                      icon: (
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                      href: "https://x.com/trite_pay?s=11",
                      label: "X"
                    },
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      ),
                      href: "#",
                      label: "WhatsApp"
                    },
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ),
                      href: "#",
                      label: "YouTube"
                    },
                    {
                      icon: (
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      ),
                      href: "https://www.instagram.com/tritepay?igsh=MWNiOHAzMzJ0M3dheQ%3D%3D&utm_source=qr",
                      label: "Instagram"
                    }
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target={social.href !== "#" ? "_blank" : undefined}
                      rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                      className="h-12 w-12 bg-[#22c55e] text-white flex items-center justify-center hover:bg-[#16a34a] transition-all duration-300"
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
                <div className="bg-gray-50 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[500px] border border-black/[0.03]">
                  <div className="h-20 w-20 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-[#22c55e]" />
                  </div>
                  <h2 className="text-2xl font-black text-black mb-4">Message Sent Successfully!</h2>
                  <p className="text-gray-500 font-medium mb-8 max-w-md">
                    Thank you for reaching out. A Trite specialist will review your inquiry and get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setFormState("idle")}
                    className="px-8 py-4 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] transition-all"
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
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all"
                        placeholder="First Name (*)"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        required
                        type="text"
                        id="last-name"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all"
                        placeholder="Last Name (*)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <input
                        type="tel"
                        id="telephone"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all"
                        placeholder="Telephone Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        required
                        type="email"
                        id="email"
                        className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all"
                        placeholder="Email (*)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      required
                      id="message"
                      rows={6}
                      className="w-full bg-white border border-gray-300 px-4 py-3 text-black font-medium focus:outline-none focus:border-[#22c55e] transition-all"
                      placeholder="Your Message"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={formState === "submitting"}
                      type="submit"
                      className="px-10 py-4 bg-[#22c55e] text-white font-bold text-sm hover:bg-[#16a34a] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
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
      </main>

      <Footer />
    </div>
  );
}
