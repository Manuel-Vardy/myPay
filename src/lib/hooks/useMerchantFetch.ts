"use client";

import { useEffect, useState } from "react";

export function useMerchantFetch<T>(path: string, params?: Record<string, string>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    const url = qs ? `${path}?${qs}` : path;
    
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch((e) => setError("Failed to load data: " + e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, JSON.stringify(params)]);

  return { data, loading, error };
}

