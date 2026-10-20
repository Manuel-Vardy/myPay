import "server-only";
import { sendEmail, ADMIN_BASE_URL } from "@/lib/email";
import { wrapTemplate } from "./templates";

export async function sendPasswordResetEmail(to: string, resetUrl: string, actorId?: string | null): Promise<void> {
  await sendEmail({
    to,
    actorId,
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

export async function sendVerificationEmail(to: string, verifyUrl: string, actorId?: string | null): Promise<void> {
  await sendEmail({
    to,
    actorId,
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

/**
 * Notify an admin of a platform alert. `alertAdmins: false` is essential: if
 * this send fails it must not raise another alert, which would try to email
 * again and loop.
 */
export async function sendAdminAlertEmail(
  to: string,
  { title, message, severity }: { title: string; message: string; severity: string }
): Promise<void> {
  await sendEmail({
    to,
    alertAdmins: false,
    subject: `[${severity}] TRITE alert: ${title}`,
    html: wrapTemplate(
      title,
      `${message}<br /><br /><strong>Severity:</strong> ${severity}`,
      "View system logs",
      `${ADMIN_BASE_URL}/admin/logs`
    ),
    text: `[${severity}] ${title}\n\n${message}\n\nSystem logs: ${ADMIN_BASE_URL}/admin/logs`,
  });
}
