"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TicketStatus = "in-progress" | "open" | "resolved" | "escalated";
type TicketPriority = "high" | "medium" | "low";

type Ticket = {
  id: string;
  ticketNumber: string;
  title: string;
  merchant: string;
  time: string;
  status: TicketStatus;
  priority: TicketPriority;
  initials: string;
  message: string;
};

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

const demoTickets: Ticket[] = [
  {
    id: "T-001",
    ticketNumber: "TR-9402",
    title: "Payment Gateway Timeout Error",
    merchant: "Apex Merchant Group",
    time: "24 mins ago",
    status: "in-progress",
    priority: "high",
    initials: "AM",
    message: "We are seeing 504 timeouts on the staging environment when hitting the /authorize endpoint since 09:00 UTC.",
  },
  {
    id: "T-002",
    ticketNumber: "TR-9398",
    title: "Settlement Discrepancy - Batch #449",
    merchant: "Lunar Digital",
    time: "1 hour ago",
    status: "open",
    priority: "medium",
    initials: "LD",
    message: "Our batch settlement shows GH₵12,450 less than expected. Please review transaction log for batch #449.",
  },
  {
    id: "T-003",
    ticketNumber: "TR-9395",
    title: "KYC Document Upload Failing",
    merchant: "Swift Systems",
    time: "3 hours ago",
    status: "in-progress",
    priority: "high",
    initials: "SS",
    message: "Users are unable to upload documents larger than 5MB. Getting 'Upload failed' error consistently.",
  },
  {
    id: "T-004",
    ticketNumber: "TR-9389",
    title: "Webhook Delivery Delays",
    merchant: "Kumasi Markets Ltd",
    time: "5 hours ago",
    status: "escalated",
    priority: "high",
    initials: "KM",
    message: "Webhooks are being delayed by 15-20 minutes. This is affecting our order processing system.",
  },
  {
    id: "T-005",
    ticketNumber: "TR-9382",
    title: "Refund Processing Issue",
    merchant: "Accra FinTech Solutions",
    time: "8 hours ago",
    status: "resolved",
    priority: "medium",
    initials: "AF",
    message: "Refund for transaction TR-8821 was processed twice. Need to reverse the duplicate.",
  },
];

const infrastructureStatus = [
  { name: "Payment Engine", status: "healthy" },
  { name: "Auth Service", status: "healthy" },
  { name: "Webhooks", status: "degraded" },
  { name: "Database Cluster", status: "healthy" },
  { name: "KYC Pipeline", status: "healthy" },
];

export default function AdminSupportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("support");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(demoTickets[0]);
  const [response, setResponse] = useState("");

  const filteredTickets = useMemo(() => {
    if (activeFilter === "all") return demoTickets;
    return demoTickets.filter((t) => {
      if (activeFilter === "unassigned") return t.status === "open";
      if (activeFilter === "escalated") return t.status === "escalated";
      return true;
    });
  }, [activeFilter]);

  const ticketCounts = {
    all: demoTickets.length,
    unassigned: demoTickets.filter((t) => t.status === "open").length,
    escalated: demoTickets.filter((t) => t.status === "escalated").length,
  };

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
                placeholder="Search tickets..."
                className="h-10 w-64 rounded-xl border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[color:var(--trite-lime-strong)]"
              />
            </div>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
              Global Overview
            </button>
            <button className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[color:var(--trite-ink)] hover:bg-black/[0.02]">
              Audit Trail
            </button>
            <button className="h-10 rounded-xl bg-[color:var(--trite-ink)] px-4 text-sm font-medium text-white hover:bg-black">
              + Create Report
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <BellIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
                <HelpCircleIcon className="h-5 w-5 text-[color:var(--trite-ink)]" />
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-sm font-medium text-white">JW</span>
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
            <div className="mb-6">
              <h1 className="text-4xl font-semibold text-[color:var(--trite-ink)]">
                Support <span className="text-blue-500">Center</span>
              </h1>
              <p className="mt-1 text-sm text-[color:var(--trite-muted)]">
                Manage merchant inquiries and system escalations with architectural precision.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Tickets List */}
              <div className="lg:col-span-8">
                {/* Filter Tabs */}
                <div className="mb-4 flex items-center gap-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeFilter === "all"
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]"
                    }`}
                  >
                    All Tickets ({ticketCounts.all})
                  </button>
                  <button
                    onClick={() => setActiveFilter("unassigned")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeFilter === "unassigned"
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]"
                    }`}
                  >
                    Unassigned ({ticketCounts.unassigned})
                  </button>
                  <button
                    onClick={() => setActiveFilter("escalated")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeFilter === "escalated"
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]"
                    }`}
                  >
                    Escalated ({ticketCounts.escalated})
                  </button>
                  <button className="ml-auto flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <FilterIcon className="h-4 w-4" />
                    Filter
                  </button>
                </div>

                {/* Tickets */}
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`cursor-pointer rounded-2xl border bg-white p-5 transition-all hover:shadow-md ${
                        selectedTicket?.id === ticket.id
                          ? "border-blue-400 ring-1 ring-blue-400"
                          : "border-black/5"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
                            {ticket.initials}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[color:var(--trite-ink)]">{ticket.title}</h3>
                            <p className="text-xs text-[color:var(--trite-muted)]">
                              Ticket #{ticket.ticketNumber} • From: {ticket.merchant}
                            </p>
                          </div>
                        </div>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-[color:var(--trite-muted)]">
                          <ClockIcon className="h-4 w-4" />
                          {ticket.time}
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex flex-col gap-4 lg:col-span-4">
                {/* Avg Response Time */}
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">Avg Response</p>
                      <p className="mt-1 text-2xl font-semibold text-[color:var(--trite-ink)]">14.2m</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--trite-lime)]">
                      <ZapIcon className="h-6 w-6 text-[color:var(--trite-ink)]" />
                    </div>
                  </div>
                </div>

                {/* Quick Resolve */}
                {selectedTicket && (
                  <div className="rounded-2xl border border-black/5 bg-white p-5">
                    <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Quick Resolve</h3>
                    <p className="text-xs text-[color:var(--trite-muted)]">
                      Active Response for {selectedTicket.ticketNumber}
                    </p>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                        Merchant Message
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--trite-ink)] italic">
                        &ldquo;{selectedTicket.message}&rdquo;
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">
                        Your Response
                      </p>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Draft your technical response..."
                        className="mt-2 h-24 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[color:var(--trite-lime-strong)] resize-none"
                      />
                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                      Send Reply
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Infrastructure */}
                <div className="rounded-2xl bg-[color:var(--trite-ink)] p-5 text-white">
                  <h3 className="text-sm font-semibold">Infrastructure</h3>
                  <div className="mt-4 space-y-3">
                    {infrastructureStatus.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm text-white/80">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.status === "healthy"
                                ? "bg-emerald-400"
                                : item.status === "degraded"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span className="text-xs text-white/60 capitalize">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">Auto-sync active</span>
                    </div>
                    <button className="text-xs text-white/60 hover:text-white">Pause</button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-black/5 bg-white py-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <BookIcon className="h-4 w-4" />
                    Docs
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-black/5 bg-white py-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <UserPlusIcon className="h-4 w-4" />
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = {
    high: { text: "High-Priority", color: "bg-red-100 text-red-700" },
    medium: { text: "Medium", color: "bg-blue-100 text-blue-700" },
    low: { text: "Low", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${config[priority].color}`}>
      {config[priority].text}
    </span>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const config = {
    "in-progress": { text: "In Progress", icon: ClockIcon, color: "text-emerald-600" },
    open: { text: "Open", icon: CircleIcon, color: "text-blue-600" },
    resolved: { text: "Resolved", icon: CheckIcon, color: "text-gray-500" },
    escalated: { text: "Escalated", icon: AlertIcon, color: "text-red-600" },
  };

  const { icon: Icon, text, color } = config[status];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {text}
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.592-2.783 6.375 6.375 0 01-11.592 2.783M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
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

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}
