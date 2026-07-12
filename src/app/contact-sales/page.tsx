'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";

const labelClass = "text-xs font-bold text-gray-900 uppercase tracking-wider";
const fieldClass =
  "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-all placeholder:text-gray-500 focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 outline-none";
const textareaClass =
  "min-h-24 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10";

export default function ContactSalesPage() {
  return (
    <main className="min-h-screen bg-white font-montserrat flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo and Home Link */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <svg className="size-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8">
          <div className="flex flex-col space-y-1 mb-8">
            <h1 className="text-2xl font-black tracking-tight text-black">
              Contact Sales
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              We typically respond within 24 hours (business days).
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="fullName">
                  Full name
                </label>
                <input
                  className={fieldClass}
                  id="fullName"
                  placeholder="Ama Owusu"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="workEmail">
                  Work email
                </label>
                <input
                  className={fieldClass}
                  id="workEmail"
                  type="email"
                  placeholder="ama@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="company">
                Company / business
              </label>
              <input
                className={fieldClass}
                id="company"
                placeholder="Trite Stores"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="phone">
                  Phone / WhatsApp
                </label>
                <input
                  className={fieldClass}
                  id="phone"
                  placeholder="+233 20 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="volume">
                  Monthly Volume (GHS)
                </label>
                <select
                  className={fieldClass}
                  id="volume"
                >
                  <option>₵0 - ₵10k</option>
                  <option>₵10k - ₵50k</option>
                  <option>₵50k - ₵200k</option>
                  <option>₵200k - ₵1m</option>
                  <option>₵1m+</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                What do you want to build?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Online Payments", "Payouts", "Subscriptions", "Cross-border"].map((item) => (
                  <label key={item} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium cursor-pointer transition-all hover:border-[#22c55e] group">
                    <input type="checkbox" className="accent-[#22c55e] h-4 w-4" />
                    <span className="text-gray-800 group-hover:text-black">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="message">
                Message
              </label>
              <textarea
                className={textareaClass}
                id="message"
                placeholder="Tell us what you're building..."
              />
            </div>

            <button
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-black/10 mt-4 active:scale-[0.98]"
              type="submit"
            >
              Submit Inquiry
            </button>
            
            <p className="text-center text-xs text-gray-600 mt-4 font-medium">
              Prefer email? Write to us at <a href="mailto:sales@trite.tech" className="font-bold text-black hover:text-[#22c55e] transition-colors">sales@trite.tech</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
