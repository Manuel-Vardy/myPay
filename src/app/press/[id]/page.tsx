"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { allArticles } from "@/lib/newsData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Look up the article by slug/id
  const article = allArticles.find((a) => a.id === id);

  // Fallback if the article is not found
  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <Header transparent={true} darkLogo={true} />
        <main className="mx-auto max-w-md px-4 py-32 text-center space-y-6">
          <h1 className="text-3xl font-bold text-slate-950">Article Not Found</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            The article you are looking for does not exist or has been moved.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#22c55e] hover:text-[#16a34a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Get up to 4 related articles (excluding the current one)
  const relatedArticles = allArticles
    .filter((a) => a.id !== id)
    .slice(0, 4);

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

        {/* Two-column layout: article body left, related stories right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 xl:gap-16 items-start">

          {/* ── LEFT: Article content ── */}
          <article>
            {/* Article Meta Header */}
            <div className="space-y-4 mb-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#22c55e]">
                {article.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 font-bold border-b border-slate-100 pb-6 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#22c55e]" />
                  {article.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#22c55e]" />
                  {article.readTime}
                </span>
              </div>
            </div>

            {/* Large Hero Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-100 mb-10 border border-slate-200/50">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
              {article.overlayText && (
                <div className="absolute bottom-4 left-4 bg-[#0ea5e9]/95 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-sm">
                  {article.overlayText}
                </div>
              )}
            </div>

            {/* Article Body Content */}
            <div className="space-y-6">
              {article.content.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          {/* ── RIGHT: Related Stories sticky sidebar ── */}
          <aside className="lg:sticky lg:top-32">
            <h3 className="text-base font-bold text-black border-b border-slate-200 pb-4 mb-6 uppercase tracking-wide">
              Related Stories
            </h3>
            <div className="flex flex-col gap-6">
              {relatedArticles.map((rel, index) => (
                <Link
                  key={index}
                  href={`/press/${rel.id}`}
                  className="group flex flex-col gap-3 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/50">
                    <Image
                      src={rel.image}
                      alt={rel.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Meta */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#22c55e] block">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-black transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#22c55e]" />
                      {rel.date}
                    </p>
                  </div>

                  {/* Divider between cards */}
                  {index < relatedArticles.length - 1 && (
                    <div className="border-b border-slate-100 mt-1" />
                  )}
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
