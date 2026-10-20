import "server-only";
import db from "@/lib/db";
import { sendAdminAlertEmail } from "@/lib/notifications";

/**
 * Push notifications to admins, respecting each admin's opt-in preferences in
 * `admin_profiles.notification_settings` (see migration 0022).
 *
 * Two delivery channels, deliberately:
 *  - a durable row in `admin_notifications`, which works even when the email
 *    provider is the thing that's broken;
 *  - an email, so an admin doesn't have to be staring at the portal.
 *
 * Alerts are deduped by key, because the faults worth alerting on (a provider
 * outage, a missing credential) tend to fire on *every* request. Without that,
 * a broken SMS gateway would mail every admin once per signup attempt.
 */

/** Notification category → the preference key that gates it. */
export const ALERT_CATEGORY_PREFERENCES = {
  SYSTEM_ALERT: "systemAlerts",
  NEW_REGISTRATION: "newRegistrations",
  COMPLIANCE_FLAG: "complianceFlags",
  LARGE_TRANSACTION: "largeTransactions",
} as const;

export type AlertCategory = keyof typeof ALERT_CATEGORY_PREFERENCES;
export type AlertSeverity = "INFO" | "WARN" | "ERROR" | "CRITICAL";

const DEFAULT_DEDUPE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

interface NotifyAdminsInput {
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  /**
   * Collapses repeats of the same underlying fault. Omit only for events that
   * are genuinely one-off — anything triggered per-request needs one.
   */
  dedupeKey?: string;
  dedupeWindowMs?: number;
  metadata?: Record<string, unknown>;
  /**
   * Set false when email can't be trusted to work (e.g. the alert is that the
   * mail provider is unconfigured). The in-app row is still written.
   */
  email?: boolean;
}

interface AdminRecipient {
  user_id: string;
  email: string;
  notification_settings: Record<string, boolean> | null;
}

/**
 * Raise an admin alert. Never throws — alerting must not take down the flow
 * that triggered it, so failures fall back to stdout.
 *
 * Returns the number of admins notified (0 if deduped or nobody opted in).
 */
export async function notifyAdmins({
  category,
  severity,
  title,
  message,
  dedupeKey,
  dedupeWindowMs = DEFAULT_DEDUPE_WINDOW_MS,
  metadata = {},
  email = true,
}: NotifyAdminsInput): Promise<number> {
  try {
    // Already alerted on this fault recently — stay quiet.
    if (dedupeKey) {
      const since = new Date(Date.now() - dedupeWindowMs);
      const recent = await db("admin_notifications")
        .where({ dedupe_key: dedupeKey })
        .where("created_at", ">=", since)
        .first("id");
      if (recent) return 0;
    }

    const preferenceKey = ALERT_CATEGORY_PREFERENCES[category];

    const admins: AdminRecipient[] = await db("users")
      .join("admin_profiles", "admin_profiles.user_id", "users.id")
      .where("users.role", "ADMIN")
      .whereNot("users.status", "DEACTIVATED")
      .select(
        "users.id as user_id",
        "users.email",
        "admin_profiles.notification_settings"
      );

    // A missing settings blob means the column default (everything on) never
    // got written — treat that as opted in rather than silently dropping.
    const recipients = admins.filter(
      (a) => a.notification_settings?.[preferenceKey] !== false
    );

    if (recipients.length === 0) return 0;

    await db("admin_notifications").insert(
      recipients.map((a) => ({
        admin_user_id: a.user_id,
        category,
        severity,
        title,
        message,
        dedupe_key: dedupeKey ?? null,
        metadata: JSON.stringify(metadata),
      }))
    );

    if (email) {
      await Promise.all(
        recipients.map((a) =>
          // `alertAdmins: false` breaks the cycle — a failed alert email must
          // not raise another alert, which would try to email again.
          sendAdminAlertEmail(a.email, { title, message, severity }).catch((err) =>
            console.error(`Failed to email admin alert to ${a.email}:`, err)
          )
        )
      );
    }

    return recipients.length;
  } catch (error) {
    console.error("Failed to raise admin alert:", error, { category, title });
    return 0;
  }
}
