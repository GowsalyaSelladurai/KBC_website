
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Crown,
  Star,
  Phone,
  Mail,
  CalendarDays,
  IndianRupee,
  TrendingUp,
  Award,
  Gift,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  Plus,
  Filter,
  Download,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Heart,
  UserRound,
  CheckCircle2,
} from "lucide-react";

type Membership = "VIP" | "Gold" | "Silver" | "Regular";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  membership: Membership;
  visits: number;
  points: number;
  spent: number;
  lastVisit: string;
  joined: string;
  favoriteService: string;
  status: "Active" | "Inactive";
  notes: string;
};

const STORAGE_KEY = "kbc_customers_v1";

const GOLD = "#EFE8A8";

const initialCustomers: Customer[] = [
  {
    id: "CUS001",
    name: "Priya Sharma",
    phone: "9876543210",
    email: "priya@example.com",
    membership: "VIP",
    visits: 28,
    points: 2450,
    spent: 48500,
    lastVisit: "2026-11-24",
    joined: "2025-04-12",
    favoriteService: "Hair Styling",
    status: "Active",
    notes: "Prefers evening appointments.",
  },
  {
    id: "CUS002",
    name: "Ananya Kumar",
    phone: "9876543211",
    email: "ananya@example.com",
    membership: "Gold",
    visits: 19,
    points: 1680,
    spent: 32700,
    lastVisit: "2026-11-22",
    joined: "2025-07-18",
    favoriteService: "Facial",
    status: "Active",
    notes: "Regular skincare customer.",
  },
  {
    id: "CUS003",
    name: "Meera Krishnan",
    phone: "9876543212",
    email: "meera@example.com",
    membership: "Silver",
    visits: 12,
    points: 890,
    spent: 18400,
    lastVisit: "2026-11-18",
    joined: "2025-10-05",
    favoriteService: "Hair Spa",
    status: "Active",
    notes: "",
  },
  {
    id: "CUS004",
    name: "Divya Raj",
    phone: "9876543213",
    email: "divya@example.com",
    membership: "Regular",
    visits: 3,
    points: 150,
    spent: 4200,
    lastVisit: "2026-10-10",
    joined: "2026-08-15",
    favoriteService: "Manicure",
    status: "Inactive",
    notes: "",
  },
  {
    id: "CUS005",
    name: "Sneha Reddy",
    phone: "9876543214",
    email: "sneha@example.com",
    membership: "VIP",
    visits: 34,
    points: 3200,
    spent: 62500,
    lastVisit: "2026-11-25",
    joined: "2024-12-20",
    favoriteService: "Premium Hair Color",
    status: "Active",
    notes: "VIP customer. Prefers senior stylist.",
  },
  {
    id: "CUS006",
    name: "Kavya Mohan",
    phone: "9876543215",
    email: "kavya@example.com",
    membership: "Gold",
    visits: 16,
    points: 1420,
    spent: 28600,
    lastVisit: "2026-11-12",
    joined: "2025-05-22",
    favoriteService: "Bridal Makeup",
    status: "Active",
    notes: "",
  },
];

const emptyCustomer: Customer = {
  id: "",
  name: "",
  phone: "",
  email: "",
  membership: "Regular",
  visits: 0,
  points: 0,
  spent: 0,
  lastVisit: "",
  joined: new Date().toISOString().slice(0, 10),
  favoriteService: "",
  status: "Active",
  notes: "",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const membershipStyle: Record<Membership, string> = {
  VIP: "border-[#d9c77b]/40 bg-[#d9c77b]/10 text-[#EFE8A8]",
  Gold: "border-[#c9a65b]/40 bg-[#c9a65b]/10 text-[#e7c77e]",
  Silver: "border-[#b7bec8]/30 bg-[#b7bec8]/10 text-[#cbd1d9]",
  Regular: "border-white/10 bg-white/[0.05] text-[#aaa69b]",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(date: string) {
  if (!date) return "Not available";

  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#EFE8A8]/10 bg-gradient-to-br from-[#24251f] via-[#1b1e1c] to-[#151715] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8A8]/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#EFE8A8]/[0.04] blur-2xl transition-all group-hover:bg-[#EFE8A8]/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#99968b]">
            {title}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#f5f3e8]">
            {value}
          </h3>
          <p className="mt-2 text-xs text-[#8e9088]">{subtitle}</p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            accent
              ? "border-[#EFE8A8]/25 bg-[#EFE8A8]/10 text-[#EFE8A8]"
              : "border-white/10 bg-white/[0.04] text-[#c8c2a0]"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function MembershipBadge({ type }: { type: Membership }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${membershipStyle[type]}`}
    >
      {type === "VIP" && <Crown size={11} />}
      {type === "Gold" && <Award size={11} />}
      {type === "Silver" && <Star size={11} />}
      {type}
    </span>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Customer>(emptyCustomer);
  const [toast, setToast] = useState("");
  const [menuCustomer, setMenuCustomer] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomers(Array.isArray(parsed) ? parsed : initialCustomers);
      } else {
        setCustomers(initialCustomers);
      }
    } catch {
      setCustomers(initialCustomers);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }
  }, [customers, loaded]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter((c) => c.membership === "VIP").length;
    const returning = customers.filter((c) => c.visits > 1).length;
    const newCustomers = customers.filter((c) => c.visits <= 1).length;

    return { total, vip, returning, newCustomers };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.id.toLowerCase().includes(term);

      const matchesFilter =
        filter === "All" || customer.membership === filter;

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, filter]);

  const totalRevenue = customers.reduce((sum, c) => sum + c.spent, 0);

  function openAddForm() {
    setEditingCustomer(null);
    setFormData({
      ...emptyCustomer,
      id: `CUS${String(Date.now()).slice(-6)}`,
    });
    setShowForm(true);
  }

  function openEditForm(customer: Customer) {
    setEditingCustomer(customer);
    setFormData({ ...customer });
    setShowForm(true);
    setMenuCustomer(null);
  }

  function saveCustomer() {
    if (!formData.name.trim() || !formData.phone.trim()) {
      setToast("Please enter customer name and phone number.");
      return;
    }

    if (!/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      setToast("Please enter a valid phone number.");
      return;
    }

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((c) => (c.id === editingCustomer.id ? formData : c))
      );
      setToast("Customer details updated successfully.");
    } else {
      setCustomers((previous) => [formData, ...previous]);
      setToast("New customer added successfully.");
    }

    setShowForm(false);
    setEditingCustomer(null);
  }

  function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    setCustomers((previous) => previous.filter((c) => c.id !== customer.id));
    setMenuCustomer(null);
    setActiveCustomer(null);
    setToast("Customer deleted successfully.");
  }

  function exportCustomers() {
    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Email",
      "Membership",
      "Visits",
      "Points",
      "Total Spent",
      "Last Visit",
      "Status",
    ];

    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email,
      c.membership,
      c.visits,
      c.points,
      c.spent,
      c.lastVisit,
      c.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "kbc-customers.csv";
    link.click();

    URL.revokeObjectURL(url);
    setToast("Customer report exported.");
  }

  function contactCustomer(phone: string) {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
  }

  const loyaltyProgress = (points: number) =>
    Math.min((points / 3000) * 100, 100);

  return (
    <div className="min-h-screen bg-[#121414] px-4 py-6 text-[#f5f3e8] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#b4a96d]">
              <Users size={14} />
              Customer Relationship Management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Customers <span className="text-[#EFE8A8]">Management</span>
            </h1>

            <p className="mt-2 text-sm text-[#92948c]">
              Build stronger relationships and manage your salon community.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCustomers}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#d5d1c4] transition hover:border-[#EFE8A8]/30 hover:bg-white/[0.07]"
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e9dfa1] to-[#bca96b] px-5 py-3 text-sm font-semibold text-[#171812] shadow-lg shadow-[#bca96b]/10 transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <UserPlus size={17} />
              Add Customer
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={String(stats.total)}
            subtitle="Registered customer profiles"
            icon={Users}
            accent
          />
          <StatCard
            title="New Customers"
            value={String(stats.newCustomers)}
            subtitle="Customers with 0–1 visits"
            icon={UserPlus}
          />
          <StatCard
            title="Returning Customers"
            value={String(stats.returning)}
            subtitle="Customers with repeat visits"
            icon={TrendingUp}
          />
          <StatCard
            title="VIP Members"
            value={String(stats.vip)}
            subtitle="Premium salon customers"
            icon={Crown}
            accent
          />
        </div>

        {/* INSIGHT STRIP */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl border border-[#EFE8A8]/15 bg-gradient-to-r from-[#29291f] to-[#1c1f1b] p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#aaa48a]">
                Customer Lifetime Spending
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#EFE8A8]">
                {money(totalRevenue)}
              </h3>
              <p className="mt-1 text-xs text-[#96978e]">
                Total recorded spending
              </p>
            </div>
            <div className="rounded-xl border border-[#EFE8A8]/20 bg-[#EFE8A8]/10 p-3 text-[#EFE8A8]">
              <IndianRupee size={23} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#1b1f1d] p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#aaa48a]">
                Loyalty Points
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#f5f3e8]">
                {customers.reduce((sum, c) => sum + c.points, 0).toLocaleString("en-IN")}
              </h3>
              <p className="mt-1 text-xs text-[#96978e]">
                Points accumulated by customers
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[#d6c887]">
              <Gift size={23} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#1b1f1d] p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#aaa48a]">
                Average Customer Value
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#f5f3e8]">
                {money(stats.total ? totalRevenue / stats.total : 0)}
              </h3>
              <p className="mt-1 text-xs text-[#96978e]">
                Average spending per customer
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[#d6c887]">
              <Sparkles size={23} />
            </div>
          </div>
        </div>

        {/* CUSTOMER DIRECTORY */}
        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-semibold">Customer Directory</h2>
              <p className="mt-1 text-sm text-[#92948c]">
                Manage customer profiles, membership and loyalty information.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#898b83]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full rounded-xl border border-white/10 bg-[#1b1f1d] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#777970] focus:border-[#EFE8A8]/40 sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa48a]"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#1b1f1d] py-3 pl-9 pr-9 text-sm text-[#e5e1d5] outline-none focus:border-[#EFE8A8]/40 sm:w-40"
                >
                  <option value="All">All Members</option>
                  <option value="VIP">VIP</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="group relative overflow-hidden rounded-[22px] border border-[#EFE8A8]/10 bg-gradient-to-br from-[#252820] via-[#1c201d] to-[#171a18] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8A8]/35 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              >
                {/* Decorative corner */}
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-[#EFE8A8]/[0.06] transition-all duration-500 group-hover:scale-125 group-hover:border-[#EFE8A8]/15" />
                <div className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-bl from-[#EFE8A8]/[0.07] to-transparent" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EFE8A8]/25 bg-gradient-to-br from-[#e9dfa1]/20 to-[#8d8052]/10 text-lg font-semibold text-[#EFE8A8] shadow-inner">
                        {initials(customer.name)}
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#20231e] bg-[#78b88b]" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-[#f4f1e5]">
                          {customer.name}
                        </h3>
                        <p className="mt-1 text-[11px] tracking-wide text-[#92948c]">
                          {customer.id}
                        </p>
                        <div className="mt-2">
                          <MembershipBadge type={customer.membership} />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuCustomer(
                            menuCustomer === customer.id ? null : customer.id
                          )
                        }
                        className="rounded-lg p-2 text-[#9b9b90] transition hover:bg-white/10 hover:text-white"
                        aria-label="Customer options"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuCustomer === customer.id && (
                        <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#252923] p-1 shadow-2xl">
                          <button
                            onClick={() => {
                              setActiveCustomer(customer);
                              setMenuCustomer(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#dedbd0] hover:bg-white/10"
                          >
                            <Eye size={14} /> View profile
                          </button>
                          <button
                            onClick={() => openEditForm(customer)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#dedbd0] hover:bg-white/10"
                          >
                            <Pencil size={14} /> Edit customer
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="my-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#85877f]">
                        Total Visits
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {customer.visits}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#85877f]">
                        Total Spent
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#EFE8A8]">
                        {money(customer.spent)}
                      </p>
                    </div>
                  </div>

                  {/* Loyalty progress */}
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-[#b6b3a8]">
                        <Star size={13} className="text-[#EFE8A8]" />
                        Loyalty Points
                      </span>
                      <span className="text-xs font-semibold text-[#EFE8A8]">
                        {customer.points.toLocaleString("en-IN")} pts
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#bba86a] to-[#f0e6aa] transition-all"
                        style={{
                          width: `${loyaltyProgress(customer.points)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-[#81847b]">
                      {Math.max(0, 3000 - customer.points).toLocaleString("en-IN")} points to 3,000-point milestone
                    </p>
                  </div>

                  <div className="space-y-2.5 border-t border-white/[0.07] pt-4">
                    <div className="flex items-center gap-2 text-xs text-[#aaa99e]">
                      <Phone size={13} className="text-[#c7b978]" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#aaa99e]">
                      <Heart size={13} className="text-[#c7b978]" />
                      {customer.favoriteService || "No preferred service"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#aaa99e]">
                      <CalendarDays size={13} className="text-[#c7b978]" />
                      Last visit: {formatDate(customer.lastVisit)}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setActiveCustomer(customer)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#EFE8A8]/20 bg-[#EFE8A8]/[0.06] py-3 text-xs font-semibold text-[#EFE8A8] transition hover:bg-[#EFE8A8]/15"
                    >
                      <Eye size={14} />
                      View Profile
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => contactCustomer(customer.phone)}
                      className="flex items-center justify-center rounded-xl border border-[#70b98a]/20 bg-[#70b98a]/[0.08] px-4 text-[#81c99b] transition hover:bg-[#70b98a]/15"
                      title="Contact on WhatsApp"
                    >
                      <MessageCircle size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#1b1f1d] px-5 py-16 text-center">
              <UserRound size={35} className="mx-auto text-[#8e8c7d]" />
              <h3 className="mt-4 font-semibold text-[#e9e5d8]">
                No customers found
              </h3>
              <p className="mt-2 text-sm text-[#8b8d85]">
                Try another search or membership filter.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="mt-4 text-sm font-medium text-[#EFE8A8] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* CUSTOMER PROFILE MODAL */}
        {activeCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setActiveCustomer(null)}
          >
            <div
              className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#EFE8A8]/20 bg-[#1c201d] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#333225] to-[#20231e] p-6 sm:p-8">
                <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full border border-[#EFE8A8]/10" />

                <button
                  onClick={() => setActiveCustomer(null)}
                  className="absolute right-5 top-5 rounded-lg border border-white/10 p-2 text-[#c9c5b8] hover:bg-white/10"
                >
                  <X size={18} />
                </button>

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[#EFE8A8]/30 bg-[#EFE8A8]/10 text-2xl font-semibold text-[#EFE8A8]">
                    {initials(activeCustomer.name)}
                  </div>

                  <div>
                    <MembershipBadge type={activeCustomer.membership} />
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {activeCustomer.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#a6a497]">
                      Customer ID: {activeCustomer.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Total Visits",
                      value: String(activeCustomer.visits),
                    },
                    {
                      label: "Total Spent",
                      value: money(activeCustomer.spent),
                    },
                    {
                      label: "Loyalty Points",
                      value: activeCustomer.points.toLocaleString("en-IN"),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-[#92948c]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#EFE8A8]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <UserRound size={16} className="text-[#EFE8A8]" />
                    Contact Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-sm text-[#c2c0b5]">
                      <Phone size={16} className="text-[#c6b77c]" />
                      {activeCustomer.phone}
                    </div>
                    <div className="flex items-center gap-3 break-all text-sm text-[#c2c0b5]">
                      <Mail size={16} className="text-[#c6b77c]" />
                      {activeCustomer.email || "No email added"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#c2c0b5]">
                      <CalendarDays size={16} className="text-[#c6b77c]" />
                      Joined: {formatDate(activeCustomer.joined)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#c2c0b5]">
                      <Clock size={16} className="text-[#c6b77c]" />
                      Last visit: {formatDate(activeCustomer.lastVisit)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EFE8A8]/15 bg-[#EFE8A8]/[0.04] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#a9a58f]">
                        Loyalty Milestone
                      </p>
                      <h3 className="mt-1 font-semibold text-[#EFE8A8]">
                        {activeCustomer.points.toLocaleString("en-IN")} / 3,000 points
                      </h3>
                    </div>
                    <Gift size={23} className="text-[#EFE8A8]" />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#bba86a] to-[#f0e6aa]"
                      style={{
                        width: `${loyaltyProgress(activeCustomer.points)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#aaa796]">
                    {Math.max(0, 3000 - activeCustomer.points).toLocaleString("en-IN")} points remaining to reach the next milestone.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    Customer Insights
                  </h3>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-xs text-[#8f9188]">Favourite Service</p>
                    <p className="mt-1 text-sm font-medium text-[#e9e5d8]">
                      {activeCustomer.favoriteService || "Not specified"}
                    </p>
                    <div className="my-3 border-t border-white/[0.07]" />
                    <p className="text-xs text-[#8f9188]">Customer Notes</p>
                    <p className="mt-1 text-sm text-[#c6c2b6]">
                      {activeCustomer.notes || "No notes available."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const customer = activeCustomer;
                      setActiveCustomer(null);
                      openEditForm(customer);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#EFE8A8]/20 bg-[#EFE8A8]/10 px-4 py-3 text-sm font-semibold text-[#EFE8A8] hover:bg-[#EFE8A8]/15"
                  >
                    <Pencil size={15} /> Edit Profile
                  </button>
                  <button
                    onClick={() => contactCustomer(activeCustomer.phone)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#70b98a]/20 bg-[#70b98a]/10 px-4 py-3 text-sm font-semibold text-[#81c99b] hover:bg-[#70b98a]/15"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT CUSTOMER MODAL */}
        {showForm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <div
              className="my-auto w-full max-w-xl rounded-3xl border border-[#EFE8A8]/20 bg-[#1c201d] p-6 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#b9ad79]">
                    Customer Directory
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-white/10 p-2 text-[#b9b6aa] hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Customer Name *", key: "name", type: "text" },
                  { label: "Phone Number *", key: "phone", type: "tel" },
                  { label: "Email Address", key: "email", type: "email" },
                  { label: "Favourite Service", key: "favoriteService", type: "text" },
                  { label: "Total Visits", key: "visits", type: "number" },
                  { label: "Loyalty Points", key: "points", type: "number" },
                  { label: "Total Spent (₹)", key: "spent", type: "number" },
                ].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-xs font-medium text-[#b9b6aa]">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      min={field.type === "number" ? 0 : undefined}
                      value={String(formData[field.key as keyof Customer] ?? "")}
                      onChange={(e) =>
                        setFormData((previous) => ({
                          ...previous,
                          [field.key]:
                            field.type === "number"
                              ? Math.max(0, Number(e.target.value))
                              : e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#121512] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#70736a] focus:border-[#EFE8A8]/40"
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#b9b6aa]">
                    Membership
                  </span>
                  <select
                    value={formData.membership}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        membership: e.target.value as Membership,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#121512] px-4 py-3 text-sm text-white outline-none focus:border-[#EFE8A8]/40"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#b9b6aa]">
                    Customer Status
                  </span>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        status: e.target.value as Customer["status"],
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#121512] px-4 py-3 text-sm text-white outline-none focus:border-[#EFE8A8]/40"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-medium text-[#b9b6aa]">
                    Last Visit
                  </span>
                  <input
                    type="date"
                    value={formData.lastVisit}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        lastVisit: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#121512] px-4 py-3 text-sm text-white outline-none focus:border-[#EFE8A8]/40"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-medium text-[#b9b6aa]">
                    Customer Notes
                  </span>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Add customer preferences or notes..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#121512] px-4 py-3 text-sm text-white outline-none placeholder:text-[#70736a] focus:border-[#EFE8A8]/40"
                  />
                </label>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-[#c5c1b5] hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomer}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#e9dfa1] to-[#bca96b] px-4 py-3 text-sm font-semibold text-[#171812] transition hover:brightness-110"
                >
                  {editingCustomer ? "Save Changes" : "Add Customer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-xl border border-[#EFE8A8]/20 bg-[#252820] px-5 py-4 text-sm text-[#f1eddf] shadow-2xl">
            <CheckCircle2 size={18} className="shrink-0 text-[#EFE8A8]" />
            {toast}
          </div>
        )}

        <div className="border-t border-white/[0.07] pt-5 text-center text-xs text-[#73766e]">
          KBC Salon Academy · Customer Management
        </div>
      </div>
    </div>
  );
}
