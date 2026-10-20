import "server-only";
import db from "@/lib/db";
import { notifyAdmins } from "@/lib/admin-alerts";

/**
 * Audit trail for outbound notification delivery (SendGrid email, Arkesel SMS).
 *
 * These sends sit on critical auth paths — signup verification, password
 * resets, phone OTPs — but they fail out-of-band: the user just never receives
 * anything. Without a record, an expired SendGrid key or an unapproved Arkesel
 * sender ID looks like "users are complaining" rather than a specific fault.
 * Failures land in `system_logs` so they surface in the admin log feed (where
 * ERROR/CRITICAL also drive the alert counters) instead of only in stdout.
 */

export type DeliveryChannel = "EMAIL" | "SMS";

/**
 * Shared `system_logs.source` so admins can filter the whole feed to delivery.
 * Matches the name already used for notification faults elsewhere in the feed,
 * rather than adding a second near-identical entry to the source dropdown.
 */
export const DELIVERY_LOG_SOURCE = "NOTIFICATION_SERVICE";

interface DeliveryFailureInput {
  channel: DeliveryChannel;
  provider: string;
  /** Email address or phone number the send was addressed to. */
  recipient: string;
  /**
   * The operation that failed, phrased to read after the channel — e.g.
   * `OTP delivery` or `delivery of "Verify your TRITE account"`.
   */
  event: string;
  error: unknown;
  actorId?: string | null;
  /**
   * Set for misconfiguration rather than a per-message fault: a missing API key
   * breaks delivery for *every* user, so it's logged CRITICAL to stand out from
   * the ordinary bad-number / bounced-message noise.
   */
  critical?: boolean;
  /**
   * Whether to push an admin alert on top of the log entry. False for the
   * alert emails themselves — otherwise a failing alert alerts about itself.
   */
  alertAdmins?: boolean;
}

/**
 * Record a failed send. Never throws — audit logging must not take down the
 * auth flow it's observing, so a logging failure falls back to stdout.
 */
export async function logDeliveryFailure({
  channel,
  provider,
  recipient,
  event,
  error,
  actorId,
  critical = false,
  alertAdmins = true,
}: DeliveryFailureInput): Promise<void> {
  const detail = error instanceof Error ? error.message : String(error);

  try {
    await db("system_logs").insert({
      level: critical ? "CRITICAL" : "ERROR",
      source: DELIVERY_LOG_SOURCE,
      event_description: `${channel} ${event} failed for ${recipient}: ${detail}`,
      actor_id: actorId ?? null,
      metadata: JSON.stringify({ channel, provider, recipient, event, detail }),
    });

    if (alertAdmins) {
      await notifyAdmins({
        category: "SYSTEM_ALERT",
        severity: critical ? "CRITICAL" : "ERROR",
        title: `${channel} ${event} failing`,
        message: `${channel} ${event} via ${provider} failed for ${recipient}: ${detail}`,
        // One alert per channel+provider+fault per window: a provider outage
        // fires on every request, and admins need one alert, not hundreds.
        dedupeKey: `delivery:${channel}:${provider}:${event}:${detail}`.slice(0, 200),
        metadata: { channel, provider, recipient, event, detail },
        // Emailing about a dead mail provider can't work — the stored
        // notification is the channel that still reaches them.
        email: !(channel === "EMAIL" && critical),
      });
    }
  } catch (logError) {
    console.error("Failed to record delivery failure in system_logs:", logError, {
      channel,
      provider,
      recipient,
      event,
      detail,
    });
  }
}
