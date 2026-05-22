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
    { name: "Home", href: "/" },
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
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <span className="text-xs text-white/70 font-medium">Global payments, local experience – Available in multiple languages</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 font-medium hidden sm:inline">Select your preferred language:</span>
            <LanguageSwitcher />
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
                    isActive ? "text-[#92bd30]" : "text-gray-700 hover:bg-gray-100/80"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#92bd30]" />
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
                className="px-5 py-2 text-sm font-semibold bg-[#92bd30] text-black hover:bg-[#81a72a] rounded-full transition-all shadow-sm hover:shadow"
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
                    isActive ? "text-[#92bd30] font-semibold" : "text-white/80 hover:bg-white/5"
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
                className="flex w-full justify-center items-center px-4 py-3 text-sm font-semibold bg-[#92bd30] text-black rounded-xl hover:bg-[#81a72a]"
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
