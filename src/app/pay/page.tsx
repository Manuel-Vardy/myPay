import Image from "next/image";

export default function PayBasePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white flex flex-col justify-between overflow-hidden">
      {/* Green gradient glows */}
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/tritee-logo.png" alt="Trite logo" width={90} height={21} priority />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[color:var(--trite-muted,#6b7280)]">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-xl px-4 py-12 sm:px-6 relative z-10">
        <div className="rounded-2xl bg-white p-8 sm:p-12 ring-1 ring-black/5 text-center w-full">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10 mb-6">
            <svg className="h-8 w-8 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            No Active Payment Session
          </h1>

          <p className="text-gray-600 leading-relaxed">
            Payments on Trite are made through secure links provided by a merchant.
            If you are trying to pay for something, please use the payment link the
            merchant shared with you.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Need help? <a href="mailto:support@trite.tech" className="text-[#22c55e] hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secure SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Verified</span>
        </div>
      </footer>
    </div>
  );
}
