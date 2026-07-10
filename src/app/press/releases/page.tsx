"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pressReleases } from "@/lib/newsData";

export default function PressReleasesListPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Page Title */}
        <div className="border-b border-slate-200 pb-4 mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Press Releases
          </h1>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pressReleases.map((release, index) => (
            <Link
              key={index}
              href={`/press/${release.id}`}
              className="bg-white rounded-3xl border border-slate-200/50 shadow-none overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src={release.image}
                  alt={release.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Title & Metadata */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 transition-colors leading-tight line-clamp-3">
                  {release.title}
                </h4>
                <div className="flex items-center gap-3 pt-4 text-[11px] text-slate-400 font-bold border-t border-slate-100 mt-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                    {release.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#22c55e]" />
                    {release.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
