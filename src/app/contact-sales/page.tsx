'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, Grid2x2PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactSalesPage() {
  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left Column: Branding & Info */}
      <div className="bg-gradient-to-b from-[#1a1a1a] via-[#0d0d0d] to-black relative hidden h-full flex-col border-r border-white/5 p-10 lg:flex overflow-hidden">
        <div className="z-20 flex items-center gap-2">
          <Link href="/">
            <Image
              src="/Trite-WB.png"
              alt="Trite logo"
              width={120}
              height={28}
              priority
            />
          </Link>
        </div>
        
        <div className="z-20 mt-auto max-w-lg">
          <div className="text-sm font-semibold uppercase tracking-wider text-[color:var(--trite-lime-strong)] mb-4">
            Enterprise Solutions
          </div>
          <blockquote className="space-y-4">
            <p className="text-2xl font-semibold leading-tight text-white">
              &ldquo;Scale your global operations with institutional-grade infrastructure. 
              Trite delivers the velocity and reliability required for enterprise-level settlements.&rdquo;
            </p>
            <footer className="font-mono text-sm font-medium text-white/40">
              ~ Enterprise Strategy Lead
            </footer>
          </blockquote>

          <div className="mt-12 space-y-6">
            <div className="text-sm font-semibold text-white/80">
              The Sales Process
            </div>
            <div className="grid gap-4 text-sm text-white/60">
              <div className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                <span>Dedicated solution architecture for your volume</span>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                <span>Customized fee structures and settlement schedules</span>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                <span>Priority onboarding and institutional support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-4 overflow-y-auto bg-white text-[color:var(--trite-ink)]">
        <Button variant="ghost" className="absolute top-7 left-5 text-[color:var(--trite-ink)] hover:bg-black/5" asChild>
          <Link href="/">
            <ChevronLeftIcon className='size-4 me-2' />
            Home
          </Link>
        </Button>

        <div className="mx-auto w-full max-w-lg py-12 px-4 sm:px-6">
          <div className="flex flex-col space-y-1 mb-8">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[color:var(--trite-ink)]">
              Contact Sales
            </h1>
            <p className="text-[color:var(--trite-muted)] text-sm">
              We typically respond within 24 hours (business days).
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]" htmlFor="fullName">
                  Full name
                </label>
                <input
                  className="h-11 w-full rounded-xl border border-black/5 bg-[#f6f7fb] px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
                  id="fullName"
                  placeholder="Ama Owusu"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]" htmlFor="workEmail">
                  Work email
                </label>
                <input
                  className="h-11 w-full rounded-xl border border-black/5 bg-[#f6f7fb] px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
                  id="workEmail"
                  type="email"
                  placeholder="ama@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]" htmlFor="company">
                Company / business
              </label>
              <input
                className="h-11 w-full rounded-xl border border-black/5 bg-[#f6f7fb] px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
                id="company"
                placeholder="Trite Stores"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]" htmlFor="phone">
                  Phone / WhatsApp
                </label>
                <input
                  className="h-11 w-full rounded-xl border border-black/5 bg-[#f6f7fb] px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
                  id="phone"
                  placeholder="+233 20 000 0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]" htmlFor="volume">
                  Monthly Volume (GHS)
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-black/5 bg-[#f6f7fb] px-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
                  id="volume"
                >
                  <option>₵0 - ₵10k</option>
                  <option>₵10k - ₵50k</option>
                  <option>₵50k - ₵200k</option>
                  <option>₵200k - ₵1m</option>
                  <option>₵1m+</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]">
                What do you want to build?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Online Payments", "Payouts", "Subscriptions", "Cross-border"].map((item) => (
                  <label key={item} className="flex items-center gap-2 rounded-xl border border-black/5 bg-[#f6f7fb] p-3 text-xs font-medium cursor-pointer transition-colors hover:bg-black/5 text-[color:var(--trite-ink)]">
                    <input type="checkbox" className="accent-[color:var(--trite-lime-strong)] h-4 w-4" />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--trite-muted)]" htmlFor="message">
                Message
              </label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-black/5 bg-[#f6f7fb] p-4 text-sm text-[color:var(--trite-ink)] outline-none transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white focus:ring-1 focus:ring-[color:var(--trite-lime-strong)]"
                id="message"
                placeholder="Tell us what you're building..."
              />
            </div>

            <Button size="lg" className="w-full bg-[color:var(--trite-ink)] text-white hover:bg-black">
              Submit Inquiry
            </Button>
            
            <p className="text-center text-xs text-[color:var(--trite-muted)] mt-4">
              Prefer email? Write to us at <a href="mailto:sales@trite.com" className="font-bold text-[color:var(--trite-ink)] hover:underline">sales@trite.com</a>
            </p>
          </form>
        </div>

        <footer className="mt-auto py-6 border-t border-black/5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[color:var(--trite-muted)]">
            © {new Date().getFullYear()} Trite. Bank-Grade Security & Compliance.
          </p>
        </footer>
      </div>
    </main>
  );
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(15,23,42,${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full text-[color:var(--trite-lime-strong)] opacity-20"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}
