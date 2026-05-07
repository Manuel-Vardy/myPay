"use client";

import { useEffect, useState } from "react";

export function useAdminFetch<T>(path: string, params?: Record<string, string>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  const mutate = () => setTick(t => t + 1);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    setLoading(true);
    fetch(`${path}${qs}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey, tick]);

  return { data, loading, error, mutate };
}
