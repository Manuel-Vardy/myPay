"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Book, Code, Terminal, Zap } from "lucide-react";
import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      <Header transparent={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#22c55e] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black mb-6">
            Developer API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Integrate Trite's high-velocity payment infrastructure into your application. 
            Our APIs are designed for reliability, security, and ease of use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#22c55e]/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-[#22c55e]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Quick Start</h3>
            <p className="text-gray-600 mb-6">Get your API keys and make your first request in less than 5 minutes.</p>
            <button className="text-sm font-bold text-[#22c55e] flex items-center group-hover:gap-2 transition-all">
              View Guide <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#22c55e]/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">API Reference</h3>
            <p className="text-gray-600 mb-6">Detailed information about endpoints, parameters, and responses.</p>
            <button className="text-sm font-bold text-[#22c55e] flex items-center group-hover:gap-2 transition-all">
              Explore Docs <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#22c55e]/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Terminal className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">SDKs & Libraries</h3>
            <p className="text-gray-600 mb-6">Official libraries for Node.js, Python, PHP, and more.</p>
            <button className="text-sm font-bold text-[#22c55e] flex items-center group-hover:gap-2 transition-all">
              Download SDKs <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
            </button>
          </div>
        </div>

        <div className="bg-black rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
              Coming Soon
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6">Interactive API Sandbox</h2>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              We're building an interactive environment where you can test our API endpoints 
              directly from your browser without writing a single line of code.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-[#22c55e] text-black font-bold rounded-full hover:bg-[#16a34a] transition-all">
                Join the Waitlist
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <Book className="h-64 w-64 translate-x-1/4 translate-y-1/4" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
