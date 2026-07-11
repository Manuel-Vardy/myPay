import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "./BackButton";
import { allArticles } from "@/lib/newsData";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve an absolute URL for OG images regardless of environment */
function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path}`;
}

// ── Static params (optional but recommended for SSG) ─────────────────────────

export async function generateStaticParams() {
  return allArticles.map((a) => ({ id: a.id }));
}

// ── Per-article Open Graph metadata ──────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = allArticles.find((a) => a.id === id);

  if (!article) {
    return {
      title: "Article Not Found | Trite",
      description: "The article you are looking for does not exist.",
    };
  }

  const imageUrl = absoluteUrl(article.image);
  const pageUrl = absoluteUrl(`/press/${article.id}`);

  return {
    title: `${article.title} | Trite`,
    description: article.description,
    openGraph: {
      type: "article",
      url: pageUrl,
      title: article.title,
      description: article.description,
      siteName: "Trite",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },
  };
}

// ── Page component (Server Component) ────────────────────────────────────────

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = allArticles.find((a) => a.id === id);

  if (!article) {
    notFound();
  }

  // Up to 4 related articles (excluding current)
  const relatedArticles = allArticles.filter((a) => a.id !== id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#22c55e]/30 selection:text-black overflow-x-hidden">
      <Header transparent={true} darkLogo={true} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Back navigation – client island */}
        <BackButton />

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
