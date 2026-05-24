"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Menu, X } from "lucide-react";

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Payments & Settlement", href: "/payments" },
    { name: "Markets", href: "/markets" },
    { name: "Businesses", href: "/businesses" },
    { name: "Products", href: "/products" },
  ];

  const getActiveState = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* TOP BLACK BAR WITH LANGUAGE SWITCHER */}
      <div className="w-full bg-black text-white py-2 px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-end gap-8">
          <span className="text-xs text-white/70 font-medium">Seamless payments across Africa and beyond – Available in multiple languages</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* Download Button with Dropdown */}
            <div className="relative group">
              <button 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Download"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              
              {/* Dropdown - appears on hover */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4">
                  {/* Placeholder for QR Code */}
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-xs text-gray-400 font-medium text-center">QR Code<br/>Coming Soon</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-3 font-medium">Scan to download our app</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className={`w-full py-6 z-40 ${transparent ? "absolute left-0 right-0" : "bg-white border-b border-black/[0.06]"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={transparent ? "/Trite-WB.png" : "/tritee-logo.png"}
              alt="Trite logo"
              width={120}
              height={28}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={`hidden md:flex items-center gap-1 px-3 py-1.5 shadow-sm border rounded-none ${transparent ? "bg-white border-transparent" : "bg-gray-50/60 border-black/[0.04]"}`}>
            {navLinks.map((link) => {
              const isActive = getActiveState(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold transition-all relative rounded-full ${
                    isActive ? "text-[#22c55e]" : "text-gray-700 hover:bg-gray-100/80"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22c55e]" />
                  )}
                </Link>
              );
            })}
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Sign in
              </Link>
              <Link 
                href="/get-started" 
                className="px-5 py-2 text-sm font-semibold bg-[#22c55e] text-black hover:bg-[#16a34a] rounded-full transition-all shadow-sm hover:shadow"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              transparent 
                ? "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" 
                : "bg-gray-50 border-black/[0.06] text-black hover:bg-gray-100"
            }`}
            aria-label="Open menu"
            type="button"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-[112px] z-50 border-b border-black/[0.06] bg-black/95 backdrop-blur-lg p-6 shadow-xl md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = getActiveState(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-left ${
                    isActive ? "text-[#22c55e] font-semibold" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="h-px bg-white/10 my-4" />
            
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full justify-center items-center px-4 py-3 text-sm font-semibold text-white border border-white/20 rounded-xl hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full justify-center items-center px-4 py-3 text-sm font-semibold bg-[#22c55e] text-black rounded-xl hover:bg-[#16a34a]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
