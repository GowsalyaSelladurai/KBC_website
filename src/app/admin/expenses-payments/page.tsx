"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Wallet,
  Receipt,
  CreditCard,
  TrendingUp,
  Plus,
  Search,
  Download,
  Trash2,
  Pencil,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownRight,
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

const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer"];

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

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem(EXPENSE_KEY);
      const savedPayments = localStorage.getItem(PAYMENT_KEY);
      const savedAppointments = localStorage.getItem(APPOINTMENT_KEY);

      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedPayments) setPayments(JSON.parse(savedPayments));
      if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    } catch (error) {
      console.error("Unable to load financial records:", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  }, [expenses, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
  }, [payments, loaded]);

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

  const cardClass =
    "gold-ambient-card rounded-2xl bg-[#121414] p-5 text-[#F5F3E8]";

  const inputClass =
    "w-full rounded-xl border border-[#D9BE64]/30 bg-[#121414] px-4 py-3 text-sm text-[#F5F3E8] outline-none transition placeholder:text-[#7A7E75] focus:border-[#FFF4CE]";

  const labelClass =
    "mb-2 block text-xs font-medium uppercase tracking-wider text-[#A9ACA2]";

  const statusStyle = (status: string) => {
    if (status === "Received") {
      return "bg-emerald-400/15 text-emerald-300";
    }

    if (status === "Pending") {
      return "bg-amber-400/15 text-amber-300";
    }

    if (status === "Refunded") {
      return "bg-red-400/15 text-red-300";
    }

    return "bg-[#D9D19A]/15 text-[#D9D19A]";
  };

  return (
    <main className="min-h-screen bg-[#FAF5ED] p-4 text-[#F5F3E8] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* HEADER */}

        <header className="gold-ambient-card flex flex-col justify-between gap-5 rounded-2xl bg-[#121414] p-5 sm:p-6 lg:flex-row lg:items-center">
          <div>
            <div className="gold-card-accent mb-2 flex items-center gap-2 text-[#E8D39A]">
              <Sparkles size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Financial Management
              </span>
            </div>

            <h1 className="gold-card-title text-3xl font-semibold tracking-tight text-[#F5F3E8] sm:text-4xl">
              Expenses &amp; Payments
            </h1>

            <p className="gold-card-muted mt-2 text-sm text-[#9CA097]">
              Manage salon spending, customer payments and outstanding balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-xl border border-[#D9BE64]/35 bg-[#121414] px-4 py-3 text-sm text-[#F5F3E8] outline-none transition focus:border-[#FFF4CE]"
            >
              <option className="bg-[#121414] text-[#F5F3E8]">This Month</option>
              <option className="bg-[#121414] text-[#F5F3E8]">Today</option>
              <option className="bg-[#121414] text-[#F5F3E8]">This Week</option>
              <option className="bg-[#121414] text-[#F5F3E8]">This Year</option>
              <option className="bg-[#121414] text-[#F5F3E8]">All Time</option>
            </select>

            <button
              onClick={exportCSV}
              className="gold-card-pill flex items-center gap-2 rounded-xl border border-[#D9BE64]/45 bg-[#121414] px-4 py-3 text-sm text-[#FFF4CE] transition hover:bg-[#17140D] hover:text-[#FFF4CE]"
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-5 py-3 text-sm font-semibold text-[#17140D] shadow-md shadow-[#C9A45C]/25 transition hover:brightness-105"
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
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Total Expenses
              </span>
              <div className="gold-card-icon rounded-xl bg-red-400/15 p-3 text-red-300">
                <Receipt size={20} />
              </div>
            </div>
            <h2 className="gold-card-title mt-5 text-2xl font-semibold text-[#F5F3E8]">
              {money(totalExpenses)}
            </h2>
            <p className="gold-card-muted mt-2 text-xs text-[#8D9289]">
              {visibleExpenses.length} expense records
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Payments Received
              </span>
              <div className="gold-card-icon rounded-xl bg-emerald-400/15 p-3 text-emerald-300">
                <Wallet size={20} />
              </div>
            </div>
            <h2 className="gold-card-title mt-5 text-2xl font-semibold text-emerald-300">
              {money(receivedPayments)}
            </h2>
            <p className="gold-card-muted mt-2 text-xs text-[#8D9289]">
              {visiblePayments.filter((item) => item.status === "Received").length} successful records
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Pending Payments
              </span>
              <div className="gold-card-icon rounded-xl bg-amber-400/15 p-3 text-amber-300">
                <Clock size={20} />
              </div>
            </div>
            <h2 className="gold-card-title mt-5 text-2xl font-semibold text-amber-300">
              {money(pendingPayments)}
            </h2>
            <p className="gold-card-muted mt-2 text-xs text-[#8D9289]">
              Awaiting customer payment
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="gold-card-muted text-sm text-[#A9ACA2]">
                Net Cash Position
              </span>
              <div className="gold-card-icon rounded-xl bg-[#E8D39A]/15 p-3 text-[#FFF4CE]">
                <TrendingUp size={20} />
              </div>
            </div>
            <h2
              className={`gold-card-title mt-5 text-2xl font-semibold ${
                netBalance >= 0 ? "text-[#FFF4CE]" : "text-red-300"
              }`}
            >
              {money(netBalance)}
            </h2>
            <p className="gold-card-muted mt-2 text-xs text-[#8D9289]">
              Collected payments minus expenses
            </p>
          </div>
        </section>

        {/* TAB SWITCHER */}

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="inline-flex w-fit rounded-xl border border-[#D9BE64]/35 bg-[#121414] p-1 shadow-sm">
            <button
              onClick={() => {
                setActiveTab("Expenses");
                setSearch("");
                setFilter("All");
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition ${
                activeTab === "Expenses"
                  ? "bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] font-semibold text-[#17140D] shadow-md"
                  : "text-[#A9ACA2] hover:text-[#FFF4CE]"
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
                  ? "bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] font-semibold text-[#17140D] shadow-md"
                  : "text-[#A9ACA2] hover:text-[#FFF4CE]"
              }`}
            >
              <CreditCard size={17} />
              Payments
            </button>
          </div>

          <div className="text-xs font-medium text-[#5C5549]">
            Showing records: {period}
          </div>
        </section>

        {/* EXPENSES TAB */}

        {activeTab === "Expenses" && (
          <section className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-3">
              <div className={`${cardClass} xl:col-span-1`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="gold-card-title font-semibold text-[#F5F3E8]">
                      Expense Breakdown
                    </h2>
                    <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                      Spending by category
                    </p>
                  </div>
                  <Filter size={18} className="gold-card-accent text-[#E8D39A]" />
                </div>

                {categorySummary.length > 0 ? (
                  <div className="mt-7 space-y-5">
                    {categorySummary.map((item) => (
                      <div key={item.name}>
                        <div className="mb-2 flex justify-between gap-2 text-sm">
                          <span className="gold-card-title text-[#D7D9D0]">
                            {item.name}
                          </span>
                          <span className="gold-card-accent font-medium text-[#E8D39A]">
                            {money(item.amount)}
                          </span>
                        </div>
                        <div className="gold-card-track h-2 overflow-hidden rounded-full bg-[#242826]">
                          <div
                            className="gold-card-bar h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#FFF4CE]"
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
                    <Receipt size={34} className="gold-card-muted mb-3 text-[#73796F]" />
                    <p className="gold-card-title text-sm text-[#A9ACA2]">
                      No expenses recorded
                    </p>
                    <p className="gold-card-muted mt-1 text-xs text-[#73796F]">
                      Add an expense to see your breakdown.
                    </p>
                  </div>
                )}
              </div>

              <div className={`${cardClass} xl:col-span-2`}>
                <div>
                  <h2 className="gold-card-title font-semibold text-[#F5F3E8]">
                    Expense Overview
                  </h2>
                  <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
                    Your business spending summary
                  </p>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="gold-ambient-card rounded-xl bg-[#121414] p-5">
                    <div className="gold-card-muted flex items-center gap-2 text-[#A9ACA2]">
                      <ArrowDownRight size={18} className="gold-card-accent text-red-300" />
                      <span className="text-xs">Total Spending</span>
                    </div>
                    <h3 className="gold-card-title mt-3 text-2xl font-semibold text-[#F5F3E8]">
                      {money(totalExpenses)}
                    </h3>
                    <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                      In selected period
                    </p>
                  </div>

                  <div className="gold-ambient-card rounded-xl bg-[#121414] p-5">
                    <div className="gold-card-muted flex items-center gap-2 text-[#A9ACA2]">
                      <FileText size={18} className="gold-card-accent text-[#E8D39A]" />
                      <span className="text-xs">Expense Records</span>
                    </div>
                    <h3 className="gold-card-title mt-3 text-2xl font-semibold text-[#F5F3E8]">
                      {visibleExpenses.length}
                    </h3>
                    <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                      Total entries in selected period
                    </p>
                  </div>
                </div>

                <div className="gold-ambient-card mt-5 rounded-xl bg-[#121414] p-5">
                  <div className="gold-card-accent flex items-center gap-2 text-[#FFF4CE]">
                    <Sparkles size={17} />
                    <span className="text-sm font-semibold">Spending Insight</span>
                  </div>
                  <p className="gold-card-muted mt-2 text-sm text-[#C5C7BC]">
                    {categorySummary.length > 0
                      ? `${categorySummary[0].name} is your highest expense category, accounting for ${money(categorySummary[0].amount)} in this period.`
                      : "Your expense insights will appear here once you record business expenses."}
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="gold-card-title text-lg font-semibold text-[#F5F3E8]">
                    Expense Records
                  </h2>
                  <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
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
                      className="w-full rounded-xl border border-[#D9BE64]/30 bg-[#121414] py-3 pl-9 pr-3 text-sm text-[#F5F3E8] outline-none transition placeholder:text-[#7A7E75] focus:border-[#FFF4CE]"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-[#D9BE64]/30 bg-[#121414] px-4 py-3 text-sm text-[#F5F3E8] outline-none transition focus:border-[#FFF4CE]"
                  >
                    <option value="All" className="bg-[#121414] text-[#F5F3E8]">
                      All categories
                    </option>
                    {expenseCategories.map((category) => (
                      <option key={category} className="bg-[#121414] text-[#F5F3E8]">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead>
                    <tr className="gold-table-head border-b border-[#D9BE64]/20 text-xs uppercase tracking-wider text-[#858B82]">
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
                          className="gold-table-row border-b border-[#D9BE64]/10 last:border-0"
                        >
                          <td className="py-4">
                            <p className="gold-card-title text-sm font-medium text-[#F5F3E8]">
                              {item.title}
                            </p>
                            {item.notes && (
                              <p className="gold-card-muted mt-1 max-w-[180px] truncate text-xs text-[#858B82]">
                                {item.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-4">
                            <span className="gold-card-pill rounded-full bg-[#E8D39A]/15 px-3 py-1 text-xs text-[#FFF4CE]">
                              {item.category}
                            </span>
                          </td>
                          <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                            {formatDate(item.date)}
                          </td>
                          <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                            {item.paymentMethod}
                          </td>
                          <td className="gold-card-title py-4 text-right text-sm font-semibold text-red-300">
                            − {money(item.amount)}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditExpense(item)}
                                title="Edit expense"
                                className="gold-row-btn rounded-lg p-2 text-[#A9ACA2] transition hover:bg-black/15 hover:text-[#17140D]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteExpense(item.id)}
                                title="Delete expense"
                                className="gold-row-btn rounded-lg p-2 text-[#A9ACA2] transition hover:bg-black/15 hover:text-[#17140D]"
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
                          className="gold-card-muted py-14 text-center text-sm text-[#858B82]"
                        >
                          No expenses found. Add your first expense.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="gold-card-muted mt-4 border-t border-[#D9BE64]/15 pt-4 text-xs text-[#858B82]">
                Showing {filteredExpenses.length} expense records
              </div>
            </div>
          </section>
        )}

        {/* PAYMENTS TAB */}

        {activeTab === "Payments" && (
          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="gold-card-muted text-sm text-[#A9ACA2]">
                    Amount Received
                  </span>
                  <CheckCircle2
                    className="gold-card-accent text-emerald-300"
                    size={21}
                  />
                </div>
                <h3 className="gold-card-title mt-5 text-2xl font-semibold text-emerald-300">
                  {money(receivedPayments)}
                </h3>
                <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                  Successful payments
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="gold-card-muted text-sm text-[#A9ACA2]">
                    Outstanding
                  </span>
                  <AlertCircle
                    className="gold-card-accent text-amber-300"
                    size={21}
                  />
                </div>
                <h3 className="gold-card-title mt-5 text-2xl font-semibold text-amber-300">
                  {money(pendingPayments)}
                </h3>
                <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                  Pending payment records
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="gold-card-muted text-sm text-[#A9ACA2]">
                    Refunds
                  </span>
                  <RefreshCw
                    className="gold-card-accent text-red-300"
                    size={21}
                  />
                </div>
                <h3 className="gold-card-title mt-5 text-2xl font-semibold text-red-300">
                  {money(refundedPayments)}
                </h3>
                <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                  Refunded payment records
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <span className="gold-card-muted text-sm text-[#A9ACA2]">
                    Net Collected
                  </span>
                  <Wallet
                    className="gold-card-accent text-[#FFF4CE]"
                    size={21}
                  />
                </div>
                <h3 className="gold-card-title mt-5 text-2xl font-semibold text-[#FFF4CE]">
                  {money(netCollected)}
                </h3>
                <p className="gold-card-muted mt-2 text-xs text-[#858B82]">
                  Received minus refunds
                </p>
              </div>
            </div>

            <div className={`${cardClass} grid gap-5 md:grid-cols-3`}>
              <div className="flex items-center gap-4">
                <div className="gold-card-icon rounded-xl bg-emerald-400/15 p-3 text-emerald-300">
                  <Banknote size={23} />
                </div>
                <div>
                  <p className="gold-card-muted text-xs text-[#92978F]">
                    Cash Received
                  </p>
                  <p className="gold-card-title mt-1 text-lg font-semibold text-[#F5F3E8]">
                    {money(
                      visiblePayments
                        .filter(
                          (item) =>
                            item.status === "Received" && item.method === "Cash"
                        )
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="gold-card-icon rounded-xl bg-blue-400/15 p-3 text-blue-300">
                  <Smartphone size={23} />
                </div>
                <div>
                  <p className="gold-card-muted text-xs text-[#92978F]">
                    UPI Received
                  </p>
                  <p className="gold-card-title mt-1 text-lg font-semibold text-[#F5F3E8]">
                    {money(
                      visiblePayments
                        .filter(
                          (item) =>
                            item.status === "Received" && item.method === "UPI"
                        )
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="gold-card-icon rounded-xl bg-purple-400/15 p-3 text-purple-300">
                  <CreditCard size={23} />
                </div>
                <div>
                  <p className="gold-card-muted text-xs text-[#92978F]">
                    Card Received
                  </p>
                  <p className="gold-card-title mt-1 text-lg font-semibold text-[#F5F3E8]">
                    {money(
                      visiblePayments
                        .filter(
                          (item) =>
                            item.status === "Received" && item.method === "Card"
                        )
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="gold-card-title text-lg font-semibold text-[#F5F3E8]">
                    Payment Transactions
                  </h2>
                  <p className="gold-card-muted mt-1 text-xs text-[#92978F]">
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
                      className="w-full rounded-xl border border-[#D9BE64]/30 bg-[#121414] py-3 pl-9 pr-3 text-sm text-[#F5F3E8] outline-none transition placeholder:text-[#7A7E75] focus:border-[#FFF4CE]"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-[#D9BE64]/30 bg-[#121414] px-4 py-3 text-sm text-[#F5F3E8] outline-none transition focus:border-[#FFF4CE]"
                  >
                    <option value="All" className="bg-[#121414] text-[#F5F3E8]">
                      All payments
                    </option>
                    {paymentStatuses.map((status) => (
                      <option key={status} className="bg-[#121414] text-[#F5F3E8]">
                        {status}
                      </option>
                    ))}
                    {paymentMethods.map((method) => (
                      <option key={method} className="bg-[#121414] text-[#F5F3E8]">
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="gold-table-head border-b border-[#D9BE64]/20 text-xs uppercase tracking-wider text-[#858B82]">
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
                          className="gold-table-row border-b border-[#D9BE64]/10 last:border-0"
                        >
                          <td className="py-4">
                            <p className="gold-card-title text-sm font-medium text-[#F5F3E8]">
                              {item.customer}
                            </p>
                            {item.reference && (
                              <p className="gold-card-muted mt-1 text-xs text-[#858B82]">
                                Ref: {item.reference}
                              </p>
                            )}
                          </td>
                          <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                            {item.service || "General Payment"}
                          </td>
                          <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                            {formatDate(item.date)}
                          </td>
                          <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
                            {item.method}
                          </td>
                          <td className="gold-card-muted py-4 text-sm text-[#A9ACA2]">
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
                              className={`gold-card-pill rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${statusStyle(
                                item.status
                              )}`}
                              aria-label={`Payment status for ${item.customer}`}
                            >
                              {paymentStatuses.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-[#121414] text-[#F5F3E8]"
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="gold-card-title py-4 text-right text-sm font-semibold text-[#F5F3E8]">
                            {money(item.amount)}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditPayment(item)}
                                title="Edit payment"
                                className="gold-row-btn rounded-lg p-2 text-[#A9ACA2] transition hover:bg-black/15 hover:text-[#17140D]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deletePayment(item.id)}
                                title="Delete payment"
                                className="gold-row-btn rounded-lg p-2 text-[#A9ACA2] transition hover:bg-black/15 hover:text-[#17140D]"
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
                          className="gold-card-muted py-14 text-center text-sm text-[#858B82]"
                        >
                          No payment records found. Record your first payment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="gold-card-muted mt-4 border-t border-[#D9BE64]/15 pt-4 text-xs text-[#858B82]">
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
            <div className="gold-modal-card my-auto w-full max-w-lg rounded-2xl border border-[#D9BE64]/50 bg-[#121414] p-6 text-[#F5F3E8] shadow-[0_0_40px_rgba(232,211,154,0.22)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F3E8]">
                    {editingExpenseId ? "Edit Expense" : "Add Expense"}
                  </h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Record your salon business spending
                  </p>
                </div>

                <button
                  onClick={() => setExpenseModal(false)}
                  className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
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
                        <option
                          key={category}
                          className="bg-[#121414] text-[#F5F3E8]"
                        >
                          {category}
                        </option>
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
                        <option
                          key={method}
                          className="bg-[#121414] text-[#F5F3E8]"
                        >
                          {method}
                        </option>
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
                    className="flex-1 rounded-xl border border-[#D9BE64]/35 px-4 py-3 text-sm text-[#C0C3B9] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-4 py-3 text-sm font-semibold text-[#17140D] transition hover:brightness-105"
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
            <div className="gold-modal-card my-auto w-full max-w-xl rounded-2xl border border-[#D9BE64]/50 bg-[#121414] p-6 text-[#F5F3E8] shadow-[0_0_40px_rgba(232,211,154,0.22)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F3E8]">
                    {editingPaymentId ? "Edit Payment" : "Record Customer Payment"}
                  </h2>
                  <p className="mt-1 text-xs text-[#92978F]">
                    Enter the actual payment details received or expected
                  </p>
                </div>

                <button
                  onClick={() => setPaymentModal(false)}
                  className="rounded-lg p-2 text-[#A9ACA2] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
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
                      onChange={(event) => selectAppointment(event.target.value)}
                      className={inputClass}
                    >
                      <option value="" className="bg-[#121414] text-[#F5F3E8]">
                        Select appointment
                      </option>
                      {appointments.map((appointment) => (
                        <option
                          key={appointment.id}
                          value={appointment.id}
                          className="bg-[#121414] text-[#F5F3E8]"
                        >
                          {appointment.customer} · {appointment.service} ·{" "}
                          {formatDate(appointment.date)}
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
                        <option
                          key={method}
                          className="bg-[#121414] text-[#F5F3E8]"
                        >
                          {method}
                        </option>
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
                      <option className="bg-[#121414] text-[#F5F3E8]">
                        Advance
                      </option>
                      <option className="bg-[#121414] text-[#F5F3E8]">
                        Partial
                      </option>
                      <option className="bg-[#121414] text-[#F5F3E8]">
                        Full
                      </option>
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
                    <option className="bg-[#121414] text-[#F5F3E8]">
                      Received
                    </option>
                    <option className="bg-[#121414] text-[#F5F3E8]">
                      Pending
                    </option>
                    <option className="bg-[#121414] text-[#F5F3E8]">
                      Refunded
                    </option>
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

                <div className="rounded-xl border border-[#D9BE64]/35 bg-[#191C1B] p-3 text-xs text-[#C5C7BC]">
                  <p className="font-medium text-[#FFF4CE]">Payment accounting</p>
                  <p className="mt-1">
                    Only records marked Received are counted as collected income.
                    Pending records are not included until their status is updated.
                  </p>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPaymentModal(false)}
                    className="flex-1 rounded-xl border border-[#D9BE64]/35 px-4 py-3 text-sm text-[#C0C3B9] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#FFF4CE] via-[#E8D39A] to-[#C9A45C] px-4 py-3 text-sm font-semibold text-[#17140D] transition hover:brightness-105"
                  >
                    {editingPaymentId ? "Update Payment" : "Save Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="pb-3 pt-2 text-center text-xs font-medium text-[#6B6457]">
          KBC Salon Academy · Financial Management
        </footer>
      </div>

      {/* CHAMPAGNE GOLD CARD HOVER, OUTER GLOW & TOUCH EFFECT */}

      <style jsx global>{`
        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          background-color: #121414;
          color: #f5f3e8;
          border: 1px solid rgba(232, 211, 154, 0.55);
          box-shadow:
            0 0 12px rgba(232, 211, 154, 0.16),
            0 0 28px rgba(201, 164, 92, 0.12),
            0 10px 26px rgba(18, 20, 20, 0.16);
          transition:
            transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 280ms ease,
            box-shadow 280ms ease,
            background 280ms ease,
            color 280ms ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
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
            0 0 16px rgba(255, 244, 206, 0.65),
            0 0 36px rgba(232, 211, 154, 0.48),
            0 0 60px rgba(201, 164, 92, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
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

        .gold-ambient-card:hover .gold-card-track,
        .gold-ambient-card:active .gold-card-track {
          background-color: rgba(23, 20, 13, 0.16) !important;
        }

        .gold-ambient-card:hover .gold-card-bar,
        .gold-ambient-card:active .gold-card-bar {
          background: #17140d !important;
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

        @media (hover: hover) {
          .gold-ambient-card:hover {
            transform: translateY(-2px);
          }
        }

        @media (hover: none) {
          .gold-ambient-card:active {
            transform: scale(0.992);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card {
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