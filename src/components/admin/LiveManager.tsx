
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Frequency = "ONE_TIME" | "WEEKLY" | "MONTHLY_TWICE";

type Recording = {
  id: number;
  title: string;
  status: string;
  visibility: "PRIVATE" | "PUBLISHED";
  publishedAt?: string | null;
  course?: { id: number; name: string } | null;
  session?: { scheduledAt: string } | null;
};

type Session = {
  id: number;
  publicId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  roomName: string;
  recordings: Recording[];
};

type LiveClass = {
  id: number;
  title: string;
  description?: string | null;
  frequency: Frequency;
  startsOn: string;
  endsOn?: string | null;
  startTimeMinutes: number;
  durationMinutes: number;
  weeklyDayOfWeek?: number | null;
  monthlyFirstDay?: number | null;
  monthlySecondDay?: number | null;
  isActive: boolean;
  course?: { id: number; name: string } | null;
  sessions: Session[];
};

type CourseOption = {
  id: number;
  name: string;
};

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const monthlyDays = Array.from({ length: 31 }, (_, i) => i + 1);

function getOrdinal(day: number) {
  if (day >= 11 && day <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function getFrequencyLabel(frequency: Frequency) {
  if (frequency === "ONE_TIME") return "One-time";
  if (frequency === "WEEKLY") return "Weekly";
  return "Monthly twice";
}

function getScheduleDetails(item: LiveClass) {
  if (item.frequency === "ONE_TIME") return "One-time class";

  if (item.frequency === "WEEKLY") {
    return `Every ${weekdays[item.weeklyDayOfWeek ?? 0]}`;
  }

  const first = item.monthlyFirstDay ?? 0;
  const second = item.monthlySecondDay ?? 0;

  return `Monthly on ${first}${getOrdinal(first)} and ${second}${getOrdinal(second)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Date to be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function getMeetingUrl(publicId: string) {
  if (typeof window === "undefined" || !publicId) return "";
  return `${window.location.origin}/live/${encodeURIComponent(publicId)}`;
}

function StatusBadge({ status }: { status: string }) {
  const live = status === "LIVE";
  const cancelled = status === "CANCELLED";
  const completed = status === "COMPLETED";

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
        live
          ? "border-red-200 bg-red-50 text-red-600"
          : cancelled
            ? "border-red-200 bg-red-50 text-red-500"
            : completed
              ? "border-[#C9A45C]/40 bg-[#EFE8A8]/40 text-[#806326]"
              : "border-[#C9A45C]/40 bg-[#FAF5ED] text-[#806326]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          live ? "animate-pulse bg-red-500" : cancelled ? "bg-red-400" : "bg-[#C9A45C]"
        }`}
      />
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default function LiveManager() {
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [live, setLive] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedSessionId, setCopiedSessionId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("ONE_TIME");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState("60");

  const [weeklyDay, setWeeklyDay] = useState("Monday");
  const [firstDay, setFirstDay] = useState("5");
  const [secondDay, setSecondDay] = useState("20");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Recordings">("Upcoming");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const inputClass =
    "w-full min-w-0 rounded-xl border border-[#C9A45C]/35 bg-white px-3.5 py-3 text-sm text-[#121414] outline-none transition placeholder:text-[#121414]/35 focus:border-[#C9A45C] focus:ring-4 focus:ring-[#EFE8A8]/40 sm:px-4";

  const primaryButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9A45C] bg-gradient-to-br from-[#EFE8A8] to-[#C9A45C] px-5 py-3 text-xs font-bold text-[#121414] shadow-[0_5px_16px_rgba(201,164,92,0.2)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-sm";

  const secondaryButton =
    "inline-flex min-h-10 items-center justify-center rounded-xl border border-[#C9A45C]/35 bg-white px-4 py-2.5 text-xs font-semibold text-[#121414] transition hover:border-[#C9A45C] hover:bg-[#FAF5ED] sm:text-sm";

  const glassCard =
    "overflow-hidden rounded-2xl border border-[#C9A45C]/35 bg-white shadow-[0_8px_28px_rgba(18,20,20,0.045)] sm:rounded-[24px]";

  const sectionLabel =
    "text-[10px] font-bold uppercase tracking-[0.22em] text-[#A17B36] sm:tracking-[0.28em]";

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);

      const response = await fetch("/api/admin/courses", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load courses.");
      }

      setCourseOptions(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load courses.");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/live-classes", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load live classes.");
      }

      setLive(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load live classes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, [fetchClasses, fetchCourses]);

  useEffect(() => {
    if (!showForm) return;

    const timer = window.setTimeout(() => {
      document.getElementById("schedule-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [showForm]);

  const openScheduleForm = () => {
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const copyMeetingLink = async (session: Session) => {
    const meetingUrl = getMeetingUrl(session.publicId);

    if (!meetingUrl) {
      setError("Meeting room is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopiedSessionId(session.id);
      setSuccess("Meeting link copied successfully.");

      window.setTimeout(() => {
        setCopiedSessionId((current) =>
          current === session.id ? null : current
        );
      }, 2500);
    } catch {
      setError("Unable to copy the link. Please copy it manually.");
    }
  };

  const joinLiveClass = (session: Session) => {
    if (!session.publicId) {
      setError("Meeting room is not available.");
      return;
    }

    const meetingUrl = getMeetingUrl(session.publicId);

    if (!meetingUrl) {
      setError("Unable to generate the meeting URL.");
      return;
    }

    window.open(`${meetingUrl}?admin=1`, "_blank", "noopener,noreferrer");
  };

  const allRecordings = useMemo(
    () =>
      live.flatMap((item) =>
        item.sessions.flatMap((session) =>
          session.recordings.map((recording) => ({
            ...recording,
            session,
            sessionTitle: item.title,
          }))
        )
      ),
    [live]
  );

  const filteredClasses = useMemo(
    () =>
      live.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      ),
    [live, search]
  );

  const filteredRecordings = useMemo(
    () =>
      allRecordings.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      ),
    [allRecordings, search]
  );

  const upcomingSessions = live.reduce(
    (total, item) =>
      total +
      item.sessions.filter(
        (session) =>
          session.status === "SCHEDULED" &&
          new Date(session.scheduledAt).getTime() >= Date.now()
      ).length,
    0
  );

  const liveSessions = live.reduce(
    (total, item) =>
      total +
      item.sessions.filter((session) => session.status === "LIVE").length,
    0
  );

  const stats = [
    {
      label: "Total Classes",
      value: live.length,
      detail: "Across your academy",
      icon: "▤",
    },
    {
      label: "Upcoming Sessions",
      value: upcomingSessions,
      detail: "Scheduled sessions",
      icon: "◷",
    },
    {
      label: "Live Sessions",
      value: liveSessions,
      detail: "Currently streaming",
      icon: "◉",
    },
    {
      label: "Recordings",
      value: allRecordings.length,
      detail: "Recorded sessions",
      icon: "▷",
    },
  ];

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFrequency("ONE_TIME");
    setStartDate("");
    setEndDate("");
    setStartTime("10:00");
    setDuration("60");
    setWeeklyDay("Monday");
    setFirstDay("5");
    setSecondDay("20");
    setSelectedCourse("");
  };

  const formatSchedule = () => {
    if (frequency === "ONE_TIME") return "One-time class";
    if (frequency === "WEEKLY") return `Every ${weeklyDay}`;

    return `Monthly on ${firstDay}${getOrdinal(Number(firstDay))} and ${secondDay}${getOrdinal(Number(secondDay))}`;
  };

  const scheduleClass = async () => {
    setError("");
    setSuccess("");

    if (!title.trim() || !startDate || !startTime) {
      setError("Please enter the class title, date and time.");
      return;
    }

    if (endDate && endDate < startDate) {
      setError("End date cannot be earlier than the starting date.");
      return;
    }

    if (frequency === "WEEKLY" && !weeklyDay) {
      setError("Please select a weekday.");
      return;
    }

    if (frequency === "MONTHLY_TWICE" && firstDay === secondDay) {
      setError("Please select two different dates for monthly classes.");
      return;
    }

    if (!Number.isInteger(Number(duration)) || Number(duration) <= 0) {
      setError("Please select a valid class duration.");
      return;
    }

    if (
      selectedCourse &&
      !courseOptions.some((course) => course.id === Number(selectedCourse))
    ) {
      setError("Please select a valid course.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      frequency,
      startDate,
      endDate: endDate || undefined,
      startTime,
      duration: Number(duration),
      weeklyDay:
        frequency === "WEEKLY" ? weekdays.indexOf(weeklyDay) : undefined,
      firstDay:
        frequency === "MONTHLY_TWICE" ? Number(firstDay) : undefined,
      secondDay:
        frequency === "MONTHLY_TWICE" ? Number(secondDay) : undefined,
      selectedCourse: selectedCourse ? Number(selectedCourse) : null,
    };

    try {
      setSaving(true);

      const response = await fetch("/api/admin/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to schedule class.");
      }

      await fetchClasses();
      resetForm();
      setShowForm(false);
      setActiveTab("Upcoming");
      setSearch("");

      setSuccess(
        "Live class created successfully. Your meeting links are ready in Class Details."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to schedule class.");
    } finally {
      setSaving(false);
    }
  };

  const removeClass = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this class and its future scheduled sessions?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/live-classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to cancel class.");
      }

      await fetchClasses();
      setSuccess("Class cancelled successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel class.");
    }
  };

  const deleteClass = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this cancelled class? This action cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/live-classes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete this class.");
      }

      await fetchClasses();
      setShowDetails((current) => (current === id ? null : current));
      setSuccess(result.message || "Cancelled class deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this class.");
    } finally {
      setDeletingId(null);
    }
  };

  const featuredClass = [...live]
    .flatMap((item) =>
      item.sessions
        .filter((session) => session.status === "SCHEDULED")
        .map((session) => ({
          ...session,
          seriesTitle: item.title,
          frequency: item.frequency,
          courseName: item.course?.name,
        }))
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    )[0];

  const formField = (
    label: string,
    child: React.ReactNode,
    hint?: string
  ) => (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#121414]/80 sm:text-sm">
        {label}
      </label>
      {child}
      {hint && <p className="mt-2 text-[11px] leading-5 text-[#121414]/50">{hint}</p>}
    </div>
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#FAF5ED] px-3 py-4 text-[#121414] sm:px-5 sm:py-6 lg:px-8">
      {/* TOAST */}
      {(success || error) && (
        <div
          role={error ? "alert" : "status"}
          aria-live="polite"
          className="fixed bottom-4 left-3 right-3 z-[9999] mx-auto max-w-[420px] overflow-hidden rounded-2xl border border-[#C9A45C]/60 bg-white shadow-[0_15px_45px_rgba(18,20,20,0.18)] sm:bottom-6 sm:left-auto sm:right-6"
        >
          <div className="flex items-start gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                error
                  ? "bg-red-50 text-red-600"
                  : "bg-gradient-to-br from-[#EFE8A8] to-[#C9A45C] text-[#121414]"
              }`}
            >
              {error ? "!" : "✓"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {error ? "Something went wrong" : "Successfully completed"}
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-[#121414]/65">
                {error || success}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess("");
                setError("");
              }}
              aria-label="Close notification"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg text-[#121414]/45 hover:bg-[#FAF5ED]"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed -left-40 top-20 h-80 w-80 rounded-full bg-[#EFE8A8]/40 blur-[100px]" />
      <div className="pointer-events-none fixed -right-40 top-60 h-80 w-80 rounded-full bg-[#E8D8C5]/60 blur-[110px]" />

      <div className="relative mx-auto max-w-[1500px] space-y-6 sm:space-y-8">
        {/* HEADER */}
        <header className="relative overflow-hidden rounded-2xl border border-[#C9A45C]/50 bg-gradient-to-br from-white via-[#FAF5ED] to-[#E8D8C5]/65 p-5 shadow-[0_12px_35px_rgba(201,164,92,0.14)] sm:rounded-[28px] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#EFE8A8]/65 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#C9A45C]" />
                <span className={sectionLabel}>KBC Saloon Academy</span>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Live <span className="italic text-[#C9A45C]">Classes</span>
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-6 text-[#121414]/60 sm:mt-4 sm:text-sm sm:leading-7">
                Your complete learning workspace. Schedule masterclasses,
                manage live sessions and organize your academy recordings.
              </p>
            </div>

            <button
              onClick={openScheduleForm}
              className={`${primaryButton} w-full shrink-0 sm:w-fit`}
            >
              <span className="text-xl leading-none">+</span>
              Schedule a Class
            </button>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#C9A45C]/25 pt-4 text-[10px] text-[#121414]/55 sm:mt-8 sm:gap-x-7 sm:text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C9A45C]" />
              Academy Management
            </span>
            <span>Live Learning Experience</span>
            <span>Class Recording Library</span>
          </div>
        </header>

        {/* STATS */}
        <section>
          <div className="mb-4 flex flex-col gap-1 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionLabel}>Overview</p>
              <h2 className="mt-1 font-serif text-xl sm:text-2xl md:text-3xl">
                Academy Overview
              </h2>
            </div>
            <p className="text-[11px] text-[#121414]/50 sm:text-xs">
              Your live class activity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#C9A45C]/35 bg-white p-4 shadow-[0_6px_20px_rgba(18,20,20,0.04)] transition hover:-translate-y-1 hover:shadow-lg sm:rounded-[22px] sm:p-5 lg:p-6"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-semibold leading-4 text-[#121414]/60 sm:text-xs">
                    {item.label}
                  </p>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFE8A8] to-[#E8D8C5] text-base text-[#806326] sm:h-10 sm:w-10 sm:text-xl">
                    {item.icon}
                  </span>
                </div>

                <p className="mt-4 font-serif text-3xl font-medium sm:mt-6 sm:text-4xl">
                  {loading ? "—" : item.value.toString().padStart(2, "0")}
                </p>
                <p className="mt-1 text-[9px] text-[#121414]/45 sm:text-[11px]">
                  {item.detail}
                </p>

                <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#E8D8C5] via-[#EFE8A8] to-[#C9A45C]" />
              </div>
            ))}
          </div>
        </section>

        {/* NEXT CLASS */}
        {featuredClass && (
          <section className="relative overflow-hidden rounded-2xl border border-[#C9A45C]/45 bg-gradient-to-br from-white via-[#FAF5ED] to-[#E8D8C5]/55 p-5 shadow-[0_8px_25px_rgba(201,164,92,0.12)] sm:rounded-[26px] sm:p-7 lg:p-8">
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="min-w-0">
                <p className={sectionLabel}>Next in your academy</p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl md:text-4xl">
                  Upcoming <span className="italic text-[#C9A45C]">Masterclass</span>
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#121414]/55 sm:text-sm">
                  Your next scheduled learning experience.
                </p>

                <div className="mt-5 rounded-xl border border-[#C9A45C]/25 bg-white/80 p-4 sm:mt-6 sm:p-5">
                  <p className={sectionLabel}>Featured class</p>
                  <h3 className="mt-2 break-words text-base font-bold sm:text-xl">
                    {featuredClass.seriesTitle}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#121414]/60 sm:text-xs">
                    <span>◷ {formatDate(featuredClass.scheduledAt)}</span>
                    <span>{getFrequencyLabel(featuredClass.frequency)}</span>
                    <span>{featuredClass.durationMinutes} minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-2xl border border-[#C9A45C]/35 bg-gradient-to-br from-[#EFE8A8] via-white to-[#E8D8C5] sm:h-40 md:w-44 lg:h-48 lg:w-52">
                <div className="text-center">
                  <span className="block font-serif text-6xl italic text-[#C9A45C] sm:text-7xl">
                    K
                  </span>
                  <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-[#121414]/55">
                    Beauty Academy
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SCHEDULE FORM */}
        {showForm && (
          <section id="schedule-form" className={`${glassCard} scroll-mt-5`}>
            <div className="border-b border-[#C9A45C]/25 bg-gradient-to-r from-[#EFE8A8]/55 via-white to-[#E8D8C5]/45 p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className={sectionLabel}>Create experience</p>
                  <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                    Schedule a Class
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[#121414]/55 sm:text-sm">
                    Configure your class details and schedule.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                    setError("");
                  }}
                  disabled={saving}
                  className="self-start rounded-full border border-[#C9A45C]/35 px-3 py-1.5 text-xs font-semibold text-[#121414]/60 hover:bg-white"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="space-y-7 p-4 sm:p-6 lg:p-7">
              {/* DETAILS */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE8A8]/65 text-xs font-bold text-[#806326]">01</span>
                  <div>
                    <h3 className="text-sm font-bold sm:text-base">Class Details</h3>
                    <p className="text-[11px] text-[#121414]/45">Basic class information</p>
                  </div>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
                  {formField("Class Title *", (
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Bridal Makeup Masterclass"
                      className={inputClass}
                    />
                  ))}

                  {formField("Related Course", (
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className={inputClass}
                      disabled={coursesLoading}
                    >
                      <option value="">
                        {coursesLoading ? "Loading courses..." : "No course selected"}
                      </option>
                      {courseOptions.map((course) => (
                        <option key={course.id} value={String(course.id)}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  ))}

                  <div className="sm:col-span-2">
                    {formField("Class Description", (
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe what students will learn..."
                        className={`${inputClass} resize-y`}
                      />
                    ))}
                  </div>
                </div>

                {!coursesLoading && courseOptions.length === 0 && (
                  <p className="mt-3 text-[11px] text-[#806326]">
                    No active courses found. You can create a class without assigning a course.
                  </p>
                )}
              </div>

              <div className="h-px bg-[#C9A45C]/20" />

              {/* FREQUENCY */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE8A8]/65 text-xs font-bold text-[#806326]">02</span>
                  <div>
                    <h3 className="text-sm font-bold sm:text-base">Class Schedule</h3>
                    <p className="text-[11px] text-[#121414]/45">Choose your class frequency</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "ONE_TIME", title: "One-time", detail: "A single class", icon: "◷" },
                    { value: "WEEKLY", title: "Weekly", detail: "Repeats every week", icon: "▦" },
                    { value: "MONTHLY_TWICE", title: "Monthly Twice", detail: "Two dates every month", icon: "◫" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFrequency(option.value as Frequency)}
                      className={`min-w-0 rounded-2xl border p-4 text-left transition ${
                        frequency === option.value
                          ? "border-[#C9A45C] bg-gradient-to-br from-[#EFE8A8]/65 to-[#E8D8C5]/35 shadow-[0_5px_15px_rgba(201,164,92,0.12)]"
                          : "border-[#C9A45C]/25 bg-white hover:bg-[#FAF5ED]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl text-[#A17B36]">{option.icon}</span>
                        <span className={`h-4 w-4 rounded-full border ${
                          frequency === option.value
                            ? "border-[#C9A45C] bg-[#C9A45C] shadow-[inset_0_0_0_3px_white]"
                            : "border-[#C9A45C]/45"
                        }`} />
                      </div>
                      <h4 className="mt-3 text-sm font-bold">{option.title}</h4>
                      <p className="mt-1 text-[11px] text-[#121414]/50">{option.detail}</p>
                    </button>
                  ))}
                </div>

                {frequency === "ONE_TIME" && (
                  <div className="mt-4 rounded-2xl border border-[#C9A45C]/30 bg-[#FAF5ED]/65 p-4 sm:p-5">
                    <p className={sectionLabel}>One-time schedule</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {formField("Class Date *", (
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                      ))}
                      {formField("Class Time *", (
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                      ))}
                    </div>
                  </div>
                )}

                {frequency === "WEEKLY" && (
                  <div className="mt-4 rounded-2xl border border-[#C9A45C]/30 bg-[#FAF5ED]/65 p-4 sm:p-5">
                    <p className={sectionLabel}>Weekly schedule</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {formField("Repeat Every *", (
                        <select value={weeklyDay} onChange={(e) => setWeeklyDay(e.target.value)} className={inputClass}>
                          {weekdays.map((day) => <option key={day}>{day}</option>)}
                        </select>
                      ))}
                      {formField("First Class Date *", (
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                      ))}
                      {formField("Class Time *", (
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                      ))}
                      {formField("Schedule Until (Optional)", (
                        <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                      ))}
                    </div>
                  </div>
                )}

                {frequency === "MONTHLY_TWICE" && (
                  <div className="mt-4 rounded-2xl border border-[#C9A45C]/35 bg-gradient-to-br from-[#FAF5ED] via-white to-[#E8D8C5]/35 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className={sectionLabel}>Monthly recurring schedule</p>
                        <h4 className="mt-1 font-serif text-xl sm:text-2xl">Choose two dates</h4>
                      </div>
                      <span className="rounded-full border border-[#C9A45C]/35 bg-[#EFE8A8]/50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider">2 classes / month</span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-[#121414]/50">
                      Dates such as the 30th or 31st are skipped in months where they do not exist.
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {formField("First Class Date *", (
                        <select value={firstDay} onChange={(e) => setFirstDay(e.target.value)} className={inputClass}>
                          {monthlyDays.map((day) => <option key={day} value={day}>{day}{getOrdinal(day)} of every month</option>)}
                        </select>
                      ))}
                      {formField("Second Class Date *", (
                        <select value={secondDay} onChange={(e) => setSecondDay(e.target.value)} className={inputClass}>
                          {monthlyDays.map((day) => <option key={day} value={day}>{day}{getOrdinal(day)} of every month</option>)}
                        </select>
                      ))}
                      {formField("Starting Month / Date *", (
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                      ))}
                      {formField("Class Time *", (
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                      ))}
                      <div className="sm:col-span-2">
                        {formField("Schedule Until (Optional)", (
                          <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#C9A45C]/25 bg-white p-4">
                      <p className={sectionLabel}>Schedule preview</p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#EFE8A8]/40 p-3">
                          <p className="font-serif text-2xl">{firstDay}{getOrdinal(Number(firstDay))}</p>
                          <p className="text-[10px] text-[#121414]/50">First class</p>
                        </div>
                        <div className="rounded-xl bg-[#E8D8C5]/45 p-3">
                          <p className="font-serif text-2xl">{secondDay}{getOrdinal(Number(secondDay))}</p>
                          <p className="text-[10px] text-[#121414]/50">Second class</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-[#C9A45C]/20" />

              {/* SETTINGS */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE8A8]/65 text-xs font-bold text-[#806326]">03</span>
                  <div>
                    <h3 className="text-sm font-bold sm:text-base">Class Settings</h3>
                    <p className="text-[11px] text-[#121414]/45">Duration and meeting preferences</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {formField("Class Duration", (
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass}>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="90">1 Hour 30 Minutes</option>
                      <option value="120">2 Hours</option>
                      <option value="180">3 Hours</option>
                    </select>
                  ))}

                  <div className="flex min-w-0 items-end">
                    <div className="flex w-full items-center gap-3 rounded-xl border border-[#C9A45C]/35 bg-[#FAF5ED] p-3 sm:p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFE8A8] to-[#E8D8C5] text-lg">◉</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold">Video Meeting</p>
                        <p className="mt-1 text-[10px] leading-4 text-[#121414]/50">Unique room for every session</p>
                      </div>
                      <span className="ml-auto rounded-full bg-[#EFE8A8]/60 px-2 py-1 text-[9px] font-bold text-[#806326]">READY</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#C9A45C]/35 bg-gradient-to-br from-[#FAF5ED] to-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFE8A8] to-[#E8D8C5] text-xl">↗</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">Automatic Meeting Link</p>
                      <p className="mt-1 text-[11px] leading-5 text-[#121414]/50">
                        A unique student joining URL is generated for every session after creation.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#EFE8A8]/60 px-3 py-1.5 text-[9px] font-bold text-[#806326]">AUTOMATIC</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[#C9A45C]/30 bg-[#FAF5ED] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg">▷</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">Automatic Class Recording</p>
                    <p className="mt-1 text-[10px] leading-5 text-[#121414]/50">
                      Recording workflow will use LiveKit Egress and Cloudflare R2.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#C9A45C]/35 bg-[#EFE8A8]/50 px-3 py-1.5 text-[9px] font-bold text-[#806326]">PLANNED</span>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="rounded-2xl border border-[#C9A45C]/30 bg-gradient-to-r from-[#EFE8A8]/35 via-white to-[#E8D8C5]/35 p-4 sm:p-5">
                <p className={sectionLabel}>Configuration summary</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ["Frequency", getFrequencyLabel(frequency)],
                    ["Schedule", formatSchedule()],
                    ["Duration", `${duration} minutes`],
                    ["Recording", "Planned"],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[10px] text-[#121414]/45">{label}</p>
                      <p className="mt-1 break-words text-xs font-bold sm:text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#C9A45C]/25 bg-[#FAF5ED]/65 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setError("");
                }}
                className={secondaryButton}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={scheduleClass}
                className={primaryButton}
                disabled={saving || coursesLoading}
              >
                {saving ? "Saving Class..." : "Create Class →"}
              </button>
            </div>
          </section>
        )}

        {/* CLASS LIBRARY */}
        <section className={glassCard}>
          <div className="flex flex-col gap-4 border-b border-[#C9A45C]/25 bg-gradient-to-r from-white to-[#FAF5ED] p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className={sectionLabel}>Manage learning</p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Class Library</h2>
              <p className="mt-1 text-xs leading-5 text-[#121414]/55 sm:text-sm">
                Manage your upcoming sessions and recordings.
              </p>
            </div>

            <div className="w-full lg:max-w-[300px]">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "Upcoming" ? "Search classes..." : "Search recordings..."}
                className={inputClass}
              />
            </div>
          </div>

          {/* TABS */}
          <div className="flex border-b border-[#C9A45C]/25 bg-[#FAF5ED]/70 px-4 sm:px-7">
            {(["Upcoming", "Recordings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearch("");
                }}
                className={`relative mr-6 py-4 text-xs font-bold transition sm:mr-8 sm:text-sm ${
                  activeTab === tab ? "text-[#806326]" : "text-[#121414]/45 hover:text-[#121414]"
                }`}
              >
                {tab}
                <span className={`absolute bottom-0 left-0 h-[3px] w-full rounded-full ${
                  activeTab === tab ? "bg-gradient-to-r from-[#C9A45C] to-[#EFE8A8]" : "bg-transparent"
                }`} />
              </button>
            ))}
          </div>

          {/* UPCOMING */}
          {activeTab === "Upcoming" && (
            <div className="space-y-4 bg-[#FAF5ED]/50 p-3 sm:space-y-5 sm:p-5 lg:p-7">
              {loading ? (
                <div className="py-16 text-center text-xs text-[#121414]/55 sm:text-sm">
                  Loading classes from database...
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#C9A45C]/40 bg-white px-4 py-14 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE8A8]/60 text-2xl">◷</span>
                  <h3 className="mt-4 font-serif text-xl sm:text-2xl">No Classes Found</h3>
                  <p className="mt-2 text-xs text-[#121414]/50 sm:text-sm">
                    Your saved classes will appear here.
                  </p>
                  <button onClick={openScheduleForm} className="mt-5 text-xs font-bold text-[#9A762F]">
                    + Schedule your first class
                  </button>
                </div>
              ) : (
                filteredClasses.map((item) => {
                  const now = Date.now();

                  const liveSession = item.sessions.find((session) => session.status === "LIVE");

                  const nextSession = item.sessions
                    .filter(
                      (session) =>
                        session.status === "SCHEDULED" &&
                        new Date(session.scheduledAt).getTime() >= now
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.scheduledAt).getTime() -
                        new Date(b.scheduledAt).getTime()
                    )[0];

                  const joinableSession = liveSession || nextSession;

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-[#C9A45C]/35 bg-white shadow-[0_5px_18px_rgba(18,20,20,0.04)] transition hover:border-[#C9A45C]/70 hover:shadow-[0_10px_25px_rgba(201,164,92,0.12)]"
                    >
                      <div className="p-4 sm:p-5 lg:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          {/* CLASS INFO */}
                          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C9A45C]/35 bg-gradient-to-br from-[#EFE8A8] to-[#E8D8C5] text-xl sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl">
                              ◷
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-sm font-bold sm:text-base lg:text-lg">
                                {item.title}
                              </h3>

                              <p className="mt-1 text-[11px] leading-5 text-[#121414]/55 sm:text-xs">
                                {liveSession
                                  ? "Live session in progress"
                                  : nextSession
                                    ? formatDate(nextSession.scheduledAt)
                                    : "No upcoming session"}
                              </p>

                              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#A17B36] sm:text-[11px]">
                                {getScheduleDetails(item)}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-[#FAF5ED] px-2.5 py-1.5 text-[10px] font-semibold text-[#121414]/65">
                                  {item.durationMinutes} min
                                </span>

                                {item.course && (
                                  <span className="max-w-full break-words rounded-lg bg-[#FAF5ED] px-2.5 py-1.5 text-[10px] font-semibold text-[#121414]/65">
                                    {item.course.name}
                                  </span>
                                )}

                                <span className="rounded-lg bg-[#EFE8A8]/45 px-2.5 py-1.5 text-[10px] font-semibold text-[#806326]">
                                  {item.sessions.length} sessions
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[290px]">
                            <div className="flex items-center justify-between gap-3 xl:justify-end">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#121414]/40">
                                Class Status
                              </span>

                              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${
                                item.isActive
                                  ? "border-[#C9A45C]/45 bg-[#EFE8A8]/45 text-[#806326]"
                                  : "border-red-200 bg-red-50 text-red-600"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${item.isActive ? "bg-[#C9A45C]" : "bg-red-500"}`} />
                                {item.isActive ? "Active" : "Cancelled"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:justify-end">
                              <button
                                type="button"
                                onClick={() => setShowDetails(showDetails === item.id ? null : item.id)}
                                className={`${secondaryButton} w-full sm:w-auto`}
                              >
                                {showDetails === item.id ? "Hide Details" : "View Details"}
                              </button>

                              {item.isActive && joinableSession && (
                                <button
                                  type="button"
                                  onClick={() => joinLiveClass(joinableSession)}
                                  disabled={!joinableSession.publicId}
                                  className={`${primaryButton} w-full sm:w-auto`}
                                >
                                  ▶ {joinableSession.status === "LIVE" ? "Join Live" : "Join Class"}
                                </button>
                              )}

                              {item.isActive && (
                                <button
                                  type="button"
                                  onClick={() => removeClass(item.id)}
                                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                                >
                                  Cancel Class
                                </button>
                              )}

                              {!item.isActive && (
                                <button
                                  type="button"
                                  onClick={() => deleteClass(item.id)}
                                  disabled={deletingId === item.id}
                                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:w-auto"
                                >
                                  {deletingId === item.id ? "Deleting..." : "Delete Class"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DETAILS */}
                        {showDetails === item.id && (
                          <div className="mt-5 space-y-5 border-t border-[#C9A45C]/20 pt-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="rounded-xl bg-[#FAF5ED]/70 p-4">
                                <p className={sectionLabel}>Description</p>
                                <p className="mt-2 break-words text-xs leading-6 text-[#121414]/65">
                                  {item.description || "No description added."}
                                </p>
                              </div>

                              <div className="rounded-xl bg-[#FAF5ED]/70 p-4">
                                <p className={sectionLabel}>Meeting access</p>
                                <p className="mt-2 text-xs leading-6 text-[#121414]/65">
                                  Each session has its own student meeting URL. Copy the link to share with students.
                                </p>
                              </div>
                            </div>

                            <div>
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className={sectionLabel}>Scheduled Sessions & Meeting Links</p>
                                <span className="text-[10px] text-[#121414]/45">
                                  {item.sessions.length} total sessions
                                </span>
                              </div>

                              {item.sessions.length === 0 ? (
                                <p className="rounded-xl bg-[#FAF5ED] p-4 text-xs text-[#121414]/55">
                                  No sessions generated.
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {item.sessions.map((session) => {
                                    const meetingUrl = getMeetingUrl(session.publicId);
                                    const canJoin =
                                      item.isActive &&
                                      ["SCHEDULED", "LIVE"].includes(session.status);

                                    return (
                                      <div key={session.id} className="min-w-0 rounded-xl border border-[#C9A45C]/25 bg-white p-3 sm:p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold sm:text-sm">
                                              {formatDate(session.scheduledAt)}
                                            </p>
                                            <p className="mt-1 text-[10px] text-[#121414]/45">
                                              {session.durationMinutes} minutes · Session #{session.id}
                                            </p>
                                          </div>
                                          <StatusBadge status={session.status} />
                                        </div>

                                        <div className="mt-4 border-t border-[#C9A45C]/15 pt-3">
                                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#A17B36]">
                                            Student Meeting URL
                                          </label>

                                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                                            <input
                                              readOnly
                                              value={meetingUrl}
                                              aria-label="Student meeting URL"
                                              className="min-w-0 flex-1 rounded-lg border border-[#C9A45C]/25 bg-[#FAF5ED] px-3 py-2.5 text-[11px] text-[#121414]/70 outline-none"
                                            />

                                            <div className="grid grid-cols-2 gap-2 sm:flex">
                                              <button
                                                type="button"
                                                onClick={() => copyMeetingLink(session)}
                                                className="rounded-lg border border-[#C9A45C]/45 bg-[#EFE8A8]/40 px-3 py-2.5 text-[11px] font-bold text-[#806326] hover:bg-[#EFE8A8]/70"
                                              >
                                                {copiedSessionId === session.id ? "✓ Copied" : "▣ Copy Link"}
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => joinLiveClass(session)}
                                                disabled={!canJoin || !session.publicId}
                                                className="rounded-lg border border-[#C9A45C] bg-gradient-to-br from-[#EFE8A8] to-[#C9A45C] px-3 py-2.5 text-[11px] font-bold text-[#121414] disabled:cursor-not-allowed disabled:opacity-40"
                                              >
                                                ▶ Join
                                              </button>
                                            </div>
                                          </div>

                                          <p className="mt-2 text-[10px] leading-5 text-[#121414]/40">
                                            Share this URL with students to let them access this session.
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* RECORDINGS */}
          {activeTab === "Recordings" && (
            <div className="space-y-4 bg-[#FAF5ED]/50 p-3 sm:p-5 lg:p-7">
              {loading ? (
                <div className="py-16 text-center text-xs text-[#121414]/55 sm:text-sm">
                  Loading recordings...
                </div>
              ) : filteredRecordings.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#C9A45C]/40 bg-white px-4 py-14 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE8A8]/60 text-2xl">▷</span>
                  <h3 className="mt-4 font-serif text-xl sm:text-2xl">No Recordings Found</h3>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#121414]/50 sm:text-sm">
                    Recordings will appear here after a live session has been recorded.
                  </p>
                </div>
              ) : (
                filteredRecordings.map((recording) => (
                  <article key={recording.id} className="rounded-2xl border border-[#C9A45C]/35 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFE8A8] to-[#E8D8C5] text-lg sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl">▶</span>
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-bold sm:text-base">{recording.title}</h3>
                          <p className="mt-1 text-[11px] text-[#121414]/50 sm:text-xs">
                            {formatDate(recording.session?.scheduledAt)}
                          </p>
                          <p className="mt-2 text-[11px] text-[#A17B36]">
                            Course: {recording.course?.name || "Not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={recording.status} />
                        <span className="rounded-full border border-[#C9A45C]/35 bg-[#EFE8A8]/35 px-3 py-1.5 text-[10px] font-bold uppercase text-[#806326]">
                          {recording.visibility}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 border-t border-[#C9A45C]/15 pt-3 text-[10px] leading-5 text-[#121414]/45 sm:text-[11px]">
                      Course assignment and publishing controls will be enabled in the recording-management API step.
                    </p>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col gap-2 border-t border-[#C9A45C]/25 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          <p className="text-[10px] text-[#121414]/45 sm:text-xs">
            © 2026 KBC Saloon Academy (Kavyas Beauty Centre)
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A17B36] sm:text-[10px] sm:tracking-[0.25em]">
            Beauty • Education • Excellence
          </p>
        </footer>
      </div>
    </div>
  );
}
