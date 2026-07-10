"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LOGO_ASSETS = {
  mark: "/trite-fav.png",
  markWhite: "/trite-fav-white.png",
  fullDark: "/tritee-logo.png",
  fullLight: "/Trite-WB.png",
};

export default function LogosPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Breadcrumb Back Navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Page Header */}
        <div className="mb-12 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
            Brand Logos
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Download our official logos in high resolution for editorial and public use.
          </p>
        </div>

        {/* Section 1: Logo */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-black mb-6">Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Logo Mark (Icon) */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="relative h-64 w-full rounded-3xl bg-slate-50 border border-slate-200/50 flex items-center justify-center p-8 group">
                <div className="relative w-20 h-20">
                  <Image
                    src={LOGO_ASSETS.mark}
                    alt="Trite Logo Mark"
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Hover Download Overlay */}
                <a
                  href={LOGO_ASSETS.mark}
                  download="trite-logo-mark.png"
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2.5 rounded-full shadow-md hover:bg-[#16a34a] transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Download Logo Mark"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-900">Logo Mark</span>
                <a
                  href={LOGO_ASSETS.mark}
                  download="trite-logo-mark.png"
                  className="text-xs font-bold text-[#22c55e] hover:text-[#16a34a] flex items-center gap-1"
                >
                  Download <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Logo Mark (White - In Between) */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="relative h-64 w-full rounded-3xl bg-[#0f172a] border border-slate-800 flex items-center justify-center p-8 group">
                <div className="relative w-20 h-20">
                  <Image
                    src={LOGO_ASSETS.markWhite}
                    alt="Trite Logo Mark White"
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Hover Download Overlay */}
                <a
                  href={LOGO_ASSETS.markWhite}
                  download="trite-logo-mark-white.png"
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2.5 rounded-full shadow-md hover:bg-[#16a34a] transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Download Logo Mark White"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-900">Logo Mark (White)</span>
                <a
                  href={LOGO_ASSETS.markWhite}
                  download="trite-logo-mark-white.png"
                  className="text-xs font-bold text-[#22c55e] hover:text-[#16a34a] flex items-center gap-1"
                >
                  Download <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Full Horizontal Logo */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="relative h-64 w-full rounded-3xl bg-slate-50 border border-slate-200/50 flex items-center justify-center p-12 group">
                <div className="relative w-64 h-16">
                  <Image
                    src={LOGO_ASSETS.fullDark}
                    alt="Trite Full Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Hover Download Overlay */}
                <a
                  href={LOGO_ASSETS.fullDark}
                  download="trite-full-logo.png"
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2.5 rounded-full shadow-md hover:bg-[#16a34a] transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Download Full Logo"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-900">Horizontal Logo (Default)</span>
                <a
                  href={LOGO_ASSETS.fullDark}
                  download="trite-full-logo.png"
                  className="text-xs font-bold text-[#22c55e] hover:text-[#16a34a] flex items-center gap-1"
                >
                  Download <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Logo Variants */}
        <section>
          <h2 className="text-xl font-bold text-black mb-6">Logo Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Primary Logo (Dark Slate Background) */}
            <div className="flex flex-col gap-3">
              <div className="relative h-48 w-full rounded-3xl bg-[#0f172a] flex items-center justify-center p-8 group">
                <div className="relative w-40 h-10">
                  <Image
                    src={LOGO_ASSETS.fullLight}
                    alt="Trite Primary Logo Variant"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={LOGO_ASSETS.fullLight}
                  download="trite-primary-logo.png"
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2 rounded-full hover:bg-[#16a34a] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-900">Primary Logo (On Dark)</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">White Text</span>
              </div>
            </div>

            {/* Secondary Logo (Dark Green Background) */}
            <div className="flex flex-col gap-3">
              <div className="relative h-48 w-full rounded-3xl bg-[#052e16] flex items-center justify-center p-8 group">
                <div className="relative w-40 h-10">
                  <Image
                    src={LOGO_ASSETS.fullLight}
                    alt="Trite Secondary Logo Variant"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={LOGO_ASSETS.fullLight}
                  download="trite-secondary-logo.png"
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2 rounded-full hover:bg-[#16a34a] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-900">Secondary Logo (On Green)</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">White Text</span>
              </div>
            </div>

            {/* Tertiary Logo (Dark Burgundy Background) */}
            <div className="flex flex-col gap-3">
              <div className="relative h-48 w-full rounded-3xl bg-[#4c0519] flex items-center justify-center p-8 group">
                <div className="relative w-40 h-10">
                  <Image
                    src={LOGO_ASSETS.fullLight}
                    alt="Trite Tertiary Logo Variant"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={LOGO_ASSETS.fullLight}
                  download="trite-tertiary-logo.png"
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2 rounded-full hover:bg-[#16a34a] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-900">Tertiary Logo (On Burgundy)</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">White Text</span>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
