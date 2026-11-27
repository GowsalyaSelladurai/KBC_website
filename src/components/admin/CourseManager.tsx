"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteCourseModal from "./courses/DeleteCourseModal";

type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Lesson = {
  id: string;
  title: string;
  durationSeconds: number | null;
  isPreview: boolean;
};

type Module = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  price: number | string;
  status: CourseStatus;
  learningPoints: { id: string; content: string; sortOrder: number }[];
  modules: Module[];
  createdAt: string;
  updatedAt: string;
};

function getCategory(course: Course): { name: string; style: string } {
  const text = `${course.title} ${course.courseCode} ${course.description || ""}`.toLowerCase();
  if (text.includes("hair")) {
    return {
      name: "Hair Styling",
      style: "border-purple-400/30 bg-purple-950/60 text-purple-200",
    };
  }
  if (text.includes("nail")) {
    return {
      name: "Nail Art",
      style: "border-[#D6AD65]/35 bg-[#211A12]/80 text-[#F1D69A]",
    };
  }
  if (text.includes("skin") || text.includes("facial")) {
    return {
      name: "Skincare",
      style: "border-emerald-400/30 bg-emerald-950/60 text-emerald-200",
    };
  }
  if (text.includes("bridal") || text.includes("wedding")) {
    return {
      name: "Bridal Makeup",
      style: "border-rose-400/30 bg-rose-950/60 text-rose-200",
    };
  }
  if (text.includes("saree") || text.includes("drape") || text.includes("styling")) {
    return {
      name: "Styling & Draping",
      style: "border-sky-400/30 bg-sky-950/60 text-sky-200",
    };
  }
  return {
    name: "Makeup",
    style: "border-[#D6AD65]/40 bg-[#211A12]/80 text-[#F1D69A]",
  };
}

function StatusBadge({ status }: { status: CourseStatus }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/75 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Published
      </span>
    );
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D6AD65]/40 bg-[#211A12]/85 px-2.5 py-0.5 text-[11px] font-medium text-[#F1D69A] backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D6AD65]" />
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/30 bg-zinc-900/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      Archived
    </span>
  );
}

function formatPrice(value: number | string) {
  const num = Number(value);
  if (Number.isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function CourseManager() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  async function fetchCourses() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/courses?_t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load courses right now.");
      }

      const data: Course[] = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Unable to load courses right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openMenuId]);

  const stats = useMemo(() => {
    const activeCourses = courses.filter((c) => c.status !== "ARCHIVED");
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    const draft = courses.filter((c) => c.status === "DRAFT").length;
    const totalLessons = activeCourses.reduce(
      (sum, c) =>
        sum +
        (c.modules?.reduce((mSum, m) => mSum + (m.lessons?.length || 0), 0) ||
          0),
      0,
    );

    return {
      total: activeCourses.length,
      published,
      draft,
      lessons: totalLessons,
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.courseCode.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term)),
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    } else {
      result = result.filter((c) => c.status !== "ARCHIVED");
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((c) =>
        getCategory(c).name.toLowerCase().includes(categoryFilter.toLowerCase()),
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [courses, query, statusFilter, categoryFilter, sortBy]);

  return (
    <div className="animate-kbc-in mx-auto max-w-[1440px] space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-wide text-white sm:text-4xl">
            Our Courses
          </h1>
          <p className="mt-1 text-xs text-[#BDB4A7] sm:text-sm">
            Empower your skills with expert-led beauty education
          </p>
        </div>

        <Link href="/admin/courses/new" className="kbc-gold-btn">
          <span className="text-sm leading-none">+</span>
          <span>Add Course</span>
        </Link>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="kbc-gold-card flex items-center gap-4 rounded-2xl p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D6AD65]/35 bg-[#211A12] text-[#F1D69A]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#BDB4A7]">Total Courses</p>
            <p className="mt-0.5 font-serif text-2xl font-semibold text-white">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="kbc-gold-card flex items-center gap-4 rounded-2xl p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-950/50 text-emerald-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#BDB4A7]">Published</p>
            <p className="mt-0.5 font-serif text-2xl font-semibold text-white">
              {stats.published}
            </p>
          </div>
        </div>

        <div className="kbc-gold-card flex items-center gap-4 rounded-2xl p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D6AD65]/35 bg-[#211A12] text-[#D6AD65]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#BDB4A7]">Draft</p>
            <p className="mt-0.5 font-serif text-2xl font-semibold text-white">
              {stats.draft}
            </p>
          </div>
        </div>

        <div className="kbc-gold-card flex items-center gap-4 rounded-2xl p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D6AD65]/35 bg-[#211A12] text-[#F1D69A]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#BDB4A7]">Total Lessons</p>
            <p className="mt-0.5 font-serif text-2xl font-semibold text-white">
              {stats.lessons}
            </p>
          </div>
        </div>
      </div>

      {/* Filter, Sort & View Toggle Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#D6AD65]/20 bg-[#15120F] p-3.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDB4A7]/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses by name or code..."
            className="w-full rounded-xl border border-[#D6AD65]/20 bg-[#090807] py-2 pl-10 pr-4 text-xs text-white outline-none placeholder:text-[#BDB4A7]/60 transition focus:border-[#D6AD65]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#D6AD65]/20 bg-[#090807] px-3.5 py-2 text-xs text-white outline-none transition focus:border-[#D6AD65]"
          >
            <option value="ALL">All Categories</option>
            <option value="makeup">Makeup</option>
            <option value="hair">Hair</option>
            <option value="nail">Nails</option>
            <option value="skin">Skincare</option>
            <option value="bridal">Bridal</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#D6AD65]/20 bg-[#090807] px-3.5 py-2 text-xs text-white outline-none transition focus:border-[#D6AD65]"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-[#D6AD65]/20 bg-[#090807] px-3.5 py-2 text-xs text-white outline-none transition focus:border-[#D6AD65]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div
            className="flex items-center rounded-xl border border-[#D6AD65]/25 bg-[#090807] p-0.5"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`rounded-lg p-1.5 transition ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] text-[#090807]"
                  : "text-[#BDB4A7] hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`rounded-lg p-1.5 transition ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] text-[#090807]"
                  : "text-[#BDB4A7] hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {deleteMessage && (
        <div className="animate-kbc-in flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-3 text-xs text-emerald-300">
          <span>✓ {deleteMessage}</span>
          <button
            type="button"
            onClick={() => setDeleteMessage("")}
            className="text-emerald-300/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Course Cards / List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse overflow-hidden rounded-2xl border border-[#D6AD65]/15 bg-[#1B1713]"
            >
              <div className="h-44 w-full bg-[#211A12]" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 rounded bg-[#211A12]" />
                <div className="h-3 w-full rounded bg-[#15120F]" />
                <div className="h-8 rounded bg-[#15120F]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="kbc-gold-card rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-rose-300">{error}</p>
          <button onClick={fetchCourses} className="kbc-outline-btn mt-4">
            Try Again
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D6AD65]/30 bg-[#15120F] p-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#211A12] text-xl text-[#D6AD65]">
            ✦
          </div>
          <h3 className="font-serif text-xl font-medium text-white">
            {courses.length === 0
              ? "No Courses Created Yet"
              : "No Matching Courses Found"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-[#BDB4A7]">
            {courses.length === 0
              ? "Create your first luxury beauty course to start building modules and video lessons."
              : "Try clearing your search or switching your filters."}
          </p>
          <div className="mt-5">
            {courses.length === 0 ? (
              <Link href="/admin/courses/new" className="kbc-gold-btn">
                <span>+</span>
                <span>Create First Course</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setQuery("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="kbc-outline-btn"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredCourses.map((course, idx) => {
            const cat = getCategory(course);
            const lessonCount =
              course.modules?.reduce(
                (acc, m) => acc + (m.lessons?.length || 0),
                0,
              ) || 0;

            return (
              <div
                key={course.id}
                style={{ animationDelay: `${Math.min(idx * 35, 250)}ms` }}
                className="animate-kbc-in group flex flex-col justify-between gap-4 rounded-2xl border border-[#D6AD65]/20 bg-[#1B1713] p-4 transition-all duration-200 hover:border-[#D6AD65]/55 hover:bg-[#211A12] sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#D6AD65]/20 bg-[#090807]">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl text-[#D6AD65]/40">
                        ✦
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={course.status} />
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${cat.style}`}
                      >
                        {cat.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#D6AD65]">
                        {course.courseCode}
                      </span>
                    </div>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="block truncate font-serif text-lg font-medium text-white transition group-hover:text-[#F1D69A]"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-[#BDB4A7]">
                      {course.duration || "Self-paced"} · {lessonCount}{" "}
                      {lessonCount === 1 ? "Lesson" : "Lessons"} ·{" "}
                      <span className="font-semibold text-[#F1D69A]">
                        {formatPrice(course.price)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                    className="kbc-outline-btn !px-3 !py-1.5"
                  >
                    Curriculum
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/courses/${course.id}/edit`)
                    }
                    className="kbc-outline-btn !px-3 !py-1.5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: course.id, title: course.title })
                    }
                    className="rounded-xl border border-rose-500/30 bg-[#090807] px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, idx) => {
            const cat = getCategory(course);
            const lessonCount =
              course.modules?.reduce(
                (acc, m) => acc + (m.lessons?.length || 0),
                0,
              ) || 0;
            const menuOpen = openMenuId === course.id;

            return (
              <div
                key={course.id}
                style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
                className="animate-kbc-in group relative flex flex-col overflow-hidden rounded-2xl border border-[#D6AD65]/25 bg-[#1B1713] shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6AD65]/60 hover:shadow-[0_14px_34px_rgba(214,173,101,0.14)]"
              >
                {/* Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-[#090807]">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#211A12] via-[#15120F] to-[#090807]">
                      <span className="text-4xl text-[#D6AD65]/30 transition-transform duration-500 group-hover:scale-110">
                        ✦
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1713] via-transparent to-black/35" />

                  <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md ${cat.style}`}
                    >
                      {cat.name}
                    </span>
                    <StatusBadge status={course.status} />
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between space-y-3.5 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="line-clamp-1 block font-serif text-lg font-medium text-white transition group-hover:text-[#F1D69A]"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-[#BDB4A7]">
                        {course.description ||
                          "Master professional beauty and salon techniques with KBC Academy."}
                      </p>
                    </div>

                    {/* More actions menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label={`More actions for ${course.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(menuOpen ? null : course.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D6AD65]/20 bg-[#15120F] text-[#BDB4A7] transition hover:border-[#D6AD65]/50 hover:text-[#F1D69A]"
                      >
                        •••
                      </button>

                      {menuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="animate-kbc-modal absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-[#D6AD65]/30 bg-[#15120F] py-1 shadow-2xl"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push(`/admin/courses/${course.id}`);
                            }}
                            className="block w-full px-3.5 py-2 text-left text-xs text-white transition hover:bg-[#211A12] hover:text-[#F1D69A]"
                          >
                            Manage Curriculum
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push(`/admin/courses/${course.id}/edit`);
                            }}
                            className="block w-full px-3.5 py-2 text-left text-xs text-white transition hover:bg-[#211A12] hover:text-[#F1D69A]"
                          >
                            Edit Course
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeleteTarget({
                                id: course.id,
                                title: course.title,
                              });
                            }}
                            className="block w-full px-3.5 py-2 text-left text-xs text-rose-300 transition hover:bg-rose-500/10"
                          >
                            Delete Course
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specs + Price */}
                  <div className="flex items-center justify-between border-t border-[#D6AD65]/15 pt-3 text-xs text-[#BDB4A7]">
                    <div className="flex items-center gap-3">
                      <span>{course.duration || "Self-paced"}</span>
                      <span>·</span>
                      <span>
                        {lessonCount}{" "}
                        {lessonCount === 1 ? "Lesson" : "Lessons"}
                      </span>
                    </div>
                    <span className="font-serif text-base font-semibold text-[#F1D69A]">
                      {formatPrice(course.price)}
                    </span>
                  </div>

                  {/* Quick Actions (fade in cleanly on hover / visible on touch) */}
                  <div className="flex items-center gap-2 pt-1 transition-opacity duration-200 sm:opacity-90 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/courses/${course.id}`)}
                      className="kbc-outline-btn flex-1 !py-2"
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/admin/courses/${course.id}/edit`)
                      }
                      className="kbc-outline-btn flex-1 !py-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <DeleteCourseModal
          courseId={deleteTarget.id}
          courseTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            const deletedTitle = deleteTarget.title;
            const deletedId = deleteTarget.id;
            setDeleteTarget(null);
            setCourses((prev) => prev.filter((c) => c.id !== deletedId));
            setDeleteMessage(`Course "${deletedTitle}" deleted successfully.`);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
