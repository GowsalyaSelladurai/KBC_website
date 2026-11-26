
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  X,
  Trash2,
  Download,
  IndianRupee,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  ChartColumnIncreasing,
  Filter,
  PiggyBank,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react";

type Appointment = {
  id: string;
  customer: string;
  service: string;
  staff: string;
  date: string;
  amount: number;
  status: string;
};

type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
};

type ExpenseDraft = Omit<Expense, "id">;

const APPOINTMENT_KEY = "kbc_appointments_v1";
const EXPENSE_KEY = "kbc_revenue_expenses_v1";

const expenseCategories = [
  "Salary",
  "Rent",
  "Products & Supplies",
  "Electricity",
  "Marketing",
  "Maintenance",
  "Other",
];

const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer"];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value: string) => {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const emptyDraft: ExpenseDraft = {
  title: "",
  category: "Products & Supplies",
  amount: 0,
  date: dateKey(new Date()),
  paymentMethod: "UPI",
  notes: "",
};

export default function RevenuePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [period, setPeriod] = useState("This Month");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<ExpenseDraft>(emptyDraft);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    try {
      const savedAppointments = localStorage.getItem(APPOINTMENT_KEY);
      const savedExpenses = localStorage.getItem(EXPENSE_KEY);

      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      }

      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error("Unable to load financial data:", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, loaded]);

  const completedAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status?.toLowerCase() === "completed"
      ),
    [appointments]
  );

  const getRange = () => {
    const now = new Date();
    const today = dateKey(now);

    if (period === "Today") {
      return { start: today, end: today };
    }

    if (period === "This Week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return { start: dateKey(start), end: dateKey(end) };
    }

    if (period === "This Year") {
      return {
        start: `${now.getFullYear()}-01-01`,
        end: `${now.getFullYear()}-12-31`,
      };
    }

    if (period === "All Time") {
      return { start: "0000-01-01", end: "9999-12-31" };
    }

    return {
      start: dateKey(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  };

  const range = getRange();

  const filteredIncome = useMemo(
    () =>
      completedAppointments.filter(
        (appointment) =>
          appointment.date >= range.start &&
          appointment.date <= range.end
      ),
    [completedAppointments, range.start, range.end]
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          expense.date >= range.start &&
          expense.date <= range.end
      ),
    [expenses, range.start, range.end]
  );

  const totalRevenue = filteredIncome.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const netIncome = totalRevenue - totalExpenses;

  const totalBookings = filteredIncome.length;

  const averageBooking =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const transactions = useMemo(() => {
    const incomeTransactions = filteredIncome.map((item) => ({
      id: item.id,
      title: item.service || "Salon Service",
      customer: item.customer || "Customer",
      date: item.date,
      amount: Number(item.amount || 0),
      type: "Income" as const,
      method: "Appointment",
      category: "Service Revenue",
    }));

    const expenseTransactions = filteredExpenses.map((item) => ({
      id: item.id,
      title: item.title,
      customer: item.category,
      date: item.date,
      amount: Number(item.amount || 0),
      type: "Expense" as const,
      method: item.paymentMethod,
      category: item.category,
    }));

    return [...incomeTransactions, ...expenseTransactions].sort(
      (a, b) => b.date.localeCompare(a.date)
    );
  }, [filteredIncome, filteredExpenses]);

  const visibleTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      item.type === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const weeklyData = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);

    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);

      const key = dateKey(current);

      const income = completedAppointments
        .filter((item) => item.date === key)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const expense = expenses
        .filter((item) => item.date === key)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return {
        day: current.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        income,
        expense,
      };
    });
  }, [completedAppointments, expenses]);

  const maxChartValue = Math.max(
    1,
    ...weeklyData.map((item) => Math.max(item.income, item.expense))
  );

  const serviceBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredIncome.forEach((item) => {
      const service = item.service || "Other Services";
      totals[service] =
        (totals[service] || 0) + Number(item.amount || 0);
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredIncome]);

  const topService = serviceBreakdown[0];

  const saveExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.title.trim() || draft.amount <= 0 || !draft.date) {
      alert("Please enter a valid expense name, amount and date.");
      return;
    }

    const newExpense: Expense = {
      ...draft,
      id: `expense_${Date.now()}`,
    };

    setExpenses((previous) => [newExpense, ...previous]);
    setDraft(emptyDraft);
    setModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Payment", "Amount"],
      ...visibleTransactions.map((item) => [
        item.date,
        item.title,
        item.category,
        item.type,
        item.method,
        item.amount.toString(),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kbc-revenue-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const cardClass =
    "rounded-2xl border border-[#343832] bg-[#1B1F1D] p-5";

  const inputClass =
    "w-full rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm text-white outline-none transition focus:border-[#D9D19A]";

  const labelClass =
    "mb-2 block text-xs font-medium uppercase tracking-wider text-[#A9ACA2]";

  return (
    <main className="min-h-screen bg-[#121414] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#D9D19A]">
              <Sparkles size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Financial Management
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Revenue & Income
            </h1>

            <p className="mt-2 text-sm text-[#92978F]">
              Track your salon earnings, expenses and business performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-[#3A403A] bg-[#1B1F1D] px-4 py-3 text-sm text-white outline-none"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl border border-[#4B5044] px-4 py-3 text-sm text-[#E9E3B2] transition hover:bg-[#292D26]"
            >
              <Download size={17} />
              Export
            </button>

            <button
              onClick={() => {
                setDraft(emptyDraft);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-5 py-3 text-sm font-semibold text-[#171914] transition hover:brightness-110"
            >
              <Plus size={18} />
              Add Expense
            </button>
          </div>
        </div>

        {/* FINANCIAL CARDS */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className={`${cardClass} relative overflow-hidden`}>
            <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#D9D19A]/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A9ACA2]">Total Revenue</span>
                <div className="rounded-xl bg-[#D9D19A]/10 p-3 text-[#E8DEA0]">
                  <Wallet size={20} />
                </div>
              </div>
              <h2 className="mt-5 text-3xl font-semibold text-[#EFE8A8]">
                {money(totalRevenue)}
              </h2>
              <p className="mt-2 text-xs text-[#8D948B]">
                From completed appointments
              </p>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">Total Expenses</span>
              <div className="rounded-xl bg-red-400/10 p-3 text-red-300">
                <TrendingDown size={20} />
              </div>
            </div>
            <h2 className="mt-5 text-3xl font-semibold">
              {money(totalExpenses)}
            </h2>
            <p className="mt-2 text-xs text-[#8D948B]">
              Recorded business expenses
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">Net Income</span>
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                <PiggyBank size={20} />
              </div>
            </div>
            <h2
              className={`mt-5 text-3xl font-semibold ${
                netIncome < 0 ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {money(netIncome)}
            </h2>
            <p className="mt-2 text-xs text-[#8D948B]">
              Revenue minus expenses
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">Completed Bookings</span>
              <div className="rounded-xl bg-blue-400/10 p-3 text-blue-300">
                <CalendarDays size={20} />
              </div>
            </div>
            <h2 className="mt-5 text-3xl font-semibold">
              {totalBookings}
            </h2>
            <p className="mt-2 text-xs text-[#8D948B]">
              Average booking: {money(averageBooking)}
            </p>
          </div>
        </section>

        {/* CHART AND SERVICE BREAKDOWN */}

        <section className="grid gap-5 xl:grid-cols-3">

          <div className={`${cardClass} xl:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Revenue Overview</h2>
                <p className="mt-1 text-xs text-[#92978F]">
                  Income and expenses over the last 7 days
                </p>
              </div>

              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-2 text-[#DCD49A]">
                  <span className="h-2 w-2 rounded-full bg-[#DCD49A]" />
                  Revenue
                </span>
                <span className="flex items-center gap-2 text-red-300">
                  <span className="h-2 w-2 rounded-full bg-red-300" />
                  Expenses
                </span>
              </div>
            </div>

            <div className="mt-8 flex h-64 items-end justify-between gap-3 border-b border-[#343832] pb-2">
              {weeklyData.map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <div className="flex h-full w-full items-end justify-center gap-1.5">
                    <div
                      title={`Revenue: ${money(item.income)}`}
                      className="w-[38%] max-w-8 rounded-t-md bg-gradient-to-t from-[#9B915A] to-[#EFE8A8] transition-all duration-500 hover:brightness-125"
                      style={{
                        height: `${Math.max(
                          item.income > 0 ? 3 : 0,
                          (item.income / maxChartValue) * 100
                        )}%`,
                      }}
                    />
                    <div
                      title={`Expenses: ${money(item.expense)}`}
                      className="w-[38%] max-w-8 rounded-t-md bg-gradient-to-t from-[#8E4545] to-[#E7A0A0] transition-all duration-500 hover:brightness-125"
                      style={{
                        height: `${Math.max(
                          item.expense > 0 ? 3 : 0,
                          (item.expense / maxChartValue) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#92978F]">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#92978F]">
              <span>Last 7 days</span>
              <span>Amounts in INR</span>
            </div>
          </div>

          <div className={cardClass}>
            <div>
              <h2 className="text-lg font-semibold">Top Services</h2>
              <p className="mt-1 text-xs text-[#92978F]">
                Revenue by service
              </p>
            </div>

            {serviceBreakdown.length > 0 ? (
              <div className="mt-7 space-y-6">
                {serviceBreakdown.map((service, index) => {
                  const percentage =
                    totalRevenue > 0
                      ? (service.amount / totalRevenue) * 100
                      : 0;

                  return (
                    <div key={service.name}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-[#E5E6DE]">
                          {service.name}
                        </span>
                        <span className="text-xs text-[#D9D19A]">
                          {money(service.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#30352F]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8D8250] to-[#EFE8A8]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-[10px] text-[#858B82]">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <ChartColumnIncreasing
                  size={35}
                  className="mb-3 text-[#73796F]"
                />
                <p className="text-sm text-[#A9ACA2]">
                  No service revenue yet
                </p>
                <p className="mt-1 text-xs text-[#73796F]">
                  Complete appointments to see your top services.
                </p>
              </div>
            )}

            {topService && (
              <div className="mt-6 rounded-xl border border-[#4B4937] bg-[#292A21] p-4">
                <div className="flex items-center gap-2 text-[#E7DDA0]">
                  <Sparkles size={15} />
                  <span className="text-xs font-semibold">Top performer</span>
                </div>
                <p className="mt-2 text-sm font-medium">
                  {topService.name}
                </p>
                <p className="mt-1 text-xs text-[#A9ACA2]">
                  {money(topService.amount)} generated in this period
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FINANCIAL SUMMARY */}

        <section className="grid gap-5 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#D9D19A]/10 p-3 text-[#E8DEA0]">
                <BriefcaseBusiness size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Business Summary</h2>
                <p className="text-xs text-[#92978F]">
                  Financial position for selected period
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#A9ACA2]">Gross revenue</span>
                <span>{money(totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A9ACA2]">Business expenses</span>
                <span className="text-red-300">
                  − {money(totalExpenses)}
                </span>
              </div>
              <div className="border-t border-[#3A403A] pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Net income</span>
                  <span className="text-xl font-semibold text-[#EFE8A8]">
                    {money(netIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                <Sparkles size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Business Insights</h2>
                <p className="text-xs text-[#92978F]">
                  Based on your current records
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-[#252A25] p-4">
                <p className="text-xs text-[#A9ACA2]">
                  Average booking value
                </p>
                <p className="mt-1 text-xl font-semibold text-[#EFE8A8]">
                  {money(averageBooking)}
                </p>
              </div>

              <div className="rounded-xl bg-[#252A25] p-4">
                <p className="text-xs text-[#A9ACA2]">
                  Expense ratio
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {totalRevenue > 0
                    ? `${((totalExpenses / totalRevenue) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl bg-[#252A25] p-4">
                <p className="text-xs text-[#A9ACA2]">
                  Financial status
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    netIncome >= 0 ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {netIncome >= 0
                    ? "Income is higher than expenses"
                    : "Expenses are higher than income"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS */}

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <p className="mt-1 text-xs text-[#92978F]">
                All income and expenses for the selected period
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[180px] flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858B82]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-[#3A403A] bg-[#151917] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#D9D19A]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm outline-none"
              >
                <option value="All">All transactions</option>
                <option value="Income">Income</option>
                <option value="Expense">Expenses</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-[#343832] text-xs uppercase tracking-wider text-[#858B82]">
                  <th className="pb-4 font-medium">Transaction</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Category</th>
                  <th className="pb-4 font-medium">Payment</th>
                  <th className="pb-4 text-right font-medium">Amount</th>
                  <th className="pb-4 text-right font-medium">Type</th>
                </tr>
              </thead>

              <tbody>
                {visibleTransactions.length > 0 ? (
                  visibleTransactions.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className="border-b border-[#2D322D] last:border-0 hover:bg-[#252A25]/60"
                    >
                      <td className="py-4">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-[#858B82]">
                          {item.customer}
                        </p>
                      </td>

                      <td className="py-4 text-sm text-[#A9ACA2]">
                        {formatDate(item.date)}
                      </td>

                      <td className="py-4 text-sm text-[#A9ACA2]">
                        {item.category}
                      </td>

                      <td className="py-4 text-sm text-[#A9ACA2]">
                        {item.method}
                      </td>

                      <td
                        className={`py-4 text-right text-sm font-semibold ${
                          item.type === "Income"
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {item.type === "Income" ? "+" : "−"}
                        {money(item.amount)}
                      </td>

                      <td className="py-4 text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                            item.type === "Income"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {item.type}
                        </span>

                        {item.type === "Expense" && (
                          <button
                            onClick={() => deleteExpense(item.id)}
                            title="Delete expense"
                            className="ml-3 inline-flex text-[#858B82] hover:text-red-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-14 text-center text-sm text-[#858B82]"
                    >
                      No transactions found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 border-t border-[#343832] pt-4 text-xs text-[#858B82]">
            Showing {visibleTransactions.length} transactions
          </div>
        </section>

        {/* ADD EXPENSE MODAL */}

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setModalOpen(false);
              }
            }}
          >
            <div className="my-auto w-full max-w-lg rounded-2xl border border-[#454A3D] bg-[#1B1F1D] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Add Expense</h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Record a new business expense
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-[#A9ACA2] hover:bg-[#30352F]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveExpense} className="space-y-4">
                <div>
                  <label className={labelClass}>Expense name</label>
                  <input
                    required
                    value={draft.title}
                    onChange={(event) =>
                      setDraft({ ...draft, title: event.target.value })
                    }
                    placeholder="Example: Monthly shop rent"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={draft.category}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          category: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {expenseCategories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Amount (₹)</label>
                    <input
                      required
                      min="1"
                      type="number"
                      value={draft.amount || ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          amount: Number(event.target.value),
                        })
                      }
                      placeholder="Enter amount"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      required
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft({ ...draft, date: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Payment method</label>
                    <select
                      value={draft.paymentMethod}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          paymentMethod: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Notes (optional)</label>
                  <textarea
                    value={draft.notes || ""}
                    onChange={(event) =>
                      setDraft({ ...draft, notes: event.target.value })
                    }
                    rows={3}
                    placeholder="Add additional details..."
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-xl border border-[#454A3D] px-4 py-3 text-sm text-[#C0C3B9] hover:bg-[#30352F]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-4 py-3 text-sm font-semibold text-[#171914] hover:brightness-110"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="pb-3 text-center text-xs text-[#656D64]">
          KBC Salon Academy · Financial Dashboard
        </p>
      </div>
    </main>
  );
}
