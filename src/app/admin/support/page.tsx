"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  Users,
  Receipt,
  ShieldCheck,
  FileText,
  Key,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  Bell,
  Clock,
  Circle,
  Check,
  AlertTriangle,
  Send,
  Server,
  Database,
  Globe,
  MoreVertical,
  Plus,
  UserPlus,
  Filter,
  Zap,
  Book
} from "lucide-react";

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
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { id: "kyc", label: "KYC Center", href: "/admin/kyc", icon: ShieldCheck },
  { id: "logs", label: "Logs", href: "/admin/logs", icon: FileText },
  { id: "roles", label: "Roles", href: "/admin/roles", icon: Key },
  { id: "support", label: "Support", href: "/admin/support", icon: HelpCircle },
];

const bottomItems = [
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
  { id: "logout", label: "Logout", href: "/admin/login", icon: LogOut },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--trite-muted)] hover:bg-black/[0.03] lg:hidden"
            >
              <HelpCircle className="h-6 w-6" />
            </button>
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/tritee-logo.png"
                alt="Trite logo"
                width={90}
                height={22}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/[0.02]">
              <Bell className="h-4 w-4 text-[color:var(--trite-ink)]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
              JW
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 z-50 h-[calc(100vh-64px)] w-56 border-r border-black/5 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
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
        <main className="flex-1 transition-all duration-300 lg:ml-56 p-5">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-[color:var(--trite-ink)] sm:text-3xl">
                Support <span className="text-blue-500">Center</span>
              </h1>
              <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">
                Manage inquiries and escalations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Tickets List */}
              <div className="lg:col-span-8">
                {/* Filter Tabs */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === "all"
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]"
                    }`}
                  >
                    All ({ticketCounts.all})
                  </button>
                  <button
                    onClick={() => setActiveFilter("unassigned")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === "unassigned"
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]"
                    }`}
                  >
                    Open ({ticketCounts.unassigned})
                  </button>
                  <button
                    onClick={() => setActiveFilter("escalated")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === "escalated"
                        ? "bg-[color:var(--trite-ink)] text-white"
                        : "bg-white text-[color:var(--trite-muted)] hover:bg-black/[0.02]"
                    }`}
                  >
                    Escalated ({ticketCounts.escalated})
                  </button>
                </div>

                {/* Tickets */}
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`cursor-pointer rounded-xl border bg-white p-5 transition-all hover:shadow-md ${
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
                          <Clock className="h-4 w-4" />
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
                <div className="rounded-xl border border-black/5 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[color:var(--trite-muted)] uppercase tracking-wide">Avg Response</p>
                      <p className="mt-1 text-2xl font-semibold text-[color:var(--trite-ink)]">14.2m</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--trite-lime)]">
                      <Zap className="h-6 w-6 text-[color:var(--trite-ink)]" />
                    </div>
                  </div>
                </div>

                {/* Quick Resolve */}
                {selectedTicket && (
                  <div className="rounded-xl border border-black/5 bg-white p-5">
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
                        className="mt-2 h-24 w-full rounded-xl border border-black/10 bg-white p-3 text-sm text-[color:var(--trite-ink)] outline-none focus:border-[color:var(--trite-lime-strong)] resize-none"
                      />
                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                      Send Reply
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Infrastructure */}
                <div className="rounded-xl bg-[color:var(--trite-ink)] p-5 text-white">
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
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">Auto-sync active</span>
                    </div>
                    <button className="text-xs text-white/60 hover:text-white">Pause</button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-black/5 bg-white py-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <Book className="h-4 w-4" />
                    Docs
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-black/5 bg-white py-4 text-sm font-medium text-[color:var(--trite-muted)] hover:bg-black/[0.02]">
                    <UserPlus className="h-4 w-4" />
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
    "in-progress": { text: "In Progress", icon: Clock, color: "text-emerald-600" },
    open: { text: "Open", icon: Circle, color: "text-blue-600" },
    resolved: { text: "Resolved", icon: Check, color: "text-gray-500" },
    escalated: { text: "Escalated", icon: AlertTriangle, color: "text-red-600" },
  };

  const { icon: Icon, text, color } = config[status];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {text}
    </div>
  );
}

// Icons imported from Lucide React
