"use client";

import { FingerprintProvider } from "@fingerprint/react";
import React from "react";

/**
 * Fingerprint Pro agent, scoped to the surfaces that need it.
 *
 * Deliberately NOT mounted in the root layout: identification is billed per
 * call, and running it on every admin and merchant page load spends quota
 * identifying users we have already authenticated. It belongs on hosted
 * checkout, where the payer is anonymous and the device is the only stable
 * signal we have.
 *
 * With no public key configured this renders children untouched — checkout
 * still works, payments just carry no device intelligence.
 */
export default function FingerprintClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY;
  const region = process.env.NEXT_PUBLIC_FINGERPRINT_REGION;

  if (!apiKey) return <>{children}</>;

  return (
    <FingerprintProvider
      apiKey={apiKey}
      region={region === "eu" || region === "ap" ? region : "us"}
      // Checkout is a handful of page views per payer; a short cache keeps a
      // reload or an OTP retry from burning a second identification call.
      cache={{ storage: "sessionStorage", duration: "optimize-cost" }}
    >
      {children}
    </FingerprintProvider>
  );
}
