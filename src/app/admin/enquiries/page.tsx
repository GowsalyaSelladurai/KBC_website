"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type ElementType } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Download,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Sparkles,
  Pencil,
} from "lucide-react";

type LeadStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Follow-up"
  | "Converted"
  | "Lost";

type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string;
  course: string;
  source: string;
  assigned: string;
  status: LeadStatus;
  date: string;
  followUp: string;
  notes: string;
};

const STORAGE_KEY = "kbc_enquiries_v1";

const cardClass =
  "gold-ambient-card rounded-2xl border border-[#343832] bg-[#1B1F1D]";

const inputClass =
  "w-full rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#73796F] focus:border-[#D9D19A]";

const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-5 py-3 text-sm font-bold text-[#171914] transition hover:brightness-110";

const secondaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl border border-[#3A403A] bg-[#1B1F1D] px-4 py-3 text-sm text-[#D8D8CD] transition hover:border-[#D9D19A] hover:text-[#EFE8A8]";

const statuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Converted",
  "Lost",
];

const statusColors: Record<LeadStatus, string> = {
  New: "text-sky-300 bg-sky-400/10 border-sky-300/20",
  Contacted: "text-blue-300 bg-blue-400/10 border-blue-300/20",
  Interested: "text-amber-200 bg-amber-400/10 border-amber-300/20",
  "Follow-up": "text-purple-300 bg-purple-400/10 border-purple-300/20",
  Converted: "text-emerald-300 bg-emerald-400/10 border-emerald-300/20",
  Lost: "text-rose-300 bg-rose-400/10 border-rose-300/20",
};

const initialEnquiries: Enquiry[] = [
  {
    id: 1001,
    name: "Priya Sharma",
    phone: "9876543210",
    email: "priya@gmail.com",
    course: "Professional Hair Styling",
    source: "Instagram",
    assigned: "Anitha",
    status: "Interested",
    date: "2026-11-25",
    followUp: "2026-11-28",
    notes: "Interested in the advanced hair styling course.",
  },
  {
    id: 1002,
    name: "Rahul Kumar",
    phone: "9876501234",
    email: "rahul@gmail.com",
    course: "Professional Makeup",
    source: "Website",
    assigned: "Meena",
    status: "New",
    date: "2026-11-26",
    followUp: "",
    notes: "Requested course details and fees.",
  },
  {
    id: 1003,
    name: "Divya R",
    phone: "9789012345",
    email: "divya@gmail.com",
    course: "Beautician Course",
    source: "Referral",
    assigned: "Anitha",
    status: "Follow-up",
    date: "2026-11-21",
    followUp: "2026-11-27",
    notes: "Needs a call regarding batch timings.",
  },
  {
    id: 1004,
    name: "Karthik S",
    phone: "9654321098",
    email: "karthik@gmail.com",
    course: "Nail Art",
    source: "Walk-in",
    assigned: "Priya",
    status: "Converted",
    date: "2026-11-18",
    followUp: "",
    notes: "Admission confirmed.",
  },
  {
    id: 1005,
    name: "Sneha M",
    phone: "9000012345",
    email: "sneha@gmail.com",
    course: "Skin Care Specialist",
    source: "Facebook",
    assigned: "Meena",
    status: "Contacted",
    date: "2026-11-24",
    followUp: "2026-11-29",
    notes: "Discussed course duration.",
  },
  {
    id: 1006,
    name: "Arun Prakash",
    phone: "9444412345",
    email: "arun@gmail.com",
    course: "Professional Makeup",
    source: "Instagram",
    assigned: "Priya",
    status: "Lost",
    date: "2026-11-15",
    followUp: "",
    notes: "Not planning to join currently.",
  },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  course: "Professional Makeup",
  source: "Instagram",
  assigned: "Anitha",
  status: "New" as LeadStatus,
  date: new Date().toISOString().slice(0, 10),
  followUp: "",
  notes: "",
};

function formatDate(value: string) {
  if (!value) return "Not scheduled";

  return new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function readEnquiries(): Enquiry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Use sample data if storage is unavailable.
  }

  return initialEnquiries;
}

function downloadCSV(rows: Enquiry[]) {
  const headers = [
    "ID",
    "Name",
    "Phone",
    "Email",
    "Course",
    "Source",
    "Assigned",
    "Status",
    "Date",
    "Follow Up",
    "Notes",
  ];

  const csv = [
    headers.join(","),
    ...rows.map((item) =>
      [
        item.id,
        item.name,
        item.phone,
        item.email,
        item.course,
        item.source,
        item.assigned,
        item.status,
        item.date,
        item.followUp,
        item.notes,
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "kbc-enquiries.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${cardClass} ${className}`}>{children}</div>;
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${statusColors[status]}`}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ElementType;
  trend?: string;
  accent?: boolean;
}) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#A9ACA2]">{title}</p>

          <h3
            className={`mt-3 text-3xl font-semibold tracking-tight ${
              accent ? "text-[#EFE8A8]" : "text-[#F5F2E9]"
            }`}
          >
            {value}
          </h3>

          <p className="mt-2 text-[11px] text-[#858B82]">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-[#D9D19A]/20 bg-[#D9D19A]/10 p-3 text-[#EFE8A8]">
          <Icon size={19} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs text-[#D9D19A]">
          <ArrowUpRight size={14} />
          {trend}
        </div>
      )}
    </div>
  );
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [activeTab, setActiveTab] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);

  useEffect(() => {
    setEnquiries(readEnquiries());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
    }
  }, [enquiries, loaded]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const total = enquiries.length;

  const newLeads = enquiries.filter((e) => e.status === "New").length;

  const followUps = enquiries.filter(
    (e) => e.status === "Follow-up"
  ).length;

  const converted = enquiries.filter(
    (e) => e.status === "Converted"
  ).length;

  const activeLeads = enquiries.filter(
    (e) => !["Converted", "Lost"].includes(e.status)
  ).length;

  const conversionRate = total
    ? Math.round((converted / total) * 100)
    : 0;

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return enquiries.filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.phone.includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.course.toLowerCase().includes(term);

      const matchesStatus =
        filterStatus === "All" || item.status === filterStatus;

      const matchesSource =
        filterSource === "All" || item.source === filterSource;

      const matchesTab =
        activeTab === "All" || item.status === activeTab;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesTab
      );
    });
  }, [enquiries, search, filterStatus, filterSource, activeTab]);

  const pipeline = statuses.map((status) => ({
    status,
    count: enquiries.filter((e) => e.status === status).length,
  }));

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};

    enquiries.forEach((item) => {
      counts[item.source] = (counts[item.source] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [enquiries]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Enquiry) {
    setEditingId(item.id);

    setForm({
      name: item.name,
      phone: item.phone,
      email: item.email,
      course: item.course,
      source: item.source,
      assigned: item.assigned,
      status: item.status,
      date: item.date,
      followUp: item.followUp,
      notes: item.notes,
    });

    setModalOpen(true);
    setMenuId(null);
  }

  function saveEnquiry(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setToast("Please enter customer name and phone number.");
      return;
    }

    if (!/^[0-9+\s-]{7,15}$/.test(form.phone.trim())) {
      setToast("Please enter a valid phone number.");
      return;
    }

    if (editingId !== null) {
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...form, id: editingId }
            : item
        )
      );

      setToast("Enquiry updated successfully.");
    } else {
      const newItem: Enquiry = {
        ...form,
        id: Date.now(),
      };

      setEnquiries((prev) => [newItem, ...prev]);
      setToast("New enquiry added successfully.");
    }

    setModalOpen(false);
  }

  function deleteEnquiry(id: number) {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }

    setEnquiries((prev) => prev.filter((item) => item.id !== id));
    setMenuId(null);
    setSelected(null);
    setToast("Enquiry deleted.");
  }

  function changeStatus(id: number, status: LeadStatus) {
    setEnquiries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setToast(`Lead moved to ${status}.`);
    setMenuId(null);
  }

  const tabs = ["All", ...statuses];

  const lostCount = enquiries.filter(
    (e) => e.status === "Lost"
  ).length;

  const contactedCount = enquiries.filter(
    (e) => e.status === "Contacted"
  ).length;

  return (
    <div className="min-h-screen bg-[#121414] p-4 text-[#F5F2E9] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C8BD79]">
              <span className="h-px w-7 bg-[#EFE8A8]" />
              Business Management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Enquiries <span className="text-[#EFE8A8]">& Leads</span>
            </h1>

            <p className="mt-2 text-sm text-[#92978F]">
              Manage prospects, nurture relationships and convert opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadCSV(filtered)}
              className={secondaryButtonClass}
            >
              <Download size={16} />
              Export CSV
            </button>

            <button onClick={openAdd} className={primaryButtonClass}>
              <Plus size={17} />
              Add Enquiry
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Enquiries"
            value={total}
            subtitle="All registered prospects"
            icon={Users}
            trend="Your lead database"
          />

          <StatCard
            title="New Enquiries"
            value={newLeads}
            subtitle="Waiting for first contact"
            icon={Sparkles}
            accent
          />

          <StatCard
            title="Follow-ups Pending"
            value={followUps}
            subtitle="Leads requiring attention"
            icon={Clock}
          />

          <StatCard
            title="Converted Leads"
            value={converted}
            subtitle={`${conversionRate}% overall conversion rate`}
            icon={Target}
            accent
          />
        </div>

        {/* Lead Pipeline */}
        <Panel className="p-5 sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[#EFE8A8]" />
                <h2 className="text-lg font-semibold">Lead Pipeline</h2>
              </div>

              <p className="mt-1 text-xs text-[#858B82]">
                Track every prospect through the admission journey.
              </p>
            </div>

            <span className="rounded-full border border-[#3A403A] bg-[#151917] px-3 py-1.5 text-xs text-[#C8BD79]">
              {total} Total Leads
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {pipeline.map((item) => (
              <button
                key={item.status}
                onClick={() => {
                  setActiveTab(item.status);
                  setFilterStatus("All");
                }}
                className={`gold-ambient-card rounded-xl border p-4 text-left transition ${
                  activeTab === item.status
                    ? "border-[#D9D19A]/60 bg-[#29291F]"
                    : "border-[#343832] bg-[#151917] hover:border-[#D9D19A]/40"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-[#A9ACA2]">
                    {item.status}
                  </span>

                  <span className="h-2 w-2 rounded-full bg-[#D9D19A]" />
                </div>

                <p className="text-2xl font-semibold text-[#F5F2E9]">
                  {item.count}
                </p>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C8BD79] to-[#EFE8A8] transition-all"
                    style={{
                      width: `${total ? (item.count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

          {/* Enquiry Management */}
          <Panel className="min-w-0">
            <div className="border-b border-[#343832] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Enquiry Management
                  </h2>

                  <p className="mt-1 text-xs text-[#858B82]">
                    View and manage all customer enquiries.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-[190px] flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858B82]"
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search enquiries..."
                      className={`${inputClass} py-2.5 pl-9 pr-3`}
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`${inputClass} w-auto min-w-[135px] px-3 py-2.5 text-xs`}
                  >
                    <option value="All">All Statuses</option>

                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className={`${inputClass} w-auto min-w-[125px] px-3 py-2.5 text-xs`}
                  >
                    <option value="All">All Sources</option>

                    {[
                      "Instagram",
                      "Website",
                      "Referral",
                      "Walk-in",
                      "Facebook",
                      "Google",
                    ].map((source) => (
                      <option key={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] text-[#171914]"
                        : "border border-[#3A403A] bg-[#151917] text-[#A9ACA2] hover:border-[#D9D19A]/50 hover:text-[#EFE8A8]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[#343832] bg-[#151917] text-[10px] uppercase tracking-[0.14em] text-[#858B82]">
                    <th className="px-5 py-4 font-semibold">Prospect</th>
                    <th className="px-4 py-4 font-semibold">Course</th>
                    <th className="px-4 py-4 font-semibold">Source</th>
                    <th className="px-4 py-4 font-semibold">Assigned To</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Follow-up</th>
                    <th className="px-4 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#343832]">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition hover:bg-[#222723]"
                    >
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(item)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9D19A]/25 bg-[#D9D19A]/10 text-sm font-bold text-[#EFE8A8]">
                            {item.name
                              .split(" ")
                              .map((word) => word[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#F5F2E9] transition group-hover:text-[#EFE8A8]">
                              {item.name}
                            </p>

                            <p className="mt-1 text-[11px] text-[#858B82]">
                              {item.phone}
                            </p>
                          </div>
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-[170px] text-xs text-[#D0D2C8]">
                          {item.course}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-[#A9ACA2]">
                        {item.source}
                      </td>

                      <td className="px-4 py-4 text-xs text-[#D0D2C8]">
                        {item.assigned}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs text-[#D0D2C8]">
                          {formatDate(item.followUp)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`https://wa.me/${item.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp"
                            className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-400/10"
                          >
                            <MessageCircle size={15} />
                          </a>

                          <a
                            href={`tel:${item.phone}`}
                            title="Call"
                            className="rounded-lg p-2 text-[#D9D19A] transition hover:bg-white/10"
                          >
                            <Phone size={15} />
                          </a>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuId(
                                  menuId === item.id ? null : item.id
                                )
                              }
                              className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-white/10 hover:text-[#EFE8A8]"
                            >
                              <MoreHorizontal size={17} />
                            </button>

                            {menuId === item.id && (
                              <div className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-[#3A403A] bg-[#1B1F1D] p-2 shadow-2xl">
                                <button
                                  onClick={() => openEdit(item)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#E5E5D9] hover:bg-white/10"
                                >
                                  <Pencil size={14} />
                                  Edit enquiry
                                </button>

                                <button
                                  onClick={() => {
                                    setSelected(item);
                                    setMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#E5E5D9] hover:bg-white/10"
                                >
                                  <User size={14} />
                                  View details
                                </button>

                                <div className="my-1 border-t border-[#343832]" />

                                <p className="px-3 py-1 text-[9px] uppercase tracking-widest text-[#858B82]">
                                  Change status
                                </p>

                                {statuses.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      changeStatus(item.id, status)
                                    }
                                    className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#C9CCC1] hover:bg-white/10"
                                  >
                                    {status}
                                  </button>
                                ))}

                                <button
                                  onClick={() => deleteEnquiry(item.id)}
                                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-300 hover:bg-rose-400/10"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9D19A]/10 text-[#EFE8A8]">
                          <Search size={20} />
                        </div>

                        <p className="mt-3 text-sm font-medium text-[#D9DCCF]">
                          No enquiries found
                        </p>

                        <p className="mt-1 text-xs text-[#858B82]">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-[#343832] px-5 py-4 text-xs text-[#858B82] sm:flex-row">
              <span>
                Showing {filtered.length} of {total} enquiries
              </span>

              <span className="flex items-center gap-1 text-[#C8BD79]">
                <CheckCircle2 size={13} />
                Data saved in this browser
              </span>
            </div>
          </Panel>

          {/* Insights */}
          <div className="space-y-6">

            {/* Lead Insights */}
            <Panel className="p-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={17} className="text-[#EFE8A8]" />
                <h3 className="text-sm font-semibold">Lead Insights</h3>
              </div>

              <div className="mt-6 rounded-xl border border-[#D9D19A]/20 bg-[#151917] p-4">
                <p className="text-xs text-[#A9ACA2]">
                  Conversion Rate
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <p className="text-3xl font-semibold text-[#EFE8A8]">
                    {conversionRate}%
                  </p>

                  <Target size={24} className="text-[#C8BD79]" />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C8BD79] to-[#EFE8A8]"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>

                <p className="mt-2 text-[10px] text-[#92978F]">
                  {converted} converted out of {total} total enquiries
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A9ACA2]">
                    Active leads
                  </span>

                  <span className="text-sm font-semibold text-[#F5F2E9]">
                    {activeLeads}
                  </span>
                </div>

                <div className="h-px bg-[#343832]" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A9ACA2]">
                    Lost enquiries
                  </span>

                  <span className="text-sm font-semibold text-rose-300">
                    {lostCount}
                  </span>
                </div>

                <div className="h-px bg-[#343832]" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A9ACA2]">
                    Contacted leads
                  </span>

                  <span className="text-sm font-semibold text-blue-300">
                    {contactedCount}
                  </span>
                </div>
              </div>
            </Panel>

            {/* Enquiry Sources */}
            <Panel className="p-5">
              <div className="flex items-center gap-2">
                <Send size={17} className="text-[#EFE8A8]" />
                <h3 className="text-sm font-semibold">Enquiry Sources</h3>
              </div>

              <p className="mt-1 text-[11px] text-[#858B82]">
                Where your leads come from.
              </p>

              <div className="mt-5 space-y-4">
                {sourceData.length === 0 && (
                  <p className="text-xs text-[#858B82]">
                    No source data yet.
                  </p>
                )}

                {sourceData.map(([source, count]) => (
                  <div key={source}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-xs text-[#C9CCC1]">
                        {source}
                      </span>

                      <span className="text-xs font-semibold text-[#EFE8A8]">
                        {count}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C8BD79] to-[#EFE8A8]"
                        style={{
                          width: `${total ? (count / total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Follow-up Reminder */}
            <Panel className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9D19A]/20 bg-[#D9D19A]/10 text-[#EFE8A8]">
                <CalendarDays size={19} />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Follow-up Reminder
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#92978F]">
                Keep your prospects engaged. Follow up on interested leads
                before they lose interest.
              </p>

              <button
                onClick={() => {
                  setActiveTab("Follow-up");
                  setFilterStatus("All");
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D9D19A]/30 bg-[#D9D19A]/10 py-2.5 text-xs font-semibold text-[#EFE8A8] transition hover:bg-[#D9D19A]/20"
              >
                View Follow-ups
                <ArrowDownRight size={14} />
              </button>
            </Panel>
          </div>
        </div>

        {/* Add / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#343832] bg-[#1B1F1D] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#343832] bg-[#1B1F1D] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    {editingId ? "Edit Enquiry" : "Add New Enquiry"}
                  </h2>

                  <p className="mt-1 text-xs text-[#858B82]">
                    Enter prospect details below.
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-white/10 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={saveEnquiry} className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Customer Name *
                    </span>

                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Enter full name"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Phone Number *
                    </span>

                    <input
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Email Address
                    </span>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="customer@email.com"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Interested Course
                    </span>

                    <select
                      value={form.course}
                      onChange={(e) =>
                        setForm({ ...form, course: e.target.value })
                      }
                      className={inputClass}
                    >
                      {[
                        "Professional Makeup",
                        "Professional Hair Styling",
                        "Beautician Course",
                        "Nail Art",
                        "Skin Care Specialist",
                        "Bridal Makeup",
                        "Other",
                      ].map((course) => (
                        <option key={course}>{course}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Enquiry Source
                    </span>

                    <select
                      value={form.source}
                      onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                      }
                      className={inputClass}
                    >
                      {[
                        "Instagram",
                        "Website",
                        "Referral",
                        "Walk-in",
                        "Facebook",
                        "Google",
                      ].map((source) => (
                        <option key={source}>{source}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Assigned Staff
                    </span>

                    <select
                      value={form.assigned}
                      onChange={(e) =>
                        setForm({ ...form, assigned: e.target.value })
                      }
                      className={inputClass}
                    >
                      {["Anitha", "Meena", "Priya", "Admin"].map((staff) => (
                        <option key={staff}>{staff}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Lead Status
                    </span>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as LeadStatus,
                        })
                      }
                      className={inputClass}
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Enquiry Date
                    </span>

                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Next Follow-up Date
                    </span>

                    <input
                      type="date"
                      value={form.followUp}
                      onChange={(e) =>
                        setForm({ ...form, followUp: e.target.value })
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-xs text-[#C9CCC1]">
                      Notes
                    </span>

                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Add enquiry notes..."
                      className={`${inputClass} resize-none`}
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#343832] pt-5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-[#3A403A] px-5 py-3 text-xs text-[#C9CCC1] transition hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button type="submit" className={primaryButtonClass}>
                    <Check size={15} />
                    {editingId ? "Save Changes" : "Create Enquiry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#343832] bg-[#1B1F1D] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#343832] p-5">
                <h2 className="font-semibold">Enquiry Details</h2>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D9D19A]/25 bg-[#D9D19A]/10 text-lg font-bold text-[#EFE8A8]">
                    {selected.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {selected.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#858B82]">
                      Enquiry #{selected.id}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    ["Phone", selected.phone],
                    ["Email", selected.email || "Not provided"],
                    ["Course", selected.course],
                    ["Source", selected.source],
                    ["Assigned To", selected.assigned],
                    ["Enquiry Date", formatDate(selected.date)],
                    ["Follow-up", formatDate(selected.followUp)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[#343832] bg-[#151917] p-3"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-[#858B82]">
                        {label}
                      </p>

                      <p className="mt-2 break-words text-xs text-[#E0E2D8]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {selected.notes && (
                  <div className="mt-4 rounded-xl border border-[#343832] bg-[#151917] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#858B82]">
                      Notes
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#D5D8CD]">
                      {selected.notes}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#3A403A] py-3 text-xs text-[#D8D8CD] transition hover:border-[#D9D19A] hover:text-[#EFE8A8]"
                  >
                    <Phone size={15} />
                    Call
                  </a>

                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 py-3 text-xs text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>

                  <button
                    onClick={() => {
                      openEdit(selected);
                      setSelected(null);
                    }}
                    className={`${primaryButtonClass} flex-1 py-3 text-xs`}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-3 rounded-xl border border-[#D9D19A]/40 bg-[#1B1F1D] px-5 py-4 text-sm text-[#F5F2E9] shadow-2xl">
            <CheckCircle2
              size={18}
              className="shrink-0 text-[#EFE8A8]"
            />

            {toast}

            <button
              onClick={() => setToast("")}
              className="ml-2 text-[#858B82] transition hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Soft Gold Hover Aura */}
      <style jsx global>{`
        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;

          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .gold-ambient-card::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          pointer-events: none;
          z-index: -1;

          background: radial-gradient(
            ellipse at center,
            rgba(255, 226, 130, 0.25) 0%,
            rgba(239, 200, 85, 0.16) 35%,
            rgba(205, 157, 55, 0.08) 65%,
            transparent 100%
          );

          filter: blur(24px);
          opacity: 0;

          transition: opacity 0.35s ease;
        }

        .gold-ambient-card:hover,
        .gold-ambient-card:active,
        .gold-ambient-card:focus-visible {
          border-color: rgba(239, 210, 130, 0.45);

          box-shadow:
            0 0 12px rgba(239, 200, 85, 0.13),
            0 0 28px rgba(239, 200, 85, 0.12),
            0 0 50px rgba(239, 200, 85, 0.08),
            inset 0 0 18px rgba(239, 200, 85, 0.025);
        }

        .gold-ambient-card:hover::before,
        .gold-ambient-card:active::before,
        .gold-ambient-card:focus-visible::before {
          opacity: 1;
        }

        @media (hover: hover) and (pointer: fine) {
          .gold-ambient-card:hover {
            transform: translateY(-3px);
          }
        }

        @media (hover: none) {
          .gold-ambient-card:active {
            transform: scale(0.99);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card,
          .gold-ambient-card::before {
            transition: none;
          }

          .gold-ambient-card:hover,
          .gold-ambient-card:active {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}