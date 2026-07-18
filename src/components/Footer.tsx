"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6 pb-12 border-b border-black/[0.06]">
          
          {/* Branding Column */}
          <div className="col-span-2 space-y-4">
            <Image
              src="/Trite-WB.png"
              alt="Trite logo"
              width={100}
              height={24}
              className="h-6 w-auto object-contain brightness-0"
              style={{ filter: "brightness(0)" }}
            />
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
              Redefining money movement with high-velocity Global Settlements, built-in KYC compliance, and robust stablecoin payment infrastructures.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Company</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="/about" className="hover:text-black transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-black transition-colors">Careers</Link></li>
              <li><Link href="/news" className="hover:text-black transition-colors">News</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Products</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="/products#merchant-storefront" className="hover:text-black transition-colors">Merchant Storefront</Link></li>
              <li><Link href="/products#stable-pay" className="hover:text-black transition-colors">Stable-Pay</Link></li>
              <li><Link href="/products#trite-api" className="hover:text-black transition-colors">Trite API</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Resources</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="/developers" className="hover:text-black transition-colors">Developers</Link></li>
              <li><Link href="/compliance" className="hover:text-black transition-colors">Compliance</Link></li>
              <li><Link href="/support" className="hover:text-black transition-colors">Support</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Legal</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="/legal" className="hover:text-black transition-colors">Refund Policy</Link></li>
              <li><Link href="/legal?tab=privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal?tab=general-terms-of-use" className="hover:text-black transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-medium">
          <div>
            &copy; {new Date().getFullYear()} Trite. All rights reserved. Ghana Payment Infrastructure Gateway.
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              {
                label: "Facebook",
                href: "https://www.facebook.com/share/1E1xqWNV6o/?mibextid=wwXIfr",
                icon: (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                ),
              },
              {
                label: "X",
                href: "https://x.com/trite_pay?s=11",
                icon: (
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                label: "WhatsApp",
                href: "#",
                icon: (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "#",
                icon: (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                ),
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/tritepay?igsh=MWNiOHAzMzJ0M3dheQ%3D%3D&utm_source=qr",
                icon: (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                ),
              },
              {
                label: "LinkedIn",
                href: "#",
                icon: (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href !== "#" ? "_blank" : undefined}
                rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="text-gray-400 hover:text-black transition-colors duration-200"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
