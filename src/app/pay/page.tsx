"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<"amount" | "method" | "details" | "processing" | "success" | "failed">("amount");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "usdc" | "usdt" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [momoNetwork, setMomoNetwork] = useState<"mtn" | "vodafone" | "airteltigo">("mtn");
  const [processingMessage, setProcessingMessage] = useState("");

  const formatGHS = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "GH₵0.00";
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(num);
  };

  const handleAmountSubmit = () => {
    if (parseFloat(amount) > 0) {
      setStep("method");
    }
  };

  const handleMethodSelect = (method: "card" | "momo" | "usdc" | "usdt") => {
    setPaymentMethod(method);
    setStep("details");
  };

  const handlePaymentSubmit = () => {
    setStep("processing");
    setProcessingMessage("Initializing payment...");
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessingMessage("Verifying transaction...");
    }, 1500);
    
    setTimeout(() => {
      setProcessingMessage("Finalizing payment...");
    }, 3000);
    
    setTimeout(() => {
      // 90% success rate for demo
      const success = Math.random() > 0.1;
      setStep(success ? "success" : "failed");
    }, 4500);
  };

  const resetCheckout = () => {
    setStep("amount");
    setAmount("");
    setPaymentMethod(null);
    setPhoneNumber("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tritee-logo.png"
              alt="Trite logo"
              width={120}
              height={28}
              priority
            />
          </Link>
          <div className="text-sm text-[color:var(--trite-muted)]">
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["Amount", "Method", "Pay"].map((label, idx) => {
              const stepNum = idx + 1;
              const currentStepNum = step === "amount" ? 1 : step === "method" ? 2 : step === "details" ? 3 : 3;
              const isActive = currentStepNum === stepNum;
              const isComplete = currentStepNum > stepNum;
              
              return (
                <div key={label} className="flex items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isComplete 
                      ? "bg-[color:var(--trite-lime-strong)] text-[color:var(--trite-ink)]"
                      : isActive 
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-black/10 text-[color:var(--trite-muted)]"
                  }`}>
                    {isComplete ? "✓" : stepNum}
                  </div>
                  <span className={`ml-2 text-sm ${isActive || isComplete ? "text-[color:var(--trite-ink)]" : "text-[color:var(--trite-muted)]"}`}>
                    {label}
                  </span>
                  {idx < 2 && (
                    <div className="mx-4 h-px w-12 bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Enter Amount */}
        {step === "amount" && (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h1 className="text-2xl font-semibold text-[color:var(--trite-ink)]">
              Enter Payment Amount
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Specify how much you want to pay
            </p>

            <div className="mt-6">
              <label className="text-sm font-medium text-[color:var(--trite-ink)]">
                Amount (GHS)
              </label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[color:var(--trite-muted)]">
                  GH₵
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-black/10 bg-white py-4 pl-12 pr-4 text-2xl font-semibold text-gray-900 placeholder:text-black/20 outline-none focus:border-[color:var(--trite-lime-strong)]"
                />
              </div>
              {amount && (
                <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
                  You will pay {formatGHS(amount)}
                </p>
              )}
            </div>

            <button
              onClick={handleAmountSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="mt-6 w-full rounded-xl bg-[color:var(--trite-ink)] py-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Payment Method */}
        {step === "method" && (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h1 className="text-2xl font-semibold text-[color:var(--trite-ink)]">
              Select Payment Method
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Choose how you want to pay {formatGHS(amount)}
            </p>

            <div className="mt-6 space-y-3">
              {/* Card Payment */}
              <button
                onClick={() => handleMethodSelect("card")}
                className="flex w-full items-center gap-4 rounded-xl border border-black/10 p-4 hover:border-[color:var(--trite-lime-strong)] hover:bg-[color:var(--trite-lime)]/10 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-semibold text-[color:var(--trite-ink)]">Card Payment</span>
                  <span className="text-sm text-[color:var(--trite-muted)]">Visa, Mastercard</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-[color:var(--trite-muted)]" />
              </button>

              {/* Mobile Money */}
              <button
                onClick={() => handleMethodSelect("momo")}
                className="flex w-full items-center gap-4 rounded-xl border border-black/10 p-4 hover:border-[color:var(--trite-lime-strong)] hover:bg-[color:var(--trite-lime)]/10 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
                  <SmartphoneIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-semibold text-[color:var(--trite-ink)]">Mobile Money</span>
                  <span className="text-sm text-[color:var(--trite-muted)]">MTN, Vodafone, AirtelTigo</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-[color:var(--trite-muted)]" />
              </button>

              {/* USDC */}
              <button
                onClick={() => handleMethodSelect("usdc")}
                className="flex w-full items-center gap-4 rounded-xl border border-black/10 p-4 hover:border-[color:var(--trite-lime-strong)] hover:bg-[color:var(--trite-lime)]/10 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <CoinIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-semibold text-[color:var(--trite-ink)]">USDC (Stablecoin)</span>
                  <span className="text-sm text-[color:var(--trite-muted)]">ERC-20, Fast settlement</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-[color:var(--trite-muted)]" />
              </button>

              {/* USDT */}
              <button
                onClick={() => handleMethodSelect("usdt")}
                className="flex w-full items-center gap-4 rounded-xl border border-black/10 p-4 hover:border-[color:var(--trite-lime-strong)] hover:bg-[color:var(--trite-lime)]/10 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                  <CoinIcon className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-semibold text-[color:var(--trite-ink)]">USDT (Tether)</span>
                  <span className="text-sm text-[color:var(--trite-muted)]">TRC-20, Low fees</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-[color:var(--trite-muted)]" />
              </button>
            </div>

            <button
              onClick={() => setStep("amount")}
              className="mt-6 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/5"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === "details" && paymentMethod && (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h1 className="text-2xl font-semibold text-[color:var(--trite-ink)]">
              Payment Details
            </h1>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Complete your payment of {formatGHS(amount)}
            </p>

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[color:var(--trite-ink)]">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1 w-full rounded-lg border border-black/10 px-4 py-3 text-gray-900 placeholder:text-black/30 outline-none focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[color:var(--trite-ink)]">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="mt-1 w-full rounded-lg border border-black/10 px-4 py-3 text-gray-900 placeholder:text-black/30 outline-none focus:border-[color:var(--trite-lime-strong)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[color:var(--trite-ink)]">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="mt-1 w-full rounded-lg border border-black/10 px-4 py-3 text-gray-900 placeholder:text-black/30 outline-none focus:border-[color:var(--trite-lime-strong)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Money Form */}
            {paymentMethod === "momo" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[color:var(--trite-ink)]">Network Provider</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(["mtn", "vodafone", "airteltigo"] as const).map((network) => (
                      <button
                        key={network}
                        onClick={() => setMomoNetwork(network)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize ${
                          momoNetwork === network
                            ? "border-[color:var(--trite-lime-strong)] bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)]"
                            : "border-black/10 text-[color:var(--trite-muted)] hover:bg-black/5"
                        }`}
                      >
                        {network === "airteltigo" ? "AirtelTigo" : network}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[color:var(--trite-ink)]">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                    className="mt-1 w-full rounded-lg border border-black/10 px-4 py-3 text-gray-900 placeholder:text-black/30 outline-none focus:border-[color:var(--trite-lime-strong)]"
                  />
                  <p className="mt-1 text-xs text-[color:var(--trite-muted)]">
                    You will receive a prompt on your phone to confirm payment
                  </p>
                </div>
              </div>
            )}

            {/* Stablecoin Forms */}
            {(paymentMethod === "usdc" || paymentMethod === "usdt") && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-[color:var(--trite-lime)]/20 p-4">
                  <div className="flex items-center gap-3">
                    <WalletIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
                    <span className="text-sm font-medium text-[color:var(--trite-ink)]">
                      Connect your wallet to proceed
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--trite-muted)]">
                    You will be redirected to wallet connection to complete this {paymentMethod.toUpperCase()} payment
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[color:var(--trite-ink)]">Wallet Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="mt-1 w-full rounded-lg border border-black/10 px-4 py-3 text-gray-900 placeholder:text-black/30 outline-none focus:border-[color:var(--trite-lime-strong)]"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handlePaymentSubmit}
              className="mt-6 w-full rounded-xl bg-[color:var(--trite-ink)] py-4 text-sm font-semibold text-white hover:bg-black"
            >
              Pay {formatGHS(amount)}
            </button>

            <button
              onClick={() => setStep("method")}
              className="mt-3 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/5"
            >
              Back
            </button>
          </div>
        )}

        {/* Processing State */}
        {step === "processing" && (
          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--trite-lime)]/30">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--trite-ink)] border-t-transparent" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Processing Payment
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              {processingMessage}
            </p>
            <p className="mt-4 text-xs text-[color:var(--trite-muted)]">
              Please do not close this window
            </p>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Your payment of {formatGHS(amount)} has been confirmed
            </p>
            <div className="mt-6 rounded-xl bg-black/[0.02] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Transaction ID</span>
                <span className="font-medium text-[color:var(--trite-ink)]">TRX-{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Status</span>
                <span className="font-medium text-green-600">Completed</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={resetCheckout}
                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/5"
              >
                Make Another Payment
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-[color:var(--trite-ink)] py-3 text-sm font-semibold text-white hover:bg-black text-center"
              >
                Done
              </Link>
            </div>
          </div>
        )}

        {/* Failed State */}
        {step === "failed" && (
          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Payment Failed
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              We could not process your payment at this time
            </p>
            <div className="mt-6 rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Possible reasons: Insufficient funds, network error, or declined by provider
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep("details")}
                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/5"
              >
                Try Again
              </button>
              <button
                onClick={resetCheckout}
                className="flex-1 rounded-xl bg-[color:var(--trite-ink)] py-3 text-sm font-semibold text-white hover:bg-black"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {step !== "processing" && step !== "success" && step !== "failed" && (
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Secure SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <LockIcon className="h-4 w-4" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckIcon className="h-4 w-4" />
              <span>Verified</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Icons
function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
