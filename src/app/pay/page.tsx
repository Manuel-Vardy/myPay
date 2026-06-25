"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function PayBasePage() {
  const [demoSessionId, setDemoSessionId] = useState("");

  const generateDemoSession = () => {
    const sessionId = `demo-${Date.now()}`;
    setDemoSessionId(sessionId);
  };

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
            <Link 
              href="/" 
              className="text-sm text-[#22c55e] hover:text-[#16a34a] font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-2xl px-4 py-12 sm:px-6 relative z-10">
        <div className="rounded-2xl bg-white p-8 sm:p-12 ring-1 ring-black/5 text-center w-full">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10 mb-6">
            <svg className="h-8 w-8 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Trite Payment System
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Our payment system works with secure session IDs. To make a payment, you need a valid session ID from a merchant.
          </p>

          <div className="space-y-6">
            {/* Demo Section */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Try Demo Payment
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate a demo session to test our payment interface
              </p>
              <div className="space-y-3">
                <button
                  onClick={generateDemoSession}
                  className="w-full bg-[#22c55e] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#16a34a] transition-colors"
                >
                  Generate Demo Session
                </button>
                
                {demoSessionId && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-xs text-gray-500 mb-1">Demo Session ID:</p>
                    <p className="font-mono text-sm text-gray-900 mb-3 break-all">
                      {demoSessionId}
                    </p>
                    <Link
                      href={`/pay/${demoSessionId}`}
                      className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Open Demo Payment →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Developer Info */}
            <div className="border border-gray-200 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                For Developers
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>URL Format:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">/pay/[sessionId]</code>
                </p>
                <p>
                  <strong>Example:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">/pay/sess_abc123xyz</code>
                </p>
                <p>
                  Sessions are created through the API and should contain merchant information, amount, and payment details.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Need help? <Link href="/contact" className="text-[#22c55e] hover:underline">Contact our support team</Link>
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