"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  Shield,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Avatars removed to clean up unused code

const MERCHANT_TOPICS = [
  { label: "Account setup" },
  { label: "Merchant onboarding" },
  { label: "Payment acceptance" },
  { label: "Settlements" },
  { label: "Dashboard usage" },
  { label: "Transaction reconciliation" },
];

const TECHNICAL_TOPICS = [
  { label: "API integration" },
  { label: "Webhooks" },
  { label: "SDK implementation" },
  { label: "Testing environments" },
  { label: "Sandbox support" },
];

const FAQS = [
  {
    question: "How do I create a merchant account?",
    answer:
      "Visit our merchant registration page to create your account. Complete your business profile, submit required KYC documents, and once verified you'll receive dashboard access and API credentials to start accepting payments.",
  },
  {
    question: "Which payment methods are supported?",
    answer:
      "Trite supports stablecoin and crypto payments (MetaMask, WalletConnect), mobile money (MTN, Telcel, AirtelTigo), and card & local wallet options including debit/credit cards and regional bank transfers — all through a single integrated platform.",
  },
  {
    question: "How long do settlements take?",
    answer:
      "Settlement timing depends on your verification tier and payout method. Most merchant settlements are processed within 1–3 business days. Premium and verified merchants may qualify for faster settlement cycles.",
  },
  {
    question: "How are refunds processed?",
    answer:
      "Refunds can be initiated from your merchant dashboard or via the Refunds API. Once approved, funds are returned to the customer's original payment method. Refund status is tracked in real time alongside your transaction ledger.",
  },
  {
    question: "What fees does Trite charge?",
    answer:
      "Trite offers transparent, competitive pricing based on transaction volume and payment method. Contact our team at support@trite.tech for a tailored fee schedule, or review your merchant agreement for your current rate card.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-300">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base font-bold text-black">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-black" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-[1.08]">
              We&apos;re Here to Help
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re onboarding your business, integrating our APIs, or managing
              payments, our support team is ready to assist you.
            </p>
          </div>
        </section>

        {/* Support Categories */}
        <section className="pt-8 pb-16 lg:pt-12 lg:pb-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {/* Merchant Support */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
                      Merchant Support
                    </h2>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">Get help with:</p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {MERCHANT_TOPICS.map(({ label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-gray-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#22c55e] text-white text-sm font-bold hover:bg-[#16a34a] transition-colors"
                >
                  Contact merchant support
                  <ArrowRight className="h-4 w-4" />
                </Link>
                </div>
                <div className="relative">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src="/images/merchant-support.jpg"
                      alt="Merchant Support"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              
              {/* Technical Support */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src="/images/technical-support.jpg"
                      alt="Technical Support"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 order-1 lg:order-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
                      Technical Support
                    </h2>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                      Need integration assistance?
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Our developer support team can help with:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {TECHNICAL_TOPICS.map(({ label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-gray-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Contact developer support
                  <ArrowRight className="h-4 w-4" />
                </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-24 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-2 text-center">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                FAQ
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Frequently Asked Questions
              </h3>
            </div>
            <div className="w-full">
              {FAQS.map((faq, idx) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Training & Support Header Banner */}
        <section className="relative h-[300px] sm:h-[385px] md:h-[450px] overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/young-african.jpg"
              alt="Our Support"
              fill
              className="object-cover object-center lg:object-right"
              priority
            />
            <div className="absolute inset-0 bg-slate-950/10" />
          </div>
        </section>

        {/* Training & Onboarding split section */}
        <section className="bg-white pb-16 sm:pb-24">
          <div className="w-full relative z-20 -mt-20 sm:-mt-28 md:-mt-32">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-0 items-stretch overflow-hidden border-y border-black/[0.06]">
              
              {/* Left Column: Onboarding and Video Walkthrough */}
              <div className="bg-[#fdfcf6] p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="max-w-4xl w-full space-y-6">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Our Support
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                    Learning to operate on this platform is streamlined with our support team guiding you at every step. You can be assured of having all the expertise, resources, and live support you need.
                  </p>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#16a34a]">
                      Step-By-Step Thorough Onboarding Process
                    </h4>
                  </div>
                  
                  {/* Video Placeholder */}
                  <div className="mt-8 relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group cursor-pointer hover:border-[#22c55e]/40 transition-all duration-300 shadow-inner">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#22c55e]/10 group-hover:border-[#22c55e] transition-all duration-300 shadow-md">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:text-[#22c55e] translate-x-0.5 transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact support card styled like the original middle section */}
              <div className="relative overflow-hidden bg-[#22c55e] p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col items-center justify-center text-center min-h-[420px]">
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.06)_100%)]" />

                <div className="relative z-10 space-y-6 max-w-sm">
                  <h3 className="text-4xl sm:text-[2.75rem] font-extrabold text-white tracking-tight leading-none">
                    Contact support
                  </h3>

                  <div className="space-y-1">
                    <a
                      href="mailto:support@trite.tech"
                      className="block text-base sm:text-lg font-bold text-white hover:text-white/90 transition-colors"
                    >
                      support@trite.tech
                    </a>
                    <p className="text-xs sm:text-sm font-semibold text-white/75">
                      Monday – Friday · 8:00 AM – 5:00 PM GMT
                    </p>
                  </div>

                  <a
                    href="mailto:support@trite.tech"
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-gray-900 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email us
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
