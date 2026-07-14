"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BrandAssetsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main className="mx-auto max-w-md px-4 py-32 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-2">
          <Clock className="w-8 h-8 text-[#22c55e]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-950">Brand Assets</h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
          Our complete brand guidelines — including typography manuals, color specifications, and product design rules — are currently being updated and will be available soon.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#22c55e] hover:text-[#16a34a] transition-colors pt-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </main>

      <Footer />
    </div>
  );
}
