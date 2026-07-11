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
              {/* <li><Link href="/about" className="hover:text-black transition-colors">About Us</Link></li> */}
              <li><Link href="/careers" className="hover:text-black transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-black transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Products</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="/products" className="hover:text-black transition-colors">Products</Link></li>
              <li><Link href="/support" className="hover:text-black transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Resources</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="#" className="hover:text-black transition-colors">Developers</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">Compliance</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-black">Legal</h5>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 font-bold">
              <li><Link href="#" className="hover:text-black transition-colors">Legal</Link></li>
              <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
              <li><Link href="/connect" className="hover:text-black transition-colors">Connect</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-medium">
          <div>
            &copy; {new Date().getFullYear()} Trite. All rights reserved. Ghana Payment Infrastructure Gateway.
          </div>
        </div>

      </div>
    </footer>
  );
}
