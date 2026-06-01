"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header({ 
  transparent = false,
  darkLogo = false
}: { 
  transparent?: boolean;
  darkLogo?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial scroll position
    const checkScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 150) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    
    checkScroll();

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 150) {
        setIsSticky(true);
        if (currentScrollY > lastScrollY && currentScrollY > 400) {
          setIsVisible(false); // scrolling down and past initial area
        } else {
          setIsVisible(true); // scrolling up
        }
      } else {
        setIsSticky(false);
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div className="w-full bg-black text-white py-4 sm:py-2.5 px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 sm:gap-8 text-center sm:text-left">
          <span className="text-xs text-white/70 font-medium">
            Seamless payments across Africa and beyond 
            <span className="hidden sm:inline"> – Available in multiple languages</span>
          </span>
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

      <header 
        className={cn(
          "w-full z-40 transition-transform duration-300 ease-in-out",
          !mounted ? "bg-white border-b border-black/[0.06] py-3 sm:py-6 relative" : 
          isSticky 
            ? "fixed top-0 left-0 right-0 bg-transparent py-2 sm:py-4 flex justify-center" 
            : transparent 
              ? "absolute left-0 right-0 py-3 sm:py-6 bg-white sm:bg-transparent border-b border-black/[0.06] sm:border-none" 
              : "bg-white border-b border-black/[0.06] py-3 sm:py-6 relative",
          mounted && isSticky && !isVisible ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div 
          className={cn(
            "mx-auto flex items-center justify-between",
            isSticky 
              ? "bg-white shadow-md border border-black/[0.06] rounded-full px-8 py-1.5 sm:py-2.5 gap-16 w-[94%] md:w-auto md:max-w-fit"
              : "max-w-7xl px-4 sm:px-6 lg:px-8 w-full"
          )}
        >
          
          <Link href="/" className="flex items-center">
            {/* Desktop White Logo (shown only when transparent and not sticky) */}
            {(mounted && transparent && !isSticky && !darkLogo) && (
              <Image
                src="/Trite-WB.png"
                alt="Trite logo"
                width={120}
                height={28}
                className="hidden sm:block h-8 w-auto object-contain"
                priority
              />
            )}
            {/* Dark Logo (shown on mobile, or when sticky, or when not transparent) */}
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              className={cn(
                "h-6 sm:h-8 w-auto object-contain",
                (mounted && transparent && !isSticky && !darkLogo) ? "block sm:hidden" : "block"
              )}
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav 
            className={cn(
              "hidden md:flex items-center gap-1 px-3 py-1.5 transition-all",
              isSticky
                ? "bg-transparent border-transparent shadow-none"
                : transparent
                  ? "bg-white border border-transparent shadow-sm rounded-none"
                  : "bg-gray-50/60 border border-black/[0.04] shadow-sm rounded-none"
            )}
          >
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

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "md:hidden flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
              (mounted && transparent && !isSticky && !darkLogo) 
                ? "bg-gray-50 sm:bg-white/10 sm:backdrop-blur-sm border-black/[0.06] sm:border-white/20 text-black sm:text-white hover:bg-gray-100 sm:hover:bg-white/20" 
                : "bg-gray-50 border-black/[0.06] text-black hover:bg-gray-100"
            )}
            aria-label="Open menu"
            type="button"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-full z-50 border-b border-black/[0.06] bg-white backdrop-blur-lg p-6 shadow-xl md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = getActiveState(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-left ${
                      isActive ? "text-[#22c55e] font-semibold" : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="h-px bg-gray-100 my-4" />
              
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full justify-center items-center px-4 py-3 text-sm font-semibold text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50"
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
      </header>
    </>
  );
}
