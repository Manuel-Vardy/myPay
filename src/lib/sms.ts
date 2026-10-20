import "server-only";
import { logDeliveryFailure } from "@/lib/delivery-log";

// Arkesel OTP API — the provider generates, sends, expires, and verifies the
// code, so we never store it ourselves (same division of labour SendGrid has
// for email). Docs: https://developers.arkesel.com
const ARKESEL_BASE_URL = process.env.ARKESEL_BASE_URL || "https://sms.arkesel.com";
const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY;
// Sender ID shown as the SMS "from". Max 11 chars, and must be registered and
// approved in the Arkesel dashboard — an unapproved ID fails with code 1003.
const ARKESEL_SENDER_ID = process.env.ARKESEL_SENDER_ID || "Trite";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
// Arkesel requires the literal %otp_code% slot in the template (else code 1002).
const OTP_MESSAGE = `Your TRITE verification code is %otp_code%. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

const REQUEST_TIMEOUT_MS = 15_000;

// Provider status codes (returned in the JSON body, not the HTTP status).
const GENERATE_OK = "1000";
const VERIFY_OK = "1100";
const VERIFY_INVALID_CODE = "1104";
const VERIFY_EXPIRED_CODE = "1105";

// Local dev without Arkesel config accepts this code, matching the MFA dev bypass.
// NEVER honored in production — a misconfigured prod deploy must fail closed
// (block verification) rather than accept a hardcoded code for any number.
const DEV_BYPASS_CODE = "000000";
const allowDevBypass = process.env.NODE_ENV !== "production";

const isConfigured = Boolean(ARKESEL_API_KEY);

/**
 * Basic E.164 shape check (`+` then 8–15 digits). Arkesel does authoritative
 * validation on send; this just rejects obviously malformed input early.
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/**
 * Send an arbitrary SMS message (not an OTP). Uses the Arkesel standard
 * messaging endpoint rather than the OTP-specific one.
 *
 * Fire-and-forget safe: never throws. Delivery failures are logged via
 * `logDeliveryFailure` so they surface in the admin log feed.
 */
export async function sendSms(
  phone: string,
  message: string,
  actorId?: string | null
): Promise<void> {
  if (!isConfigured) {
    if (!allowDevBypass) {
      await logDeliveryFailure({
        channel: "SMS",
        provider: "arkesel",
        recipient: phone,
        event: "SMS delivery",
        error: new Error("Arkesel is not configured (missing ARKESEL_API_KEY)."),
        actorId,
        critical: true,
      });
    } else {
      console.warn(`[sms] Arkesel not configured — skipping SMS to ${phone}: "${message}"`);
    }
    return;
  }

  try {
    const res = await fetch(`${ARKESEL_BASE_URL}/api/v2/sms/send`, {
      method: "POST",
      headers: {
        "api-key": ARKESEL_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: ARKESEL_SENDER_ID,
        message,
        recipients: [toArkeselNumber(phone)],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Arkesel SMS send returned HTTP ${res.status}: ${text}`);
    }
  } catch (error) {
    await logDeliveryFailure({
      channel: "SMS",
      provider: "arkesel",
      recipient: phone,
      event: "SMS delivery",
      error,
      actorId,
    });
  }
}

/**
 * Arkesel wants the international number as bare digits (e.g. 233201234567),
 * while we persist E.164 (+233201234567). Convert at the boundary only.
 */
function toArkeselNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

interface ArkeselResponse {
  code?: string;
  message?: string;
}

async function postToArkesel(
  path: string,
  body: Record<string, unknown>
): Promise<ArkeselResponse> {
  const res = await fetch(`${ARKESEL_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "api-key": ARKESEL_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // Arkesel signals outcomes via the body's `code`, but 401/422/500 can arrive
  // with a non-JSON body — don't let a parse error mask the real status.
  const parsed = (await res.json().catch(() => null)) as ArkeselResponse | null;
  if (!parsed) {
    throw new Error(`Arkesel ${path} returned HTTP ${res.status} with an unreadable body`);
  }
  return parsed;
}

/**
 * Generate and send a one-time code over SMS. Throws if the provider rejects
 * the request (bad sender ID, insufficient balance, invalid number, …) so the
 * caller can surface a failure instead of silently expecting an SMS.
 */
export async function sendPhoneVerification(
  phone: string,
  actorId?: string | null
): Promise<void> {
  if (!isConfigured) {
    if (!allowDevBypass) {
      const error = new Error("Arkesel is not configured (missing ARKESEL_API_KEY).");
      // No merchant can verify a number in this state — surface it loudly.
      await logDeliveryFailure({
        channel: "SMS",
        provider: "arkesel",
        recipient: phone,
        event: "OTP delivery",
        error,
        actorId,
        critical: true,
      });
      throw error;
    }
    console.warn(
      `[sms] Arkesel not configured — skipping SMS to ${phone}. Use code ${DEV_BYPASS_CODE} to verify in dev.`
    );
    return;
  }

  try {
    const result = await postToArkesel("/api/otp/generate", {
      expiry: OTP_EXPIRY_MINUTES,
      length: OTP_LENGTH,
      medium: "sms",
      message: OTP_MESSAGE,
      number: toArkeselNumber(phone),
      sender_id: ARKESEL_SENDER_ID,
      type: "numeric",
    });

    if (result.code !== GENERATE_OK) {
      throw new Error(
        `Arkesel OTP generate failed (code ${result.code}): ${result.message ?? "unknown error"}`
      );
    }
  } catch (error) {
    // Covers provider rejections (unapproved sender ID, no balance, bad
    // number) and transport failures alike — both mean no SMS arrived.
    await logDeliveryFailure({
      channel: "SMS",
      provider: "arkesel",
      recipient: phone,
      event: "OTP delivery",
      error,
      actorId,
    });
    throw error;
  }
}

/**
 * Check a code the user entered. Returns true only when Arkesel confirms it.
 * In unconfigured dev, accepts `DEV_BYPASS_CODE` only.
 */
export async function checkPhoneVerification(
  phone: string,
  code: string,
  actorId?: string | null
): Promise<boolean> {
  if (!/^\d{4,10}$/.test(code)) return false;

  if (!isConfigured) {
    // Fail closed in production — never accept the hardcoded code there.
    if (!allowDevBypass) {
      await logDeliveryFailure({
        channel: "SMS",
        provider: "arkesel",
        recipient: phone,
        event: "OTP verification check",
        error: new Error(
          "Arkesel is not configured (missing ARKESEL_API_KEY) — rejecting verification"
        ),
        actorId,
        critical: true,
      });
      return false;
    }
    return code === DEV_BYPASS_CODE;
  }

  try {
    const result = await postToArkesel("/api/otp/verify", {
      code,
      number: toArkeselNumber(phone),
    });

    if (result.code === VERIFY_OK) return true;

    // Wrong/expired codes are ordinary user error, not an incident — reject
    // without logging. Anything else means the check itself broke, which the
    // merchant sees as "invalid code", so admins need the real reason.
    if (result.code !== VERIFY_INVALID_CODE && result.code !== VERIFY_EXPIRED_CODE) {
      await logDeliveryFailure({
        channel: "SMS",
        provider: "arkesel",
        recipient: phone,
        event: "OTP verification check",
        error: new Error(
          `Arkesel returned code ${result.code}: ${result.message ?? "unknown error"}`
        ),
        actorId,
      });
    }
    return false;
  } catch (error) {
    await logDeliveryFailure({
      channel: "SMS",
      provider: "arkesel",
      recipient: phone,
      event: "OTP verification check",
      error,
      actorId,
    });
    return false;
  }
}

export { isConfigured as isSmsConfigured };
