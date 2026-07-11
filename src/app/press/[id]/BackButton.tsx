"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black mb-8 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> Back
    </button>
  );
}
