
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ElementType,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  User,
  Phone,
  Scissors,
  Pencil,
  Trash2,
  X,
  Check,
  CheckCircle2,
  Filter,
  IndianRupee,
  CalendarCheck,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  MoreHorizontal,
  Users,
  CalendarClock,
  LayoutGrid,
  List,
  CircleCheck,
  CircleDashed,
  Timer,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type AppointmentStatus =
  | "Confirmed"
  | "Pending"
  | "Completed"
  | "Cancelled";

type Appointment = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  amount: number;
  status: AppointmentStatus;
  notes: string;
  durationMinutes?: number;
};

type AppointmentDraft = Omit<Appointment, "id">;
type CalendarView = "Day" | "Week" | "Month";

// =====================================================
// CONSTANTS
// =====================================================

const STORAGE_KEY = "kbc_appointments_v1";

const GOLD = "#EFE8A8";

const services = [
  "Hair Styling",
  "Hair Cut",
  "Hair Coloring",
  "Bridal Makeup",
  "Party Makeup",
  "Facial",
  "Hair Spa",
  "Manicure",
  "Pedicure",
  "Beauty Consultation",
];

const staffMembers = [
  "Kavya",
  "Priya",
  "Anitha",
  "Divya",
  "Meena",
];

const serviceDurations: Record<string, number> = {
  "Hair Styling": 45,
  "Hair Cut": 30,
  "Hair Coloring": 120,
  "Bridal Makeup": 180,
  "Party Makeup": 90,
  Facial: 60,
  "Hair Spa": 60,
  Manicure: 45,
  Pedicure: 45,
  "Beauty Consultation": 30,
};

const statusStyles: Record<AppointmentStatus, string> = {
  Confirmed: "bg-emerald-400",
  Pending: "bg-amber-300",
  Completed: "bg-sky-400",
  Cancelled: "bg-red-400",
};

const statusBadgeStyles: Record<AppointmentStatus, string> = {
  Confirmed:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Pending:
    "border-amber-300/20 bg-amber-300/10 text-amber-200",
  Completed:
    "border-sky-400/20 bg-sky-400/10 text-sky-300",
  Cancelled:
    "border-red-400/20 bg-red-400/10 text-red-300",
};

// Every reusable panel gets the ambient glow.
const panel =
  "gold-ambient-card rounded-2xl border border-[#EFE8A8]/10 bg-[#1B1F1D]";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#EFE8A8]/15 bg-[#121414] px-4 py-3 text-sm text-[#F5F3E8] outline-none transition placeholder:text-[#73766E] focus:border-[#EFE8A8]/60";

const labelClass =
  "text-sm font-medium text-[#D8D6C8]";

// =====================================================
// DATE HELPERS
// =====================================================

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeInMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getAppointmentDuration(appointment: Appointment) {
  return (
    appointment.durationMinutes ||
    serviceDurations[appointment.service] ||
    60
  );
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
}

function formatCurrency(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

// =====================================================
// STAFF CONFLICT DETECTION
// =====================================================

function findStaffConflict(
  appointments: Appointment[],
  draft: AppointmentDraft,
  editingId: string | null
): Appointment | null {
  if (
    !draft.date ||
    !draft.time ||
    !draft.staff ||
    draft.status === "Cancelled"
  ) {
    return null;
  }

  const startTime = getTimeInMinutes(draft.time);
  const duration =
    Number(draft.durationMinutes) ||
    serviceDurations[draft.service] ||
    60;

  const endTime = startTime + duration;

  return (
    appointments.find((appointment) => {
      if (
        appointment.id === editingId ||
        appointment.status === "Cancelled" ||
        appointment.date !== draft.date ||
        appointment.staff !== draft.staff
      ) {
        return false;
      }

      const existingStart = getTimeInMinutes(appointment.time);
      const existingEnd =
        existingStart + getAppointmentDuration(appointment);

      return startTime < existingEnd && endTime > existingStart;
    }) || null
  );
}

// =====================================================
// SAMPLE DATA
// =====================================================

function getInitialAppointments(): Appointment[] {
  const today = new Date();

  return [
    {
      id: "KBC-001",
      customer: "Anjali Kumar",
      phone: "9876543210",
      service: "Bridal Makeup",
      staff: "Kavya",
      date: dateKey(today),
      time: "09:00",
      amount: 4500,
      status: "Confirmed",
      notes: "Bridal consultation and makeup.",
      durationMinutes: 180,
    },
    {
      id: "KBC-002",
      customer: "Priya Sharma",
      phone: "9876543211",
      service: "Hair Styling",
      staff: "Anitha",
      date: dateKey(today),
      time: "11:00",
      amount: 1200,
      status: "Pending",
      notes: "",
      durationMinutes: 45,
    },
    {
      id: "KBC-003",
      customer: "Divya Raj",
      phone: "9876543212",
      service: "Facial",
      staff: "Meena",
      date: dateKey(today),
      time: "14:00",
      amount: 1800,
      status: "Confirmed",
      notes: "",
      durationMinutes: 60,
    },
    {
      id: "KBC-004",
      customer: "Sneha",
      phone: "9876543213",
      service: "Hair Coloring",
      staff: "Priya",
      date: dateKey(addDays(today, 1)),
      time: "10:30",
      amount: 2500,
      status: "Pending",
      notes: "Customer requested a consultation.",
      durationMinutes: 120,
    },
    {
      id: "KBC-005",
      customer: "Meera",
      phone: "9876543214",
      service: "Party Makeup",
      staff: "Kavya",
      date: dateKey(addDays(today, 2)),
      time: "16:00",
      amount: 3000,
      status: "Confirmed",
      notes: "",
      durationMinutes: 90,
    },
  ];
}

const emptyDraft: AppointmentDraft = {
  customer: "",
  phone: "",
  service: "Hair Styling",
  staff: "Kavya",
  date: dateKey(new Date()),
  time: "09:00",
  amount: 0,
  status: "Pending",
  notes: "",
  durationMinutes: 45,
};

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

function StatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${statusBadgeStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusStyles[status]}`}
      />
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ElementType;
  accent: string;
}) {
  return (
    <div className="gold-ambient-card group relative overflow-hidden rounded-2xl border border-[#EFE8A8]/10 bg-[#1B1F1D] p-5 transition duration-300 hover:-translate-y-1">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.06] blur-2xl transition group-hover:opacity-20"
        style={{ background: accent }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium text-[#A5A79D]">
          {title}
        </p>

        <div
          className="rounded-xl border border-white/5 p-2.5"
          style={{
            backgroundColor: `${accent}15`,
            color: accent,
          }}
        >
          <Icon size={19} />
        </div>
      </div>

      <div className="relative mt-5">
        <p className="text-3xl font-semibold tracking-tight text-[#F5F3E8]">
          {value}
        </p>

        <p className="mt-1.5 text-[11px] text-[#92958C]">
          {description}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl border border-[#EFE8A8]/15 bg-[#EFE8A8]/10 p-2.5 text-[#EFE8A8]">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EFE8A8]/65">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#F5F3E8]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs text-[#92958C]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// CALENDAR DATE CELL
// =====================================================

function CalendarDateCell({
  date,
  appointments,
  selected,
  today,
  currentMonth,
  onSelect,
  onAdd,
}: {
  date: Date;
  appointments: Appointment[];
  selected: boolean;
  today: boolean;
  currentMonth: boolean;
  onSelect: () => void;
  onAdd: () => void;
}) {
  const activeAppointments = appointments.filter(
    (item) => item.status !== "Cancelled"
  );

  return (
    <div
      className={`gold-ambient-card group relative min-h-[112px] border-b border-r border-[#EFE8A8]/10 p-2 transition sm:min-h-[130px] sm:p-3 ${
        !currentMonth ? "opacity-30" : ""
      } ${
        selected
          ? "bg-[#EFE8A8]/10 ring-1 ring-inset ring-[#EFE8A8]/40"
          : "hover:bg-[#EFE8A8]/[0.04]"
      }`}
    >
      <button
        onClick={onSelect}
        className="flex w-full items-center justify-between text-left"
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
            today
              ? "bg-[#EFE8A8] font-bold text-[#121414]"
              : selected
                ? "bg-[#EFE8A8]/20 font-semibold text-[#EFE8A8]"
                : "text-[#D8D6C8] group-hover:bg-white/5"
          }`}
        >
          {date.getDate()}
        </span>

        {activeAppointments.length > 0 && (
          <span className="rounded-full bg-[#EFE8A8]/10 px-2 py-0.5 text-[10px] text-[#EFE8A8]">
            {activeAppointments.length}
          </span>
        )}
      </button>

      <div className="mt-3 space-y-1.5">
        {appointments.slice(0, 2).map((item) => (
          <button
            key={item.id}
            onClick={onSelect}
            title={`${item.customer} – ${item.service}`}
            className="flex w-full items-center gap-1.5 truncate rounded-md bg-white/[0.035] px-1.5 py-1 text-left text-[10px] text-[#D8D6C8] transition hover:bg-white/[0.08]"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyles[item.status]}`}
            />
            <span className="truncate">
              {formatTime(item.time)} {item.customer}
            </span>
          </button>
        ))}

        {appointments.length > 2 && (
          <button
            onClick={onSelect}
            className="px-1 text-[10px] text-[#EFE8A8] hover:underline"
          >
            +{appointments.length - 2} more
          </button>
        )}
      </div>

      <button
        onClick={onAdd}
        title="Add appointment on this date"
        className="absolute bottom-2 right-2 hidden h-6 w-6 items-center justify-center rounded-md border border-[#EFE8A8]/20 bg-[#1B1F1D] text-[#EFE8A8] opacity-0 transition hover:bg-[#EFE8A8] hover:text-[#121414] group-hover:opacity-100 sm:flex"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

// =====================================================
// APPOINTMENT ROW
// =====================================================

function AppointmentRow({
  appointment,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  appointment: Appointment;
  onEdit: (item: Appointment) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-[#EFE8A8]/[0.07] transition hover:bg-[#EFE8A8]/[0.025]">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EFE8A8]/15 bg-[#EFE8A8]/10 text-xs font-semibold text-[#EFE8A8]">
            {appointment.customer
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-[#F5F3E8]">
              {appointment.customer}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[#92958C]">
              <Phone size={11} />
              {appointment.phone}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-[#D8D6C8]">
          {appointment.service}
        </p>
        <p className="mt-1 text-[11px] text-[#92958C]">
          {formatDuration(getAppointmentDuration(appointment))}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-[#F5F3E8]">
          {formatDate(parseDate(appointment.date))}
        </p>
        <p className="mt-1 text-[11px] text-[#92958C]">
          {formatTime(appointment.time)}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-[#D8D6C8]">
        {appointment.staff}
      </td>

      <td className="px-4 py-4 text-sm font-semibold text-[#EFE8A8]">
        {formatCurrency(appointment.amount)}
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={appointment.status} />
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(appointment)}
            title="Edit appointment"
            className="rounded-lg p-2 text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
          >
            <Pencil size={15} />
          </button>

          {appointment.status === "Pending" && (
            <button
              onClick={() =>
                onStatusChange(appointment.id, "Confirmed")
              }
              title="Confirm appointment"
              className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-500/10"
            >
              <Check size={16} />
            </button>
          )}

          {appointment.status === "Confirmed" && (
            <button
              onClick={() =>
                onStatusChange(appointment.id, "Completed")
              }
              title="Mark completed"
              className="rounded-lg p-2 text-sky-300 transition hover:bg-sky-500/10"
            >
              <CheckCircle2 size={16} />
            </button>
          )}

          <button
            onClick={() => onDelete(appointment.id)}
            title="Delete appointment"
            className="rounded-lg p-2 text-red-300 transition hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] =
    useState<CalendarView>("Week");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] =
    useState<AppointmentDraft>(emptyDraft);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarAnimation, setCalendarAnimation] = useState(0);

  // ---------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Appointment[];

        setAppointments(
          parsed.map((item) => ({
            ...item,
            durationMinutes:
              item.durationMinutes ||
              serviceDurations[item.service] ||
              60,
          }))
        );
      } else {
        setAppointments(getInitialAppointments());
      }
    } catch {
      setAppointments(getInitialAppointments());
    }

    setStorageLoaded(true);
  }, []);

  // ---------------------------------------------------
  // SAVE DATA
  // ---------------------------------------------------

  useEffect(() => {
    if (!storageLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appointments)
      );
    } catch (error) {
      console.error("Unable to save appointments:", error);
    }
  }, [appointments, storageLoaded]);

  // ---------------------------------------------------
  // LIVE CONFLICT CHECK
  // ---------------------------------------------------

  const staffConflict = useMemo(
    () =>
      findStaffConflict(appointments, draft, editingId),
    [appointments, draft, editingId]
  );

  // ---------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------

  const todayKey = dateKey(new Date());

  const todaysAppointments = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            item.date === todayKey &&
            item.status !== "Cancelled"
        )
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, todayKey]
  );

  const pendingCount = appointments.filter(
    (item) => item.status === "Pending"
  ).length;

  const confirmedCount = appointments.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const totalRevenue = appointments
    .filter((item) => item.status === "Completed")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  const todayRevenue = todaysAppointments
    .filter((item) => item.status === "Completed")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  // ---------------------------------------------------
  // SEARCH AND FILTER
  // ---------------------------------------------------

  const filteredAppointments = useMemo(() => {
    const query = search.toLowerCase().trim();

    return appointments
      .filter((item) => {
        const matchesSearch =
          !query ||
          item.customer.toLowerCase().includes(query) ||
          item.phone.includes(query) ||
          item.service.toLowerCase().includes(query) ||
          item.staff.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);

        if (dateComparison !== 0) return dateComparison;

        return a.time.localeCompare(b.time);
      });
  }, [appointments, search, statusFilter]);

  const appointmentsForDate = (date: Date) => {
    const key = dateKey(date);

    return filteredAppointments.filter(
      (item) => item.date === key
    );
  };

  // ---------------------------------------------------
  // CALENDAR ARRAYS
  // ---------------------------------------------------

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );

    const firstCell = startOfWeek(firstOfMonth);

    return Array.from({ length: 42 }, (_, index) =>
      addDays(firstCell, index)
    );
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const first = startOfWeek(selectedDate);

    return Array.from({ length: 7 }, (_, index) =>
      addDays(first, index)
    );
  }, [selectedDate]);

  const visibleAppointments = useMemo(() => {
    if (calendarView === "Day") {
      return filteredAppointments.filter(
        (item) => item.date === dateKey(selectedDate)
      );
    }

    if (calendarView === "Week") {
      const first = startOfWeek(selectedDate);
      const last = addDays(first, 6);

      return filteredAppointments.filter(
        (item) =>
          item.date >= dateKey(first) &&
          item.date <= dateKey(last)
      );
    }

    return filteredAppointments.filter((item) => {
      const date = parseDate(item.date);

      return (
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth()
      );
    });
  }, [
    filteredAppointments,
    selectedDate,
    calendarView,
  ]);

  // ---------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------

  const changeDate = (direction: number) => {
    setCalendarAnimation((value) => value + 1);

    setSelectedDate((current) => {
      if (calendarView === "Day") {
        return addDays(current, direction);
      }

      if (calendarView === "Week") {
        return addDays(current, direction * 7);
      }

      const next = new Date(current);
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);

      return next;
    });
  };

  const goToToday = () => {
    setCalendarAnimation((value) => value + 1);
    setSelectedDate(new Date());
  };

  const selectCalendarView = (view: CalendarView) => {
    setCalendarAnimation((value) => value + 1);
    setCalendarView(view);
  };

  // ---------------------------------------------------
  // CREATE
  // ---------------------------------------------------

  const openCreateModal = (date?: Date) => {
    setEditingId(null);

    setDraft({
      ...emptyDraft,
      date: date ? dateKey(date) : dateKey(selectedDate),
    });

    setModalOpen(true);
  };

  // ---------------------------------------------------
  // EDIT
  // ---------------------------------------------------

  const openEditModal = (appointment: Appointment) => {
    setEditingId(appointment.id);

    setDraft({
      customer: appointment.customer,
      phone: appointment.phone,
      service: appointment.service,
      staff: appointment.staff,
      date: appointment.date,
      time: appointment.time,
      amount: appointment.amount,
      status: appointment.status,
      notes: appointment.notes,
      durationMinutes: getAppointmentDuration(appointment),
    });

    setModalOpen(true);
  };

  // ---------------------------------------------------
  // SAVE
  // ---------------------------------------------------

  const saveAppointment = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !draft.customer.trim() ||
      !draft.phone.trim() ||
      !draft.date ||
      !draft.time ||
      !draft.service ||
      !draft.staff
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (!/^[0-9+\-\s]{7,15}$/.test(draft.phone.trim())) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (Number(draft.amount) < 0) {
      alert("Amount cannot be negative.");
      return;
    }

    const conflict = findStaffConflict(
      appointments,
      draft,
      editingId
    );

    if (conflict) {
      alert(
        `Booking conflict! ${draft.staff} already has an appointment with ${conflict.customer} at ${formatTime(conflict.time)}. Please select another time or staff member.`
      );
      return;
    }

    const cleanDraft: AppointmentDraft = {
      ...draft,
      customer: draft.customer.trim(),
      phone: draft.phone.trim(),
      amount: Number(draft.amount) || 0,
      durationMinutes: Number(draft.durationMinutes) || 60,
    };

    if (editingId) {
      setAppointments((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...cleanDraft, id: editingId }
            : item
        )
      );
    } else {
      const newAppointment: Appointment = {
        ...cleanDraft,
        id: `KBC-${Date.now()}`,
      };

      setAppointments((current) => [
        ...current,
        newAppointment,
      ]);
    }

    setModalOpen(false);
    setEditingId(null);
  };

  // ---------------------------------------------------
  // STATUS UPDATE
  // ---------------------------------------------------

  const updateStatus = (
    id: string,
    status: AppointmentStatus
  ) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------

  const deleteAppointment = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) return;

    setAppointments((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  // ---------------------------------------------------
  // HEADING
  // ---------------------------------------------------

  const headingDate =
    calendarView === "Day"
      ? formatDate(selectedDate)
      : calendarView === "Week"
        ? `${formatDate(weekDays[0])} – ${formatDate(weekDays[6])}`
        : formatMonth(selectedDate);

  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------

  if (!storageLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#121414] text-[#EFE8A8]">
        <div className="flex items-center gap-3">
          <RefreshCw size={18} className="animate-spin" />
          Loading appointment command center...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <div className="min-h-screen space-y-6 bg-[#121414] p-4 text-[#F5F3E8] sm:p-6 lg:p-8">

      {/* HEADER */}

      <header className="gold-ambient-card relative overflow-hidden rounded-3xl border border-[#EFE8A8]/15 bg-gradient-to-br from-[#252923] via-[#1B1F1D] to-[#151816] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#EFE8A8]/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[#EFE8A8]/[0.035] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#EFE8A8]/70">
                KBC Salon Academy / Operations
              </p>
            </div>

            <h1 className="font-serif text-3xl tracking-tight text-[#F5F3E8] sm:text-4xl lg:text-5xl">
              Appointment
              <span className="ml-2 text-[#EFE8A8]">
                Command Center
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#A5A79D]">
              Your salon schedule, customer bookings and team
              appointments — organised in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#B8BAAF]">
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                <CalendarDays size={14} className="text-[#EFE8A8]" />
                {formatDate(new Date())}
              </span>

              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                <Users size={14} className="text-[#EFE8A8]" />
                {staffMembers.length} team members
              </span>
            </div>
          </div>

          <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFE8A8] px-6 py-3.5 text-sm font-bold text-[#121414] shadow-lg shadow-[#EFE8A8]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFF4B5] hover:shadow-[#EFE8A8]/20"
            >
              <Plus size={18} />
              Create Appointment
            </button>

            <button
              onClick={() => {
                goToToday();
                selectCalendarView("Day");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EFE8A8]/25 bg-white/[0.03] px-5 py-3 text-sm text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
            >
              <CalendarCheck size={16} />
              Today's Schedule
            </button>
          </div>
        </div>
      </header>

      {/* KPI STRIP */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Bookings"
          value={todaysAppointments.length}
          description="Appointments scheduled today"
          icon={CalendarDays}
          accent="#EFE8A8"
        />

        <StatCard
          title="Awaiting Confirmation"
          value={pendingCount}
          description="Bookings waiting for approval"
          icon={CircleDashed}
          accent="#FBBF24"
        />

        <StatCard
          title="Confirmed Bookings"
          value={confirmedCount}
          description="Ready for customer service"
          icon={CircleCheck}
          accent="#34D399"
        />

        <StatCard
          title="Completed Revenue"
          value={formatCurrency(totalRevenue)}
          description={`${completedCount} completed appointments`}
          icon={IndianRupee}
          accent="#7DD3FC"
        />
      </section>

      {/* TODAY AT A GLANCE */}

      <section className={`${panel} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-4 border-b border-[#EFE8A8]/10 p-5 sm:flex-row sm:items-center sm:p-6">
          <SectionHeading
            eyebrow="Live salon activity"
            title="Today's Agenda"
            description="A quick look at your appointments for today"
            icon={CalendarClock}
          />

          <button
            onClick={() => {
              setSelectedDate(new Date());
              selectCalendarView("Day");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EFE8A8]/20 px-4 py-2.5 text-xs font-medium text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
          >
            Open full schedule
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_250px]">
          <div className="p-5 sm:p-6">
            {todaysAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#EFE8A8]/20 px-5 py-12 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto text-[#EFE8A8]/50"
                />

                <h3 className="mt-3 font-medium text-[#F5F3E8]">
                  Your schedule is clear
                </h3>

                <p className="mt-1 text-sm text-[#A5A79D]">
                  No appointments are scheduled for today.
                </p>

                <button
                  onClick={() => openCreateModal(new Date())}
                  className="mt-4 rounded-xl bg-[#EFE8A8] px-5 py-2.5 text-sm font-semibold text-[#121414] transition hover:bg-[#FFF4B5]"
                >
                  <Plus size={15} className="mr-1 inline" />
                  Create appointment
                </button>
              </div>
            ) : (
              <div className="relative space-y-3">
                <div className="absolute bottom-7 left-[47px] top-7 w-px bg-gradient-to-b from-[#EFE8A8]/50 via-[#EFE8A8]/15 to-transparent" />

                {todaysAppointments.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative flex items-stretch gap-4"
                    style={{
                      animation: `fadeInUp 0.4s ease ${index * 0.06}s both`,
                    }}
                  >
                    <div className="w-12 shrink-0 pt-4 text-right">
                      <p className="text-[11px] font-semibold text-[#EFE8A8]">
                        {formatTime(item.time)}
                      </p>
                    </div>

                    <div className="relative z-10 mt-5 h-3 w-3 shrink-0 rounded-full border-2 border-[#EFE8A8] bg-[#1B1F1D] shadow-[0_0_12px_rgba(239,232,168,0.25)]" />

                    <button
                      onClick={() => openEditModal(item)}
                      className="gold-ambient-card group min-w-0 flex-1 rounded-xl border border-[#EFE8A8]/10 bg-[#121414] p-4 text-left transition duration-300 hover:bg-[#20241F]"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFE8A8]/10 text-[#EFE8A8] transition group-hover:scale-105">
                            <Scissors size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#F5F3E8]">
                              {item.customer}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#EFE8A8]">
                              {item.service}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#92958C]">
                              <span className="flex items-center gap-1">
                                <User size={11} />
                                {item.staff}
                              </span>

                              <span className="flex items-center gap-1">
                                <Timer size={11} />
                                {formatDuration(getAppointmentDuration(item))}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <StatusBadge status={item.status} />

                          <p className="text-sm font-semibold text-[#EFE8A8]">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TODAY SUMMARY */}

          <div className="gold-ambient-card border-t border-[#EFE8A8]/10 bg-[#151916] p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EFE8A8]/65">
              Daily summary
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs text-[#92958C]">
                  Total appointments
                </p>
                <p className="mt-1 text-3xl font-semibold text-[#F5F3E8]">
                  {todaysAppointments.length}
                </p>
              </div>

              <div className="h-px bg-[#EFE8A8]/10" />

              <div>
                <p className="text-xs text-[#92958C]">
                  Confirmed today
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-300">
                  {
                    todaysAppointments.filter(
                      (item) => item.status === "Confirmed"
                    ).length
                  }
                </p>
              </div>

              <div className="h-px bg-[#EFE8A8]/10" />

              <div>
                <p className="text-xs text-[#92958C]">
                  Pending today
                </p>
                <p className="mt-1 text-2xl font-semibold text-amber-200">
                  {
                    todaysAppointments.filter(
                      (item) => item.status === "Pending"
                    ).length
                  }
                </p>
              </div>

              <div className="h-px bg-[#EFE8A8]/10" />

              <div>
                <p className="text-xs text-[#92958C]">
                  Completed revenue today
                </p>
                <p className="mt-1 text-xl font-semibold text-[#EFE8A8]">
                  {formatCurrency(todayRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          CALENDAR + SELECTED DAY PANEL
      ================================================ */}

      <section className={`${panel} overflow-hidden`}>
        {/* CALENDAR HEADER */}

        <div className="border-b border-[#EFE8A8]/10 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <SectionHeading
              eyebrow="Planning workspace"
              title="Salon Calendar"
              description="Navigate your bookings and manage your team's schedule"
              icon={CalendarDays}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToToday}
                className="rounded-lg border border-[#EFE8A8]/20 px-4 py-2 text-xs text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
              >
                Today
              </button>

              <div className="flex items-center rounded-lg border border-[#EFE8A8]/15 bg-[#121414] p-1">
                <button
                  onClick={() => changeDate(-1)}
                  aria-label="Previous date"
                  className="rounded-md p-2 text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  onClick={() => changeDate(1)}
                  aria-label="Next date"
                  className="rounded-md p-2 text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setDatePickerOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-lg border border-[#EFE8A8]/15 bg-[#121414] px-3 py-2 text-xs font-semibold text-[#F5F3E8] transition hover:border-[#EFE8A8]/35"
                >
                  <CalendarDays size={15} className="text-[#EFE8A8]" />
                  {headingDate}
                </button>

                {datePickerOpen && (
                  <div className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-[#EFE8A8]/20 bg-[#222522] p-4 shadow-2xl">
                    <label className="text-xs text-[#A5A79D]">
                      Jump to date
                    </label>

                    <input
                      type="date"
                      value={dateKey(selectedDate)}
                      onChange={(event) => {
                        if (!event.target.value) return;

                        setCalendarAnimation((value) => value + 1);
                        setSelectedDate(parseDate(event.target.value));
                        setDatePickerOpen(false);
                      }}
                      className="mt-2 w-full rounded-lg border border-[#EFE8A8]/15 bg-[#121414] p-3 text-sm text-white outline-none"
                    />

                    <button
                      onClick={() => setDatePickerOpen(false)}
                      className="mt-3 w-full rounded-lg bg-[#EFE8A8] py-2 text-sm font-semibold text-[#121414]"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex w-fit rounded-xl border border-[#EFE8A8]/15 bg-[#121414] p-1">
              {(["Day", "Week", "Month"] as CalendarView[]).map(
                (view) => (
                  <button
                    key={view}
                    onClick={() => selectCalendarView(view)}
                    className={`rounded-lg px-4 py-2 text-xs transition ${
                      calendarView === view
                        ? "bg-[#EFE8A8] font-semibold text-[#121414] shadow"
                        : "text-[#A5A79D] hover:text-white"
                    }`}
                  >
                    {view}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => openCreateModal(selectedDate)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EFE8A8]/25 px-4 py-2.5 text-xs font-medium text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
            >
              <Plus size={15} />
              Add booking
            </button>
          </div>
        </div>

        {/* CALENDAR LEGEND */}

        <div className="flex flex-wrap items-center gap-4 border-b border-[#EFE8A8]/10 px-5 py-3 sm:px-6">
          {(
            [
              ["Confirmed", "bg-emerald-400"],
              ["Pending", "bg-amber-300"],
              ["Completed", "bg-sky-400"],
              ["Cancelled", "bg-red-400"],
            ] as const
          ).map(([label, color]) => (
            <div
              key={label}
              className="flex items-center gap-2 text-[11px] text-[#A5A79D]"
            >
              <span className={`h-2 w-2 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* CALENDAR CONTENT */}

        <div
          key={`${calendarView}-${calendarAnimation}`}
          className="calendar-transition p-3 sm:p-5"
        >
          {/* MONTH VIEW */}

          {calendarView === "Month" && (
            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-7 border-b border-[#EFE8A8]/10">
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day) => (
                    <div
                      key={day}
                      className="py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#A5A79D]"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarDays.map((date) => (
                    <CalendarDateCell
                      key={dateKey(date)}
                      date={date}
                      appointments={appointmentsForDate(date)}
                      selected={dateKey(date) === dateKey(selectedDate)}
                      today={dateKey(date) === todayKey}
                      currentMonth={
                        date.getMonth() === selectedDate.getMonth()
                      }
                      onSelect={() => {
                        setSelectedDate(date);
                        selectCalendarView("Day");
                      }}
                      onAdd={() => openCreateModal(date)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WEEK VIEW */}

          {calendarView === "Week" && (
            <div className="overflow-x-auto">
              <div className="grid min-w-[850px] grid-cols-7 gap-2">
                {weekDays.map((date) => {
                  const key = dateKey(date);
                  const dayAppointments = appointmentsForDate(date);

                  const activeCount = dayAppointments.filter(
                    (item) => item.status !== "Cancelled"
                  ).length;

                  return (
                    <div
                      key={key}
                      className={`gold-ambient-card group min-h-[290px] rounded-xl border p-2 transition sm:p-3 ${
                        key === todayKey
                          ? "border-[#EFE8A8]/50 bg-[#EFE8A8]/[0.06]"
                          : "border-[#EFE8A8]/10 bg-[#121414]/60 hover:border-[#EFE8A8]/25"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedDate(date);
                          selectCalendarView("Day");
                        }}
                        className="mb-3 w-full rounded-lg py-2 text-center transition hover:bg-white/[0.04]"
                      >
                        <p className="text-[10px] uppercase text-[#A5A79D]">
                          {date.toLocaleDateString("en-IN", {
                            weekday: "short",
                          })}
                        </p>

                        <p
                          className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold ${
                            key === todayKey
                              ? "bg-[#EFE8A8] text-[#121414]"
                              : "text-[#F5F3E8]"
                          }`}
                        >
                          {date.getDate()}
                        </p>

                        <p className="mt-1 text-[10px] text-[#92958C]">
                          {activeCount} bookings
                        </p>
                      </button>

                      <div className="space-y-2">
                        {dayAppointments.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => openEditModal(item)}
                            className="gold-ambient-card w-full rounded-lg border border-[#EFE8A8]/10 bg-[#222522] p-2 text-left transition hover:border-[#EFE8A8]/40 hover:bg-[#2B302B]"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyles[item.status]}`}
                              />

                              <p className="truncate text-[10px] text-[#EFE8A8]">
                                {formatTime(item.time)}
                              </p>
                            </div>

                            <p className="mt-1 truncate text-xs font-medium text-white">
                              {item.customer}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-[#A5A79D]">
                              {item.service}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-[#92958C]">
                              {item.staff}
                            </p>
                          </button>
                        ))}

                        {dayAppointments.length === 0 && (
                          <p className="py-5 text-center text-[10px] text-[#666B63]">
                            No bookings
                          </p>
                        )}

                        <button
                          onClick={() => openCreateModal(date)}
                          className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-[#EFE8A8]/20 py-2 text-[10px] text-[#A5A79D] transition hover:border-[#EFE8A8]/50 hover:text-[#EFE8A8]"
                        >
                          <Plus size={12} />
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAY VIEW */}

          {calendarView === "Day" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[#F5F3E8]">
                    {formatDate(selectedDate)}
                  </p>

                  <p className="mt-1 text-xs text-[#A5A79D]">
                    {appointmentsForDate(selectedDate).length} appointments scheduled
                  </p>
                </div>

                <button
                  onClick={() => openCreateModal(selectedDate)}
                  className="rounded-lg bg-[#EFE8A8]/10 px-3 py-2 text-xs text-[#EFE8A8] transition hover:bg-[#EFE8A8]/20"
                >
                  <Plus size={13} className="mr-1 inline" />
                  Add appointment
                </button>
              </div>

              {appointmentsForDate(selectedDate).length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#EFE8A8]/20 py-14 text-center">
                  <CalendarDays
                    size={30}
                    className="mx-auto text-[#EFE8A8]/50"
                  />

                  <p className="mt-3 text-sm text-[#D8D6C8]">
                    No appointments for this date.
                  </p>

                  <button
                    onClick={() => openCreateModal(selectedDate)}
                    className="mt-3 text-sm text-[#EFE8A8] underline"
                  >
                    Create an appointment
                  </button>
                </div>
              ) : (
                <div className="relative space-y-3">
                  <div className="absolute bottom-4 left-[22px] top-4 w-px bg-[#EFE8A8]/10" />

                  {appointmentsForDate(selectedDate).map((item) => (
                    <div
                      key={item.id}
                      className="relative flex gap-3"
                    >
                      <div className="z-10 mt-5 h-3 w-3 shrink-0 rounded-full border-2 border-[#EFE8A8] bg-[#1B1F1D]" />

                      <div className="min-w-0 flex-1">
                        <div className="gold-ambient-card flex flex-col gap-4 rounded-xl border border-[#EFE8A8]/10 bg-[#121414] p-4 transition sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE8A8]/10 text-[#EFE8A8]">
                              <Scissors size={19} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-[#F5F3E8]">
                                  {item.customer}
                                </h3>
                                <StatusBadge status={item.status} />
                              </div>

                              <p className="mt-1 text-sm text-[#EFE8A8]">
                                {item.service}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#92958C]">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatTime(item.time)}
                                </span>

                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {item.staff}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {item.phone}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Timer size={12} />
                                  {formatDuration(getAppointmentDuration(item))}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                            <p className="font-semibold text-[#EFE8A8]">
                              {formatCurrency(item.amount)}
                            </p>

                            <button
                              onClick={() => openEditModal(item)}
                              className="rounded-lg border border-[#EFE8A8]/20 px-3 py-2 text-xs text-[#EFE8A8] transition hover:bg-[#EFE8A8]/10"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================================================
          APPOINTMENT MANAGEMENT TABLE
      ================================================ */}

      <section className={`${panel} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-4 border-b border-[#EFE8A8]/10 p-5 sm:p-6 xl:flex-row xl:items-center">
          <SectionHeading
            eyebrow="Booking management"
            title="All Appointments"
            description={`${visibleAppointments.length} appointments in the selected calendar view`}
            icon={ClipboardList}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A5A79D]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, phone, service..."
                className="w-full rounded-xl border border-[#EFE8A8]/15 bg-[#121414] py-3 pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-[#73766E] focus:border-[#EFE8A8]/50 sm:w-72"
              />
            </div>

            <div className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#EFE8A8]"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#EFE8A8]/15 bg-[#121414] py-3 pl-9 pr-8 text-xs text-white outline-none transition focus:border-[#EFE8A8]/50 sm:w-44"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-[#EFE8A8]/10 bg-[#121414]/50 text-[10px] uppercase tracking-wider text-[#92958C]">
                <th className="px-4 py-4 font-medium">Customer</th>
                <th className="px-4 py-4 font-medium">Service</th>
                <th className="px-4 py-4 font-medium">Date & Time</th>
                <th className="px-4 py-4 font-medium">Staff</th>
                <th className="px-4 py-4 font-medium">Amount</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleAppointments.map((item) => (
                <AppointmentRow
                  key={item.id}
                  appointment={item}
                  onEdit={openEditModal}
                  onStatusChange={updateStatus}
                  onDelete={deleteAppointment}
                />
              ))}

              {visibleAppointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <CalendarDays
                      size={30}
                      className="mx-auto text-[#EFE8A8]/40"
                    />

                    <p className="mt-3 text-sm text-[#D8D6C8]">
                      No appointments found.
                    </p>

                    <p className="mt-1 text-xs text-[#92958C]">
                      Try changing the date, search term or status filter.
                    </p>

                    <button
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                      }}
                      className="mt-4 text-xs text-[#EFE8A8] underline"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-[#EFE8A8]/10 px-5 py-4 text-[11px] text-[#92958C] sm:flex-row sm:items-center">
          <span>
            Showing {visibleAppointments.length} of {appointments.length} total appointments
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Changes are saved automatically on this device
          </span>
        </div>
      </section>

      {/* ================================================
          CREATE / EDIT MODAL
      ================================================ */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="gold-ambient-card my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#EFE8A8]/20 bg-[#1B1F1D] shadow-2xl animate-modalIn">
            {/* MODAL HEADER */}

            <div className="relative overflow-hidden border-b border-[#EFE8A8]/10 bg-gradient-to-r from-[#252923] to-[#1B1F1D] px-5 py-5 sm:px-7">
              <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-[#EFE8A8]/[0.06] blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} className="text-[#EFE8A8]" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EFE8A8]/70">
                      KBC Salon Academy
                    </p>
                  </div>

                  <h2 className="mt-2 text-xl font-semibold text-[#F5F3E8]">
                    {editingId
                      ? "Edit Appointment"
                      : "Create New Appointment"}
                  </h2>

                  <p className="mt-1 text-xs text-[#92958C]">
                    Enter booking details and assign your salon professional.
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close appointment form"
                  className="rounded-lg p-2 text-[#A5A79D] transition hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* FORM */}

            <form
              onSubmit={saveAppointment}
              className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-7"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Customer name *
                  </label>

                  <input
                    required
                    value={draft.customer}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        customer: event.target.value,
                      })
                    }
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Phone number *
                  </label>

                  <input
                    required
                    value={draft.phone}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        phone: event.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Service *
                  </label>

                  <select
                    required
                    value={draft.service}
                    onChange={(event) => {
                      const service = event.target.value;

                      setDraft({
                        ...draft,
                        service,
                        durationMinutes:
                          serviceDurations[service] || 60,
                      });
                    }}
                    className={inputClass}
                  >
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Assigned staff *
                  </label>

                  <select
                    required
                    value={draft.staff}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        staff: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    {staffMembers.map((staff) => (
                      <option key={staff} value={staff}>
                        {staff}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Appointment date *
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
                    Appointment time *
                  </label>

                  <input
                    required
                    type="time"
                    value={draft.time}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        time: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Amount (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={draft.amount}
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

                <div>
                  <label className={labelClass}>
                    Appointment duration *
                  </label>

                  <select
                    required
                    value={draft.durationMinutes || 60}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        durationMinutes: Number(event.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1 hour 30 minutes</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Appointment status
                  </label>

                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        status: event.target.value as AppointmentStatus,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* CONFLICT WARNING */}

              {staffConflict && (
                <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                  <div className="rounded-lg bg-red-500/15 p-2 text-red-300">
                    <AlertTriangle size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-300">
                      Staff booking conflict detected
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-200/80">
                      {draft.staff} already has an appointment with{" "}
                      {staffConflict.customer} at{" "}
                      {formatTime(staffConflict.time)} on this date.
                      Please select another time or assign a different
                      staff member.
                    </p>

                    <p className="mt-2 text-xs text-red-200/70">
                      Existing appointment duration:{" "}
                      {formatDuration(
                        getAppointmentDuration(staffConflict)
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* NOTES */}

              <div>
                <label className={labelClass}>
                  Notes / Special instructions
                </label>

                <textarea
                  rows={3}
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      notes: event.target.value,
                    })
                  }
                  placeholder="Add customer requirements, preferences or instructions..."
                  className={inputClass}
                />
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#EFE8A8]/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#EFE8A8]/20 px-5 py-3 text-sm text-[#D8D6C8] transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!!staffConflict}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFE8A8] px-6 py-3 text-sm font-semibold text-[#121414] transition hover:bg-[#FFF4B5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check size={17} />

                  {staffConflict
                    ? "Resolve Booking Conflict"
                    : editingId
                      ? "Save Changes"
                      : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================
          ANIMATIONS + GOLDEN AMBIENT CARD EFFECT
      ================================================ */}

      <style jsx global>{`
        /* ---------------------------------------------
           GOLDEN AMBIENT GLOW
        --------------------------------------------- */

        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 350ms ease,
            border-color 350ms ease,
            box-shadow 350ms ease,
            background-color 350ms ease;
        }

        .gold-ambient-card::after {
          content: "";
          position: absolute;
          inset: -18px;
          z-index: -1;
          border-radius: inherit;
          pointer-events: none;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 225, 130, 0.24) 0%,
            rgba(239, 200, 85, 0.16) 35%,
            rgba(205, 157, 55, 0.07) 65%,
            transparent 100%
          );
          filter: blur(22px);
          opacity: 0;
          transition: opacity 350ms ease;
        }

        .gold-ambient-card:hover,
        .gold-ambient-card:active,
        .gold-ambient-card:focus-visible {
          border-color: rgba(239, 210, 115, 0.42) !important;
          box-shadow:
            0 0 15px rgba(239, 200, 85, 0.13),
            0 0 32px rgba(239, 200, 85, 0.11),
            0 0 55px rgba(239, 200, 85, 0.07),
            inset 0 0 18px rgba(239, 200, 85, 0.025);
        }

        .gold-ambient-card:hover::after,
        .gold-ambient-card:active::after,
        .gold-ambient-card:focus-visible::after {
          opacity: 1;
        }

        @media (hover: hover) {
          .gold-ambient-card:hover {
            transform: translateY(-3px);
          }
        }

        /* ---------------------------------------------
           PAGE ANIMATIONS
        --------------------------------------------- */

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes calendarEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-modalIn {
          animation: modalIn 0.25s ease-out both;
        }

        .calendar-transition {
          animation: calendarEnter 0.3s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card,
          .gold-ambient-card::after {
            transition: none;
          }

          .gold-ambient-card:hover {
            transform: none;
          }

          .animate-modalIn,
          .calendar-transition {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
