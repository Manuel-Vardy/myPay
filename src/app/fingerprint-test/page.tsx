"use client";

import { useVisitorData } from "@fingerprint/react";
import FingerprintClientProvider from "@/components/FingerprintClientProvider";
import React from "react";

// Config smoke test for the Fingerprint agent — confirms the public key and
// region resolve and that the browser can reach the identification API. It
// carries its own provider because the agent is scoped to /pay in the real app.
// The visitor id shown here is the *client's* claim; what the ledger records is
// the value re-resolved server-side from event_id.

function FingerprintTest() {
  const { isLoading, error, data, getData } = useVisitorData({
    immediate: true,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">
              Fingerprint Pro Test
            </h1>
            <p className="text-sm text-slate-400">
              Visitor Identification & Device Intelligence
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isLoading
                ? "bg-amber-500/20 text-amber-300"
                : error
                ? "bg-rose-500/20 text-rose-300"
                : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {isLoading ? "Identifying..." : error ? "Error" : "Identified"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Visitor ID
            </label>
            <div className="mt-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold text-lg">
              {isLoading ? "Loading Visitor ID..." : data?.visitor_id || "N/A"}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Event ID (what checkout sends to the backend)
            </label>
            <div className="mt-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-sm break-all">
              {data?.event_id || "N/A"}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Suspect Score
            </label>
            <div className="mt-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-sm">
              {data?.suspect_score ?? "N/A (Smart Signals disabled)"}
            </div>
          </div>

          <button
            onClick={() => getData()}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition duration-200 cursor-pointer"
          >
            {isLoading ? "Refreshing..." : "Reload Visitor Data"}
          </button>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Raw Payload JSON
          </label>
          <pre className="mt-1 p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-60">
            {error
              ? JSON.stringify({ error: error.message }, null, 2)
              : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function FingerprintTestPage() {
  return (
    <FingerprintClientProvider>
      <FingerprintTest />
    </FingerprintClientProvider>
  );
}
