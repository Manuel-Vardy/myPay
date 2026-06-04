"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Clock, 
  Globe2,
  Send,
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

      <main className="flex-grow pt-32 sm:pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-black mb-2">Get in touch</h1>
            <p className="text-gray-500 font-medium">
              Have questions or need support? We're here to help you scale your business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Contact Form Section */}
            <div className="lg:col-span-7">
              {formState === "success" ? (
                <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[500px] border border-black/[0.03]">
                  <div className="h-20 w-20 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-[#22c55e]" />
                  </div>
                  <h2 className="text-2xl font-black text-black mb-4">Message Sent Successfully!</h2>
                  <p className="text-gray-500 font-medium mb-8 max-w-md">
                    Thank you for reaching out. A Trite specialist will review your inquiry and get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setFormState("idle")}
                    className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-900 transition-all"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-xs font-bold uppercase tracking-wider text-black">First Name</label>
                      <input
                        required
                        type="text"
                        id="first-name"
                        className="w-full bg-gray-50 border border-black/[0.08] rounded-[20px] px-6 py-3 text-black font-medium focus:outline-none focus:border-black/20 transition-all"
                        placeholder="Kwame"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-xs font-bold uppercase tracking-wider text-black">Last Name</label>
                      <input
                        required
                        type="text"
                        id="last-name"
                        className="w-full bg-gray-50 border border-black/[0.08] rounded-[20px] px-6 py-3 text-black font-medium focus:outline-none focus:border-black/20 transition-all"
                        placeholder="Boateng"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-black">Work Email</label>
                    <input
                      required
                      type="email"
                      id="email"
                      className="w-full bg-gray-50 border border-black/[0.08] rounded-[20px] px-6 py-3 text-black font-medium focus:outline-none focus:border-black/20 transition-all"
                      placeholder="kwameboateng@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-black">Message</label>
                    <textarea
                      required
                      id="message"
                      rows={5}
                      className="w-full bg-gray-50 border border-black/[0.08] rounded-[20px] px-6 py-3 text-black font-medium focus:outline-none focus:border-black/20 transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button
                    disabled={formState === "submitting"}
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#22c55e] text-black rounded-full font-semibold text-base hover:bg-[#16a34a] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {formState === "submitting" ? (
                      <>
                        <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Section */}
            <div className="lg:col-span-5 space-y-12">
              
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-black">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-black/[0.03]">
                      <Mail className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email us</p>
                      <p className="text-lg font-semibold text-black">support@trite.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-black/[0.03]">
                      <Phone className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Call us</p>
                      <p className="text-lg font-semibold text-black">+233 (0) 50 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-black/[0.03]">
                      <MapPin className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Visit us</p>
                      <p className="text-lg font-semibold text-black">
                        Ahodwo-Daban, Dei-Kwarteng Street,<br />
                        Near Hill-Top (AK-606-2396)
                      </p>
                    </div>
                  </div>
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
