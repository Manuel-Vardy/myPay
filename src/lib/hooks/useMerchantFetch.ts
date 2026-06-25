"use client";

import { useEffect, useState } from "react";

export function useMerchantFetch<T>(path: string, params?: Record<string, string>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    // Build clean query string — strip empty values
    const parsed: Record<string, string> = params ?? {};
    const cleaned = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== "")
    );
    const qs = Object.keys(cleaned).length
      ? new URLSearchParams(cleaned).toString()
      : "";
    const url = qs ? `${path}?${qs}` : path;

    // Reset state for fresh fetch
    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch((e) => setError("Failed to load data: " + e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, serializedParams]);

  return { data, loading, error };
}
