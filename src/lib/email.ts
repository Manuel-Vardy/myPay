import "server-only";
import { Client as MailjetClient, type SendEmailV3_1 } from "node-mailjet";
import { logDeliveryFailure } from "@/lib/delivery-log";

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;
const FROM_EMAIL = process.env.EMAIL_FROM || "no-reply@trite.tech";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "TRITE";
// Merchant portal (dashboard.trite.tech in prod) — used for signup verification
// and merchant password resets. Same env var proxy.ts already uses to redirect
// the marketing site's /login and /get-started to the dashboard domain.
const DASHBOARD_BASE_URL = process.env.DASHBOARD_BASE_URL || "http://localhost:3000";
// Admin portal lives on its own domain (ops.tritegroup.org in prod, separate
// cert/service from the merchant dashboard) — falls back to DASHBOARD_BASE_URL
// for local single-server dev where there's no service split.
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || DASHBOARD_BASE_URL;

const mailjet =
  MJ_APIKEY_PUBLIC && MJ_APIKEY_PRIVATE
    ? new MailjetClient({ apiKey: MJ_APIKEY_PUBLIC, apiSecret: MJ_APIKEY_PRIVATE })
    : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Attributes the failure to a user in the admin log feed. */
  actorId?: string | null;
  /**
   * Whether a delivery failure should raise an admin alert. Must be false for
   * the alert emails themselves, or a failing alert would alert about itself.
   */
  alertAdmins?: boolean;
}

/**
 * Send an email via Mailjet. If MJ_APIKEY_PUBLIC/PRIVATE aren't configured
 * (e.g. local dev without keys), logs the send instead of throwing so auth
 * flows that trigger email don't hard-fail.
 *
 * Failures are recorded in `system_logs` before being re-thrown, so a silent
 * delivery outage is visible to admins rather than only to whoever is reading
 * stdout. Callers keep their existing throw/catch behaviour.
 */
export async function sendEmail({ to, subject, html, text, actorId, alertAdmins = true }: SendEmailOptions): Promise<void> {
  if (!mailjet) {
    console.warn(`[email] MJ_APIKEY_PUBLIC/MJ_APIKEY_PRIVATE not set — skipping send to ${to}: "${subject}"`);
    // Unconfigured dev is expected; unconfigured production means nobody is
    // receiving mail at all, which admins need to see immediately.
    if (process.env.NODE_ENV === "production") {
      await logDeliveryFailure({
        channel: "EMAIL",
        provider: "mailjet",
        recipient: to,
        event: subject,
        error: new Error("MJ_APIKEY_PUBLIC/MJ_APIKEY_PRIVATE not configured — email was not sent"),
        actorId,
        critical: true,
        alertAdmins,
      });
    }
    return;
  }

  const body: SendEmailV3_1.Body = {
    Messages: [
      {
        From: { Email: FROM_EMAIL, Name: FROM_NAME },
        To: [{ Email: to }],
        Subject: subject,
        TextPart: text,
        HTMLPart: html,
      },
    ],
  };

  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request(body);

    // Mailjet reports per-message rejections inside a 200 response, so a
    // resolved promise alone doesn't mean the mail was accepted.
    const message = (result?.body as SendEmailV3_1.Response | undefined)?.Messages?.[0];
    if (message && message.Status !== "success") {
      const reason =
        message.Errors?.map((e) => e.ErrorMessage).filter(Boolean).join("; ") ||
        `Mailjet returned status "${message.Status}"`;
      throw new Error(reason);
    }
  } catch (error) {
    await logDeliveryFailure({
      channel: "EMAIL",
      provider: "mailjet",
      recipient: to,
      event: subject,
      error,
      actorId,
      alertAdmins,
    });
    throw error;
  }
}

export { DASHBOARD_BASE_URL, ADMIN_BASE_URL };
