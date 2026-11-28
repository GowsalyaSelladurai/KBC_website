
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
  CheckCircle2,
  Filter,
  Mail,
  MailOpen,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

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

/* =========================================
   STORAGE
========================================= */

const NOTIFICATIONS_STORAGE_KEY = "kbc_notifications_v1";
const PREFERENCES_STORAGE_KEY = "kbc_notification_preferences_v1";

/* =========================================
   CATEGORY CONFIG
========================================= */

const categoryConfig: Record<
  Category,
  {
    icon: typeof Bell;
    color: string;
    bg: string;
  }
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

/* =========================================
   PRIORITY CONFIG
========================================= */

const priorityConfig: Record<
  Priority,
  {
    color: string;
    bg: string;
  }
> = {
  Urgent: {
    color: "#F18C8C",
    bg: "rgba(241,140,140,0.12)",
  },
  High: {
    color: "#E7AD75",
    bg: "rgba(231,173,117,0.12)",
  },
  Normal: {
    color: "#D7C98D",
    bg: "rgba(215,201,141,0.12)",
  },
  Low: {
    color: "#A4B2A8",
    bg: "rgba(164,178,168,0.12)",
  },
};

/* =========================================
   INITIAL NOTIFICATIONS
========================================= */

const initialNotifications: Notification[] = [
  {
    id: "n1",
    title: "New appointment booked",
    message: "A new appointment has been booked for today at 4:30 PM.",
    category: "Appointments",
    priority: "High",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "n2",
    title: "Payment received",
    message: "A payment of ₹2,500 has been received successfully.",
    category: "Payments",
    priority: "Normal",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "n3",
    title: "New student registration",
    message: "A new student has completed the registration process.",
    category: "Students",
    priority: "High",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "n4",
    title: "Inventory stock running low",
    message: "One or more inventory items are running low on stock.",
    category: "Inventory",
    priority: "Urgent",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "n5",
    title: "Staff attendance updated",
    message: "Today's staff attendance has been updated.",
    category: "Staff",
    priority: "Low",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "n6",
    title: "Course content updated",
    message: "New learning materials have been added to the course.",
    category: "Courses",
    priority: "Normal",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "n7",
    title: "System maintenance completed",
    message: "Scheduled system maintenance has been completed successfully.",
    category: "System",
    priority: "Low",
    status: "Archived",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

/* =========================================
   DEFAULT PREFERENCES
========================================= */

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

/* =========================================
   HELPERS
========================================= */

function timeAgo(date: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return new Date(date).toLocaleDateString();
}

/* =========================================
   REUSABLE STYLES
========================================= */

const cardClass =
  "gold-ambient-card rounded-2xl border border-[#343832] bg-[#121414] p-5";

const inputClass =
  "w-full rounded-xl border border-[#D8CDBB] bg-white px-4 py-3 text-sm text-[#17140D] outline-none transition placeholder:text-[#928879] focus:border-[#C9A45C] focus:ring-2 focus:ring-[#C9A45C]/20";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] px-4 py-2.5 text-sm font-semibold text-[#17140D] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9A45C] bg-white px-4 py-2.5 text-sm font-medium text-[#17140D] transition hover:bg-[#FFF4CE] disabled:cursor-not-allowed disabled:opacity-40";

/* =========================================
   MAIN COMPONENT
========================================= */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );

  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [loaded, setLoaded] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");

  const [activeCategory, setActiveCategory] = useState<Category | "All">(
    "All"
  );

  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showPreferences, setShowPreferences] = useState(false);

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const [toast, setToast] = useState("");

  const [menuId, setMenuId] = useState<string | null>(null);

  /* =========================================
     LOAD STORAGE
  ========================================= */

  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(
        NOTIFICATIONS_STORAGE_KEY
      );

      const savedPreferences = localStorage.getItem(
        PREFERENCES_STORAGE_KEY
      );

      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);

        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }

      if (savedPreferences) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(savedPreferences),
        });
      }
    } catch (error) {
      console.error("Unable to load notification data:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  /* =========================================
     SAVE STORAGE
  ========================================= */

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Unable to save notifications:", error);
    }
  }, [notifications, loaded]);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Unable to save preferences:", error);
    }
  }, [preferences, loaded]);

  /* =========================================
     TOAST TIMER
  ========================================= */

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  /* =========================================
     COUNTS
  ========================================= */

  const unreadCount = notifications.filter(
    (item) => item.status === "Unread"
  ).length;

  const readCount = notifications.filter(
    (item) => item.status === "Read"
  ).length;

  const archivedCount = notifications.filter(
    (item) => item.status === "Archived"
  ).length;

  const categories = Object.keys(categoryConfig) as Category[];

  /* =========================================
     FILTERED NOTIFICATIONS
  ========================================= */

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (activeFilter !== "All" && item.status !== activeFilter) {
          return false;
        }

        if (
          activeCategory !== "All" &&
          item.category !== activeCategory
        ) {
          return false;
        }

        const query = search.toLowerCase().trim();

        if (
          query &&
          !item.title.toLowerCase().includes(query) &&
          !item.message.toLowerCase().includes(query) &&
          !item.category.toLowerCase().includes(query)
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [notifications, activeFilter, activeCategory, search]);

  /* =========================================
     HANDLERS
  ========================================= */

  const updateNotification = (
    id: string,
    updates: Partial<Notification>
  ) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;

    setNotifications((previous) =>
      previous.map((item) =>
        item.status === "Unread"
          ? { ...item, status: "Read" }
          : item
      )
    );

    setToast("All notifications marked as read");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const bulkMarkRead = () => {
    if (selectedIds.length === 0) return;

    setNotifications((previous) =>
      previous.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "Read" }
          : item
      )
    );

    setSelectedIds([]);
    setToast("Selected notifications marked as read");
  };

  const bulkArchive = () => {
    if (selectedIds.length === 0) return;

    setNotifications((previous) =>
      previous.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "Archived" }
          : item
      )
    );

    setSelectedIds([]);
    setToast("Selected notifications archived");
  };

  const deleteNotification = (id: string) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setSelectedIds((previous) =>
      previous.filter((item) => item !== id)
    );

    setMenuId(null);
    setToast("Notification deleted");
  };

  const clearArchived = () => {
    if (archivedCount === 0) return;

    if (!window.confirm("Delete all archived notifications?")) return;

    setNotifications((previous) =>
      previous.filter((item) => item.status !== "Archived")
    );

    setSelectedIds([]);
    setToast("Archived notifications cleared");
  };

  const togglePreference = (category: Category) => {
    setPreferences((previous) => ({
      ...previous,
      [category]: !previous[category],
    }));
  };

  const resetFilters = () => {
    setActiveFilter("All");
    setActiveCategory("All");
    setSearch("");
    setSelectedIds([]);
    setMenuId(null);
  };

  /* =========================================
     SUMMARY CARDS
  ========================================= */

  const summaryCards = [
    {
      title: "Total Notifications",
      value: notifications.length,
      icon: Bell,
      color: "#EFE8A8",
      description: "All notifications",
    },
    {
      title: "Unread",
      value: unreadCount,
      icon: Mail,
      color: "#D9D19A",
      description: "Awaiting attention",
    },
    {
      title: "Read",
      value: readCount,
      icon: CheckCircle2,
      color: "#8DCBA5",
      description: "Already reviewed",
    },
    {
      title: "Archived",
      value: archivedCount,
      icon: Archive,
      color: "#A9B1B8",
      description: "Stored notifications",
    },
  ];

  const getCategoryIcon = (category: Category) => {
    const Icon = categoryConfig[category].icon;
    return <Icon size={18} />;
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-[#FAF5ED] px-4 py-6 text-[#17140D] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">

        {/* HEADER */}

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#756B42] bg-[#302F23] text-[#EFE8A8]">
                  <Bell size={19} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9D19A]">
                  KBC Admin Center
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 text-sm text-[#92978F]">
                Stay updated with all your important activities and alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className={secondaryButtonClass}
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>

              <button
                onClick={() => setShowPreferences(true)}
                className={primaryButtonClass}
              >
                <SlidersHorizontal size={16} />
                Preferences
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#A9ACA2]">
                      {item.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tabular-nums text-white">
                      {item.value}
                    </h2>

                    <p className="mt-2 text-xs text-[#858B82]">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3A403A]"
                    style={{
                      backgroundColor: `${item.color}12`,
                      color: item.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN NOTIFICATIONS CARD */}

        <section className={cardClass}>

          {/* SECTION HEADER */}

          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  All Notifications
                </h2>

                {unreadCount > 0 && (
                  <span className="rounded-full border border-[#756B42] bg-[#2B291F] px-2.5 py-1 text-xs font-semibold text-[#EFE8A8]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-[#92978F]">
                Manage, filter and organize your notifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={clearArchived}
                disabled={archivedCount === 0}
                className={secondaryButtonClass}
              >
                <Trash2 size={15} />
                Clear archived
              </button>

              <button
                onClick={resetFilters}
                className={secondaryButtonClass}
              >
                <RotateCcw size={15} />
                Reset filters
              </button>
            </div>
          </div>

          {/* SEARCH AND CATEGORY */}

          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858B82]"
              />

              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${inputClass} pl-11`}
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#858B82] transition hover:text-[#17140D]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu((previous) => !previous)}
                className={`${secondaryButtonClass} w-full lg:min-w-[190px]`}
              >
                <Filter size={16} />
                {activeCategory === "All"
                  ? "All Categories"
                  : activeCategory}
                <ChevronDown size={15} />
              </button>

              {showCategoryMenu && (
                <div className="absolute right-0 top-full z-30 mt-2 w-full min-w-[210px] rounded-xl border border-[#C9A45C] bg-white p-2 shadow-2xl">
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setShowCategoryMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                      activeCategory === "All"
                        ? "bg-[#FFF4CE] text-[#17140D]"
                        : "text-[#514A3D] hover:bg-[#FAF5ED]"
                    }`}
                  >
                    All Categories
                    {activeCategory === "All" && <Check size={15} />}
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setShowCategoryMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                        activeCategory === category
                          ? "bg-[#FFF4CE] text-[#17140D]"
                          : "text-[#514A3D] hover:bg-[#FAF5ED]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span style={{ color: categoryConfig[category].color }}>
                          {getCategoryIcon(category)}
                        </span>
                        {category}
                      </span>

                      {activeCategory === category && (
                        <Check size={15} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STATUS FILTERS */}

          <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-[#343832] pb-5">
            {filters.map((filter) => {
              const active = activeFilter === filter;

              const count =
                filter === "All"
                  ? notifications.length
                  : filter === "Unread"
                    ? unreadCount
                    : filter === "Read"
                      ? readCount
                      : archivedCount;

              return (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSelectedIds([]);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-[#C9A45C] bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] text-[#17140D]"
                      : "border-[#343832] bg-[#151917] text-[#A9ACA2] hover:border-[#C9A45C] hover:text-[#EFE8A8]"
                  }`}
                >
                  {filter}

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs ${
                      active
                        ? "bg-white/40 text-[#17140D]"
                        : "bg-[#252A27] text-[#92978F]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* BULK ACTIONS */}

          {selectedIds.length > 0 && (
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-[#C9A45C] bg-[#FFF4CE] p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm text-[#17140D]">
                <CheckCircle2 size={17} />
                <span>
                  {selectedIds.length} notification
                  {selectedIds.length > 1 ? "s" : ""} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={bulkMarkRead}
                  className={secondaryButtonClass}
                >
                  <MailOpen size={15} />
                  Mark as read
                </button>

                <button
                  onClick={bulkArchive}
                  className={secondaryButtonClass}
                >
                  <Archive size={15} />
                  Archive
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className={secondaryButtonClass}
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATION LIST */}

          <div className="flex flex-col gap-3">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#3A403A] bg-[#151917] px-5 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3A403A] bg-[#202522] text-[#D9D19A]">
                  <Bell size={25} />
                </div>

                <h3 className="text-base font-semibold text-white">
                  No notifications found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-[#858B82]">
                  There are no notifications matching your current filters.
                </p>

                <button
                  onClick={resetFilters}
                  className={`${primaryButtonClass} mt-5`}
                >
                  <RotateCcw size={15} />
                  Reset filters
                </button>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const category = categoryConfig[item.category];
                const priority = priorityConfig[item.priority];
                const CategoryIcon = category.icon;

                return (
                  <div
                    key={item.id}
                    className={`gold-ambient-card group relative rounded-xl border p-4 transition ${
                      item.status === "Unread"
                        ? "border-[#756B42] bg-[#20221D]"
                        : "border-[#343832] bg-[#171B19]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                      {/* CHECKBOX AND CATEGORY */}

                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="mt-1 h-4 w-4 cursor-pointer accent-[#C9A45C]"
                          aria-label={`Select ${item.title}`}
                        />

                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3A403A]"
                          style={{
                            backgroundColor: category.bg,
                            color: category.color,
                          }}
                        >
                          <CategoryIcon size={19} />
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-semibold ${
                              item.status === "Unread"
                                ? "text-white"
                                : "text-[#D0D3CA]"
                            }`}
                          >
                            {item.title}
                          </h3>

                          {item.status === "Unread" && (
                            <span className="notification-unread-dot h-2 w-2 rounded-full bg-[#D9D19A]" />
                          )}

                          <span
                            className="notification-priority rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                              color: priority.color,
                              backgroundColor: priority.bg,
                            }}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-[#A9ACA2]">
                          {item.message}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#858B82]">
                          <span
                            className="flex items-center gap-1.5"
                            style={{ color: category.color }}
                          >
                            <CategoryIcon size={13} />
                            {item.category}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {timeAgo(item.createdAt)}
                          </span>

                          <span className="rounded-md border border-[#343832] bg-[#151917] px-2 py-1">
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="relative flex shrink-0 items-center gap-2 self-end sm:self-start">
                        {item.status === "Unread" && (
                          <button
                            onClick={() => {
                              updateNotification(item.id, {
                                status: "Read",
                              });
                              setToast("Notification marked as read");
                            }}
                            title="Mark as read"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#C9A45C] hover:text-[#EFE8A8]"
                          >
                            <MailOpen size={16} />
                          </button>
                        )}

                        {item.status === "Read" && (
                          <button
                            onClick={() => {
                              updateNotification(item.id, {
                                status: "Unread",
                              });
                              setToast("Notification marked as unread");
                            }}
                            title="Mark as unread"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#C9A45C] hover:text-[#EFE8A8]"
                          >
                            <Mail size={16} />
                          </button>
                        )}

                        {item.status === "Archived" && (
                          <button
                            onClick={() => {
                              updateNotification(item.id, {
                                status: "Read",
                              });
                              setToast("Notification restored");
                            }}
                            title="Restore notification"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#C9A45C] hover:text-[#EFE8A8]"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setMenuId(
                              menuId === item.id ? null : item.id
                            )
                          }
                          title="More options"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#C9A45C] hover:text-[#EFE8A8]"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {menuId === item.id && (
                          <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-[#C9A45C] bg-white p-2 shadow-2xl">
                            {item.status !== "Archived" && (
                              <button
                                onClick={() => {
                                  updateNotification(item.id, {
                                    status: "Archived",
                                  });
                                  setMenuId(null);
                                  setToast("Notification archived");
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#514A3D] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                              >
                                <Archive size={15} />
                                Archive
                              </button>
                            )}

                            {item.status === "Archived" && (
                              <button
                                onClick={() => {
                                  updateNotification(item.id, {
                                    status: "Read",
                                  });
                                  setMenuId(null);
                                  setToast("Notification restored");
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#514A3D] transition hover:bg-[#FFF4CE] hover:text-[#17140D]"
                              >
                                <RotateCcw size={15} />
                                Restore
                              </button>
                            )}

                            <button
                              onClick={() => deleteNotification(item.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER */}

          {filteredNotifications.length > 0 && (
            <div className="mt-5 flex flex-col justify-between gap-2 border-t border-[#343832] pt-5 text-xs text-[#858B82] sm:flex-row sm:items-center">
              <p>
                Showing {filteredNotifications.length} of{" "}
                {notifications.length} notifications
              </p>

              <p className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#D9D19A]" />
                Your notifications are saved automatically
              </p>
            </div>
          )}
        </section>
      </div>

      {/* =====================================
          PREFERENCES MODAL
      ===================================== */}

      {showPreferences && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowPreferences(false)}
        >
          <div
            className="gold-modal-card my-auto w-full max-w-lg rounded-2xl border border-[#C9A45C]/50 bg-[#1B1F1D] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#343832] pb-5">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#5A5438] bg-[#28291F] text-[#EFE8A8]">
                  <SlidersHorizontal size={19} />
                </div>

                <h2 className="text-xl font-semibold text-white">
                  Notification Preferences
                </h2>

                <p className="mt-1 text-sm text-[#92978F]">
                  Choose which notification categories you want to receive.
                </p>
              </div>

              <button
                onClick={() => setShowPreferences(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3A403A] bg-[#151917] text-[#A9ACA2] transition hover:border-[#C9A45C] hover:text-[#EFE8A8]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {categories.map((category) => {
                const config = categoryConfig[category];
                const Icon = config.icon;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#343832] bg-[#151917] p-3.5 transition hover:border-[#C9A45C]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: config.bg,
                          color: config.color,
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          {category}
                        </p>

                        <p className="mt-0.5 text-xs text-[#858B82]">
                          {preferences[category]
                            ? "Notifications enabled"
                            : "Notifications disabled"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences[category]}
                      onClick={() => togglePreference(category)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        preferences[category]
                          ? "bg-[#C8BD79]"
                          : "bg-[#444A44]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-[#171914] shadow transition ${
                          preferences[category]
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#343832] pt-5 sm:flex-row sm:justify-between">
              <button
                onClick={() => {
                  setPreferences(defaultPreferences);
                  setToast("Preferences reset successfully");
                }}
                className={secondaryButtonClass}
              >
                <RotateCcw size={15} />
                Reset defaults
              </button>

              <button
                onClick={() => {
                  setShowPreferences(false);
                  setToast("Preferences saved successfully");
                }}
                className={primaryButtonClass}
              >
                <Check size={16} />
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-xl border border-[#C9A45C] bg-[#25271F] px-4 py-3.5 text-sm text-[#EFE8A8] shadow-2xl">
          <CheckCircle2 size={18} className="shrink-0 text-[#D9D19A]" />
          <span>{toast}</span>

          <button
            onClick={() => setToast("")}
            className="ml-2 text-[#A9ACA2] transition hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =====================================
          GLOBAL STYLES
      ===================================== */}

      <style jsx global>{`
        .gold-ambient-card {
          position: relative;
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;

          transition:
            transform 0.35s ease,
            background 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .gold-ambient-card::before {
          content: "";
          position: absolute;
          inset: -3px;
          z-index: -1;
          border-radius: inherit;
          pointer-events: none;

          background: linear-gradient(
            135deg,
            #fff4ce 0%,
            #e8d39a 52%,
            #c9a45c 100%
          );

          filter: blur(24px);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        /* FULL CHAMPAGNE GOLD HOVER */

        .gold-ambient-card:hover,
        .gold-ambient-card:active {
          background: linear-gradient(
            135deg,
            #fff4ce 0%,
            #e8d39a 52%,
            #c9a45c 100%
          ) !important;

          border-color: #fff0b8 !important;

          color: #17140d !important;

          box-shadow:
            0 0 10px rgba(255, 244, 206, 0.85),
            0 0 24px rgba(232, 211, 154, 0.75),
            0 0 45px rgba(201, 164, 92, 0.65),
            0 0 70px rgba(201, 164, 92, 0.35),
            inset 0 0 20px rgba(255, 255, 255, 0.3) !important;
        }

        .gold-ambient-card:hover::before,
        .gold-ambient-card:active::before {
          opacity: 1;
        }

        /* DARK TEXT WHEN CARD IS HOVERED */

        .gold-ambient-card:hover h1,
        .gold-ambient-card:hover h2,
        .gold-ambient-card:hover h3,
        .gold-ambient-card:hover h4,
        .gold-ambient-card:hover p,
        .gold-ambient-card:hover label,
        .gold-ambient-card:active h1,
        .gold-ambient-card:active h2,
        .gold-ambient-card:active h3,
        .gold-ambient-card:active h4,
        .gold-ambient-card:active p,
        .gold-ambient-card:active label {
          color: #17140d !important;
        }

        /* PRESERVE PRIORITY AND CATEGORY COLORS */

        .gold-ambient-card:hover .notification-priority,
        .gold-ambient-card:active .notification-priority {
          background-color: rgba(255, 255, 255, 0.45) !important;
        }

        /* BUTTONS AND ICONS */

        .gold-ambient-card:hover button,
        .gold-ambient-card:active button {
          color: #17140d;
        }

        .gold-ambient-card:hover button svg,
        .gold-ambient-card:active button svg {
          color: #17140d;
        }

        /* DESKTOP HOVER */

        @media (hover: hover) and (pointer: fine) {
          .gold-ambient-card:hover {
            transform: translateY(-4px);
          }
        }

        /* MOBILE TOUCH */

        @media (hover: none) {
          .gold-ambient-card:active {
            transform: scale(0.985);
          }

          .gold-ambient-card:active::before {
            opacity: 1;
          }
        }

        /* MODAL ANIMATION */

        .gold-modal-card {
          animation: modalAppear 0.25s ease-out;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ACCESSIBILITY */

        @media (prefers-reduced-motion: reduce) {
          .gold-ambient-card,
          .gold-ambient-card::before,
          .gold-modal-card {
            transition: none;
            animation: none;
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
