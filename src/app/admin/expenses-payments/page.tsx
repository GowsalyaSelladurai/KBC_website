
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Wallet,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Download,
  Trash2,
  Pencil,
  X,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Smartphone,
  Filter,
  Sparkles,
  FileText,
  RefreshCw,
} from "lucide-react";

type Tab = "Expenses" | "Payments";
type PaymentStatus = "Received" | "Pending" | "Refunded";
type PaymentType = "Advance" | "Partial" | "Full";

type Appointment = {
  id: string;
  customer: string;
  phone?: string;
  service: string;
  staff?: string;
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
  notes: string;
};

type Payment = {
  id: string;
  appointmentId: string;
  customer: string;
  service: string;
  amount: number;
  date: string;
  method: string;
  type: PaymentType;
  status: PaymentStatus;
  reference: string;
  notes: string;
};

type ExpenseDraft = Omit<Expense, "id">;
type PaymentDraft = Omit<Payment, "id">;

const EXPENSE_KEY = "kbc_revenue_expenses_v1";
const PAYMENT_KEY = "kbc_payments_v1";
const APPOINTMENT_KEY = "kbc_appointments_v1";

const expenseCategories = [
  "Salary",
  "Rent",
  "Products & Supplies",
  "Electricity",
  "Water Bill",
  "Marketing",
  "Maintenance",
  "Equipment",
  "Training",
  "Other",
];

const paymentMethods = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
];

const paymentStatuses: PaymentStatus[] = [
  "Received",
  "Pending",
  "Refunded",
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const todayKey = () => {
  const date = new Date();
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

const emptyExpense: ExpenseDraft = {
  title: "",
  category: "Products & Supplies",
  amount: 0,
  date: todayKey(),
  paymentMethod: "UPI",
  notes: "",
};

const emptyPayment: PaymentDraft = {
  appointmentId: "",
  customer: "",
  service: "",
  amount: 0,
  date: todayKey(),
  method: "UPI",
  type: "Full",
  status: "Received",
  reference: "",
  notes: "",
};

export default function ExpensesPaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Expenses");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [expenseModal, setExpenseModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  const [expenseDraft, setExpenseDraft] =
    useState<ExpenseDraft>(emptyExpense);
  const [paymentDraft, setPaymentDraft] =
    useState<PaymentDraft>(emptyPayment);

  const [editingExpenseId, setEditingExpenseId] =
    useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [period, setPeriod] = useState("This Month");

  // LOAD SAVED DATA

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem(EXPENSE_KEY);
      const savedPayments = localStorage.getItem(PAYMENT_KEY);
      const savedAppointments = localStorage.getItem(APPOINTMENT_KEY);

      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }

      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      }

      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      }
    } catch (error) {
      console.error("Unable to load financial records:", error);
    }

    setLoaded(true);
  }, []);

  // SAVE DATA

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  }, [expenses, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
  }, [payments, loaded]);

  // DATE FILTER

  const dateRange = useMemo(() => {
    const now = new Date();
    const today = todayKey();

    if (period === "Today") {
      return { start: today, end: today };
    }

    if (period === "This Week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }

    if (period === "This Year") {
      return {
        start: `${now.getFullYear()}-01-01`,
        end: `${now.getFullYear()}-12-31`,
      };
    }

    if (period === "All Time") {
      return {
        start: "0000-01-01",
        end: "9999-12-31",
      };
    }

    return {
      start: `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-01`,
      end: todayKey(),
    };
  }, [period]);

  const visibleExpenses = useMemo(
    () =>
      expenses.filter(
        (item) =>
          item.date >= dateRange.start &&
          item.date <= dateRange.end
      ),
    [expenses, dateRange]
  );

  const visiblePayments = useMemo(
    () =>
      payments.filter(
        (item) =>
          item.date >= dateRange.start &&
          item.date <= dateRange.end
      ),
    [payments, dateRange]
  );

  // FINANCIAL TOTALS

  const totalExpenses = visibleExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const receivedPayments = visiblePayments
    .filter((item) => item.status === "Received")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pendingPayments = visiblePayments
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const refundedPayments = visiblePayments
    .filter((item) => item.status === "Refunded")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netCollected = receivedPayments - refundedPayments;
  const netBalance = netCollected - totalExpenses;

  // EXPENSE CATEGORY SUMMARY

  const categorySummary = useMemo(() => {
    const totals: Record<string, number> = {};

    visibleExpenses.forEach((item) => {
      totals[item.category] =
        (totals[item.category] || 0) + Number(item.amount || 0);
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [visibleExpenses]);

  const maxCategoryAmount = Math.max(
    1,
    ...categorySummary.map((item) => item.amount)
  );

  // TRANSACTION SEARCH

  const filteredExpenses = visibleExpenses.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.category === filter;

    return matchesSearch && matchesFilter;
  });

  const filteredPayments = visiblePayments.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.service.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      item.status === filter ||
      item.method === filter;

    return matchesSearch && matchesFilter;
  });

  // EXPENSE ACTIONS

  const openAddExpense = () => {
    setExpenseDraft(emptyExpense);
    setEditingExpenseId(null);
    setExpenseModal(true);
  };

  const openEditExpense = (expense: Expense) => {
    setExpenseDraft({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    });

    setEditingExpenseId(expense.id);
    setExpenseModal(true);
  };

  const saveExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !expenseDraft.title.trim() ||
      expenseDraft.amount <= 0 ||
      !expenseDraft.date
    ) {
      alert("Please enter a valid expense name, amount and date.");
      return;
    }

    if (editingExpenseId) {
      setExpenses((previous) =>
        previous.map((item) =>
          item.id === editingExpenseId
            ? { ...expenseDraft, id: editingExpenseId }
            : item
        )
      );
    } else {
      const newExpense: Expense = {
        ...expenseDraft,
        id: `expense_${Date.now()}`,
      };

      setExpenses((previous) => [newExpense, ...previous]);
    }

    setExpenseModal(false);
    setExpenseDraft(emptyExpense);
    setEditingExpenseId(null);
  };

  const deleteExpense = (id: string) => {
    if (!confirm("Delete this expense record?")) return;

    setExpenses((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // PAYMENT ACTIONS

  const openAddPayment = () => {
    setPaymentDraft(emptyPayment);
    setEditingPaymentId(null);
    setPaymentModal(true);
  };

  const openEditPayment = (payment: Payment) => {
    setPaymentDraft({
      appointmentId: payment.appointmentId || "",
      customer: payment.customer,
      service: payment.service,
      amount: payment.amount,
      date: payment.date,
      method: payment.method,
      type: payment.type,
      status: payment.status,
      reference: payment.reference || "",
      notes: payment.notes || "",
    });

    setEditingPaymentId(payment.id);
    setPaymentModal(true);
  };

  const selectAppointment = (appointmentId: string) => {
    const appointment = appointments.find(
      (item) => item.id === appointmentId
    );

    if (!appointment) {
      setPaymentDraft((previous) => ({
        ...previous,
        appointmentId: "",
      }));
      return;
    }

    setPaymentDraft((previous) => ({
      ...previous,
      appointmentId,
      customer: appointment.customer,
      service: appointment.service,
    }));
  };

  const savePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !paymentDraft.customer.trim() ||
      !paymentDraft.amount ||
      paymentDraft.amount <= 0 ||
      !paymentDraft.date
    ) {
      alert("Please enter customer name, amount and payment date.");
      return;
    }

    if (editingPaymentId) {
      setPayments((previous) =>
        previous.map((item) =>
          item.id === editingPaymentId
            ? { ...paymentDraft, id: editingPaymentId }
            : item
        )
      );
    } else {
      const newPayment: Payment = {
        ...paymentDraft,
        id: `payment_${Date.now()}`,
      };

      setPayments((previous) => [newPayment, ...previous]);
    }

    setPaymentModal(false);
    setPaymentDraft(emptyPayment);
    setEditingPaymentId(null);
  };

  const deletePayment = (id: string) => {
    if (!confirm("Delete this payment record?")) return;

    setPayments((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const updatePaymentStatus = (
    id: string,
    status: PaymentStatus
  ) => {
    setPayments((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  // CSV EXPORT

  const exportCSV = () => {
    const rows =
      activeTab === "Expenses"
        ? [
            [
              "Date",
              "Expense",
              "Category",
              "Payment Method",
              "Amount",
              "Notes",
            ],
            ...filteredExpenses.map((item) => [
              item.date,
              item.title,
              item.category,
              item.paymentMethod,
              String(item.amount),
              item.notes,
            ]),
          ]
        : [
            [
              "Date",
              "Customer",
              "Service",
              "Amount",
              "Method",
              "Type",
              "Status",
              "Reference",
            ],
            ...filteredPayments.map((item) => [
              item.date,
              item.customer,
              item.service,
              String(item.amount),
              item.method,
              item.type,
              item.status,
              item.reference,
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
    link.download =
      activeTab === "Expenses"
        ? "kbc-expenses.csv"
        : "kbc-payments.csv";

    link.click();
    URL.revokeObjectURL(url);
  };

  // STYLES

  const cardClass =
    "rounded-2xl border border-[#343832] bg-[#1B1F1D] p-5";

  const inputClass =
    "w-full rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm text-white outline-none transition focus:border-[#D9D19A]";

  const labelClass =
    "mb-2 block text-xs font-medium uppercase tracking-wider text-[#A9ACA2]";

  const statusStyle = (status: string) => {
    if (status === "Received") {
      return "bg-emerald-400/10 text-emerald-300";
    }

    if (status === "Pending") {
      return "bg-amber-400/10 text-amber-300";
    }

    if (status === "Refunded") {
      return "bg-red-400/10 text-red-300";
    }

    return "bg-[#D9D19A]/10 text-[#D9D19A]";
  };

  return (
    <main className="min-h-screen bg-[#121414] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}

        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#D9D19A]">
              <Sparkles size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Financial Management
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Expenses & Payments
            </h1>

            <p className="mt-2 text-sm text-[#92978F]">
              Manage salon spending, customer payments and outstanding balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-[#3A403A] bg-[#1B1F1D] px-4 py-3 text-sm outline-none"
            >
              <option>This Month</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl border border-[#4B5044] px-4 py-3 text-sm text-[#E9E3B2] transition hover:bg-[#292D26]"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={
                activeTab === "Expenses"
                  ? openAddExpense
                  : openAddPayment
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-5 py-3 text-sm font-semibold text-[#171914] transition hover:brightness-110"
            >
              <Plus size={18} />
              {activeTab === "Expenses"
                ? "Add Expense"
                : "Record Payment"}
            </button>
          </div>
        </header>

        {/* SUMMARY CARDS */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">
                Total Expenses
              </span>
              <div className="rounded-xl bg-red-400/10 p-3 text-red-300">
                <Receipt size={20} />
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-semibold">
              {money(totalExpenses)}
            </h2>
            <p className="mt-2 text-xs text-[#858B82]">
              {visibleExpenses.length} expense records
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">
                Payments Received
              </span>
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                <Wallet size={20} />
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-emerald-300">
              {money(receivedPayments)}
            </h2>
            <p className="mt-2 text-xs text-[#858B82]">
              {visiblePayments.filter((item) => item.status === "Received").length} successful records
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">
                Pending Payments
              </span>
              <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300">
                <Clock size={20} />
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-amber-300">
              {money(pendingPayments)}
            </h2>
            <p className="mt-2 text-xs text-[#858B82]">
              Awaiting customer payment
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A9ACA2]">
                Net Cash Position
              </span>
              <div className="rounded-xl bg-[#D9D19A]/10 p-3 text-[#E8DEA0]">
                <TrendingUp size={20} />
              </div>
            </div>
            <h2
              className={`mt-5 text-2xl font-semibold ${
                netBalance >= 0
                  ? "text-[#EFE8A8]"
                  : "text-red-300"
              }`}
            >
              {money(netBalance)}
            </h2>
            <p className="mt-2 text-xs text-[#858B82]">
              Collected payments minus expenses
            </p>
          </div>
        </section>

        {/* TAB SWITCHER */}

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="inline-flex w-fit rounded-xl border border-[#343832] bg-[#1B1F1D] p-1">
            <button
              onClick={() => {
                setActiveTab("Expenses");
                setSearch("");
                setFilter("All");
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition ${
                activeTab === "Expenses"
                  ? "bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] text-[#171914] shadow-lg"
                  : "text-[#A9ACA2] hover:text-white"
              }`}
            >
              <Receipt size={17} />
              Expenses
            </button>

            <button
              onClick={() => {
                setActiveTab("Payments");
                setSearch("");
                setFilter("All");
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition ${
                activeTab === "Payments"
                  ? "bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] text-[#171914] shadow-lg"
                  : "text-[#A9ACA2] hover:text-white"
              }`}
            >
              <CreditCard size={17} />
              Payments
            </button>
          </div>

          <div className="text-xs text-[#858B82]">
            Showing records: {period}
          </div>
        </section>

        {/* EXPENSES TAB */}

        {activeTab === "Expenses" && (
          <section className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-3">

              {/* CATEGORY BREAKDOWN */}

              <div className={`${cardClass} xl:col-span-1`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Expense Breakdown</h2>
                    <p className="mt-1 text-xs text-[#92978F]">
                      Spending by category
                    </p>
                  </div>
                  <Filter size={18} className="text-[#D9D19A]" />
                </div>

                {categorySummary.length > 0 ? (
                  <div className="mt-7 space-y-5">
                    {categorySummary.map((item) => (
                      <div key={item.name}>
                        <div className="mb-2 flex justify-between gap-2 text-sm">
                          <span className="text-[#D7D9D0]">
                            {item.name}
                          </span>
                          <span className="text-[#D9D19A]">
                            {money(item.amount)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#30352F]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#8D8250] to-[#EFE8A8]"
                            style={{
                              width: `${(item.amount / maxCategoryAmount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <Receipt size={34} className="mb-3 text-[#73796F]" />
                    <p className="text-sm text-[#A9ACA2]">
                      No expenses recorded
                    </p>
                    <p className="mt-1 text-xs text-[#73796F]">
                      Add an expense to see your breakdown.
                    </p>
                  </div>
                )}
              </div>

              {/* EXPENSE SUMMARY */}

              <div className={`${cardClass} xl:col-span-2`}>
                <div>
                  <h2 className="font-semibold">Expense Overview</h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Your business spending summary
                  </p>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#343832] bg-[#151917] p-5">
                    <div className="flex items-center gap-2 text-[#A9ACA2]">
                      <ArrowDownRight size={18} className="text-red-300" />
                      <span className="text-xs">Total Spending</span>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">
                      {money(totalExpenses)}
                    </h3>
                    <p className="mt-2 text-xs text-[#858B82]">
                      In selected period
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#343832] bg-[#151917] p-5">
                    <div className="flex items-center gap-2 text-[#A9ACA2]">
                      <FileText size={18} className="text-[#D9D19A]" />
                      <span className="text-xs">Expense Records</span>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">
                      {visibleExpenses.length}
                    </h3>
                    <p className="mt-2 text-xs text-[#858B82]">
                      Total entries in selected period
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#4B4937] bg-[#292A21] p-5">
                  <div className="flex items-center gap-2 text-[#E7DDA0]">
                    <Sparkles size={17} />
                    <span className="text-sm font-semibold">
                      Spending Insight
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#C5C7BC]">
                    {categorySummary.length > 0
                      ? `${categorySummary[0].name} is your highest expense category, accounting for ${money(categorySummary[0].amount)} in this period.`
                      : "Your expense insights will appear here once you record business expenses."}
                  </p>
                </div>
              </div>
            </div>

            {/* EXPENSE TABLE */}

            <div className={cardClass}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Expense Records
                  </h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Manage your salon business expenses
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[190px] flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858B82]"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search expenses..."
                      className="w-full rounded-xl border border-[#3A403A] bg-[#151917] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#D9D19A]"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm outline-none"
                  >
                    <option value="All">All categories</option>
                    {expenseCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead>
                    <tr className="border-b border-[#343832] text-xs uppercase tracking-wider text-[#858B82]">
                      <th className="pb-4 font-medium">Expense</th>
                      <th className="pb-4 font-medium">Category</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Method</th>
                      <th className="pb-4 text-right font-medium">Amount</th>
                      <th className="pb-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#2D322D] last:border-0 hover:bg-[#252A25]/60"
                        >
                          <td className="py-4">
                            <p className="text-sm font-medium">
                              {item.title}
                            </p>
                            {item.notes && (
                              <p className="mt-1 max-w-[180px] truncate text-xs text-[#858B82]">
                                {item.notes}
                              </p>
                            )}
                          </td>

                          <td className="py-4">
                            <span className="rounded-full bg-[#D9D19A]/10 px-3 py-1 text-xs text-[#D9D19A]">
                              {item.category}
                            </span>
                          </td>

                          <td className="py-4 text-sm text-[#A9ACA2]">
                            {formatDate(item.date)}
                          </td>

                          <td className="py-4 text-sm text-[#A9ACA2]">
                            {item.paymentMethod}
                          </td>

                          <td className="py-4 text-right text-sm font-semibold text-red-300">
                            − {money(item.amount)}
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditExpense(item)}
                                title="Edit expense"
                                className="rounded-lg p-2 text-[#A9ACA2] hover:bg-[#343832] hover:text-[#EFE8A8]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteExpense(item.id)}
                                title="Delete expense"
                                className="rounded-lg p-2 text-[#A9ACA2] hover:bg-red-400/10 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-14 text-center text-sm text-[#858B82]"
                        >
                          No expenses found. Add your first expense.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t border-[#343832] pt-4 text-xs text-[#858B82]">
                Showing {filteredExpenses.length} expense records
              </div>
            </div>
          </section>
        )}

        {/* PAYMENTS TAB */}

        {activeTab === "Payments" && (
          <section className="space-y-5">

            {/* PAYMENT SUMMARY */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A9ACA2]">
                    Amount Received
                  </span>
                  <CheckCircle2 className="text-emerald-300" size={21} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-emerald-300">
                  {money(receivedPayments)}
                </h3>
                <p className="mt-2 text-xs text-[#858B82]">
                  Successful payments
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A9ACA2]">
                    Outstanding
                  </span>
                  <AlertCircle className="text-amber-300" size={21} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-amber-300">
                  {money(pendingPayments)}
                </h3>
                <p className="mt-2 text-xs text-[#858B82]">
                  Pending payment records
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A9ACA2]">
                    Refunds
                  </span>
                  <RefreshCw className="text-red-300" size={21} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-red-300">
                  {money(refundedPayments)}
                </h3>
                <p className="mt-2 text-xs text-[#858B82]">
                  Refunded payment records
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A9ACA2]">
                    Net Collected
                  </span>
                  <Wallet className="text-[#EFE8A8]" size={21} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-[#EFE8A8]">
                  {money(netCollected)}
                </h3>
                <p className="mt-2 text-xs text-[#858B82]">
                  Received minus refunds
                </p>
              </div>
            </div>

            {/* PAYMENT METHODS */}

            <div className={`${cardClass} grid gap-5 md:grid-cols-3`}>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                  <Banknote size={23} />
                </div>
                <div>
                  <p className="text-xs text-[#92978F]">Cash Received</p>
                  <p className="mt-1 text-lg font-semibold">
                    {money(
                      visiblePayments
                        .filter(
                          (item) =>
                            item.status === "Received" &&
                            item.method === "Cash"
                        )
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-400/10 p-3 text-blue-300">
                  <Smartphone size={23} />
                </div>
                <div>
                  <p className="text-xs text-[#92978F]">UPI Received</p>
                  <p className="mt-1 text-lg font-semibold">
                    {money(
                      visiblePayments
                        .filter(
                          (item) =>
                            item.status === "Received" &&
                            item.method === "UPI"
                        )
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-purple-400/10 p-3 text-purple-300">
                  <CreditCard size={23} />
                </div>
                <div>
                  <p className="text-xs text-[#92978F]">Card Received</p>
                  <p className="mt-1 text-lg font-semibold">
                    {money(
                      visiblePayments
                        .filter(
                          (item) =>
                            item.status === "Received" &&
                            item.method === "Card"
                        )
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* PAYMENT TABLE */}

            <div className={cardClass}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Payment Transactions
                  </h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Customer payments, advances and outstanding records
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative min-w-[190px] flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858B82]"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search customer or service..."
                      className="w-full rounded-xl border border-[#3A403A] bg-[#151917] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#D9D19A]"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-[#3A403A] bg-[#151917] px-4 py-3 text-sm outline-none"
                  >
                    <option value="All">All payments</option>
                    {paymentStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                    {paymentMethods.map((method) => (
                      <option key={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b border-[#343832] text-xs uppercase tracking-wider text-[#858B82]">
                      <th className="pb-4 font-medium">Customer</th>
                      <th className="pb-4 font-medium">Service</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Method</th>
                      <th className="pb-4 font-medium">Type</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 text-right font-medium">Amount</th>
                      <th className="pb-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#2D322D] last:border-0 hover:bg-[#252A25]/60"
                        >
                          <td className="py-4">
                            <p className="text-sm font-medium">
                              {item.customer}
                            </p>
                            {item.reference && (
                              <p className="mt-1 text-xs text-[#858B82]">
                                Ref: {item.reference}
                              </p>
                            )}
                          </td>

                          <td className="py-4 text-sm text-[#A9ACA2]">
                            {item.service || "General Payment"}
                          </td>

                          <td className="py-4 text-sm text-[#A9ACA2]">
                            {formatDate(item.date)}
                          </td>

                          <td className="py-4 text-sm text-[#A9ACA2]">
                            {item.method}
                          </td>

                          <td className="py-4 text-sm text-[#A9ACA2]">
                            {item.type}
                          </td>

                          <td className="py-4">
                            <select
                              value={item.status}
                              onChange={(event) =>
                                updatePaymentStatus(
                                  item.id,
                                  event.target.value as PaymentStatus
                                )
                              }
                              className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${statusStyle(
                                item.status
                              )}`}
                              aria-label={`Payment status for ${item.customer}`}
                            >
                              {paymentStatuses.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-[#1B1F1D] text-white"
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-4 text-right text-sm font-semibold">
                            {money(item.amount)}
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditPayment(item)}
                                title="Edit payment"
                                className="rounded-lg p-2 text-[#A9ACA2] hover:bg-[#343832] hover:text-[#EFE8A8]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deletePayment(item.id)}
                                title="Delete payment"
                                className="rounded-lg p-2 text-[#A9ACA2] hover:bg-red-400/10 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-14 text-center text-sm text-[#858B82]"
                        >
                          No payment records found. Record your first payment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t border-[#343832] pt-4 text-xs text-[#858B82]">
                Showing {filteredPayments.length} payment records
              </div>
            </div>
          </section>
        )}

        {/* EXPENSE MODAL */}

        {expenseModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setExpenseModal(false);
              }
            }}
          >
            <div className="my-auto w-full max-w-lg rounded-2xl border border-[#454A3D] bg-[#1B1F1D] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {editingExpenseId ? "Edit Expense" : "Add Expense"}
                  </h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Record your salon business spending
                  </p>
                </div>

                <button
                  onClick={() => setExpenseModal(false)}
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
                    value={expenseDraft.title}
                    onChange={(event) =>
                      setExpenseDraft({
                        ...expenseDraft,
                        title: event.target.value,
                      })
                    }
                    placeholder="Example: Monthly shop rent"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={expenseDraft.category}
                      onChange={(event) =>
                        setExpenseDraft({
                          ...expenseDraft,
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
                      value={expenseDraft.amount || ""}
                      onChange={(event) =>
                        setExpenseDraft({
                          ...expenseDraft,
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
                      value={expenseDraft.date}
                      onChange={(event) =>
                        setExpenseDraft({
                          ...expenseDraft,
                          date: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Payment method</label>
                    <select
                      value={expenseDraft.paymentMethod}
                      onChange={(event) =>
                        setExpenseDraft({
                          ...expenseDraft,
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
                  <label className={labelClass}>Notes</label>
                  <textarea
                    rows={3}
                    value={expenseDraft.notes}
                    onChange={(event) =>
                      setExpenseDraft({
                        ...expenseDraft,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Additional details..."
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpenseModal(false)}
                    className="flex-1 rounded-xl border border-[#454A3D] px-4 py-3 text-sm text-[#C0C3B9] hover:bg-[#30352F]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-4 py-3 text-sm font-semibold text-[#171914] hover:brightness-110"
                  >
                    {editingExpenseId ? "Update Expense" : "Save Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAYMENT MODAL */}

        {paymentModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setPaymentModal(false);
              }
            }}
          >
            <div className="my-auto w-full max-w-xl rounded-2xl border border-[#454A3D] bg-[#1B1F1D] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {editingPaymentId
                      ? "Edit Payment"
                      : "Record Customer Payment"}
                  </h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Enter the actual payment details received or expected
                  </p>
                </div>

                <button
                  onClick={() => setPaymentModal(false)}
                  className="rounded-lg p-2 text-[#A9ACA2] hover:bg-[#30352F]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={savePayment} className="space-y-4">

                {appointments.length > 0 && (
                  <div>
                    <label className={labelClass}>
                      Link an appointment (optional)
                    </label>
                    <select
                      value={paymentDraft.appointmentId}
                      onChange={(event) =>
                        selectAppointment(event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select appointment</option>
                      {appointments.map((appointment) => (
                        <option
                          key={appointment.id}
                          value={appointment.id}
                        >
                          {appointment.customer} · {appointment.service} · {formatDate(appointment.date)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-[#858B82]">
                      Selecting an appointment fills in the customer and service.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Customer name</label>
                    <input
                      required
                      value={paymentDraft.customer}
                      onChange={(event) =>
                        setPaymentDraft({
                          ...paymentDraft,
                          customer: event.target.value,
                          appointmentId: "",
                        })
                      }
                      placeholder="Customer name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Service</label>
                    <input
                      value={paymentDraft.service}
                      onChange={(event) =>
                        setPaymentDraft({
                          ...paymentDraft,
                          service: event.target.value,
                        })
                      }
                      placeholder="Example: Hair Styling"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Amount (₹)</label>
                    <input
                      required
                      min="1"
                      type="number"
                      value={paymentDraft.amount || ""}
                      onChange={(event) =>
                        setPaymentDraft({
                          ...paymentDraft,
                          amount: Number(event.target.value),
                        })
                      }
                      placeholder="Enter amount"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Payment date</label>
                    <input
                      required
                      type="date"
                      value={paymentDraft.date}
                      onChange={(event) =>
                        setPaymentDraft({
                          ...paymentDraft,
                          date: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Payment method</label>
                    <select
                      value={paymentDraft.method}
                      onChange={(event) =>
                        setPaymentDraft({
                          ...paymentDraft,
                          method: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Payment type</label>
                    <select
                      value={paymentDraft.type}
                      onChange={(event) =>
                        setPaymentDraft({
                          ...paymentDraft,
                          type: event.target.value as PaymentType,
                        })
                      }
                      className={inputClass}
                    >
                      <option>Advance</option>
                      <option>Partial</option>
                      <option>Full</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Payment status</label>
                  <select
                    value={paymentDraft.status}
                    onChange={(event) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        status: event.target.value as PaymentStatus,
                      })
                    }
                    className={inputClass}
                  >
                    <option>Received</option>
                    <option>Pending</option>
                    <option>Refunded</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Transaction reference (optional)
                  </label>
                  <input
                    value={paymentDraft.reference}
                    onChange={(event) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        reference: event.target.value,
                      })
                    }
                    placeholder="UPI ID / transaction number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    rows={2}
                    value={paymentDraft.notes}
                    onChange={(event) =>
                      setPaymentDraft({
                        ...paymentDraft,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Additional payment details..."
                    className={inputClass}
                  />
                </div>

                <div className="rounded-xl border border-[#4B4937] bg-[#292A21] p-3 text-xs text-[#C5C7BC]">
                  <p className="font-medium text-[#E7DDA0]">
                    Payment accounting
                  </p>
                  <p className="mt-1">
                    Only records marked Received are counted as collected income.
                    Pending records are not included until their status is updated.
                  </p>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPaymentModal(false)}
                    className="flex-1 rounded-xl border border-[#454A3D] px-4 py-3 text-sm text-[#C0C3B9] hover:bg-[#30352F]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C8BD79] px-4 py-3 text-sm font-semibold text-[#171914] hover:brightness-110"
                  >
                    {editingPaymentId ? "Update Payment" : "Save Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <footer className="pb-3 pt-2 text-center text-xs text-[#656D64]">
          KBC Salon Academy · Financial Management
        </footer>
      </div>
    </main>
  );
}
