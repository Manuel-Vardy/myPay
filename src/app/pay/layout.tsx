import FingerprintClientProvider from "@/components/FingerprintClientProvider";

/**
 * Hosted checkout. The Fingerprint agent is mounted here rather than in the
 * root layout so identification is only billed for anonymous payers, not for
 * authenticated admin and merchant traffic.
 */
export default function PayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FingerprintClientProvider>{children}</FingerprintClientProvider>;
}
