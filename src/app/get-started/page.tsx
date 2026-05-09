"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function GetStartedPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    legalEntity: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          business_name: formData.businessName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          legal_entity: formData.legalEntity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // In a real app, save the token (e.g., localStorage.setItem('token', data.token))
      // and redirect to the dashboard
      router.push("/merchant");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-white">
      {/* Left Column: Testimonial & Branding */}
      <div className="bg-gradient-to-b from-[#1a1a1a] via-[#0d0d0d] to-black relative hidden h-full flex-col border-r border-white/5 p-10 lg:flex overflow-hidden">
        <div className="z-20 flex items-center gap-2">
          <Image
            src="/images/Trite-WB.png"
            alt="Trite logo"
            width={120}
            height={28}
            priority
          />
        </div>
        
        <div className="z-20 mt-auto max-w-lg">
          <div className="text-sm font-semibold uppercase tracking-wider text-[color:var(--trite-lime-strong)] mb-4">
            Institutional Infrastructure
          </div>
          <blockquote className="space-y-4">
            <p className="text-2xl font-semibold leading-tight text-white">
              &ldquo;Architecting the future of global commerce. Trite provides the 
              secure, scalable rails we need to settle across borders in real-time.&rdquo;
            </p>
            <footer className="font-mono text-sm font-medium text-white/40">
              ~ Global Fintech Partner
            </footer>
          </blockquote>

          <div className="mt-12 space-y-6">
            <div className="text-sm font-semibold text-white/80">
              What you get with Trite
            </div>
            <div className="grid gap-4 text-sm text-white/60">
              <div className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                <span>GHS settlement-ready payment flows</span>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                <span>Unified API for fiat + digital asset rails</span>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[color:var(--trite-lime-strong)]" />
                <span>Bank-grade security and compliance controls</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-4 overflow-y-auto">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.04)_0,hsla(0,0%,55%,.02)_50%,transparent_80%)] absolute top-0 right-0 h-[320px] w-[140px] -translate-y-[87.5px] rounded-full" />
        </div>

        <div className="absolute top-7 left-5">
          <Link 
            href="/"
            className="inline-flex items-center text-sm font-medium text-[color:var(--trite-muted)] hover:text-[color:var(--trite-ink)]"
          >
            <svg className="size-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6 py-12">
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Image
              src="/Trite-WB.png"
              alt="Trite logo"
              width={100}
              height={24}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white w-fit px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--trite-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--trite-lime-strong)]" />
              Merchant onboarding
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[color:var(--trite-ink)]">
              Create Account
            </h1>
            <p className="text-sm text-[color:var(--trite-muted)]">
              Start accepting payments in Ghana Cedis (GHS) today.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="firstName">First name</label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Kwame"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="lastName">Last name</label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mensah"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="businessName">Business name</label>
              <input
                className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Trite Stores"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="legalEntity">Legal entity name</label>
              <input
                className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                id="legalEntity"
                name="legalEntity"
                value={formData.legalEntity}
                onChange={handleChange}
                placeholder="Trite Limited"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="email">Business email</label>
              <input
                className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@business.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="password">Password</label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[color:var(--trite-ink)] uppercase tracking-tight" htmlFor="confirmPassword">Confirm</label>
                <input
                  className="flex h-11 w-full rounded-xl border border-black/10 bg-[#f9fafb] px-3 py-2 text-sm transition-all focus:border-[color:var(--trite-lime-strong)] focus:bg-white outline-none"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              className="w-full flex h-12 items-center justify-center rounded-xl bg-[color:var(--trite-ink)] text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-50 mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Merchant Account"}
            </button>

            <div className="text-center text-xs text-[color:var(--trite-muted)] mt-6">
              Already have an account?{" "}
              <Link className="font-bold text-[color:var(--trite-ink)] hover:underline" href="/login">
                Sign in
              </Link>
            </div>
          </form>

          <p className="text-muted-foreground mt-8 text-xs text-center">
            By clicking continue, you agree to our{' '}
            <a href="#" className="hover:text-primary underline underline-offset-4">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="hover:text-primary underline underline-offset-4">Privacy Policy</a>.
          </p>
        </div>
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
