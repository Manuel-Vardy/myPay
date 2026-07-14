"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PRODUCT_IMAGES = [
  {
    src: "/images/trite-api.png",
    title: "Trite Payment API interface",
    description: "Visual rendering of our high-velocity developer integration endpoint structures.",
    filename: "trite-payment-api.png",
  },
  {
    src: "/images/merchant_transactions.png",
    title: "Merchant Portal Ledger",
    description: "High-fidelity visualization of the stablecoin transaction ledger and analytics dashboard.",
    filename: "trite-merchant-portal-ledger.png",
  },
  {
    src: "/images/kyc_3d.png",
    title: "KYC Identity Verification Flow",
    description: "3D visual representing our automated KYC customer verification pipelines.",
    filename: "trite-kyc-flow-3d.png",
  },
  {
    src: "/images/stablecoin_3d.png",
    title: "Stablecoin Settlement Rails",
    description: "3D abstract design indicating global stablecoin-enabled payout pipelines.",
    filename: "trite-stablecoin-settlement.png",
  },
  {
    src: "/images/gateway.png",
    title: "Trite Checkout Gateway",
    description: "Standard checkout gateway interfaces for cards, mobile money, and wallets.",
    filename: "trite-checkout-gateway.png",
  },
  {
    src: "/images/omnichannel_3d.png",
    title: "Omnichannel Payment Infrastructure",
    description: "Abstract architectural illustration of multi-channel billing layers.",
    filename: "trite-omnichannel-payments.png",
  },
];

export default function ProductImagesPage() {
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
            Product Images
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            A curated gallery of press-ready product screens, mockups, and illustrations.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCT_IMAGES.map((img, index) => (
            <div key={index} className="flex flex-col gap-4 group">
              
              {/* Image Preview Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-slate-50 border border-slate-200/50 flex items-center justify-center">
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Hover Download Overlay */}
                <a
                  href={img.src}
                  download={img.filename}
                  className="absolute bottom-4 right-4 bg-[#22c55e] text-white p-2.5 rounded-full shadow-md hover:bg-[#16a34a] transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title={`Download ${img.title}`}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

              {/* Card Meta & Bottom Controls */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {img.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                  {img.description}
                </p>
                <a
                  href={img.src}
                  download={img.filename}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22c55e] hover:text-[#16a34a] transition-colors"
                >
                  Download Asset <Download className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
