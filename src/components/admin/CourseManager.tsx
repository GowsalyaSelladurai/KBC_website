"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

// Helper for category badge based on course content
function getCategory(course: Course): { name: string; style: string } {
  const text = `${course.title} ${course.courseCode} ${course.description || ""}`.toLowerCase();
  if (text.includes("hair")) {
    return { name: "Hair Styling", style: "border-purple-500/30 bg-purple-500/10 text-purple-300" };
  }
  if (text.includes("nail")) {
    return { name: "Nail Art", style: "border-amber-500/30 bg-amber-500/10 text-amber-300" };
  }
  if (text.includes("skin") || text.includes("facial")) {
    return { name: "Skincare", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" };
  }
  if (text.includes("bridal") || text.includes("wedding")) {
    return { name: "Bridal Makeup", style: "border-rose-500/30 bg-rose-500/10 text-rose-300" };
  }
  if (text.includes("saree") || text.includes("drape") || text.includes("styling")) {
    return { name: "Styling & Draping", style: "border-blue-500/30 bg-blue-500/10 text-blue-300" };
  }
  return { name: "Makeup", style: "border-[#c9a66a]/40 bg-[#c9a66a]/10 text-[#e5be75]" };
}

function StatusBadge({ status }: { status: CourseStatus }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-2.5 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Published
      </span>
    );
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-950/70 px-2.5 py-1 text-[11px] font-medium text-amber-300 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/30 bg-zinc-900/70 px-2.5 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-md">
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCourses() {
    setLoading(true);
    setError("");

    try {
      // Use cache-busting timestamp to always guarantee live database state
      const response = await fetch(`/api/admin/courses?_t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses from database.");
      }

      const data: Course[] = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Unable to load courses. Please check your database connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  // Compute live statistics strictly from database courses
  const stats = useMemo(() => {
    const activeCourses = courses.filter((c) => c.status !== "ARCHIVED");
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    const draft = courses.filter((c) => c.status === "DRAFT").length;
    const totalLessons = activeCourses.reduce(
      (sum, c) =>
        sum + (c.modules?.reduce((mSum, m) => mSum + (m.lessons?.length || 0), 0) || 0),
      0,
    );

    return {
      total: activeCourses.length,
      published,
      draft,
      lessons: totalLessons,
    };
  }, [courses]);

  // Client-side filtering on live data
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
      result = result.filter((c) => {
        const cat = getCategory(c).name.toLowerCase();
        return cat.includes(categoryFilter.toLowerCase());
      });
    }

    return result;
  }, [courses, query, statusFilter, categoryFilter]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      {/* Dashboard Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#3d3224]/50 bg-gradient-to-r from-[#171410] via-[#12110f] to-[#1c1813] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#d8b16d]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-80 bg-gradient-to-t from-[#c9a66a]/10 to-transparent blur-2xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[.25em] text-[#c9a66a]">
              <span className="h-px w-6 bg-[#c9a66a]" />
              KBC Salon Academy
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-wide text-[#f4e5c5] sm:text-4xl">
              Courses
            </h1>
            <p className="mt-1.5 text-xs text-[#8a857b] sm:text-sm">
              Manage your academy&apos;s courses, modules, and video curriculum
            </p>
          </div>

          <Link
            href="/admin/courses/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-5 py-3 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <span>+</span>
            <span>Add Course</span>
          </Link>
        </div>
      </div>

      {/* Real Statistics Bar (computed purely from live database data) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {/* Total Courses */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#26211b] bg-[#121110] p-4 transition hover:border-[#3d3224]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8b16d]/30 bg-[#c9a66a]/10 text-base text-[#d8b16d]">
            📖
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-[#8a857b]">Total Courses</p>
            <p className="font-serif text-xl font-semibold text-[#f4e5c5]">{stats.total}</p>
          </div>
        </div>

        {/* Published */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#26211b] bg-[#121110] p-4 transition hover:border-[#3d3224]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-base text-emerald-400">
            ▶
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-[#8a857b]">Published</p>
            <p className="font-serif text-xl font-semibold text-[#f4e5c5]">{stats.published}</p>
          </div>
        </div>

        {/* Draft */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#26211b] bg-[#121110] p-4 transition hover:border-[#3d3224]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-base text-amber-400">
            📄
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-[#8a857b]">Draft</p>
            <p className="font-serif text-xl font-semibold text-[#f4e5c5]">{stats.draft}</p>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#26211b] bg-[#121110] p-4 transition hover:border-[#3d3224]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a66a]/30 bg-[#c9a66a]/10 text-base text-[#c9a66a]">
            🎬
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-[#8a857b]">Curriculum Lessons</p>
            <p className="font-serif text-xl font-semibold text-[#f4e5c5]">{stats.lessons}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#26211b] bg-[#121110] p-3.5 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#736c62]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course title, code, or description..."
            className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2.5 pl-10 pr-4 text-xs text-[#e8dfd1] outline-none placeholder:text-[#666056] transition focus:border-[#d8b16d]/60"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#d8d2c6] outline-none transition focus:border-[#d8b16d]/60"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#d8d2c6] outline-none transition focus:border-[#d8b16d]/60"
          >
            <option value="ALL">All Categories</option>
            <option value="makeup">Makeup</option>
            <option value="hair">Hair Styling</option>
            <option value="nail">Nail Art</option>
            <option value="skin">Skincare</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchCourses}
            title="Refresh from database"
            className="flex items-center gap-1.5 rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#c9a66a] transition hover:bg-[#1a1713] hover:border-[#c9a66a]/40"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse overflow-hidden rounded-2xl border border-[#26211b] bg-[#121110]"
            >
              <div className="h-48 w-full bg-[#1c1a17]" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 rounded bg-[#1c1a17]" />
                <div className="h-3 w-full rounded bg-[#181614]" />
                <div className="h-3 w-1/2 rounded bg-[#181614]" />
                <div className="h-8 rounded bg-[#181614] mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center">
          <p className="text-sm font-medium text-rose-300">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 rounded-xl border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-5 py-2.5 text-xs font-medium text-[#d8b16d] transition hover:bg-[#c9a66a]/20"
          >
            Try Again
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#3d3224]/50 bg-[#121110] p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a66a]/10 text-2xl text-[#c9a66a]">
            ✦
          </div>
          <h3 className="font-serif text-xl font-medium text-[#f4e5c5]">
            {courses.length === 0 ? "No Courses Created Yet" : "No Matching Courses Found"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-[#8a857b]">
            {courses.length === 0
              ? "Start building your academy by adding your first luxury beauty course."
              : "Try clearing your search query or switching your status/category filter."}
          </p>

          <div className="mt-6">
            {courses.length === 0 ? (
              <Link
                href="/admin/courses/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-5 py-2.5 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/20 transition hover:brightness-110"
              >
                <span>+</span>
                <span>Create Your First Course</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setQuery("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-4 py-2 text-xs text-[#d8b16d] hover:border-[#c9a66a]/40"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const cat = getCategory(course);
            const moduleCount = course.modules?.length || 0;
            const lessonCount =
              course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

            return (
              <div
                key={course.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#2e261d] bg-[#121110] transition-all duration-300 hover:border-[#c9a66a]/60 hover:shadow-[0_10px_35px_rgba(201,166,106,0.14)]"
              >
                {/* Top Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-[#0c0b0a]">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1b1712] via-[#12110f] to-[#0c0b0a]">
                      <span className="text-4xl text-[#c9a66a]/30 transition-transform duration-500 group-hover:scale-110">
                        ✦
                      </span>
                    </div>
                  )}

                  {/* Gradient Fade Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md ${cat.style}`}>
                      {cat.name}
                    </span>

                    <StatusBadge status={course.status} />
                  </div>

                  {/* Course Code Chip at Bottom-Left of Image */}
                  <div className="absolute bottom-2.5 left-3.5">
                    <span className="rounded-lg border border-[#3d3224]/80 bg-[#0c0c0b]/80 px-2 py-0.5 text-[10px] font-mono tracking-wider text-[#d8b16d] backdrop-blur-sm">
                      {course.courseCode}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div>
                    {/* Course Title */}
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="block font-serif text-lg font-medium text-[#f4e5c5] transition group-hover:text-[#f0cf91] line-clamp-1"
                    >
                      {course.title}
                    </Link>

                    {/* Course Description */}
                    <p className="mt-1.5 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-[#8a857b]">
                      {course.description || "Master professional salon and makeover techniques with KBC Academy."}
                    </p>
                  </div>

                  {/* Course Specs Row */}
                  <div className="space-y-2.5 border-t border-[#211d19] pt-3 text-xs">
                    <div className="flex items-center justify-between text-[#8a857b]">
                      <span className="flex items-center gap-1.5">
                        <span>🕐</span>
                        <span>{course.duration || "Self-paced"}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <span>📚</span>
                        <span>
                          {moduleCount} {moduleCount === 1 ? "Module" : "Modules"} · {lessonCount}{" "}
                          {lessonCount === 1 ? "Lesson" : "Lessons"}
                        </span>
                      </span>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[11px] text-[#736c62]">Course Fee</span>
                      <span className="font-serif text-lg font-semibold text-[#e2c18a]">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons Footer */}
                  <div className="flex items-center gap-2 border-t border-[#211d19] pt-3.5">
                    {/* Preview Course */}
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/courses/${course.id}`)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2 text-xs font-medium text-[#c8bda9] transition hover:border-[#c9a66a]/60 hover:bg-[#1a1713] hover:text-[#f4e5c5]"
                    >
                      <span>👁</span>
                      <span>Preview</span>
                    </button>

                    {/* Edit Course */}
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2 text-xs font-medium text-[#c8bda9] transition hover:border-[#c9a66a]/60 hover:bg-[#1a1713] hover:text-[#f4e5c5]"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>

                    {/* Add/Manage Video Lesson Button */}
                    <button
                      type="button"
                      title="Add video lesson"
                      onClick={() => router.push(`/admin/courses/${course.id}/lessons/new`)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2e2720] bg-[#0c0c0b] text-xs text-[#c9a66a] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/15"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
