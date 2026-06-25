"use client";

import { useMemo, useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  Clock,
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
  Book,
} from "lucide-react";

type ApiTicket = {
  id: string; ticket_id_display: string; issue_type: string;
  priority: string; status: string; description: string | null;
  messages: Array<{ sender_id: string; content: string; timestamp: string }>;
  business_name: string; merchant_display_id: string;
  created_at: string;
};

type TicketPriority = "high" | "medium" | "low" | string;
type TicketStatus = "in-progress" | "open" | "resolved" | "escalated" | string;

const infrastructureStatus = [
  { name: "Payment Engine", status: "healthy" },
  { name: "Auth Service", status: "healthy" },
  { name: "Webhooks", status: "degraded" },
  { name: "Database Cluster", status: "healthy" },
  { name: "KYC Pipeline", status: "healthy" },
];

export default function AdminSupportPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);

  const params: Record<string, string> = { per_page: "20" };
  if (activeFilter === "unassigned") params.status = "OPEN";
  if (activeFilter === "escalated") params.status = "IN_PROGRESS";

  const { data: ticketsData } = useAdminFetch<{ data: ApiTicket[]; pagination: { total: number } }>("/api/admin/support", params);
  const tickets = ticketsData?.data ?? [];
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const ticketCounts = {
    all: ticketsData?.pagination?.total ?? tickets.length,
    unassigned: tickets.filter((t) => t.status === "OPEN").length,
    escalated: tickets.filter((t) => t.status === "IN_PROGRESS").length,
  };

  async function handleSendReply() {
    if (!selectedTicket || !response.trim()) return;
    setSending(true);
    await fetch(`/api/admin/support/${selectedTicket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: { sender_id: "admin", content: response } }),
    });
    setResponse("");
    setSending(false);
  }


  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[color:var(--trite-ink)] sm:text-4xl">
            Support <span className="text-blue-500">Center</span>
          </h1>
          <p className="mt-1 text-xs text-[color:var(--trite-muted)] sm:text-sm">
            Manage merchant inquiries and system escalations with architectural precision.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Tickets List */}
        <div className="lg:col-span-8">
          {/* Filter Tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeFilter === "all"
                  ? "bg-[color:var(--trite-ink)] text-white shadow-md"
                  : "bg-white text-[color:var(--trite-muted)] border border-black/5 hover:bg-black/[0.02]"
              }`}
            >
              All ({ticketCounts.all})
            </button>
            <button
              onClick={() => setActiveFilter("unassigned")}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeFilter === "unassigned"
                  ? "bg-[color:var(--trite-ink)] text-white shadow-md"
                  : "bg-white text-[color:var(--trite-muted)] border border-black/5 hover:bg-black/[0.02]"
              }`}
            >
              Unassigned ({ticketCounts.unassigned})
            </button>
            <button
              onClick={() => setActiveFilter("escalated")}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeFilter === "escalated"
                  ? "bg-[color:var(--trite-ink)] text-white shadow-md"
                  : "bg-white text-[color:var(--trite-muted)] border border-black/5 hover:bg-black/[0.02]"
              }`}
            >
              Escalated ({ticketCounts.escalated})
            </button>
          </div>

          {/* Tickets */}
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`cursor-pointer rounded-2xl border bg-white p-5 transition-all hover:shadow-md ${
                  selectedTicket?.id === ticket.id ? "border-blue-400 ring-1 ring-blue-400" : "border-black/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
                      {ticket.business_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[color:var(--trite-ink)]">{ticket.issue_type.replace(/_/g, " ")}</h3>
                      <p className="text-xs text-[color:var(--trite-muted)]">Ticket #{ticket.ticket_id_display} • From: {ticket.business_name}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={ticket.priority.toLowerCase() as "high" | "medium" | "low"} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-[color:var(--trite-muted)]">
                    <Clock className="h-4 w-4" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                  <StatusBadge status={ticket.status.toLowerCase().replace("_", "-") as "in-progress" | "open" | "resolved" | "escalated"} />
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
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Quick Resolve */}
          {selectedTicket && (
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="text-sm font-semibold text-[color:var(--trite-ink)]">Quick Resolve</h3>
              <p className="text-xs text-[color:var(--trite-muted)]">
                Active Response for {selectedTicket?.ticket_id_display}
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--trite-muted)]">Merchant Message</p>
                <p className="mt-2 text-sm text-[color:var(--trite-ink)] italic">
                  &ldquo;{selectedTicket?.description ?? "No description provided."}&rdquo;
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

              <button onClick={handleSendReply} disabled={sending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {sending ? "Sending..." : "Send Reply"}
                <Check className="h-4 w-4" />
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
    </>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = {
    high: { text: "High-Priority", color: "bg-red-100 text-red-700" },
    medium: { text: "Medium", color: "bg-blue-100 text-blue-700" },
    low: { text: "Low", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${(config[priority as keyof typeof config] || config.medium).color}`}>
      {(config[priority as keyof typeof config] || config.medium).text}
    </span>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const config = {
    "in-progress": { text: "In Progress", icon: Clock, color: "text-emerald-600" },
    open: { text: "Open", icon: Check, color: "text-blue-600" },
    resolved: { text: "Resolved", icon: Check, color: "text-gray-500" },
    escalated: { text: "Escalated", icon: AlertTriangle, color: "text-red-600" },
  };

  const { icon: Icon, text, color } = config[status as keyof typeof config] || config["open"];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {text}
    </div>
  );
}
