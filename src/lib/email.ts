import "server-only";
import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "no-reply@trite.tech";
// Merchant portal (dashboard.trite.tech in prod) — used for signup verification
// and merchant password resets. Same env var proxy.ts already uses to redirect
// the marketing site's /login and /get-started to the dashboard domain.
const DASHBOARD_BASE_URL = process.env.DASHBOARD_BASE_URL || "http://localhost:3000";
// Admin portal lives on its own domain (ops.tritegroup.org in prod, separate
// cert/service from the merchant dashboard) — falls back to DASHBOARD_BASE_URL
// for local single-server dev where there's no service split.
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || DASHBOARD_BASE_URL;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send an email via SendGrid. If SENDGRID_API_KEY isn't configured (e.g.
 * local dev without a key), logs the send instead of throwing so auth flows
 * that trigger email don't hard-fail.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn(`[email] SENDGRID_API_KEY not set — skipping send to ${to}: "${subject}"`);
    return;
  }

  await sgMail.send({ to, from: FROM_EMAIL, subject, html, text });
}

function wrapTemplate(heading: string, bodyHtml: string, ctaLabel: string, ctaUrl: string): string {
  return `
  <div style="background:#f6f7fb;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
      <p style="font-weight:800;font-size:18px;color:#000;margin:0 0 24px;">TRITE</p>
      <h1 style="font-size:20px;color:#000;margin:0 0 12px;">${heading}</h1>
      <div style="font-size:14px;line-height:1.6;color:#444;margin:0 0 24px;">${bodyHtml}</div>
      <a href="${ctaUrl}" style="display:inline-block;background:#22c55e;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:12px;">${ctaLabel}</a>
      <p style="font-size:12px;color:#999;margin:24px 0 0;">If the button doesn't work, copy this link into your browser:<br />${ctaUrl}</p>
    </div>
  </div>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Reset your TRITE password",
    html: wrapTemplate(
      "Reset your password",
      "We received a request to reset the password on your TRITE account. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
      "Reset Password",
      resetUrl
    ),
    text: `Reset your TRITE password: ${resetUrl} (expires in 1 hour). If you didn't request this, you can ignore this email.`,
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Verify your TRITE account",
    html: wrapTemplate(
      "Verify your email address",
      "Thanks for signing up for TRITE. Confirm your email address to finish setting up your merchant account. This link expires in 24 hours.",
      "Verify Email",
      verifyUrl
    ),
    text: `Verify your TRITE account: ${verifyUrl} (expires in 24 hours).`,
  });
}

export { DASHBOARD_BASE_URL, ADMIN_BASE_URL };
