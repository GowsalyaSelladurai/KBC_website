"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode, ElementType } from "react";
import {
  Activity,
  ArrowDownRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  IndianRupee,
  Package,
  RefreshCw,
  Scissors,
  Search,
  ShoppingBag,
  Target,
  TrendingUp,
  Users,
  X,
  XCircle,
  Award,
  Crown,
} from "lucide-react";

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------

type Appointment = {
  id?: string | number;
  customer?: string;
  service?: string;
  staff?: string;
  date?: string;
  time?: string;
  amount?: number | string;
  status?: string;
  durationMinutes?: number;
};

type StaffMember = {
  id?: string;
  name?: string;
  role?: string;
  type?: string;
  status?: string;
  attendance?: string;
  salary?: number;
};

type InventoryProduct = {
  id?: string;
  name?: string;
  category?: string;
  quantity?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  expiryDate?: string;
  minimumStock?: number;
};

type DateRange = "7" | "30" | "90" | "365" | "all" | "custom";

// ------------------------------------------------------
// CONSTANTS & HELPERS
// ------------------------------------------------------

const APPOINTMENTS_KEY = "kbc_appointments_v1";
const STAFF_KEY = "kbc_staff_members_v1";
const INVENTORY_KEY = "kbc_inventory_products_v1";

const GOLD = "#EFE8A8";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function amount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) return "—";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isCancelled(status = "") {
  return ["cancelled", "canceled", "rejected"].includes(
    status.trim().toLowerCase()
  );
}

function isCompleted(status = "") {
  return ["completed", "complete", "finished"].includes(
    status.trim().toLowerCase()
  );
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getLastMonths(count: number) {
  const result: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    result.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
    });
  }

  return result;
}

// ------------------------------------------------------
// REUSABLE UI
// ------------------------------------------------------

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`report-card gold-ambient-card rounded-2xl border border-[#34372F] bg-[#1B1F1D] ${className}`}
    >
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "gold",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
  color?: "gold" | "green" | "blue" | "red";
}) {
  const colors = {
    gold: {
      icon: "bg-[#EFE8A8]/10 text-[#EFE8A8]",
      glow: "from-[#EFE8A8]/15",
      line: "group-hover:border-[#EFE8A8]/50",
    },
    green: {
      icon: "bg-emerald-500/10 text-emerald-400",
      glow: "from-emerald-400/10",
      line: "group-hover:border-emerald-400/40",
    },
    blue: {
      icon: "bg-blue-500/10 text-blue-400",
      glow: "from-blue-400/10",
      line: "group-hover:border-blue-400/40",
    },
    red: {
      icon: "bg-red-500/10 text-red-400",
      glow: "from-red-400/10",
      line: "group-hover:border-red-400/40",
    },
  };

  const theme = colors[color];

  return (
    <div
      className={`report-kpi gold-ambient-card group relative isolate overflow-hidden rounded-2xl border border-[#45483A] bg-gradient-to-br ${theme.glow} via-[#20241F] to-[#151916] p-5 transition-all duration-300 ${theme.line}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-[#EFE8A8]/[0.08]" />
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#EFE8A8]/40 to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-[#A9A58A]">
            {title}
          </p>
          <h3 className="mt-3 break-words text-2xl font-semibold tracking-tight text-[#F4F0D5] sm:text-[27px]">
            {value}
          </h3>
          <p className="mt-2 text-[11px] leading-5 text-[#85877C]">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] shadow-inner ${theme.icon}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="relative mt-5 h-[2px] overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#EFE8A8]/70 to-transparent transition-all duration-500 group-hover:w-2/3" />
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ElementType;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="rounded-xl border border-[#EFE8A8]/10 bg-[#EFE8A8]/10 p-2.5 text-[#EFE8A8]">
        <Icon size={19} />
      </div>
      <div>
        <h2 className="font-semibold text-[#EFE8A8]">{title}</h2>
        <p className="mt-1 text-xs text-[#929487]">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-2xl border border-[#34372F] bg-[#151916] p-4">
        <BarChart3 size={30} className="text-[#A9A58A]" />
      </div>
      <p className="text-sm font-medium text-[#D5D2BD]">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-[#77796E]">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const completed = isCompleted(status);
  const cancelled = isCancelled(status);

  const style = completed
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
    : cancelled
      ? "border-red-500/20 bg-red-500/10 text-red-400"
      : "border-amber-500/20 bg-amber-500/10 text-amber-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// ------------------------------------------------------
// REVENUE BAR CHART
// ------------------------------------------------------

function RevenueChart({
  data,
}: {
  data: { key: string; label: string; revenue: number; bookings: number }[];
}) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-9">
        {[100, 75, 50, 25, 0].map((line) => (
          <div key={line} className="flex items-center gap-3">
            <span className="w-7 text-[9px] text-[#66695D]">{line}%</span>
            <div className="h-px flex-1 border-t border-dashed border-[#414438]/70" />
          </div>
        ))}
      </div>

      <div className="relative flex h-64 items-end gap-3 pl-9 sm:gap-5">
        {data.map((item) => {
          const height =
            item.revenue > 0
              ? Math.max((item.revenue / maxRevenue) * 100, 4)
              : 2;

          return (
            <div
              key={item.key}
              className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div className="pointer-events-none absolute bottom-[calc(100%-1px)] z-20 mb-2 hidden min-w-[125px] rounded-xl border border-[#EFE8A8]/20 bg-[#252920] px-3 py-2 text-center shadow-xl group-hover:block">
                <p className="text-[10px] text-[#A9A58A]">
                  {item.label} {item.key.slice(0, 4)}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#EFE8A8]">
                  {money(item.revenue)}
                </p>
                <p className="mt-1 text-[10px] text-[#929487]">
                  {item.bookings} completed bookings
                </p>
              </div>

              <div className="flex h-full w-full items-end justify-center">
                <div
                  className="relative w-full max-w-12 overflow-hidden rounded-t-lg border border-[#EFE8A8]/20 bg-gradient-to-t from-[#77734E] via-[#B8B184] to-[#F6F0BB] shadow-[0_0_18px_rgba(239,232,168,0.08)] transition-all duration-500 group-hover:brightness-125 group-hover:shadow-[0_0_22px_rgba(239,232,168,0.22)]"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-black/10" />
                </div>
              </div>

              <span className="mt-3 text-[10px] font-medium text-[#929487] sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// APPOINTMENT STATUS RING
// ------------------------------------------------------

function AppointmentStatusRing({
  completed,
  pending,
  cancelled,
  total,
}: {
  completed: number;
  pending: number;
  cancelled: number;
  total: number;
}) {
  const completedPercent = total ? (completed / total) * 100 : 0;
  const pendingPercent = total ? (pending / total) * 100 : 0;

  const completedEnd = completedPercent;
  const pendingEnd = completedPercent + pendingPercent;

  return (
    <div className="my-7 flex justify-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{
            background:
              total > 0
                ? `conic-gradient(
                    #DCD39A 0% ${completedEnd}%,
                    #D6A94E ${completedEnd}% ${pendingEnd}%,
                    #C96C64 ${pendingEnd}% 100%
                  )`
                : "#34372F",
          }}
        />

        <div className="absolute inset-[10px] rounded-full border border-white/[0.06] bg-[#1B1F1D] shadow-[inset_0_0_25px_rgba(0,0,0,0.35)]" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-4xl font-semibold tracking-tight text-[#EFE8A8]">
            {total}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#929487]">
            Total bookings
          </span>
          <div className="mt-3 h-px w-12 bg-gradient-to-r from-transparent via-[#EFE8A8]/50 to-transparent" />
          <span className="mt-2 text-xs font-medium text-emerald-300">
            {completedPercent.toFixed(1)}% completed
          </span>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_25px_rgba(239,232,168,0.08)]" />
      </div>
    </div>
  );
}

// ------------------------------------------------------
// RANKING CARD
// ------------------------------------------------------

function RankingCard({
  rank,
  name,
  detail,
  value,
  percentage,
  type = "service",
}: {
  rank: number;
  name: string;
  detail: string;
  value: string;
  percentage: number;
  type?: "service" | "staff";
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const rankStyle = isFirst
    ? "border-[#EFE8A8]/40 bg-gradient-to-br from-[#EFE8A8]/20 to-[#9E9564]/10 text-[#EFE8A8]"
    : isSecond
      ? "border-slate-300/20 bg-slate-300/10 text-slate-300"
      : isThird
        ? "border-amber-700/30 bg-amber-700/10 text-amber-500"
        : "border-[#34372F] bg-[#151916] text-[#A9A58A]";

  return (
    <div className="gold-ambient-card group rounded-xl border border-[#34372F] bg-[#151916] p-4 transition duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${rankStyle}`}
          >
            {isFirst ? <Crown size={17} /> : rank}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#E6E2CF]">
              {name}
            </p>
            <p className="mt-1 text-[11px] text-[#77796E]">{detail}</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-[#EFE8A8]">{value}</p>
          {type === "staff" && isFirst && (
            <span className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#EFE8A8]">
              <Award size={10} /> Top performer
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#34372F]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isFirst
              ? "bg-gradient-to-r from-[#9E9564] via-[#D6CE96] to-[#FFF5BD]"
              : "bg-gradient-to-r from-[#77734E] to-[#C9C18A]"
          }`}
          style={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }}
        />
      </div>
    </div>
  );
}

// ------------------------------------------------------
// MAIN PAGE
// ------------------------------------------------------

export default function ReportsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeSection, setActiveSection] = useState("Overview");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  // ------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------

  function refreshData() {
    const savedAppointments = readStorage<Appointment[]>(
      APPOINTMENTS_KEY,
      []
    );

    const savedStaff = readStorage<StaffMember[]>(STAFF_KEY, []);
    const savedProducts = readStorage<InventoryProduct[]>(
      INVENTORY_KEY,
      []
    );

    setAppointments(
      Array.isArray(savedAppointments) ? savedAppointments : []
    );
    setStaff(Array.isArray(savedStaff) ? savedStaff : []);
    setProducts(Array.isArray(savedProducts) ? savedProducts : []);
  }

  useEffect(() => {
    refreshData();

    const handleStorage = () => refreshData();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ------------------------------------------------------
  // DATE FILTER
  // ------------------------------------------------------

  const dateBounds = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (dateRange === "all") {
      return { start: null as Date | null, end: today };
    }

    if (dateRange === "custom") {
      return {
        start: customStart
          ? new Date(`${customStart}T00:00:00`)
          : null,
        end: customEnd
          ? new Date(`${customEnd}T23:59:59`)
          : today,
      };
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - Number(dateRange) + 1);

    return { start, end: today };
  }, [dateRange, customStart, customEnd]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (!appointment.date) return false;

      const date = new Date(`${appointment.date.slice(0, 10)}T12:00:00`);

      if (Number.isNaN(date.getTime())) return false;
      if (dateBounds.start && date < dateBounds.start) return false;
      if (dateBounds.end && date > dateBounds.end) return false;

      return true;
    });
  }, [appointments, dateBounds]);

  const validAppointments = filteredAppointments.filter(
    (appointment) => !isCancelled(appointment.status)
  );

  const completedAppointments = validAppointments.filter((appointment) =>
    isCompleted(appointment.status)
  );

  const totalRevenue = completedAppointments.reduce(
    (sum, appointment) => sum + amount(appointment.amount),
    0
  );

  const totalBookings = validAppointments.length;
  const completedCount = completedAppointments.length;

  const cancelledCount = filteredAppointments.filter((appointment) =>
    isCancelled(appointment.status)
  ).length;

  const pendingCount = filteredAppointments.filter((appointment) => {
    const status = (appointment.status ?? "").toLowerCase();

    return !isCancelled(status) && !isCompleted(status);
  }).length;

  const averageBooking =
    completedCount > 0 ? totalRevenue / completedCount : 0;

  const completionRate =
    totalBookings > 0
      ? (completedCount / totalBookings) * 100
      : 0;

  // ------------------------------------------------------
  // MONTHLY REVENUE
  // ------------------------------------------------------

  const monthlyData = useMemo(() => {
    const months = getLastMonths(6);

    return months.map((month) => {
      const monthAppointments = appointments.filter((appointment) => {
        if (!appointment.date || !isCompleted(appointment.status)) {
          return false;
        }

        return appointment.date.slice(0, 7) === month.key;
      });

      return {
        ...month,
        revenue: monthAppointments.reduce(
          (sum, appointment) => sum + amount(appointment.amount),
          0
        ),
        bookings: monthAppointments.length,
      };
    });
  }, [appointments]);

  const maxRevenue = Math.max(
    ...monthlyData.map((item) => item.revenue),
    1
  );

  // ------------------------------------------------------
  // SERVICE PERFORMANCE
  // ------------------------------------------------------

  const serviceData = useMemo(() => {
    const serviceMap = new Map<
      string,
      { name: string; bookings: number; revenue: number }
    >();

    completedAppointments.forEach((appointment) => {
      const name = appointment.service?.trim() || "Unspecified service";
      const existing = serviceMap.get(name) ?? {
        name,
        bookings: 0,
        revenue: 0,
      };

      existing.bookings += 1;
      existing.revenue += amount(appointment.amount);
      serviceMap.set(name, existing);
    });

    return Array.from(serviceMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }, [completedAppointments]);

  const maxServiceRevenue = Math.max(
    ...serviceData.map((item) => item.revenue),
    1
  );

  // ------------------------------------------------------
  // STAFF PERFORMANCE
  // ------------------------------------------------------

  const staffPerformance = useMemo(() => {
    const staffMap = new Map<
      string,
      { name: string; appointments: number; revenue: number }
    >();

    completedAppointments.forEach((appointment) => {
      const name = appointment.staff?.trim();
      if (!name) return;

      const existing = staffMap.get(name) ?? {
        name,
        appointments: 0,
        revenue: 0,
      };

      existing.appointments += 1;
      existing.revenue += amount(appointment.amount);
      staffMap.set(name, existing);
    });

    return Array.from(staffMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }, [completedAppointments]);

  const maxStaffRevenue = Math.max(
    ...staffPerformance.map((item) => item.revenue),
    1
  );

  // ------------------------------------------------------
  // INVENTORY INSIGHTS
  // ------------------------------------------------------

  const totalProducts = products.length;

  const totalStockUnits = products.reduce(
    (sum, product) => sum + Math.max(0, amount(product.quantity)),
    0
  );

  const inventoryPurchaseValue = products.reduce(
    (sum, product) =>
      sum +
      Math.max(0, amount(product.quantity)) *
        Math.max(0, amount(product.purchasePrice)),
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      amount(product.quantity) > 0 &&
      amount(product.quantity) <= amount(product.minimumStock)
  ).length;

  const outOfStockCount = products.filter(
    (product) => amount(product.quantity) <= 0
  ).length;

  const expiredCount = products.filter((product) => {
    if (!product.expiryDate) return false;

    const expiry = new Date(`${product.expiryDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return !Number.isNaN(expiry.getTime()) && expiry < today;
  }).length;

  // ------------------------------------------------------
  // APPOINTMENT STATUS
  // ------------------------------------------------------

  const statusData = [
    {
      name: "Completed",
      count: completedCount,
      color: "bg-emerald-400",
      text: "text-emerald-400",
    },
    {
      name: "Pending / Other",
      count: pendingCount,
      color: "bg-amber-400",
      text: "text-amber-300",
    },
    {
      name: "Cancelled",
      count: cancelledCount,
      color: "bg-red-400",
      text: "text-red-400",
    },
  ];

  const statusTotal = filteredAppointments.length;

  // ------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------

  const recentAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...filteredAppointments]
      .filter((appointment) => {
        if (!query) return true;

        return [
          appointment.customer,
          appointment.service,
          appointment.staff,
          appointment.status,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 10);
  }, [filteredAppointments, search]);

  // ------------------------------------------------------
  // EXPORTS
  // ------------------------------------------------------

  function exportAppointments() {
    const rows: (string | number)[][] = [
      ["Date", "Time", "Customer", "Service", "Staff", "Status", "Amount"],
      ...filteredAppointments.map((item) => [
        item.date ?? "",
        item.time ?? "",
        item.customer ?? "",
        item.service ?? "",
        item.staff ?? "",
        item.status ?? "",
        amount(item.amount),
      ]),
    ];

    downloadCSV("kbc-appointment-report.csv", rows);
    setToast("Appointment report exported.");
  }

  function exportRevenue() {
    const rows: (string | number)[][] = [
      ["Month", "Completed Appointments", "Revenue"],
      ...monthlyData.map((item) => [
        item.key,
        item.bookings,
        item.revenue,
      ]),
    ];

    downloadCSV("kbc-revenue-report.csv", rows);
    setToast("Revenue report exported.");
  }

  function exportStaff() {
    const rows: (string | number)[][] = [
      ["Staff Name", "Completed Appointments", "Revenue"],
      ...staffPerformance.map((item) => [
        item.name,
        item.appointments,
        item.revenue,
      ]),
    ];

    downloadCSV("kbc-staff-performance-report.csv", rows);
    setToast("Staff report exported.");
  }

  function exportInventory() {
    const rows: (string | number)[][] = [
      [
        "Product",
        "Category",
        "Quantity",
        "Minimum Stock",
        "Purchase Price",
        "Selling Price",
        "Stock Value",
        "Expiry Date",
      ],
      ...products.map((product) => [
        product.name ?? "",
        product.category ?? "",
        amount(product.quantity),
        amount(product.minimumStock),
        amount(product.purchasePrice),
        amount(product.sellingPrice),
        amount(product.quantity) * amount(product.purchasePrice),
        product.expiryDate ?? "",
      ]),
    ];

    downloadCSV("kbc-inventory-report.csv", rows);
    setToast("Inventory report exported.");
  }

  // ------------------------------------------------------
  // PAGE
  // ------------------------------------------------------

  const sections = [
    "Overview",
    "Revenue",
    "Appointments",
    "Staff",
    "Inventory",
  ];

  const dateOptions = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
    { label: "12M", value: "365" },
    { label: "All", value: "all" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <main className="min-h-screen bg-[#121414] px-4 py-6 text-[#F4F0D5] sm:px-6 lg:px-8">
      <style jsx global>{`
        @keyframes reportFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .report-fade {
          animation: reportFade 0.35s ease both;
        }

        .report-card {
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.12);
        }

        .report-kpi {
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        /* ==========================================
           SOFT GOLDEN AMBIENT HOVER GLOW
        ========================================== */

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

        .report-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .report-scroll::-webkit-scrollbar-thumb {
          background: #555744;
          border-radius: 20px;
        }

        .report-date-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.65;
          filter: invert(0.85) sepia(0.3);
        }

        .report-table tbody tr {
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }

        .report-table tbody tr:hover {
          background: rgba(239, 232, 168, 0.045);
          box-shadow: inset 2px 0 0 #c9c18a;
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

      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* HEADER */}

        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#A9A58A]">
              <Activity size={14} />
              KBC Salon Academy
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#EFE8A8] sm:text-3xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-sm text-[#929487]">
              Understand your salon performance with business insights and reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                refreshData();
                setToast("Reports refreshed from saved browser data.");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#45483A] bg-[#1B1F1D] px-4 py-3 text-sm text-[#D5D2BD] transition hover:border-[#EFE8A8]/30 hover:bg-[#252920]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={exportAppointments}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9C18A] px-5 py-3 text-sm font-semibold text-[#171916] shadow-[0_5px_20px_rgba(239,232,168,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(239,232,168,0.2)]"
            >
              <Download size={17} />
              Export Report
            </button>
          </div>
        </header>

        {/* COMPACT FILTER BAR */}

        <Card className="p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#EFE8A8]/15 bg-[#EFE8A8]/10 p-2.5 text-[#EFE8A8]">
                <Filter size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#E6E2CF]">
                  Reporting period
                </p>
                <p className="mt-0.5 text-[11px] text-[#77796E]">
                  Choose the date range for your reports
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#34372F] bg-[#121614] p-1.5">
              {dateOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setDateRange(item.value as DateRange)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    dateRange === item.value
                      ? "bg-gradient-to-r from-[#EFE8A8] to-[#C9C18A] text-[#171916] shadow-md"
                      : "text-[#929487] hover:bg-white/[0.04] hover:text-[#EFE8A8]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="mt-4 grid gap-3 border-t border-[#34372F] pt-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs text-[#A9A58A]">
                Start date
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="report-date-input w-full rounded-xl border border-[#3A3D34] bg-[#121614] px-3 py-3 text-sm text-[#F4F0D5] outline-none transition focus:border-[#EFE8A8]/60"
                />
              </label>

              <label className="space-y-2 text-xs text-[#A9A58A]">
                End date
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="report-date-input w-full rounded-xl border border-[#3A3D34] bg-[#121614] px-3 py-3 text-sm text-[#F4F0D5] outline-none transition focus:border-[#EFE8A8]/60"
                />
              </label>
            </div>
          )}
        </Card>

        {/* SECTION NAVIGATION */}

        <div className="report-scroll overflow-x-auto border-b border-[#34372F]">
          <div className="flex min-w-max gap-2">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`relative px-4 py-3 text-sm transition ${
                  activeSection === section
                    ? "font-semibold text-[#EFE8A8]"
                    : "text-[#929487] hover:text-[#E5E0C5]"
                }`}
              >
                {section}

                {activeSection === section && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#EFE8A8] shadow-[0_0_10px_rgba(239,232,168,0.45)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================= */}
        {/* OVERVIEW */}
        {/* ============================================= */}

        {activeSection === "Overview" && (
          <div className="report-fade space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value={money(totalRevenue)}
                subtitle="Completed appointments in selected period"
                icon={IndianRupee}
                color="green"
              />

              <StatCard
                title="Total Appointments"
                value={String(totalBookings)}
                subtitle="Non-cancelled bookings"
                icon={CalendarDays}
                color="blue"
              />

              <StatCard
                title="Completed Appointments"
                value={String(completedCount)}
                subtitle={`${completionRate.toFixed(1)}% completion rate`}
                icon={CheckCircle2}
                color="green"
              />

              <StatCard
                title="Average Booking Value"
                value={money(averageBooking)}
                subtitle="Revenue per completed appointment"
                icon={Target}
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <Card className="p-5 xl:col-span-2">
                <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-[#EFE8A8]" />
                      <h2 className="font-semibold text-[#EFE8A8]">
                        Revenue Overview
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-[#929487]">
                      Monthly revenue from completed appointments
                    </p>
                  </div>

                  <button
                    onClick={exportRevenue}
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-[#45483A] px-3 py-2 text-xs text-[#D5D2BD] transition hover:border-[#EFE8A8]/30 hover:bg-white/5"
                  >
                    <Download size={14} />
                    Export
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <EmptyState
                    title="No appointment data yet"
                    description="Create appointments and mark them completed to see revenue trends."
                  />
                ) : (
                  <>
                    <RevenueChart data={monthlyData} />

                    <div className="mt-5 flex items-center justify-between border-t border-[#34372F] pt-4 text-xs text-[#929487]">
                      <span>Last 6 months</span>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#EFE8A8]" />
                        Completed revenue
                      </span>
                    </div>
                  </>
                )}
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-[#EFE8A8]" />
                  <h2 className="font-semibold text-[#EFE8A8]">
                    Appointment Status
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#929487]">
                  Booking status breakdown
                </p>

                <AppointmentStatusRing
                  completed={completedCount}
                  pending={pendingCount}
                  cancelled={cancelledCount}
                  total={statusTotal}
                />

                <div className="space-y-3">
                  {statusData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg border border-[#34372F]/70 bg-[#151916] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <span className="text-xs text-[#C9C6B7]">
                          {item.name}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${item.text}`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Staff Members"
                value={String(staff.length)}
                subtitle="Saved staff records"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Inventory Products"
                value={String(totalProducts)}
                subtitle={`${totalStockUnits} total units`}
                icon={Package}
              />
              <StatCard
                title="Low Stock Products"
                value={String(lowStockCount)}
                subtitle={`${outOfStockCount} out of stock`}
                icon={ShoppingBag}
                color="red"
              />
              <StatCard
                title="Inventory Purchase Value"
                value={money(inventoryPurchaseValue)}
                subtitle={`${expiredCount} expired products`}
                icon={IndianRupee}
                color="green"
              />
            </div>

            <Card className="p-5">
              <SectionHeading
                title="Top Performing Services"
                description="Ranked by completed appointment revenue"
                icon={Scissors}
              />

              {serviceData.length === 0 ? (
                <EmptyState
                  title="No completed service records"
                  description="Completed appointments with service names will appear here."
                />
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {serviceData.slice(0, 6).map((service, index) => (
                    <RankingCard
                      key={service.name}
                      rank={index + 1}
                      name={service.name}
                      detail={`${service.bookings} completed bookings`}
                      value={money(service.revenue)}
                      percentage={(service.revenue / maxServiceRevenue) * 100}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================================= */}
        {/* REVENUE SECTION */}
        {/* ============================================= */}

        {activeSection === "Revenue" && (
          <div className="report-fade space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Completed Revenue"
                value={money(totalRevenue)}
                subtitle="Selected reporting period"
                icon={IndianRupee}
                color="green"
              />
              <StatCard
                title="Average Booking"
                value={money(averageBooking)}
                subtitle="Per completed appointment"
                icon={Target}
                color="blue"
              />
              <StatCard
                title="Completed Bookings"
                value={String(completedCount)}
                subtitle="Revenue-generating appointments"
                icon={CheckCircle2}
                color="green"
              />
            </div>

            <Card className="p-5">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <SectionHeading
                  title="Monthly Revenue Trend"
                  description="Revenue grouped by calendar month"
                  icon={TrendingUp}
                />

                <button
                  onClick={exportRevenue}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-[#45483A] px-3 py-2 text-xs text-[#EFE8A8] transition hover:bg-white/5"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>

              <RevenueChart data={monthlyData} />

              <div className="mt-5 grid gap-3 border-t border-[#34372F] pt-4 sm:grid-cols-3">
                <div className="gold-ambient-card rounded-xl bg-[#151916] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#77796E]">
                    Total revenue
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#EFE8A8]">
                    {money(monthlyData.reduce((sum, item) => sum + item.revenue, 0))}
                  </p>
                </div>
                <div className="gold-ambient-card rounded-xl bg-[#151916] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#77796E]">
                    Completed bookings
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#E6E2CF]">
                    {monthlyData.reduce((sum, item) => sum + item.bookings, 0)}
                  </p>
                </div>
                <div className="gold-ambient-card rounded-xl bg-[#151916] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#77796E]">
                    Monthly average
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#E6E2CF]">
                    {money(
                      monthlyData.reduce((sum, item) => sum + item.revenue, 0) /
                        Math.max(monthlyData.length, 1)
                    )}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeading
                title="Revenue by Service"
                description="Completed appointment revenue grouped by service"
                icon={Scissors}
              />

              {serviceData.length === 0 ? (
                <EmptyState
                  title="No revenue breakdown available"
                  description="Complete appointments with service and amount information to populate this report."
                />
              ) : (
                <div className="report-scroll overflow-x-auto">
                  <table className="report-table w-full min-w-[500px] text-left text-sm">
                    <thead className="border-b border-[#34372F] text-[10px] uppercase tracking-wider text-[#929487]">
                      <tr>
                        <th className="px-4 pb-4 font-medium">Service</th>
                        <th className="px-4 pb-4 font-medium">Bookings</th>
                        <th className="px-4 pb-4 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceData.map((service, index) => (
                        <tr
                          key={service.name}
                          className="border-b border-[#34372F]/70 last:border-0"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFE8A8]/10 text-xs font-semibold text-[#EFE8A8]">
                                {index + 1}
                              </span>
                              <span className="font-medium text-[#E6E2CF]">
                                {service.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[#A9A58A]">
                            {service.bookings}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-[#EFE8A8]">
                            {money(service.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================================= */}
        {/* APPOINTMENTS SECTION */}
        {/* ============================================= */}

        {activeSection === "Appointments" && (
          <div className="report-fade space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Bookings"
                value={String(filteredAppointments.length)}
                subtitle="Selected date range"
                icon={CalendarDays}
                color="blue"
              />
              <StatCard
                title="Completed"
                value={String(completedCount)}
                subtitle="Successfully completed"
                icon={CheckCircle2}
                color="green"
              />
              <StatCard
                title="Pending / Other"
                value={String(pendingCount)}
                subtitle="Not completed or cancelled"
                icon={Clock}
              />
              <StatCard
                title="Cancelled"
                value={String(cancelledCount)}
                subtitle="Cancelled or rejected bookings"
                icon={XCircle}
                color="red"
              />
            </div>

            <Card className="overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b border-[#34372F] p-5 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-semibold text-[#EFE8A8]">
                    Appointment Report
                  </h2>
                  <p className="mt-1 text-xs text-[#929487]">
                    {filteredAppointments.length} appointments in selected period
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-0 flex-1 sm:min-w-56">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77796E]"
                      size={16}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search appointments..."
                      className="w-full rounded-xl border border-[#3A3D34] bg-[#121614] py-2.5 pl-9 pr-3 text-sm text-[#F4F0D5] outline-none transition focus:border-[#EFE8A8]/50"
                    />
                  </div>

                  <button
                    onClick={exportAppointments}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#45483A] px-3 py-2.5 text-xs text-[#EFE8A8] transition hover:bg-white/5"
                  >
                    <Download size={14} />
                    Export
                  </button>
                </div>
              </div>

              {recentAppointments.length === 0 ? (
                <EmptyState
                  title="No appointments found"
                  description="Appointments matching the selected date range and search will appear here."
                />
              ) : (
                <div className="report-scroll overflow-x-auto">
                  <table className="report-table w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-[#151916] text-[10px] uppercase tracking-wider text-[#929487]">
                      <tr>
                        <th className="px-5 py-4 font-medium">Customer</th>
                        <th className="px-4 py-4 font-medium">Service</th>
                        <th className="px-4 py-4 font-medium">Staff</th>
                        <th className="px-4 py-4 font-medium">Date</th>
                        <th className="px-4 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map((appointment, index) => {
                        const status = appointment.status ?? "Unknown";

                        return (
                          <tr
                            key={appointment.id ?? `${appointment.date}-${index}`}
                            className="border-t border-[#34372F]/70"
                          >
                            <td className="px-5 py-4">
                              <p className="font-medium text-[#E6E2CF]">
                                {appointment.customer || "Unnamed customer"}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-[#C9C6B7]">
                              {appointment.service || "—"}
                            </td>
                            <td className="px-4 py-4 text-[#A9A58A]">
                              {appointment.staff || "Unassigned"}
                            </td>
                            <td className="px-4 py-4 text-xs text-[#A9A58A]">
                              {formatDate(appointment.date ?? "")}
                              {appointment.time && (
                                <span className="ml-1">{appointment.time}</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-5 py-4 text-right font-semibold text-[#EFE8A8]">
                              {money(amount(appointment.amount))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================================= */}
        {/* STAFF SECTION */}
        {/* ============================================= */}

        {activeSection === "Staff" && (
          <div className="report-fade space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Total Staff"
                value={String(staff.length)}
                subtitle="Saved staff and instructor records"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Active Staff"
                value={String(staff.filter((member) => member.status !== "Inactive").length)}
                subtitle="Not marked inactive"
                icon={CheckCircle2}
                color="green"
              />
              <StatCard
                title="Staff With Completed Bookings"
                value={String(staffPerformance.length)}
                subtitle="Matched by appointment staff name"
                icon={TrendingUp}
              />
            </div>

            <Card className="p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <SectionHeading
                  title="Staff Performance Leaderboard"
                  description="Ranked by completed appointment revenue"
                  icon={Award}
                />

                <button
                  onClick={exportStaff}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-[#45483A] px-3 py-2 text-xs text-[#EFE8A8] transition hover:bg-white/5"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>

              {staffPerformance.length === 0 ? (
                <EmptyState
                  title="No staff performance data yet"
                  description="Completed appointments with an assigned staff member will appear here."
                />
              ) : (
                <>
                  <div className="mb-5 grid gap-3 md:grid-cols-3">
                    {staffPerformance.slice(0, 3).map((member, index) => {
                      const rank = index + 1;
                      const topStyles = [
                        "border-[#EFE8A8]/35 bg-gradient-to-br from-[#EFE8A8]/15 to-[#1B1F1D]",
                        "border-slate-300/20 bg-gradient-to-br from-slate-300/[0.08] to-[#1B1F1D]",
                        "border-amber-700/25 bg-gradient-to-br from-amber-700/[0.08] to-[#1B1F1D]",
                      ];

                      return (
                        <div
                          key={member.name}
                          className={`gold-ambient-card relative overflow-hidden rounded-2xl border p-5 transition duration-300 ${topStyles[index]}`}
                        >
                          <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-[#EFE8A8]/[0.05] blur-2xl" />

                          <div className="relative flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[#929487]">
                              Rank 0{rank}
                            </span>
                            {rank === 1 ? (
                              <Crown size={20} className="text-[#EFE8A8]" />
                            ) : (
                              <Award
                                size={19}
                                className={rank === 2 ? "text-slate-300" : "text-amber-500"}
                              />
                            )}
                          </div>

                          <div className="relative mt-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#EFE8A8]/20 bg-[#EFE8A8]/10 text-lg font-semibold text-[#EFE8A8]">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#F4F0D5]">
                                {member.name}
                              </p>
                              <p className="mt-1 text-[11px] text-[#929487]">
                                {member.appointments} completed appointments
                              </p>
                            </div>
                          </div>

                          <div className="relative mt-5 border-t border-white/[0.07] pt-4">
                            <p className="text-[10px] uppercase tracking-wider text-[#929487]">
                              Generated revenue
                            </p>
                            <p className="mt-1 text-xl font-semibold text-[#EFE8A8]">
                              {money(member.revenue)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#929487]">
                      Complete leaderboard
                    </p>

                    {staffPerformance.map((member, index) => (
                      <RankingCard
                        key={member.name}
                        rank={index + 1}
                        name={member.name}
                        detail={`${member.appointments} completed appointments`}
                        value={money(member.revenue)}
                        percentage={(member.revenue / maxStaffRevenue) * 100}
                        type="staff"
                      />
                    ))}
                  </div>
                </>
              )}
            </Card>

            <Card className="p-5">
              <SectionHeading
                title="Staff Directory Summary"
                description="Staff records currently saved in your staff module"
                icon={Users}
              />

              {staff.length === 0 ? (
                <EmptyState
                  title="No staff records available"
                  description="Add staff members in Staff & Instructors to see them in this report."
                />
              ) : (
                <div className="report-scroll overflow-x-auto">
                  <table className="report-table w-full min-w-[550px] text-left text-sm">
                    <thead className="border-b border-[#34372F] text-[10px] uppercase tracking-wider text-[#929487]">
                      <tr>
                        <th className="px-4 pb-4 font-medium">Name</th>
                        <th className="px-4 pb-4 font-medium">Role</th>
                        <th className="px-4 pb-4 font-medium">Type</th>
                        <th className="px-4 pb-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member, index) => (
                        <tr
                          key={member.id ?? `${member.name}-${index}`}
                          className="border-b border-[#34372F]/70 last:border-0"
                        >
                          <td className="px-4 py-4 font-medium text-[#E6E2CF]">
                            {member.name || "Unnamed member"}
                          </td>
                          <td className="px-4 py-4 text-[#A9A58A]">
                            {member.role || "—"}
                          </td>
                          <td className="px-4 py-4 text-[#A9A58A]">
                            {member.type || "Staff"}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              status={
                                member.status === "Inactive" ? "Inactive" : "Active"
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================================= */}
        {/* INVENTORY SECTION */}
        {/* ============================================= */}

        {activeSection === "Inventory" && (
          <div className="report-fade space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Products"
                value={String(totalProducts)}
                subtitle="Products in inventory"
                icon={Package}
              />
              <StatCard
                title="Total Stock Units"
                value={String(totalStockUnits)}
                subtitle="Combined quantity"
                icon={ShoppingBag}
                color="blue"
              />
              <StatCard
                title="Low Stock"
                value={String(lowStockCount)}
                subtitle={`${outOfStockCount} out of stock`}
                icon={ArrowDownRight}
                color="red"
              />
              <StatCard
                title="Purchase Value"
                value={money(inventoryPurchaseValue)}
                subtitle="Current inventory cost"
                icon={IndianRupee}
                color="green"
              />
            </div>

            <Card className="p-5">
              <SectionHeading
                title="Inventory Health"
                description="Stock levels based on your saved inventory products"
                icon={Package}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Healthy Stock",
                    count: products.filter(
                      (product) =>
                        amount(product.quantity) > amount(product.minimumStock)
                    ).length,
                    color: "text-emerald-400",
                    bar: "bg-emerald-400",
                  },
                  {
                    title: "Low Stock",
                    count: lowStockCount,
                    color: "text-amber-300",
                    bar: "bg-amber-400",
                  },
                  {
                    title: "Out of Stock",
                    count: outOfStockCount,
                    color: "text-red-400",
                    bar: "bg-red-400",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="gold-ambient-card rounded-xl border border-[#34372F] bg-[#151916] p-4 transition"
                  >
                    <p className="text-xs text-[#929487]">{item.title}</p>
                    <p className={`mt-2 text-2xl font-semibold ${item.color}`}>
                      {item.count}
                    </p>
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#34372F]">
                      <div
                        className={`h-full rounded-full ${item.bar}`}
                        style={{
                          width: `${
                            totalProducts > 0
                              ? (item.count / totalProducts) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <SectionHeading
                  title="Inventory Product Report"
                  description="Product stock and valuation details"
                  icon={FileSpreadsheet}
                />

                <button
                  onClick={exportInventory}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-[#45483A] px-3 py-2 text-xs text-[#EFE8A8] transition hover:bg-white/5"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>

              {products.length === 0 ? (
                <EmptyState
                  title="No inventory data available"
                  description="Add products in Inventory & Products to see stock insights and valuation."
                />
              ) : (
                <div className="report-scroll overflow-x-auto">
                  <table className="report-table w-full min-w-[650px] text-left text-sm">
                    <thead className="border-b border-[#34372F] text-[10px] uppercase tracking-wider text-[#929487]">
                      <tr>
                        <th className="px-4 pb-4 font-medium">Product</th>
                        <th className="px-4 pb-4 font-medium">Category</th>
                        <th className="px-4 pb-4 font-medium">Quantity</th>
                        <th className="px-4 pb-4 font-medium">Purchase Value</th>
                        <th className="px-4 pb-4 font-medium">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => {
                        const expired = product.expiryDate
                          ? new Date(`${product.expiryDate}T00:00:00`) <
                            new Date(new Date().setHours(0, 0, 0, 0))
                          : false;

                        const quantity = amount(product.quantity);
                        const isOut = quantity <= 0;
                        const isLow =
                          quantity > 0 &&
                          quantity <= amount(product.minimumStock);

                        return (
                          <tr
                            key={product.id ?? `${product.name}-${index}`}
                            className="border-b border-[#34372F]/70 last:border-0"
                          >
                            <td className="px-4 py-4 font-medium text-[#E6E2CF]">
                              {product.name || "Unnamed product"}
                            </td>
                            <td className="px-4 py-4 text-[#A9A58A]">
                              {product.category || "—"}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full border px-3 py-1 text-[11px] ${
                                  isOut
                                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                                    : isLow
                                      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                }`}
                              >
                                {quantity}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-medium text-[#EFE8A8]">
                              {money(
                                quantity * amount(product.purchasePrice)
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {expired ? (
                                <span className="text-xs font-medium text-red-400">
                                  Expired
                                </span>
                              ) : (
                                <span className="text-xs text-[#A9A58A]">
                                  {formatDate(product.expiryDate || "")}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* FOOTER */}

        <div className="flex flex-col justify-between gap-2 border-t border-[#34372F] pt-4 text-xs text-[#77796E] sm:flex-row">
          <span>KBC Salon Academy · Reports & Analytics</span>
          <span>
            Reports are calculated from saved browser records. Revenue includes completed appointments only.
          </span>
        </div>
      </div>

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-xl border border-[#EFE8A8]/30 bg-[#242822] px-5 py-4 text-sm text-[#EFE8A8] shadow-2xl">
          <CheckCircle2 size={18} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </main>
  );
}