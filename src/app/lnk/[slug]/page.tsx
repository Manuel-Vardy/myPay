import db from "@/lib/db";
import crypto from "crypto";
import { redirect } from "next/navigation";
import Image from "next/image";
import AmountEntryForm from "./AmountEntryForm";
import { isMerchantPaused } from "@/lib/payments/controls";

export default async function LinkResolverPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let linkRecord;
  let merchantRecord;
  let errorMsg = "";

  try {
    // 1. Fetch link details
    linkRecord = await db("payment_links")
      .where({ link_id_display: slug })
      .first();

    if (!linkRecord) {
      errorMsg = "This payment link does not exist or has been deleted.";
    } else if (!linkRecord.is_active) {
      errorMsg = "This payment link is currently inactive.";
    } else if (
      linkRecord.expires_at &&
      new Date(linkRecord.expires_at) < new Date()
    ) {
      errorMsg = "This payment link has expired.";
    }

    if (linkRecord && !errorMsg) {
      // 2. Fetch merchant info to confirm active profile
      merchantRecord = await db("merchants")
        .where({ id: linkRecord.merchant_id })
        .first();

      if (!merchantRecord) {
        errorMsg = "Merchant profile not found for this link.";
      } else if (isMerchantPaused(merchantRecord)) {
        errorMsg = "This merchant is not currently accepting payments.";
      }
    }
  } catch (err) {
    console.error("Link resolution database error:", err);
    errorMsg = "An error occurred while retrieving order details.";
  }

  // If there's an error, show a premium branded page
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white flex flex-col justify-between">
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Image src="/tritee-logo.png" alt="Trite logo" width={120} height={28} priority />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center justify-center rounded-full bg-[color:var(--trite-lime-strong)] p-0.5 h-5 w-5">
                <svg className="h-full w-full text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-sm text-[color:var(--trite-muted)]">Secure Checkout</div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5 text-center w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-[color:var(--trite-ink)]">
              Payment Link Unavailable
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)] leading-relaxed">
              {errorMsg}
            </p>
            <p className="mt-8 text-sm text-[color:var(--trite-muted)]">
              Please contact the merchant who sent you this link.
            </p>
          </div>
        </main>

        <footer className="py-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Encrypted</span>
          </div>
        </footer>
      </div>
    );
  }

  // 3a. Amount-less link: the customer decides the amount. Render the
  // amount entry form; the session is created by /api/payments/link-session
  // once they submit, then they're redirected to /pay/[sessionId].
  if (linkRecord.amount === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white flex flex-col justify-between">
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Image src="/tritee-logo.png" alt="Trite logo" width={120} height={28} priority />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center justify-center rounded-full bg-[color:var(--trite-lime-strong)] p-0.5 h-5 w-5">
                <svg className="h-full w-full text-[color:var(--trite-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-sm text-[color:var(--trite-muted)]">Secure Checkout</div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-xl w-full px-4 py-12 sm:px-6">
          <AmountEntryForm
            slug={linkRecord.link_id_display}
            merchantName={merchantRecord.business_name}
            title={linkRecord.title}
            description={linkRecord.description}
            currency={linkRecord.currency}
          />
        </main>

        <footer className="py-8 flex items-center justify-center gap-6 text-xs text-[color:var(--trite-muted)]">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Encrypted</span>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Otherwise, create a payment_session and redirect to it!
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const sessionDescription = linkRecord.description
    ? `${linkRecord.title} - ${linkRecord.description}`
    : linkRecord.title;

  try {
    await db("payment_sessions").insert({
      id: sessionId,
      merchant_id: linkRecord.merchant_id,
      payment_link_id: linkRecord.id,
      amount: linkRecord.amount,
      currency: linkRecord.currency,
      description: sessionDescription,
      redirect_url: linkRecord.redirect_url,
      status: "ACTIVE",
      expires_at: expiresAt,
    });

    await db("system_logs").insert({
      level: "INFO",
      source: "GATEWAY_API",
      event_description: `Payment session ${sessionId} initialized via payment link ${linkRecord.link_id_display} by visitor`,
      actor_id: merchantRecord.user_id,
    });
  } catch (err) {
    console.error("Failed to create checkout session:", err);
    // Return error view
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f6f7fb] to-white flex flex-col justify-between">
        <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Image src="/tritee-logo.png" alt="Trite logo" width={120} height={28} priority />
            </div>
          </div>
        </header>
        <main className="mx-auto flex flex-col items-center justify-center flex-1 max-w-xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-black/5 text-center w-full">
            <h2 className="text-xl font-semibold text-[color:var(--trite-ink)]">
              Initialization Failed
            </h2>
            <p className="mt-2 text-sm text-[color:var(--trite-muted)] leading-relaxed">
              We were unable to create a checkout session. Please try again.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // 4. Redirect to the checkout page
  redirect(`/pay/${sessionId}`);
}
