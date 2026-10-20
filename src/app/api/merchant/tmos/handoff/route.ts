// GET /api/merchant/tmos/handoff — mint a short-lived handoff token and return
// the URL that signs the merchant owner into TMOS (the opt-in shop management
// system).
//
// Access control is entirely `requireActiveMerchant()`: it already enforces
// mobile → email → KYC APPROVED in that order and returns MOBILE_NOT_VERIFIED /
// EMAIL_NOT_VERIFIED / KYC_NOT_APPROVED, which is exactly the rule for TMOS
// access. The merchant portal surfaces those codes so the link is never a dead
// end.
//
// Trite deliberately does not record that a merchant uses TMOS — there is no
// opt-in flag to keep in sync. Any active merchant may hit this endpoint; TMOS
// onboards them on first arrival.
import db from "@/lib/db";
import { requireActiveMerchant, checkAuthRateLimit } from "@/lib/guards";
import {
  buildHandoffUrl,
  isTmosConfigured,
  mintHandoffToken,
  TMOS_HANDOFF_TTL_SECONDS,
} from "@/lib/tmos/handoff";

export async function GET() {
  const guard = await requireActiveMerchant();
  if (guard.error) return guard.error;

  const { session, merchant, kycStatus } = guard;

  if (!isTmosConfigured()) {
    return Response.json(
      { error: "TMOS management is not available", code: "TMOS_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  // A valid token is a bearer credential for a TMOS session. Cap minting so a
  // stolen dashboard cookie can't be farmed for a supply of them.
  const limited = await checkAuthRateLimit(
    `user:${session.userId}`,
    "tmos_handoff",
    { limit: 10, windowSeconds: 60 }
  );
  if (limited.error) return limited.error;

  try {
    const user = await db("users")
      .where({ id: session.userId })
      .first("email");

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const token = await mintHandoffToken({
      sub: session.userId,
      merchant_id: merchant.id,
      merchant_display_id: merchant.merchant_display_id,
      business_name: merchant.business_name,
      email: user.email,
      kyc_status: kycStatus,
    });

    return Response.json({
      url: buildHandoffUrl(token),
      expires_in: TMOS_HANDOFF_TTL_SECONDS,
    });
  } catch (error) {
    console.error("TMOS handoff mint error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
