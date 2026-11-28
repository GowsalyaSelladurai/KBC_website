"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Wallet,
  TrendingDown,
  CalendarDays,
  Plus,
  Search,
  X,
  Trash2,
  Download,
  Sparkles,
  ChartColumnIncreasing,
  PiggyBank,
  BriefcaseBusiness,
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
    ...weeklyData.map((item) =>
      Math.max(item.income, item.expense)
    )
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

  const saveExpense = (event: FormEvent<HTMLFormElement>) => {
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
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
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

  // Shared champagne gold card effect with deep charcoal default
  const cardClass =
    "gold-ambient-card rounded-2xl bg-[#121414] p-5 text-[#F5F2E9]";

  const inputClass =
    "w-full rounded-xl border border-[#E8D39A]/30 bg-[#121414] px-4 py-3 text-sm text-[#F5F2E9] outline-none transition placeholder:text-[#858B82] focus:border-[#FFF4CE]";

  const labelClass =
    "mb-2 block text-xs font-medium uppercase tracking-wider text-[#A9ACA2]";

  return (
    <main className="min-h-screen bg-[#FAF5ED] p-4 text-[#F5F2E9] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* HEADER */}

        <div className="gold-ambient-card flex flex-col justify-between gap-5 rounded-2xl bg-[#121414] p-5 lg:flex-row lg:items-center">
          <div>
            <div className="gold-card-accent mb-2 flex items-center gap-2 text-[#E8D39A]">
              <Sparkles size={16} />

              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Financial Management
              </span>
            </div>

            <h1 className="gold-card-title text-3xl font-semibold tracking-tight text-[#FFF4CE] sm:text-4xl">
              Revenue &amp; Income
            </h1>

            <p className="gold-card-muted mt-2 text-sm text-[#9CA097]">
              Track your salon earnings, expenses and business performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-[#E8D39A]/35 bg-[#121414] px-4 py-3 text-sm text-[#F5F2E9] outline-none transition focus:border-[#FFF4CE]"
            >
              <option className="bg-[#121414] text-[#F5F2E9]">Today</option>
              <option className="bg-[#121414] text-[#F5F2E9]">This Week</option>
              <option className="bg-[#121414] text-[#F5F2E9]">This Month</option>
              <option className="bg-[#121414] text-[#F5F2E9]">This Year</option>
              <option className="bg-[#121414] text-[#F5F2E9]">All Time</option>
            </select>

            <button
              type="button"
              onClick={exportCSV}
              className="gold-card-pill flex items-center gap-2 rounded-xl border border-[#E8D39A]/45 bg-[#121414] px-4 py-3 text-sm font-medium text-[#FFF4CE] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
            >
              <Download size={17} />
              Export
            </button>

            <button
              type="button"
              onClick={() => {
                setDraft(emptyDraft);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-5 py-3 text-sm font-semibold text-[#17140D] shadow-md shadow-[#C9A45C]/25 transition hover:brightness-105"
            >
              <Plus size={18} />
              Add Expense
            </button>
          </div>
        </div>

        {/* FINANCIAL CARDS */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL REVENUE */}

          <div className={cardClass}>
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="gold-card-muted text-sm text-[#A9ACA2]">
                  Total Revenue
                </span>

                <div className="gold-card-icon rounded-xl bg-[#E8D39A]/15 p-3 text-[#FFF4CE]">
                  <Wallet size={20} />
                </div>
              </div>

              <h2 className="gold-card-accent mt-5 text-3xl font-semibold text-[#FFF4CE]">
                {money(totalRevenue)}
              </h2>

              <p className="gold-card-muted mt-2 text-xs text-[#8D948B]">
                From completed appointments
              </p>
            </div>
          </div>

          {/* TOTAL EXPENSES */}

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Total Expenses
              </span>

              <div className="gold-card-icon rounded-xl bg-red-400/15 p-3 text-red-300">
                <TrendingDown size={20} />
              </div>
            </div>

            <h2 className="gold-card-title mt-5 text-3xl font-semibold text-[#F5F2E9]">
              {money(totalExpenses)}
            </h2>

            <p className="gold-card-muted mt-2 text-xs text-[#8D948B]">
              Recorded business expenses
            </p>
          </div>

          {/* NET INCOME */}

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Net Income
              </span>

              <div className="gold-card-icon rounded-xl bg-emerald-400/15 p-3 text-emerald-300">
                <PiggyBank size={20} />
              </div>
            </div>

            <h2
              className={`gold-card-title mt-5 text-3xl font-semibold ${
                netIncome < 0 ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {money(netIncome)}
            </h2>

            <p className="gold-card-muted mt-2 text-xs text-[#8D948B]">
              Revenue minus expenses
            </p>
          </div>

          {/* COMPLETED BOOKINGS */}

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Completed Bookings
              </span>

              <div className="gold-card-icon rounded-xl bg-blue-400/15 p-3 text-blue-300">
                <CalendarDays size={20} />
              </div>
            </div>

            <h2 className="gold-card-title mt-5 text-3xl font-semibold text-[#F5F2E9]">
              {totalBookings}
            </h2>

            <p className="gold-card-muted mt-2 text-xs text-[#8D948B]">
              Average booking: {money(averageBooking)}
            </p>
          </div>
        </section>

        {/* CHART AND SERVICE BREAKDOWN */}

        <section className="grid gap-5 xl:grid-cols-3">
          {/* REVENUE CHART */}

          <div className={`${cardClass} xl:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="gold-card-title text-lg font-semibold text-[#F5F2E9]">
                  Revenue Overview
                </h2>

                <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                  Income and expenses over the last 7 days
                </p>
              </div>

              <div className="flex gap-4 text-xs">
                <span className="gold-card-accent flex items-center gap-2 text-[#FFF4CE]">
                  <span className="gold-card-dot h-2 w-2 rounded-full bg-[#FFF4CE]" />
                  Revenue
                </span>

                <span className="gold-card-title flex items-center gap-2 text-red-300">
                  <span className="h-2 w-2 rounded-full bg-red-300" />
                  Expenses
                </span>
              </div>
            </div>

            <div className="gold-card-divider mt-8 flex h-64 items-end justify-between gap-3 border-b border-[#E8D39A]/20 pb-2">
              {weeklyData.map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <div className="flex h-full w-full items-end justify-center gap-1.5">
                    <div
                      title={`Revenue: ${money(item.income)}`}
                      className="gold-card-bar w-[38%] max-w-8 rounded-t-md bg-gradient-to-t from-[#C9A45C] to-[#FFF4CE] transition-all duration-500 hover:brightness-110"
                      style={{
                        height: `${Math.max(
                          item.income > 0 ? 3 : 0,
                          (item.income / maxChartValue) * 100
                        )}%`,
                      }}
                    />

                    <div
                      title={`Expenses: ${money(item.expense)}`}
                      className="w-[38%] max-w-8 rounded-t-md bg-gradient-to-t from-[#8E4545] to-[#E7A0A0] transition-all duration-500 hover:brightness-110"
                      style={{
                        height: `${Math.max(
                          item.expense > 0 ? 3 : 0,
                          (item.expense / maxChartValue) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="gold-card-muted text-xs text-[#92978F]">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="gold-card-muted mt-4 flex items-center justify-between text-xs text-[#92978F]">
              <span>Last 7 days</span>
              <span>Amounts in INR</span>
            </div>
          </div>

          {/* TOP SERVICES */}

          <div className={cardClass}>
            <div>
              <h2 className="gold-card-title text-lg font-semibold text-[#F5F2E9]">
                Top Services
              </h2>

              <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                Revenue by service
              </p>
            </div>

            {serviceBreakdown.length > 0 ? (
              <div className="mt-7 space-y-6">
                {serviceBreakdown.map((service) => {
                  const percentage =
                    totalRevenue > 0
                      ? (service.amount / totalRevenue) * 100
                      : 0;

                  return (
                    <div key={service.name}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="gold-card-title truncate text-sm text-[#E5E6DE]">
                          {service.name}
                        </span>

                        <span className="gold-card-accent text-xs font-medium text-[#E8D39A]">
                          {money(service.amount)}
                        </span>
                      </div>

                      <div className="gold-card-track h-2 overflow-hidden rounded-full bg-[#262A28]">
                        <div
                          className="gold-card-bar h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#FFF4CE]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <p className="gold-card-muted mt-1 text-right text-[10px] text-[#858B82]">
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
                  className="gold-card-muted mb-3 text-[#73796F]"
                />

                <p className="gold-card-title text-sm text-[#A9ACA2]">
                  No service revenue yet
                </p>

                <p className="gold-card-muted mt-1 text-xs text-[#73796F]">
                  Complete appointments to see your top services.
                </p>
              </div>
            )}

            {topService && (
              <div className="gold-ambient-card gold-card-subpanel mt-6 rounded-xl bg-[#121414] p-4">
                <div className="gold-card-accent flex items-center gap-2 text-[#FFF4CE]">
                  <Sparkles size={15} />
                  <span className="text-xs font-semibold">
                    Top performer
                  </span>
                </div>

                <p className="gold-card-title mt-2 text-sm font-medium text-[#F5F2E9]">
                  {topService.name}
                </p>

                <p className="gold-card-muted mt-1 text-xs text-[#A9ACA2]">
                  {money(topService.amount)} generated in this period
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FINANCIAL SUMMARY */}

        <section className="grid gap-5 lg:grid-cols-2">
          {/* BUSINESS SUMMARY */}

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="gold-card-icon rounded-xl bg-[#E8D39A]/15 p-3 text-[#FFF4CE]">
                <BriefcaseBusiness size={21} />
              </div>

              <div>
                <h2 className="gold-card-title font-semibold text-[#F5F2E9]">
                  Business Summary
                </h2>

                <p className="gold-card-muted text-xs text-[#92978F]">
                  Financial position for selected period
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="gold-card-muted text-[#A9ACA2]">
                  Gross revenue
                </span>

                <span className="gold-card-title font-medium text-[#F5F2E9]">
                  {money(totalRevenue)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="gold-card-muted text-[#A9ACA2]">
                  Business expenses
                </span>

                <span className="gold-card-title font-medium text-red-300">
                  − {money(totalExpenses)}
                </span>
              </div>

              <div className="gold-card-divider border-t border-[#E8D39A]/20 pt-4">
                <div className="flex justify-between">
                  <span className="gold-card-title font-semibold text-[#F5F2E9]">
                    Net income
                  </span>

                  <span className="gold-card-accent text-xl font-semibold text-[#FFF4CE]">
                    {money(netIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BUSINESS INSIGHTS */}

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="gold-card-icon rounded-xl bg-emerald-400/15 p-3 text-emerald-300">
                <Sparkles size={21} />
              </div>

              <div>
                <h2 className="gold-card-title font-semibold text-[#F5F2E9]">
                  Business Insights
                </h2>

                <p className="gold-card-muted text-xs text-[#92978F]">
                  Based on your current records
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="gold-ambient-card gold-card-subpanel rounded-xl bg-[#121414] p-4">
                <p className="gold-card-muted text-xs text-[#A9ACA2]">
                  Average booking value
                </p>

                <p className="gold-card-accent mt-1 text-xl font-semibold text-[#FFF4CE]">
                  {money(averageBooking)}
                </p>
              </div>

              <div className="gold-ambient-card gold-card-subpanel rounded-xl bg-[#121414] p-4">
                <p className="gold-card-muted text-xs text-[#A9ACA2]">
                  Expense ratio
                </p>

                <p className="gold-card-title mt-1 text-xl font-semibold text-[#F5F2E9]">
                  {totalRevenue > 0
                    ? `${((totalExpenses / totalRevenue) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>

              <div className="gold-ambient-card gold-card-subpanel rounded-xl bg-[#121414] p-4">
                <p className="gold-card-muted text-xs text-[#A9ACA2]">
                  Financial status
                </p>

                <p
                  className={`gold-card-title mt-1 text-sm font-semibold ${
                    netIncome >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
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
              <h2 className="gold-card-title text-lg font-semibold text-[#F5F2E9]">
                Recent Transactions
              </h2>

              <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
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
                  className="w-full rounded-xl border border-[#E8D39A]/30 bg-[#121414] py-3 pl-9 pr-3 text-sm text-[#F5F2E9] outline-none transition placeholder:text-[#858B82] focus:border-[#FFF4CE]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="rounded-xl border border-[#E8D39A]/30 bg-[#121414] px-4 py-3 text-sm text-[#F5F2E9] outline-none transition focus:border-[#FFF4CE]"
              >
                <option value="All" className="bg-[#121414] text-[#F5F2E9]">
                  All transactions
                </option>
                <option value="Income" className="bg-[#121414] text-[#F5F2E9]">
                  Income
                </option>
                <option value="Expense" className="bg-[#121414] text-[#F5F2E9]">
                  Expenses
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="gold-table-head border-b border-[#E8D39A]/20 text-xs uppercase tracking-wider text-[#858B82]">
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
                      className="gold-table-row border-b border-[#E8D39A]/10 transition last:border-0"
                    >
                      <td className="py-4">
                        <p className="gold-card-title text-sm font-medium text-[#F5F2E9]">
                          {item.title}
                        </p>

                        <p className="gold-card-muted mt-1 text-xs text-[#858B82]">
                          {item.customer}
                        </p>
                      </td>

                      <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                        {formatDate(item.date)}
                      </td>

                      <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                        {item.category}
                      </td>

                      <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                        {item.method}
                      </td>

                      <td
                        className={`gold-card-title py-4 text-right text-sm font-semibold ${
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
                          className={`gold-card-pill rounded-full px-3 py-1 text-[10px] font-semibold ${
                            item.type === "Income"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-red-400/15 text-red-300"
                          }`}
                        >
                          {item.type}
                        </span>

                        {item.type === "Expense" && (
                          <button
                            type="button"
                            onClick={() => deleteExpense(item.id)}
                            title="Delete expense"
                            className="gold-row-btn ml-3 inline-flex text-[#858B82] transition hover:text-[#17140D]"
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
                      className="gold-card-muted py-14 text-center text-sm text-[#858B82]"
                    >
                      No transactions found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="gold-card-muted mt-4 border-t border-[#E8D39A]/15 pt-4 text-xs text-[#858B82]">
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
            <div className="my-auto w-full max-w-lg rounded-2xl border border-[#E8D39A]/50 bg-[#121414] p-6 text-[#F5F2E9] shadow-[0_0_40px_rgba(232,211,154,0.22)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#FFF4CE]">
                    Add Expense
                  </h2>

                  <p className="mt-1 text-xs text-[#92978F]">
                    Record a new business expense
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveExpense} className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Expense name
                  </label>

                  <input
                    required
                    value={draft.title}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        title: event.target.value,
                      })
                    }
                    placeholder="Example: Monthly shop rent"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Category
                    </label>

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
                        <option
                          key={category}
                          className="bg-[#121414] text-[#F5F2E9]"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Amount (₹)
                    </label>

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
                    <label className={labelClass}>
                      Date
                    </label>

                    <input
                      required
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          date: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Payment method
                    </label>

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
                        <option
                          key={method}
                          className="bg-[#121414] text-[#F5F2E9]"
                        >
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Notes (optional)
                  </label>

                  <textarea
                    value={draft.notes || ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        notes: event.target.value,
                      })
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
                    className="flex-1 rounded-xl border border-[#E8D39A]/35 px-4 py-3 text-sm text-[#C0C3B9] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-4 py-3 text-sm font-semibold text-[#17140D] transition hover:brightness-105"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="pb-3 text-center text-xs font-medium text-[#6B6457]">
          KBC Salon Academy · Financial Dashboard
        </p>
      </div>

      {/* =========================================
          CHAMPAGNE HOVER, OUTER GLOW & TOUCH STYLES
      ========================================= */}

      <style jsx global>{`
        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          background-color: #121414;
          color: #f5f2e9;
          border: 1px solid rgba(232, 211, 154, 0.55);
          box-shadow:
            0 0 14px rgba(232, 211, 154, 0.18),
            0 0 30px rgba(201, 164, 92, 0.12),
            0 10px 24px rgba(18, 20, 20, 0.14);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition:
            transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.32s ease,
            box-shadow 0.32s ease,
            background 0.32s ease,
            color 0.32s ease;
        }

        .gold-ambient-card::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          pointer-events: none;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 244, 206, 0.38) 0%,
            rgba(232, 211, 154, 0.24) 40%,
            rgba(201, 164, 92, 0.12) 70%,
            transparent 100%
          );
          filter: blur(22px);
          opacity: 0;
          transition: opacity 0.32s ease;
        }

        .gold-ambient-card:hover,
        .gold-ambient-card:active,
        .gold-ambient-card:focus-visible {
          background: linear-gradient(
            135deg,
            #fff4ce 0%,
            #e8d39a 52%,
            #c9a45c 100%
          ) !important;
          color: #17140d !important;
          border-color: #fff4ce !important;
          box-shadow:
            0 0 18px rgba(255, 244, 206, 0.68),
            0 0 38px rgba(232, 211, 154, 0.48),
            0 0 64px rgba(201, 164, 92, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        .gold-ambient-card:hover .gold-card-title,
        .gold-ambient-card:active .gold-card-title,
        .gold-ambient-card:focus-visible .gold-card-title,
        .gold-ambient-card:hover .gold-card-accent,
        .gold-ambient-card:active .gold-card-accent,
        .gold-ambient-card:focus-visible .gold-card-accent {
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-muted,
        .gold-ambient-card:active .gold-card-muted,
        .gold-ambient-card:focus-visible .gold-card-muted {
          color: rgba(23, 20, 13, 0.8) !important;
        }

        .gold-ambient-card:hover .gold-card-icon,
        .gold-ambient-card:active .gold-card-icon,
        .gold-ambient-card:focus-visible .gold-card-icon {
          background-color: rgba(23, 20, 13, 0.14) !important;
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-pill,
        .gold-ambient-card:active .gold-card-pill,
        .gold-ambient-card:focus-visible .gold-card-pill {
          background-color: rgba(23, 20, 13, 0.14) !important;
          border-color: rgba(23, 20, 13, 0.25) !important;
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-subpanel,
        .gold-ambient-card:active .gold-card-subpanel,
        .gold-ambient-card:focus-visible .gold-card-subpanel {
          background-color: rgba(23, 20, 13, 0.12) !important;
          border-color: rgba(23, 20, 13, 0.22) !important;
          color: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-track,
        .gold-ambient-card:active .gold-card-track {
          background-color: rgba(23, 20, 13, 0.18) !important;
        }

        .gold-ambient-card:hover .gold-card-bar,
        .gold-ambient-card:active .gold-card-bar {
          background: #17140d !important;
        }

        .gold-ambient-card:hover .gold-card-divider,
        .gold-ambient-card:active .gold-card-divider {
          border-color: rgba(23, 20, 13, 0.2) !important;
        }

        .gold-ambient-card:hover .gold-table-head,
        .gold-ambient-card:active .gold-table-head {
          color: rgba(23, 20, 13, 0.78) !important;
          border-color: rgba(23, 20, 13, 0.2) !important;
        }

        .gold-ambient-card:hover .gold-table-row,
        .gold-ambient-card:active .gold-table-row {
          border-color: rgba(23, 20, 13, 0.14) !important;
        }

        .gold-ambient-card:hover .gold-row-btn,
        .gold-ambient-card:active .gold-row-btn {
          color: #17140d !important;
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
    </main>
  );
}