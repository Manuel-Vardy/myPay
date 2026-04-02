"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LogLevel = "CRITICAL" | "ERROR" | "WARNING" | "INFO";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  description: string;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGridIcon },
  { id: "users", label: "Users", href: "/admin/users", icon: UsersIcon },
  { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: ReceiptIcon },
  { id: "kyc", label: "KYC Center", href: "/admin/kyc", icon: ShieldCheckIcon },
  { id: "logs", label: "Logs", href: "/admin/logs", icon: FileTextIcon },
  { id: "roles", label: "Roles", href: "/admin/roles", icon: KeyIcon },
  { id: "support", label: "Support", href: "/admin/support", icon: HelpCircleIcon },
];

const bottomItems = [
  { id: "settings", label: "Settings", href: "/admin/settings", icon: SettingsIcon },
  { id: "logout", label: "Logout", href: "/admin/login", icon: LogOutIcon },
];

const demoLogs: LogEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2024-01-15 14:02:44.112",
    level: "CRITICAL",
    source: "AUTH_CORE_V2",
    description: "Failed brute-force attempt from IP 192.168.1.104 on admin portal",
  },
  {
    id: "LOG-002",
    timestamp: "2024-01-15 14:02:41.005",
    level: "ERROR",
    source: "GATEWAY_API",
    description: "Timeout exceeded during handshake with external payment processor",
  },
  {
    id: "LOG-003",
    timestamp: "2024-01-15 14:02:39.992",
    level: "WARNING",
    source: "DB_CLUSTER_B",
    description: "Query execution time exceeded threshold (842ms) - KYC table scan",
  },
  {
    id: "LOG-004",
    timestamp: "2024-01-15 14:02:38.210",
    level: "INFO",
    source: "KYC_HANDLER",
    description: "Identity verification completed for user_id: TR-99428-X",
  },
  {
    id: "LOG-005",
    timestamp: "2024-01-15 14:02:35.454",
    level: "INFO",
    source: "WEB_APP_SERVER",
    description: "Health check heart-beat acknowledged. Cluster integrity nominal",
  },
  {
    id: "LOG-006",
    timestamp: "2024-01-15 14:02:31.002",
    level: "CRITICAL",
    source: "SYSTEM_KERNEL",
    description: "Unexpected kernel panic in background scheduler - auto-recovery initiated",
  },
  {
    id: "LOG-007",
    timestamp: "2024-01-15 14:02:28.112",
    level: "INFO",
    source: "AUTH_CORE_V2",
    description: "Admin login session created for user: s.richards@trite.com.gh",
  },
  {
    id: "LOG-008",
    timestamp: "2024-01-15 14:02:24.887",
    level: "WARNING",
    source: "TRANSACTION_ENGINE",
    description: "High volume alert: 450 transactions/minute detected on mobile money gateway",
  },
  {
    id: "LOG-009",
    timestamp: "2024-01-15 14:02:22.331",
    level: "ERROR",
    source: "NOTIFICATION_SERVICE",
    description: "SMS gateway timeout - MTN Ghana API returning 503 errors",
  },
  {
    id: "LOG-010",
    timestamp: "2024-01-15 14:02:19.445",
    level: "INFO",
    source: "SETTLEMENT_CORE",
    description: "Batch settlement completed: GH₵2.4M processed to 14 merchant accounts",
  },
];

const activityData = [
  { hour: "00:00", requests: 120, errors: 5 },
  { hour: "04:00", requests: 85, errors: 2 },
  { hour: "08:00", requests: 340, errors: 8 },
  { hour: "12:00", requests: 520, errors: 25 },
  { hour: "16:00", requests: 480, errors: 15 },
  { hour: "20:00", requests: 290, errors: 6 },
];

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState("logs");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLive, setIsLive] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const filteredLogs = demoLogs.filter((log) =>
    log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const maxRequests = Math.max(...activityData.map(d => d.requests));

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/tritee-logo.png"
                alt="Trite logo"
                width={120}
                height={28}
                priority
              />
            </Link>
            <span className="text-xs font-medium text-[color:var(--trite-muted)]">Financial Architect</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--trite-muted)]" />
              <input
                type="text"
                placeholder="Search logs, sources, or IPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-72 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
              Global Overview
            </button>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Audit Trail
            </button>
            <button className="h-10 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-medium text-white hover:bg-black">
              Create Report
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <BellIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <HelpCircleIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-black/5 bg-white">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[color:var(--trite-lime)] text-[color:var(--trite-ink)]"
                            : "text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-black/5 px-3 py-4">
              <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2">
                <p className="text-xs font-medium text-emerald-700">● System Status: Operational</p>
              </div>
              <ul className="space-y-1">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.03] hover:text-[color:var(--trite-ink)]"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-[color:var(--trite-ink)]">System Logs</h1>
                <p className="mt-1 text-sm text-[color:var(--trite-muted)]">Real-time security auditing and compliance monitoring engine.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                  <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-emerald-500" : "bg-gray-400"}`} />
                  <span className="text-xs font-medium text-[color:var(--trite-muted)]">LIVE FEED</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                  <span className="text-xs font-medium text-[color:var(--trite-muted)]">RETENTION</span>
                  <span className="text-xs font-semibold text-[color:var(--trite-ink)]">90 Days</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[color:var(--trite-ink)]">12</p>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase">Critical</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangleIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[color:var(--trite-ink)]">48</p>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase">Warnings</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <InfoIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[color:var(--trite-ink)]">1.2k</p>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase">Info</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5 cursor-pointer hover:bg-black/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <LayersIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[color:var(--trite-ink)]">42.5k</p>
                    <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase">Total Events</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Console Output */}
            <div className="mb-6 rounded-2xl border border-black/5 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/5 bg-[color:var(--trite-ink)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="ml-3 text-xs font-mono text-white/60">CONSOLE OUTPUT — TTY/DEV/LOGS</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className="flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white"
                  >
                    {isLive ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
                    {isLive ? "Pause Feed" : "Resume Feed"}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white">
                    <DownloadIcon className="h-3.5 w-3.5" />
                    Export .JSON
                  </button>
                </div>
              </div>

              <table className="w-full">
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
                      <td className="py-3 px-6 text-[color:var(--trite-muted)]">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${getLevelColor(log.level)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full bg-white`} />
                          {log.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[color:var(--trite-ink)]">{log.source}</td>
                      <td className="py-3 px-4 text-[color:var(--trite-muted)] truncate max-w-md">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-black/5 px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[color:var(--trite-muted)]">Showing</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="h-8 rounded-lg border border-black/10 bg-white px-2 text-xs outline-none"
                  >
                    <option>50</option>
                    <option>100</option>
                    <option>250</option>
                  </select>
                  <span className="text-xs text-[color:var(--trite-muted)]">entries</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50" disabled>
                    &lt;&lt;
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs text-[color:var(--trite-muted)] hover:bg-black/[0.02] disabled:opacity-50" disabled>
                    &lt;
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white">1</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs text-[color:var(--trite-muted)] hover:bg-black/[0.02]">2</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs text-[color:var(--trite-muted)] hover:bg-black/[0.02]">3</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs text-[color:var(--trite-muted)] hover:bg-black/[0.02]">&gt;</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-xs text-[color:var(--trite-muted)] hover:bg-black/[0.02]">&gt;&gt;</button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Activity Volume Chart */}
              <div className="lg:col-span-2 rounded-2xl border border-black/5 bg-white p-5">
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
              <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white">
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
                      <CheckIcon className="h-4 w-4" />
                      Passed
                    </span>
                  </div>
                </div>

                <button className="mt-5 w-full rounded-xl bg-white/10 py-2.5 text-xs font-medium hover:bg-white/20">
                  VIEW DETAILED AUDIT →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Icons
function LayoutGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.392 4.396 9.78 9.829 9.78 1.645.001 3.26-.337 4.78-1.003.657-.283 1.113-.78 1.333-1.423A9.713 9.713 0 0022.083 12.75c0-1.454-.146-2.87-.453-4.236A11.994 11.994 0 003.745 4.986 11.959 11.959 0 0012.499 2.25z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.317.53a3 3 0 01-5.317-.53m5.317.53V12.75A1.5 1.5 0 0014.25 12h-.904a1.5 1.5 0 00-1.5 1.5v2.336c0 .607.197 1.217.573 1.702.242.312.578.53.962.6.46.086.93.032 1.37-.137z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.831a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
