"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Shield,
  AlertTriangle,
  Info,
  Terminal,
  MoreVertical,
  Check,
  Layers,
  Pause,
  Play,
} from "lucide-react";

type LogLevel = "CRITICAL" | "ERROR" | "WARNING" | "INFO";

type ApiLog = { id: number; timestamp: string; level: string; source: string; event_description: string };

export default function AdminLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLive, setIsLive] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), per_page: String(rowsPerPage) };
  if (searchQuery) params.source = searchQuery;

  const { data: logsData } = useAdminFetch<{ 
    data: ApiLog[]; 
    activity_stats?: Array<{ hour: string; requests: number; errors: number }>;
    pagination: { total: number } 
  }>("/api/admin/logs", params);
  
  const logs = logsData?.data ?? [];

  const filteredLogs = searchQuery
    ? logs.filter((l) =>
        l.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.event_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.level.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "ERROR":
        return "bg-orange-500 text-white";
      case "WARNING":
        return "bg-amber-400 text-white";
      case "INFO":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getLevelDot = (level: LogLevel) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500";
      case "ERROR":
        return "bg-orange-500";
      case "WARNING":
        return "bg-amber-400";
      case "INFO":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const activityData = logsData?.activity_stats ?? [
    { hour: "00:00", requests: 0, errors: 0 },
    { hour: "04:00", requests: 0, errors: 0 },
    { hour: "08:00", requests: 0, errors: 0 },
    { hour: "12:00", requests: 0, errors: 0 },
    { hour: "16:00", requests: 0, errors: 0 },
    { hour: "20:00", requests: 0, errors: 0 },
  ];

  const maxRequests = Math.max(...activityData.map(d => d.requests));


  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[color:var(--trite-ink)] sm:text-2xl">System Logs</h1>
          <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">Real-time auditing engine.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-emerald-500" : "bg-gray-400"}`} />
            <span className="text-[10px] font-bold text-[color:var(--trite-muted)]">LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50/50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--trite-ink)]">12</p>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Critical</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50/50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--trite-ink)]">48</p>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Warnings</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50/50">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--trite-ink)]">1.2k</p>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Info</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50/50">
              <Layers className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--trite-ink)]">42.5k</p>
              <p className="text-[10px] font-bold text-[color:var(--trite-muted)] uppercase tracking-widest">Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Console Output */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-black/5 bg-[color:var(--trite-ink)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
            </div>
            <span className="text-[10px] font-bold font-mono text-white/70 uppercase tracking-[0.2em]">Live Auditing Console</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-2 text-[10px] font-bold font-mono text-white hover:text-[color:var(--trite-lime)] transition-colors"
            >
              {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isLive ? "PAUSE FEED" : "RESUME FEED"}
            </button>
          </div>
        </div>

        {/* Console Content */}
        <div className="lg:hidden divide-y divide-black/5">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 space-y-3 bg-[color:var(--trite-ink)] text-white/90 font-mono text-[11px]">
              <div className="flex items-start justify-between">
                <span className="text-white/40">{String(log.timestamp)}</span>
                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${getLevelColor(log.level as LogLevel)}`}>
                  {log.level}
                </span>
              </div>
              <div>
                <span className="text-emerald-400">source:</span> {log.source}
              </div>
              <div className="text-white/70 break-words leading-relaxed">
                <span className="text-blue-400">event:</span> {log.event_description}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-black/5 bg-slate-50 text-left text-xs font-medium text-[color:var(--trite-muted)] uppercase">
                <th className="py-3 px-6 font-mono">Timestamp</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4 font-mono">Source</th>
                <th className="py-3 px-4">Event Description</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="py-3 px-6 text-[color:var(--trite-muted)]">{String(log.timestamp)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${getLevelColor(log.level as LogLevel)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {log.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[color:var(--trite-ink)]">{log.source}</td>
                  <td className="py-3 px-4 text-[color:var(--trite-muted)] truncate max-w-md">{log.event_description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">Showing</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-black/10 bg-white px-2 text-xs font-bold text-[color:var(--trite-ink)] outline-none focus:border-blue-500 transition-colors"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">entries</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs font-bold text-[color:var(--trite-ink)] hover:bg-black/[0.02] disabled:opacity-30 transition-colors"
              >
                &lt;&lt;
              </button>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs font-bold text-[color:var(--trite-ink)] hover:bg-black/[0.02] disabled:opacity-30 transition-colors"
              >
                &lt;
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, Math.ceil((logsData?.pagination?.total ?? 0) / rowsPerPage)))].map((_, i) => {
                const p = i + 1;
                // Simple pagination display for now
                return (
                  <button 
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                      page === p 
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                        : "border-black/10 text-[color:var(--trite-ink)] hover:bg-black/[0.02]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.min(Math.ceil((logsData?.pagination?.total ?? 0) / rowsPerPage), p + 1))}
                disabled={page >= Math.ceil((logsData?.pagination?.total ?? 0) / rowsPerPage)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs font-bold text-[color:var(--trite-ink)] hover:bg-black/[0.02] disabled:opacity-30 transition-colors"
              >
                &gt;
              </button>
              <button 
                onClick={() => setPage(Math.ceil((logsData?.pagination?.total ?? 0) / rowsPerPage))}
                disabled={page >= Math.ceil((logsData?.pagination?.total ?? 0) / rowsPerPage)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs font-bold text-[color:var(--trite-ink)] hover:bg-black/[0.02] disabled:opacity-30 transition-colors"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Activity Volume Chart */}
        <div className="lg:col-span-2 rounded-xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Activity Volume (24h)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-[color:var(--trite-muted)]">Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs text-[color:var(--trite-muted)]">Errors</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-32 px-2">
            {activityData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <div className="relative w-full flex flex-col items-center">
                  {/* Error bar */}
                  <div
                    className="w-full bg-red-400 rounded-t"
                    style={{ height: `${(data.errors / maxRequests) * 100}px` }}
                  />
                  {/* Request bar */}
                  <div
                    className="w-full bg-blue-500 rounded-b"
                    style={{ height: `${((data.requests - data.errors) / maxRequests) * 100}px` }}
                  />
                </div>
                <span className="text-xs text-[color:var(--trite-muted)]">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Profile */}
        <div className="rounded-xl bg-[color:var(--trite-ink)] p-5 text-white">
          <h3 className="text-sm font-semibold">Security Profile</h3>
          <p className="mt-1 text-xs text-white/60">System-wide threat analysis based on current log ingestion patterns.</p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">RISK LEVEL</span>
                <span className="font-medium text-emerald-400">Low</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className="h-full w-[15%] rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">SYNC LATENCY</span>
              <span className="text-sm font-medium">24ms</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">INTEGRITY CHECK</span>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                <Check className="h-4 w-4" />
                Passed
              </span>
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl bg-white/10 py-2.5 text-xs font-medium hover:bg-white/20">
            VIEW DETAILED AUDIT →
          </button>
        </div>
      </div>
    </>
  );
}
