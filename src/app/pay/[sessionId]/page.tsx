"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface SessionDetails {
  session_id: string;
  merchant_name: string;
  amount: number;
  currency: string;
  description: string;
  stablecoin_equivalent: number;
  processing_fee: number;
  network_gas: string;
  redirect_url: string | null;
}

export default function DynamicCheckoutPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // Session state
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);

  // Checkout flow state
  const [step, setStep] = useState<"method" | "details" | "processing" | "success" | "failed">("method");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "usdc" | "usdt" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [momoNetwork, setMomoNetwork] = useState<"MTN" | "TELECEL" | "AT">("MTN");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [processingMessage, setProcessingMessage] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState<string | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);


  const formatCurrency = useCallback((value: number, currency: string) => {
    if (isNaN(value)) return `${currency} 0.00`;
    try {
      return new Intl.NumberFormat(currency === "GHS" ? "en-GH" : "en-US", {
        style: "currency",
        currency: currency,
      }).format(value);
    } catch {
      return `${currency} ${Number(value).toFixed(2)}`;
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback((txId: string) => {
    stopPolling();
    let attempts = 0;
    const maxAttempts = 60; // ~5 minutes at 5s intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        stopPolling();
        setErrorMessage("Payment confirmation timed out. Please check your transaction history.");
        setStep("failed");
        return;
      }

      try {
        const res = await fetch(`/api/payments/${txId}/status`);
        const data = await res.json();

        if (data.status === "SUCCESS") {
          stopPolling();
          setStep("success");
        } else if (data.status === "FAILED") {
          stopPolling();
          setErrorMessage(data.error_details?.message || "Payment failed");
          setStep("failed");
        }
      } catch {
        // Network issue — keep polling
      }
    }, 5000);
  }, [stopPolling]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Fetch session details on load
  useEffect(() => {
    if (!sessionId) return;

    async function fetchSession() {
      try {
        const res = await fetch(`/api/payments/${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          setSessionError(data.error || "Failed to load payment session");
          setLoading(false);
          return;
        }

        setSessionDetails(data);
        setLoading(false);
      } catch (err) {
        setSessionError("Something went wrong while loading the payment session.");
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const handleMethodSelect = (method: "card" | "momo" | "usdc" | "usdt") => {
    setPaymentMethod(method);
    setStep("details");
    setOtpRequired(false);
    setOtpCode("");
    setOtpMessage("");
    setCryptoAddress(null);
    setCryptoAmount(null);
  };

  const handleGetCryptoAddress = async () => {
    if (!sessionDetails) return;
    setLoadingAddress(true);
    
    try {
      const res = await fetch(`/api/payments/${sessionDetails.session_id}/crypto-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: paymentMethod === "usdt" ? "USDT" : "USDC",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to get address");
        setLoadingAddress(false);
        return;
      }

      setCryptoAddress(data.address);
      setCryptoAmount(data.amount);
      setLoadingAddress(false);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setLoadingAddress(false);
    }
  };

  const handleCryptoPaymentConfirm = () => {
    // User confirms they have paid, proceed with payment submission
    handlePaymentSubmit();
  };

  useEffect(() => {
    setOtpRequired(false);
    setOtpCode("");
    setOtpMessage("");
  }, [phoneNumber, momoNetwork]);

  const handlePaymentSubmit = async () => {
    if (!sessionDetails) return;
    setStep("processing");
    setProcessingMessage("Initializing payment...");
    setErrorMessage("");

    try {
      const payload: Record<string, unknown> = {
        session_id: sessionDetails.session_id,
        method: paymentMethod === "momo" ? "MOBILE_MONEY" : paymentMethod === "card" ? "CARD" : "CRYPTO",
      };

      if (paymentMethod === "momo") {
        payload.mobile_money_number = phoneNumber;
        payload.mobile_money_network = momoNetwork;
        if (otpRequired && otpCode) {
          payload.otp_code = otpCode;
        }
      }

      const res = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 202) {
        setErrorMessage(data.error || data.message || "Payment failed");
        setStep("failed");
        return;
      }

      if (data.status === "OTP_REQUIRED") {
        setOtpRequired(true);
        setOtpMessage(data.message || "Please enter the OTP sent to your phone");
        setStep("details");
        return;
      }

      if (data.status === "FAILED") {
        setErrorMessage(data.message || "Payment initiation failed");
        setStep("failed");
        return;
      }

      // Payment is PROCESSING — start polling
      setTransactionId(data.transaction_id);
      setProcessingMessage(data.message || "Payment prompt sent to your phone. Please approve it.");
      pollStatus(data.transaction_id);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStep("failed");
    }
  };

  // UI state logic for Loading
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white flex flex-col justify-between overflow-hidden">
        {/* Green gradient glows */}
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Image src="/tritee-logo.png" alt="Trite logo" width={90} height={21} priority />
            </div>
            <div className="flex items-center gap-3">
              <VerifiedBadge className="h-5 w-5" />
              <div className="text-sm text-[color:var(--trite-muted)]">Secure Checkout</div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-xl px-4 py-12 sm:px-6 relative z-10">
          <div className="rounded-2xl bg-white p-12 ring-1 ring-black/5 text-center w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--trite-lime)]/30">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--trite-ink)] border-t-transparent" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Verifying Payment Session
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              Securing connections and loading order details...
            </p>
          </div>
        </main>

        <footer className="py-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
          <div className="flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4" /><span>Secure SSL</span></div>
          <div className="flex items-center gap-1"><LockIcon className="h-4 w-4" /><span>Encrypted</span></div>
          <div className="flex items-center gap-1"><CheckIcon className="h-4 w-4" /><span>Verified</span></div>
        </footer>
      </div>
    );
  }

  // UI state logic for Session Errors (e.g. Expired, Completed, Not Found)
  if (sessionError || !sessionDetails) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white flex flex-col justify-between overflow-hidden">
        {/* Green gradient glows */}
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Image src="/tritee-logo.png" alt="Trite logo" width={90} height={21} priority />
            </div>
            <div className="flex items-center gap-3">
              <VerifiedBadge className="h-5 w-5" />
              <div className="text-sm text-[color:var(--trite-muted)]">Secure Checkout</div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-xl px-4 py-12 sm:px-6 relative z-10">
          <div className="rounded-2xl bg-white p-12 ring-1 ring-black/5 text-center w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Invalid Payment Session
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              {sessionError || "The requested payment session is no longer active."}
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-block rounded-xl bg-[color:var(--trite-ink)] px-8 py-3 text-sm font-semibold text-white hover:bg-black text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>

        <footer className="py-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
          <div className="flex items-center gap-1"><ShieldCheckIcon className="h-4 w-4" /><span>Secure SSL</span></div>
          <div className="flex items-center gap-1"><LockIcon className="h-4 w-4" /><span>Encrypted</span></div>
          <div className="flex items-center gap-1"><CheckIcon className="h-4 w-4" /><span>Verified</span></div>
        </footer>
      </div>
    );
  }

  // Active session render
  const formattedAmount = formatCurrency(sessionDetails.amount, sessionDetails.currency);
  const stablecoinEquivalentFormatted = formatCurrency(sessionDetails.stablecoin_equivalent, "USDT");

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
            <VerifiedBadge className="h-5 w-5" />
            <div className="text-sm text-[color:var(--trite-muted)]">
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-3 py-6 sm:px-6 sm:py-12 flex-1 w-full relative z-10">
        {/* Merchant / Payment Summary Header */}
        {step !== "processing" && step !== "success" && step !== "failed" && (
          <div className="mb-4 sm:mb-6 relative rounded-2xl bg-[#22c55e] p-5 sm:p-7 overflow-hidden">
            {/* Subtle abstract lines in background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                <path d="M300 -50 Q350 100 200 150 Q50 200 100 300" stroke="white" strokeWidth="40" strokeLinecap="round"/>
                <path d="M350 0 Q300 120 150 100 Q0 80 50 250" stroke="white" strokeWidth="30" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/70">
                Pay to Merchant
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <span className="text-base sm:text-lg font-bold text-white truncate max-w-[60%]">
                  {sessionDetails.merchant_name}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {formattedAmount}
                </span>
              </div>
              {sessionDetails.description && (
                <p className="mt-2 text-xs sm:text-sm text-white/70 border-t border-white/20 pt-2">
                  {sessionDetails.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {["Payment Method", "Details & Pay"].map((label, idx) => {
              const stepNum = idx + 1;
              const currentStepNum = step === "method" ? 1 : 2;
              const isActive = currentStepNum === stepNum;
              const isComplete = currentStepNum > stepNum;

              return (
                <div key={label} className="flex items-center">
                  <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-semibold ${
                    isComplete 
                      ? "bg-[#22c55e] text-white"
                      : isActive 
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-black/10 text-[color:var(--trite-muted)]"
                  }`}>
                    {isComplete ? "✓" : stepNum}
                  </div>
                  <span className={`ml-1.5 sm:ml-2 text-xs sm:text-sm ${isActive || isComplete ? "text-[color:var(--trite-ink)]" : "text-[color:var(--trite-muted)]"}`}>
                    {label}
                  </span>
                  {idx < 1 && (
                    <div className="mx-3 sm:mx-6 h-px w-10 sm:w-16 bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Select Payment Method */}
        {step === "method" && (
          <div className="pt-2 pb-4 sm:pb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-[color:var(--trite-ink)]">
              Select Payment Method
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-center text-[color:var(--trite-muted)]">
              Choose how you want to settle this payment
            </p>

            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              {/* Mobile Money */}
              <button
                onClick={() => handleMethodSelect("momo")}
                className="flex w-full items-center gap-3 sm:gap-4 rounded-xl bg-gray-100 p-3 sm:p-4 hover:bg-gray-200 transition-all text-left"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full overflow-hidden bg-white shrink-0">
                  <Image src="/images/MOMO-3D.jpg" alt="Mobile Money" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm sm:text-base text-[color:var(--trite-ink)]">Mobile Money</span>
                  <span className="text-xs sm:text-sm text-[color:var(--trite-muted)]">MTN, Telecel, AT</span>
                </div>
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[color:var(--trite-muted)] shrink-0" />
              </button>

              {/* Card Payment */}
              <button
                onClick={() => handleMethodSelect("card")}
                className="flex w-full items-center gap-3 sm:gap-4 rounded-xl bg-gray-100 p-3 sm:p-4 hover:bg-gray-200 transition-all text-left"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full overflow-hidden bg-white shrink-0">
                  <Image src="/images/Credit-Card.jpg" alt="Card Payment" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm sm:text-base text-[color:var(--trite-ink)]">Card Payment</span>
                  <span className="text-xs sm:text-sm text-[color:var(--trite-muted)]">Visa, Mastercard</span>
                </div>
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[color:var(--trite-muted)] shrink-0" />
              </button>

              {/* USDC */}
              <button
                onClick={() => handleMethodSelect("usdc")}
                className="flex w-full items-center gap-3 sm:gap-4 rounded-xl bg-gray-100 p-3 sm:p-4 hover:bg-gray-200 transition-all text-left"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full overflow-hidden bg-white shrink-0">
                  <Image src="/images/USDC.jpg" alt="USDC" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm sm:text-base text-[color:var(--trite-ink)]">USDC (Stablecoin)</span>
                  <span className="text-xs sm:text-sm text-[color:var(--trite-muted)]">ERC-20, Fast settlement</span>
                </div>
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[color:var(--trite-muted)] shrink-0" />
              </button>

              {/* USDT */}
              <button
                onClick={() => handleMethodSelect("usdt")}
                className="flex w-full items-center gap-3 sm:gap-4 rounded-xl bg-gray-100 p-3 sm:p-4 hover:bg-gray-200 transition-all text-left"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full overflow-hidden bg-white shrink-0">
                  <Image src="/images/USDT.jpg" alt="USDT" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm sm:text-base text-[color:var(--trite-ink)]">USDT (Tether)</span>
                  <span className="text-xs sm:text-sm text-[color:var(--trite-muted)]">TRC-20, Low fees</span>
                </div>
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[color:var(--trite-muted)] shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Details & Finalization */}
        {step === "details" && paymentMethod && (
          <div className="p-4 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-[color:var(--trite-ink)]">
              Payment Details
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[color:var(--trite-muted)]">
              Provide authorization details to complete your payment
            </p>

            {/* Mobile Money Form */}
            {paymentMethod === "momo" && (
              <div className="mt-6 space-y-4">
                {otpRequired && (
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                    <p className="text-sm text-amber-800 font-semibold leading-relaxed">
                      {otpMessage || "An OTP code has been sent to your phone. Please verify it to proceed."}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-[color:var(--trite-ink)]">Select Network Provider</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(["MTN", "TELECEL", "AT"] as const).map((network) => (
                      <div key={network} className="flex flex-col items-center gap-2">
                        <div className="h-8 w-full flex items-center justify-center">
                          <Image 
                            src={
                              network === "MTN" 
                                ? "/images/mtn-logo.png" 
                                : network === "TELECEL" 
                                ? "/images/Telecel-logo.png" 
                                : "/images/AirtelTigo-logo.png"
                            } 
                            alt={network} 
                            width={60} 
                            height={32} 
                            className="object-contain max-h-8"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setMomoNetwork(network)}
                          disabled={otpRequired}
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${
                            network === "MTN"
                              ? "border-[#FFCC00] bg-[#FFCC00] text-black hover:bg-[#E6B800] hover:border-[#E6B800]"
                              : network === "TELECEL"
                              ? "border-[#E31E24] bg-[#E31E24] text-white hover:bg-[#B71820] hover:border-[#B71820]"
                              : "border-[#003A70] bg-[#003A70] text-[#E31E24] hover:bg-[#002A50] hover:border-[#002A50]"
                          } ${
                            momoNetwork === network ? "ring-2 ring-black ring-offset-2" : ""
                          } disabled:opacity-50`}
                        >
                          {network}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[color:var(--trite-ink)]">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={otpRequired}
                    placeholder="+233 XX XXX XXXX"
                    className="mt-2 w-full rounded-xl border border-black/20 px-3 py-3 sm:px-4 sm:py-3.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#22c55e] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {!otpRequired && (
                    <p className="mt-1.5 text-xs text-[color:var(--trite-muted)]">
                      You will receive a USSD push prompt on your phone to confirm payment
                    </p>
                  )}
                </div>
                {otpRequired && (
                  <div>
                    <label className="text-sm font-semibold text-[color:var(--trite-ink)]">One-Time Password (OTP)</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter the OTP code"
                      className="mt-2 w-full rounded-xl border border-black/20 px-4 py-3.5 text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#22c55e] transition-all"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[color:var(--trite-ink)]">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-2 w-full rounded-xl border border-black/20 px-4 py-3.5 text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#22c55e] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[color:var(--trite-ink)]">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded-xl border border-black/20 px-4 py-3.5 text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#22c55e] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[color:var(--trite-ink)]">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="mt-2 w-full rounded-xl border border-black/20 px-4 py-3.5 text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#22c55e] transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stablecoin Forms */}
            {(paymentMethod === "usdc" || paymentMethod === "usdt") && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-[#22c55e]/10 p-4 border border-[#22c55e]/20">
                  <div className="flex items-center gap-3">
                    <WalletIcon className="h-5 w-5 text-[#22c55e]" />
                    <span className="text-sm font-semibold text-[color:var(--trite-ink)]">
                      Send token to designated address
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--trite-muted)] leading-relaxed">
                    You will pay {paymentMethod === "usdt" ? "USDT" : "USDC"} {sessionDetails.stablecoin_equivalent.toFixed(2)} equivalent. Request for a destination address below.
                  </p>
                </div>

                {!cryptoAddress ? (
                  <button
                    onClick={handleGetCryptoAddress}
                    disabled={loadingAddress}
                    className="w-full rounded-xl bg-[#22c55e] py-3.5 text-sm font-semibold text-white hover:bg-[#1ea74f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAddress ? "Getting Address..." : "Get Address"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white border border-black/10 p-4 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider">
                          Destination Address
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 break-all">
                          <p className="text-sm font-mono text-[color:var(--trite-ink)]">{cryptoAddress}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--trite-muted)] uppercase tracking-wider">
                          Amount to Send
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-lg font-bold text-[#22c55e]">
                            {cryptoAmount} {paymentMethod === "usdt" ? "USDT" : "USDC"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Details Box */}
            <div className="mt-6 border-t border-black/5 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Fees & Surcharges</span>
                <span className="font-semibold text-[color:var(--trite-ink)]">
                  {formatCurrency(sessionDetails.processing_fee, sessionDetails.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Network Gas fee</span>
                <span className="font-semibold text-[#22c55e]">{sessionDetails.network_gas}</span>
              </div>
              {paymentMethod !== "momo" && paymentMethod !== "card" && (
                <div className="flex justify-between text-sm border-t border-dashed border-black/5 pt-2">
                  <span className="text-[color:var(--trite-muted)]">Stablecoin equivalent</span>
                  <span className="font-bold text-[color:var(--trite-ink)]">{stablecoinEquivalentFormatted}</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <button
              onClick={(paymentMethod === "usdc" || paymentMethod === "usdt") && cryptoAddress ? handleCryptoPaymentConfirm : handlePaymentSubmit}
              disabled={(paymentMethod === "usdc" || paymentMethod === "usdt") && !cryptoAddress}
              className="mt-6 w-full rounded-xl bg-[#22c55e] py-4 text-sm font-bold text-white hover:bg-[#1ea74f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I Have Paid
            </button>

            <button
              onClick={() => setStep("method")}
              className="mt-3 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/5 transition-all"
            >
              Back to Methods
            </button>
          </div>
        )}

        {/* Processing State */}
        {step === "processing" && (
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[color:var(--trite-lime)]/30 animate-pulse">
              <div className="h-7 w-7 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-[color:var(--trite-ink)] border-t-transparent" />
            </div>
            <h2 className="mt-5 sm:mt-6 text-lg sm:text-xl font-semibold text-[color:var(--trite-ink)]">
              Processing Payment
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[color:var(--trite-muted)] leading-relaxed">
              {processingMessage}
            </p>
            <p className="mt-3 sm:mt-4 text-xs text-[color:var(--trite-muted)] italic">
              Please keep this window open while we secure the network approval.
            </p>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h2 className="mt-5 sm:mt-6 text-lg sm:text-xl font-semibold text-[color:var(--trite-ink)]">
              Payment Successful!
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[color:var(--trite-muted)]">
              Your payment of {formattedAmount} has been successfully settled.
            </p>
            <div className="mt-6 rounded-xl bg-black/[0.02] p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Transaction Reference</span>
                <span className="font-semibold text-[color:var(--trite-ink)] truncate max-w-[180px]">
                  {transactionId || `TRX-${Date.now().toString().slice(-8)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Recipient</span>
                <span className="font-semibold text-[color:var(--trite-ink)]">
                  {sessionDetails.merchant_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--trite-muted)]">Status</span>
                <span className="font-bold text-green-600">Completed</span>
              </div>
            </div>
            <div className="mt-8">
              {sessionDetails.redirect_url ? (
                <a
                  href={sessionDetails.redirect_url}
                  className="block w-full rounded-xl bg-[#22c55e] py-3.5 text-sm font-semibold text-white hover:bg-[#1ea74f] text-center transition-colors"
                >
                  Return to Merchant
                </a>
              ) : (
                <Link
                  href="/"
                  className="block w-full rounded-xl bg-[color:var(--trite-ink)] py-3.5 text-sm font-semibold text-white hover:bg-black text-center transition-colors"
                >
                  Done
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Failed State */}
        {step === "failed" && (
          <div className="rounded-2xl bg-white p-12 ring-1 ring-black/5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Payment Failed
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)]">
              We could not complete your transaction at this moment.
            </p>
            <div className="mt-6 rounded-xl bg-red-50 p-4 border border-red-100">
              <p className="text-sm text-red-700 font-medium">
                {errorMessage || "Insufficient balance, incorrect details, or transient payment network errors."}
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep("details")}
                className="flex-1 rounded-xl border border-black/10 py-3.5 text-sm font-semibold text-[color:var(--trite-muted)] hover:bg-black/5 transition-all animate-fade-in"
              >
                Try Again
              </button>
              <button
                onClick={() => setStep("method")}
                className="flex-1 rounded-xl bg-[color:var(--trite-ink)] py-3.5 text-sm font-semibold text-white hover:bg-black transition-all"
              >
                Back to Methods
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {step !== "processing" && step !== "success" && step !== "failed" && (
        <footer className="py-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
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
        </footer>
      )}
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

// Unfinished icons
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

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-[color:var(--trite-lime-strong)] p-0.5 ${className}`}>
      <svg className="h-full w-full text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
