
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CreditCard,
  GraduationCap,
  Users,
  Package,
  BookOpen,
  Settings,
  Search,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  MoreVertical,
  X,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  Filter,
  Mail,
  MailOpen,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";

type Category =
  | "Appointments"
  | "Payments"
  | "Students"
  | "Staff"
  | "Inventory"
  | "Courses"
  | "System";

type Priority = "Urgent" | "High" | "Normal" | "Low";
type Status = "Unread" | "Read" | "Archived";

type Notification = {
  id: string;
  title: string;
  message: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdAt: string;
};

type Preferences = Record<Category, boolean>;

const STORAGE_KEY = "kbc_notifications_v1";
const PREFERENCES_KEY = "kbc_notification_preferences_v1";

const GOLD = "#EFE8A8";

const categoryConfig: Record<
  Category,
  { icon: typeof Bell; color: string; bg: string }
> = {
  Appointments: {
    icon: CalendarDays,
    color: "#D6BD83",
    bg: "rgba(214,189,131,0.12)",
  },
  Payments: {
    icon: CreditCard,
    color: "#8DCBA5",
    bg: "rgba(141,203,165,0.12)",
  },
  Students: {
    icon: GraduationCap,
    color: "#B9A0E8",
    bg: "rgba(185,160,232,0.12)",
  },
  Staff: {
    icon: Users,
    color: "#91BCE6",
    bg: "rgba(145,188,230,0.12)",
  },
  Inventory: {
    icon: Package,
    color: "#E3A477",
    bg: "rgba(227,164,119,0.12)",
  },
  Courses: {
    icon: BookOpen,
    color: "#D7A4C9",
    bg: "rgba(215,164,201,0.12)",
  },
  System: {
    icon: Settings,
    color: "#A9B1B8",
    bg: "rgba(169,177,184,0.12)",
  },
};

const priorityConfig: Record<
  Priority,
  { color: string; bg: string }
> = {
  Urgent: { color: "#F18C8C", bg: "rgba(241,140,140,0.12)" },
  High: { color: "#E7AD75", bg: "rgba(231,173,117,0.12)" },
  Normal: { color: "#D7C98D", bg: "rgba(215,201,141,0.12)" },
  Low: { color: "#A4B2A8", bg: "rgba(164,178,168,0.12)" },
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    title: "New appointment received",
    message:
      "A new appointment has been booked. Please review the schedule and confirm the assigned stylist.",
    category: "Appointments",
    priority: "High",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "n2",
    title: "Payment successfully received",
    message:
      "A student payment has been recorded successfully. Check the revenue section for details.",
    category: "Payments",
    priority: "Normal",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "n3",
    title: "Low stock alert",
    message:
      "One or more inventory products have reached their minimum stock level. Review inventory.",
    category: "Inventory",
    priority: "Urgent",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "n4",
    title: "New student enrollment",
    message:
      "A new student enrollment has been recorded. Review the student profile and course details.",
    category: "Students",
    priority: "Normal",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "n5",
    title: "Staff attendance update",
    message:
      "Attendance records have been updated. Review the staff attendance dashboard.",
    category: "Staff",
    priority: "Low",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "n6",
    title: "Course schedule reminder",
    message:
      "Upcoming course sessions need to be reviewed. Check the course calendar for details.",
    category: "Courses",
    priority: "Normal",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: "n7",
    title: "System maintenance notice",
    message:
      "Remember to review your system settings and keep your academy information up to date.",
    category: "System",
    priority: "Low",
    status: "Archived",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const defaultPreferences: Preferences = {
  Appointments: true,
  Payments: true,
  Students: true,
  Staff: true,
  Inventory: true,
  Courses: true,
  System: true,
};

const filters = ["All", "Unread", "Read", "Archived"] as const;
type FilterType = (typeof filters)[number];

function timeAgo(date: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  );

  if (Number.isNaN(seconds)) return "Recently";
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(value: string) {
  return value
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedPreferences = localStorage.getItem(PREFERENCES_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        } else {
          setNotifications(initialNotifications);
        }
      } else {
        setNotifications(initialNotifications);
      }

      if (savedPreferences) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(savedPreferences),
        });
      }
    } catch {
      setNotifications(initialNotifications);
      setPreferences(defaultPreferences);
    }
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const unreadCount = notifications.filter(
    (item) => item.status === "Unread"
  ).length;

  const readCount = notifications.filter(
    (item) => item.status === "Read"
  ).length;

  const archivedCount = notifications.filter(
    (item) => item.status === "Archived"
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (activeFilter === "All") return item.status !== "Archived";
        return item.status === activeFilter;
      })
      .filter((item) => {
        return (
          activeCategory === "All" ||
          item.category === activeCategory
        );
      })
      .filter((item) => {
        const term = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(term) ||
          item.message.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [notifications, activeFilter, activeCategory, search]);

  const updateNotification = (
    id: string,
    updates: Partial<Notification>
  ) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((item) =>
        item.status === "Unread"
          ? { ...item, status: "Read" }
          : item
      )
    );
    setSelectedIds([]);
    setToast("All notifications marked as read");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const bulkMarkRead = () => {
    setNotifications((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "Read" }
          : item
      )
    );
    setSelectedIds([]);
    setToast("Selected notifications marked as read");
  };

  const bulkArchive = () => {
    setNotifications((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "Archived" }
          : item
      )
    );
    setSelectedIds([]);
    setToast("Selected notifications archived");
  };

  const deleteNotification = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    setNotifications((current) =>
      current.filter((item) => item.id !== id)
    );
    setSelectedIds((current) => current.filter((item) => item !== id));
    setMenuId(null);
    setToast("Notification deleted");
  };

  const clearArchived = () => {
    if (archivedCount === 0) return;
    if (!window.confirm("Delete all archived notifications?")) return;

    setNotifications((current) =>
      current.filter((item) => item.status !== "Archived")
    );
    setToast("Archived notifications cleared");
  };

  const togglePreference = (category: Category) => {
    setPreferences((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const categories = Object.keys(categoryConfig) as Category[];

  return (
    <main className="min-h-screen bg-[#121414] p-4 text-[#F5F2E9] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A9A58A]">
              <Sparkles size={14} />
              KBC Admin Center
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-[#92968E]">
              Stay updated with everything happening in your academy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-xl border border-[#3B403B] px-4 py-3 text-sm text-[#DAD6C8] transition hover:border-[#EFE8A8] hover:text-[#EFE8A8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="flex items-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-3 text-sm font-semibold text-[#24251F] transition hover:bg-[#DED49A]"
            >
              <SlidersHorizontal size={17} />
              Preferences
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Notifications",
              value: notifications.length,
              icon: Bell,
              color: "#EFE8A8",
              note: "All notifications",
            },
            {
              label: "Unread",
              value: unreadCount,
              icon: Mail,
              color: "#E7AD75",
              note: "Needs your attention",
            },
            {
              label: "Read",
              value: readCount,
              icon: MailOpen,
              color: "#8DCBA5",
              note: "Already reviewed",
            },
            {
              label: "Archived",
              value: archivedCount,
              icon: Archive,
              color: "#B9A0E8",
              note: "Saved for later",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="group rounded-2xl border border-[#303530] bg-[#1B1F1D] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#77745D]"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#A1A49B]">
                    {item.label}
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: `${item.color}16` }}
                  >
                    <Icon size={19} style={{ color: item.color }} />
                  </div>
                </div>

                <div className="mt-4 text-3xl font-semibold">
                  {item.value}
                </div>

                <div className="mt-2 text-xs text-[#777D74]">
                  {item.note}
                </div>
              </div>
            );
          })}
        </section>

        {/* Main Content */}
        <section className="overflow-hidden rounded-2xl border border-[#303530] bg-[#1B1F1D]">

          {/* Toolbar */}
          <div className="border-b border-[#303530] p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-lg font-semibold">Activity Center</h2>
                <p className="mt-1 text-xs text-[#858B82]">
                  Manage your latest academy updates.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777D74]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full rounded-xl border border-[#383E38] bg-[#141816] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#747B72] focus:border-[#A9A58A] sm:w-64"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#383E38] bg-[#141816] px-4 py-3 text-sm text-[#D5D2C7] sm:w-48"
                  >
                    <span className="flex items-center gap-2">
                      <Filter size={16} />
                      {activeCategory === "All"
                        ? "All categories"
                        : activeCategory}
                    </span>
                    <ChevronDown size={15} />
                  </button>

                  {showCategoryMenu && (
                    <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#3C423B] bg-[#202521] p-1 shadow-2xl">
                      {["All", ...categories].map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveCategory(category);
                            setShowCategoryMenu(false);
                          }}
                          className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            activeCategory === category
                              ? "bg-[#EFE8A8]/10 text-[#EFE8A8]"
                              : "text-[#B9BDB3] hover:bg-[#303630]"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {filters.map((filter) => {
                const count =
                  filter === "All"
                    ? notifications.filter(
                        (item) => item.status !== "Archived"
                      ).length
                    : notifications.filter(
                        (item) => item.status === filter
                      ).length;

                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setSelectedIds([]);
                    }}
                    className={`rounded-xl px-4 py-2.5 text-sm transition ${
                      activeFilter === filter
                        ? "bg-[#EFE8A8] font-semibold text-[#25261F]"
                        : "border border-[#363C36] text-[#AEB3A9] hover:border-[#77745D] hover:text-[#EFE8A8]"
                    }`}
                  >
                    {filter}
                    <span className="ml-2 text-xs opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}

              <div className="ml-auto hidden text-xs text-[#777D74] sm:block">
                {filteredNotifications.length} results
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#303530] bg-[#EFE8A8]/5 px-4 py-3 sm:px-6">
              <span className="text-sm text-[#EFE8A8]">
                {selectedIds.length} selected
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={bulkMarkRead}
                  className="flex items-center gap-2 rounded-lg border border-[#4C574B] px-3 py-2 text-xs text-[#BBDCC2] hover:bg-[#8DCBA5]/10"
                >
                  <Check size={14} /> Mark read
                </button>

                <button
                  onClick={bulkArchive}
                  className="flex items-center gap-2 rounded-lg border border-[#4C574B] px-3 py-2 text-xs text-[#D9C994] hover:bg-[#EFE8A8]/10"
                >
                  <Archive size={14} /> Archive
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg border border-[#4C574B] px-3 py-2 text-xs text-[#AEB3A9] hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="divide-y divide-[#303530]">
            {filteredNotifications.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl bg-[#EFE8A8]/10 p-5">
                  <Bell size={30} className="text-[#EFE8A8]" />
                </div>
                <h3 className="text-lg font-semibold">
                  No notifications found
                </h3>
                <p className="mt-2 max-w-sm text-sm text-[#858B82]">
                  There are no notifications matching your current filters.
                  Try changing the category or search.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("All");
                    setActiveCategory("All");
                  }}
                  className="mt-5 flex items-center gap-2 text-sm text-[#EFE8A8] hover:underline"
                >
                  <RotateCcw size={15} /> Reset filters
                </button>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const config = categoryConfig[item.category];
                const CategoryIcon = config.icon;
                const priority = priorityConfig[item.priority];

                return (
                  <div
                    key={item.id}
                    className={`group relative flex gap-3 p-4 transition duration-200 hover:bg-[#242A25] sm:gap-5 sm:p-6 ${
                      item.status === "Unread"
                        ? "bg-[#EFE8A8]/[0.025]"
                        : ""
                    }`}
                  >
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        aria-label={`Select ${item.title}`}
                        className="h-4 w-4 cursor-pointer accent-[#EFE8A8]"
                      />
                    </div>

                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                      style={{ backgroundColor: config.bg }}
                    >
                      <CategoryIcon
                        size={21}
                        style={{ color: config.color }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm sm:text-base ${
                            item.status === "Unread"
                              ? "font-semibold text-[#F3F0E5]"
                              : "font-medium text-[#C0C4BA]"
                          }`}
                        >
                          {item.title}
                        </h3>

                        {item.status === "Unread" && (
                          <span className="h-2 w-2 rounded-full bg-[#EFE8A8]" />
                        )}

                        <span
                          className="rounded-md px-2 py-1 text-[10px] font-semibold"
                          style={{
                            color: priority.color,
                            backgroundColor: priority.bg,
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>

                      <p className="mt-2 max-w-3xl text-xs leading-6 text-[#949A90] sm:text-sm">
                        {item.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#737A70]">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {timeAgo(item.createdAt)}
                        </span>

                        <span
                          className="rounded-md px-2 py-1"
                          style={{
                            color: config.color,
                            backgroundColor: config.bg,
                          }}
                        >
                          {item.category}
                        </span>

                        <span>{item.status}</span>
                      </div>
                    </div>

                    <div className="relative flex shrink-0 items-start gap-1">
                      <button
                        title={
                          item.status === "Unread"
                            ? "Mark as read"
                            : "Mark as unread"
                        }
                        onClick={() => {
                          updateNotification(item.id, {
                            status:
                              item.status === "Unread"
                                ? "Read"
                                : "Unread",
                          });
                          setToast("Notification status updated");
                        }}
                        className="hidden rounded-lg p-2 text-[#92988D] transition hover:bg-[#EFE8A8]/10 hover:text-[#EFE8A8] sm:block"
                      >
                        {item.status === "Unread" ? (
                          <MailOpen size={17} />
                        ) : (
                          <Mail size={17} />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          setMenuId(
                            menuId === item.id ? null : item.id
                          )
                        }
                        className="rounded-lg p-2 text-[#92988D] transition hover:bg-[#303630] hover:text-white"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuId === item.id && (
                        <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-[#42483F] bg-[#202521] p-1 shadow-2xl">
                          <button
                            onClick={() => {
                              updateNotification(item.id, {
                                status:
                                  item.status === "Unread"
                                    ? "Read"
                                    : "Unread",
                              });
                              setMenuId(null);
                              setToast("Notification updated");
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#D2D4CA] hover:bg-[#303630]"
                          >
                            <Check size={15} />
                            Mark as{" "}
                            {item.status === "Unread" ? "read" : "unread"}
                          </button>

                          <button
                            onClick={() => {
                              updateNotification(item.id, {
                                status:
                                  item.status === "Archived"
                                    ? "Read"
                                    : "Archived",
                              });
                              setMenuId(null);
                              setToast(
                                item.status === "Archived"
                                  ? "Notification restored"
                                  : "Notification archived"
                              );
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#D2D4CA] hover:bg-[#303630]"
                          >
                            <Archive size={15} />
                            {item.status === "Archived"
                              ? "Restore"
                              : "Archive"}
                          </button>

                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#F18C8C] hover:bg-[#F18C8C]/10"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col justify-between gap-3 border-t border-[#303530] px-4 py-4 text-xs text-[#777D74] sm:flex-row sm:items-center sm:px-6">
            <span>
              Showing {filteredNotifications.length} of{" "}
              {notifications.length} notifications
            </span>

            <button
              onClick={clearArchived}
              disabled={archivedCount === 0}
              className="flex items-center gap-2 text-[#A9A58A] transition hover:text-[#EFE8A8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} />
              Clear archived notifications
            </button>
          </div>
        </section>

        {/* Notification Preferences Modal */}
        {showPreferences && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowPreferences(false)}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#44493E] bg-[#1B1F1D] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#343A33] p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Notification Preferences
                  </h2>
                  <p className="mt-1 text-xs text-[#8B9187]">
                    Choose the updates you want to receive.
                  </p>
                </div>

                <button
                  onClick={() => setShowPreferences(false)}
                  className="rounded-lg p-2 text-[#A4AA9F] hover:bg-[#303630] hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-1 p-5 sm:p-6">
                {categories.map((category) => {
                  const Icon = categoryConfig[category].icon;

                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-xl p-3 transition hover:bg-[#252B26]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-lg p-2"
                          style={{
                            backgroundColor:
                              categoryConfig[category].bg,
                          }}
                        >
                          <Icon
                            size={17}
                            style={{
                              color: categoryConfig[category].color,
                            }}
                          />
                        </div>
                        <span className="text-sm text-[#D5D7CD]">
                          {category}
                        </span>
                      </div>

                      <button
                        role="switch"
                        aria-checked={preferences[category]}
                        onClick={() => togglePreference(category)}
                        className={`relative h-6 w-11 rounded-full transition ${
                          preferences[category]
                            ? "bg-[#EFE8A8]"
                            : "bg-[#454B43]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full transition ${
                            preferences[category]
                              ? "left-6 bg-[#24251F]"
                              : "left-1 bg-[#B9BDB3]"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end border-t border-[#343A33] p-5 sm:p-6">
                <button
                  onClick={() => {
                    setShowPreferences(false);
                    setToast("Notification preferences saved");
                  }}
                  className="rounded-xl bg-[#EFE8A8] px-6 py-3 text-sm font-semibold text-[#24251F] transition hover:bg-[#DED49A]"
                >
                  Save preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[60] flex max-w-[calc(100vw-3rem)] items-center gap-3 rounded-xl border border-[#66644D] bg-[#252A25] px-5 py-4 text-sm text-[#EFE8A8] shadow-2xl animate-[slideIn_.25s_ease-out]">
            <CheckCircle2 size={18} />
            {toast}
            <button
              onClick={() => setToast("")}
              className="ml-2 text-[#92988D] hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
