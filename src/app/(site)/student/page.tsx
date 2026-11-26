
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { enrolled, getCourse, recordings } from "@/data/mock";

import Countdown from "@/components/Countdown";
import LiveList from "@/components/LiveList";
import Sidebar from "@/components/sidebar";
import StudentLearningBanner from "@/components/Student/StudentLearningBanner";

// ============================================
// EMBER DASHBOARD V32
// DEEP CHARCOAL + CHAMPAGNE YELLOW
// ============================================

type CourseRecord = NonNullable<ReturnType<typeof getCourse>>;
type CourseItem = {
  enrollment: (typeof enrolled)[number];
  course: CourseRecord;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  expired: boolean;
  completed: boolean;
};

type CourseFilter = "all" | "active" | "completed";

export default function Student() {
  const [tab, setTab] = useState("dashboard");
  const [courseFilter, setCourseFilter] = useState<CourseFilter>("all");

  // ==========================================
  // COURSE DATA
  // ==========================================

  const courses = useMemo(() => {
    return enrolled
      .map((item) => {
        const course = getCourse(item.courseId);

        if (!course) return null;

        const totalLessons = course.videos.length;
        const completedLessons = Math.min(item.done, totalLessons);

        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const expired = item.msLeft <= 0;

        return {
          enrollment: item,
          course,
          totalLessons,
          completedLessons,
          progress,
          expired,
          completed:
            !expired &&
            totalLessons > 0 &&
            completedLessons >= totalLessons,
        };
      })
      .filter((item): item is CourseItem => item !== null);
  }, []);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const totalCourses = courses.length;

  const activeCourses = courses.filter(
    (item) => !item.expired
  ).length;

  const completedLessons = courses.reduce(
    (total, item) => total + item.completedLessons,
    0
  );

  const totalLessons = courses.reduce(
    (total, item) => total + item.totalLessons,
    0
  );

  const remainingLessons = Math.max(
    0,
    totalLessons - completedLessons
  );

  const overallProgress =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round((completedLessons / totalLessons) * 100)
        )
      : 0;

  const completedCourses = courses.filter(
    (item) => item.completed
  ).length;

  const filteredCourses = courses.filter((item) => {
    if (courseFilter === "active") {
      return !item.expired && !item.completed;
    }

    if (courseFilter === "completed") {
      return item.completed;
    }

    return true;
  });

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigation = [
    { id: "dashboard", label: "Overview", icon: "⌂" },
    { id: "courses", label: "My Courses", icon: "▤" },
    { id: "live", label: "Live Classes", icon: "◉" },
    { id: "rec", label: "Recordings", icon: "▷" },
  ];

  return (
    <main className="flex min-h-screen bg-[#FAF5ED] text-[#2A2118]">
      <style jsx global>{`
        @keyframes courseSlideIn {
          from { opacity: 0; transform: translateX(28px) translateY(8px); }
          to { opacity: 1; transform: translateX(0) translateY(0); }
        }
      `}</style>

      {/* SIDEBAR */}

      <Sidebar
        activeItem={tab}
        onNavigate={setTab}
      />

      {/* MAIN CONTENT */}

      <section className="relative min-w-0 flex-1 overflow-hidden px-5 py-7 sm:px-8 lg:px-10">

        {/* BACKGROUND AMBIENT LIGHT */}

        <div className="pointer-events-none fixed right-0 top-0 -z-0 h-96 w-96 rounded-full bg-[#E8D8C5]/60 blur-[150px]" />

        <div className="pointer-events-none fixed bottom-0 left-1/3 -z-0 h-80 w-80 rounded-full bg-[#EFE8A8]/40 blur-[130px]" />

        <div className="relative z-10 mx-auto max-w-[1500px]">

          {/* HEADER */}

          <header className="mb-9 flex flex-wrap items-center justify-between gap-5">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#C9A45C] shadow-[0_0_12px_#C9A45C]" />

                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A45C]/70">
                  Student Learning Portal
                </p>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[#C9A45C] to-white bg-clip-text text-transparent">
                  Anjali
                </span>
                <span className="ml-2">✦</span>
              </h1>

              <p className="mt-2 text-sm text-[#806F5C]">
                Track your progress. Stay focused. Keep learning.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                aria-label="Notifications"
                className="group relative grid h-12 w-12 place-items-center rounded-2xl border border-[#E8D8C5] bg-white/85 text-lg text-[#6F5D49] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#C9A45C]/40 hover:bg-[#C9A45C]/10 hover:text-[#C9A45C]"
              >
                ♧

                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#C9A45C] shadow-[0_0_10px_#C9A45C]" />
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-[#E8D8C5] bg-white/85 p-2 pr-4 backdrop-blur-xl transition duration-300 hover:border-[#C9A45C]/30">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#C9A45C] to-[#C9A45C] font-bold text-[#FAF5ED]">
                  A
                </div>

                <div>
                  <p className="text-xs font-semibold">Anjali</p>
                  <p className="mt-1 text-[10px] text-[#806F5C]">
                    Student Account
                  </p>
                </div>

              </div>

            </div>

          </header>

          {/* NAVIGATION */}

          <div className="mb-8 flex flex-wrap gap-2">

            {navigation.map((item) => (

              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                  tab === item.id
                    ? "border-[#C9A45C]/40 bg-[#C9A45C] text-[#FAF5ED] shadow-[0_5px_25px_rgba(239,232,168,0.15)]"
                    : "border-[#E8D8C5] bg-white/75 text-[#756451] hover:border-[#C9A45C]/30 hover:bg-[#C9A45C]/[0.06] hover:text-[#C9A45C]"
                }`}
              >

                <span className="text-base">
                  {item.icon}
                </span>

                {item.label}

              </button>

            ))}

          </div>

          {/* ======================================
              DASHBOARD OVERVIEW
          ====================================== */}

          {tab === "dashboard" && (

            <div className="space-y-8">

              {/* NEW BEAUTY ACADEMY BANNER */}

              <StudentLearningBanner
                progress={overallProgress}
                onExploreCourses={() => setTab("courses")}
              />

              {/* ======================================
                  KPI STATISTICS
              ====================================== */}

              <div>

                <SectionHeading
                  eyebrow="PERFORMANCE OVERVIEW"
                  title="Your Learning Statistics"
                  description="Your current learning performance at a glance."
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <StatCard
                    icon="▤"
                    label="Total Courses"
                    value={totalCourses}
                    subtitle="Courses enrolled"
                    number="01"
                  />

                  <StatCard
                    icon="◉"
                    label="Active Courses"
                    value={activeCourses}
                    subtitle="Available to continue"
                    number="02"
                  />

                  <StatCard
                    icon="✓"
                    label="Lessons Completed"
                    value={completedLessons}
                    subtitle="Lessons finished"
                    number="03"
                  />

                  <StatCard
                    icon="◈"
                    label="Recordings"
                    value={recordings.length}
                    subtitle="Available recordings"
                    number="04"
                  />

                </div>

              </div>

              {/* ======================================
                  ANALYTICS GRID
              ====================================== */}

              <div className="grid gap-5 xl:grid-cols-3">

                {/* COURSE COMPLETION CHART */}

                <div className="rounded-[26px] border border-[#E8D8C5] bg-white/85 p-6 shadow-xl backdrop-blur-2xl transition duration-300 hover:border-[#C9A45C]/30 xl:col-span-2">

                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>
                      <p className="text-[10px] font-semibold tracking-[2px] text-[#C9A45C]/70">
                        LEARNING ANALYTICS
                      </p>

                      <h3 className="mt-2 text-lg font-semibold">
                        Course Completion
                      </h3>
                    </div>

                    <span className="rounded-lg border border-[#C9A45C]/20 bg-[#C9A45C]/10 px-3 py-1.5 text-[10px] text-[#C9A45C]">
                      Overall Performance
                    </span>

                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-8">

                    {/* DONUT CHART */}

                    <div
                      className="grid h-44 w-44 shrink-0 place-items-center rounded-full transition-transform duration-500 hover:scale-105"
                      style={{
                        background: `conic-gradient(#C9A45C ${overallProgress}%, #E8D8C5 ${overallProgress}% 100%)`,
                      }}
                    >

                      <div className="grid h-36 w-36 place-items-center rounded-full bg-[#FFFFFF]">

                        <div className="text-center">

                          <p className="text-3xl font-bold text-[#C9A45C]">
                            {overallProgress}%
                          </p>

                          <p className="mt-1 text-[9px] uppercase tracking-widest text-[#806F5C]">
                            Completed
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* CHART LEGEND */}

                    <div className="min-w-[170px] flex-1 space-y-6">

                      <Legend
                        color="#C9A45C"
                        label="Completed lessons"
                        value={completedLessons}
                      />

                      <Legend
                        color="#77716A"
                        label="Remaining lessons"
                        value={remainingLessons}
                      />

                      <Legend
                        color="#FFFFFF"
                        label="Total lessons"
                        value={totalLessons}
                      />

                    </div>

                  </div>

                  <div className="mt-8 border-t border-[#E8D8C5] pt-5">

                    <div className="flex justify-between text-xs">

                      <span className="text-[#806F5C]">
                        Overall completion
                      </span>

                      <span className="font-semibold text-[#C9A45C]">
                        {completedLessons} / {totalLessons}
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8D8C5]">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#C9A45C] transition-all duration-1000"
                        style={{
                          width: `${overallProgress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

                {/* ACHIEVEMENT PANEL */}

                <div className="group relative overflow-hidden rounded-[26px] border border-[#C9A45C]/20 bg-gradient-to-br from-[#C9A45C]/10 to-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C9A45C]/40">

                  <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#C9A45C]/10 blur-[70px] transition duration-500 group-hover:bg-[#C9A45C]/20" />

                  <div className="relative">

                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#C9A45C]/20 bg-[#C9A45C]/10 text-2xl text-[#C9A45C]">
                      ✦
                    </div>

                    <p className="mt-7 text-[10px] font-semibold tracking-[2px] text-[#C9A45C]">
                      ACHIEVEMENTS
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold">
                      Great progress!
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#806F5C]">
                      Your learning journey is moving forward.
                      Keep completing lessons and courses.
                    </p>

                    <div className="mt-8 border-t border-[#E8D8C5] pt-5">

                      <p className="text-4xl font-bold text-[#C9A45C]">
                        {completedCourses}
                      </p>

                      <p className="mt-2 text-xs text-[#806F5C]">
                        Courses completed
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ======================================
                  COURSE PERFORMANCE CHART
              ====================================== */}

              <div className="rounded-[26px] border border-[#E8D8C5] bg-white/85 p-6 backdrop-blur-2xl">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <p className="text-[10px] font-semibold tracking-[2px] text-[#C9A45C]/70">
                      COURSE PERFORMANCE
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      Progress by Course
                    </h3>
                  </div>

                  <button
                    onClick={() => setTab("courses")}
                    className="rounded-xl border border-[#C9A45C]/20 px-4 py-2 text-xs font-semibold text-[#C9A45C] transition hover:bg-[#C9A45C] hover:text-[#FAF5ED]"
                  >
                    View All →
                  </button>

                </div>

                <div className="mt-7 space-y-6">

                  {courses.length === 0 && (
                    <p className="text-sm text-[#806F5C]">
                      No enrolled courses available.
                    </p>
                  )}

                  {courses.slice(0, 5).map((item) => (

                    <div key={item.course.id} className="group">

                      <div className="mb-3 flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#C9A45C]/10 text-lg text-[#C9A45C]">
                            {item.course.icon}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.course.name}
                            </p>

                            <p className="mt-1 text-[10px] text-[#927F69]">
                              {item.completedLessons} / {item.totalLessons} lessons
                            </p>
                          </div>

                        </div>

                        <span className="shrink-0 text-sm font-bold text-[#C9A45C]">
                          {item.progress}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#EFE8A8]/45">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#C9A45C] transition-all duration-1000 group-hover:brightness-125"
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* ======================================
                  COURSE MANAGEMENT
              ====================================== */}

              <div>

                <SectionHeading
                  eyebrow="YOUR LEARNING SPACE"
                  title="My Courses"
                  description="Manage your enrolled courses and continue learning."
                />

                <div className="mt-5 flex flex-wrap gap-2">

                  {(
                    [
                      { id: "all", label: "All Courses" },
                      { id: "active", label: "In Progress" },
                      { id: "completed", label: "Completed" },
                    ] as const
                  ).map((filter) => (

                    <button
                      key={filter.id}
                      onClick={() => setCourseFilter(filter.id)}
                      className={`rounded-xl border px-4 py-2 text-xs font-medium transition duration-300 ${
                        courseFilter === filter.id
                          ? "border-[#C9A45C]/40 bg-[#C9A45C] text-[#FAF5ED]"
                          : "border-[#E8D8C5] bg-white/75 text-[#756451] hover:border-[#C9A45C]/30 hover:text-[#C9A45C]"
                      }`}
                    >
                      {filter.label}
                    </button>

                  ))}

                </div>

                <div className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 pr-2 scroll-smooth">

                  {filteredCourses.map((item) => (

                    <CourseCard
                      key={item.course.id}
                      item={item}
                    />

                  ))}

                  {filteredCourses.length === 0 && (

                    <div className="rounded-2xl border border-[#E8D8C5] bg-white/75 p-8 text-center text-sm text-[#806F5C] lg:col-span-2">
                      No courses found in this category.
                    </div>

                  )}

                </div>

              </div>

              {/* ======================================
                  LIVE CLASSES
              ====================================== */}

              <div className="rounded-[26px] border border-[#E8D8C5] bg-white/80 p-6 backdrop-blur-xl">

                <SectionHeading
                  eyebrow="LIVE LEARNING"
                  title="Live Classes"
                  description="Stay connected with your learning sessions."
                />

                <div className="mt-5">
                  <LiveList />
                </div>

              </div>

              {/* ======================================
                  RECENT RECORDINGS
              ====================================== */}

              <div>

                <SectionHeading
                  eyebrow="YOUR VIDEO LIBRARY"
                  title="Recent Recordings"
                  description="Revisit your previous learning sessions."
                />

                <div className="mt-5 space-y-3">

                  {recordings.slice(0, 4).map((recording) => (

                    <RecordingCard
                      key={recording.id}
                      recording={recording}
                    />

                  ))}

                  {recordings.length === 0 && (

                    <div className="rounded-2xl border border-[#E8D8C5] p-7 text-center text-sm text-[#806F5C]">
                      No recordings available.
                    </div>

                  )}

                </div>

              </div>

            </div>

          )}

          {/* ======================================
              COURSES PAGE
          ====================================== */}

          {tab === "courses" && (

            <div>

              <SectionHeading
                eyebrow="YOUR LEARNING"
                title="My Courses"
                description="All your enrolled courses in one place."
              />

              <div className="mt-6 flex flex-wrap gap-2">

                {(
                  [
                    { id: "all", label: "All Courses" },
                    { id: "active", label: "In Progress" },
                    { id: "completed", label: "Completed" },
                  ] as const
                ).map((filter) => (

                  <button
                    key={filter.id}
                    onClick={() => setCourseFilter(filter.id)}
                    className={`rounded-xl border px-4 py-2 text-xs transition ${
                      courseFilter === filter.id
                        ? "border-[#C9A45C]/40 bg-[#C9A45C] text-[#FAF5ED]"
                        : "border-[#E8D8C5] text-[#756451] hover:text-[#C9A45C]"
                    }`}
                  >
                    {filter.label}
                  </button>

                ))}

              </div>

              <div className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 pr-2 scroll-smooth">

                {filteredCourses.map((item) => (

                  <CourseCard
                    key={item.course.id}
                    item={item}
                  />

                ))}

                {filteredCourses.length === 0 && (

                  <p className="text-sm text-[#806F5C]">
                    No courses found.
                  </p>

                )}

              </div>

            </div>

          )}

          {/* ======================================
              LIVE CLASSES PAGE
          ====================================== */}

          {tab === "live" && (

            <div>

              <SectionHeading
                eyebrow="LIVE LEARNING"
                title="Live Classes"
                description="Join your learning sessions."
              />

              <div className="mt-6 rounded-[26px] border border-[#E8D8C5] bg-white/85 p-6 backdrop-blur-xl">
                <LiveList />
              </div>

            </div>

          )}

          {/* ======================================
              RECORDINGS PAGE
          ====================================== */}

          {tab === "rec" && (

            <div>

              <SectionHeading
                eyebrow="YOUR LIBRARY"
                title="Recordings"
                description="Revisit your previous learning sessions."
              />

              <div className="mt-6 space-y-3">

                {recordings.map((recording) => (

                  <RecordingCard
                    key={recording.id}
                    recording={recording}
                  />

                ))}

                {recordings.length === 0 && (

                  <p className="rounded-2xl border border-[#E8D8C5] p-8 text-center text-sm text-[#806F5C]">
                    No recordings available.
                  </p>

                )}

              </div>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

// ============================================
// SECTION HEADING COMPONENT
// ============================================

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-semibold tracking-[2px] text-[#C9A45C]/60">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-1 text-xs text-[#806F5C]">
        {description}
      </p>

    </div>
  );
}

// ============================================
// STATISTICS CARD
// ============================================

function StatCard({
  icon,
  label,
  value,
  subtitle,
  number,
}: {
  icon: string;
  label: string;
  value: number;
  subtitle: string;
  number: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-[#E8D8C5] bg-white/90 p-5 shadow-lg backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A45C]/30 hover:bg-[#EFE8A8]/45 hover:shadow-[0_15px_40px_rgba(239,232,168,0.07)]">

      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#C9A45C]/[0.05] blur-[40px] transition duration-500 group-hover:bg-[#C9A45C]/15" />

      <div className="relative flex items-center justify-between">

        <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#C9A45C]/15 bg-[#C9A45C]/[0.07] text-xl text-[#C9A45C] transition duration-300 group-hover:scale-110">
          {icon}
        </div>

        <span className="text-[10px] font-semibold tracking-widest text-[#B7A58F]">
          {number}
        </span>

      </div>

      <div className="relative mt-6">

        <p className="text-3xl font-bold tracking-tight">
          {value}
        </p>

        <h3 className="mt-1 text-sm font-medium text-[#46382A]">
          {label}
        </h3>

        <p className="mt-2 text-[10px] text-[#927F69]">
          {subtitle}
        </p>

      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C9A45C] transition-all duration-500 group-hover:w-full" />

    </div>
  );
}

// ============================================
// CHART LEGEND
// ============================================

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-3">

        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />

        <span className="text-xs text-[#756451]">
          {label}
        </span>

      </div>

      <span className="text-sm font-semibold text-[#2A2118]">
        {value}
      </span>

    </div>
  );
}

// ============================================
// COURSE CARD
// ============================================


// ============================================
// COURSE CARD
// ============================================

function CourseCard({
  item,
}: {
  item: CourseItem;
}) {
  const {
    enrollment,
    course,
    totalLessons,
    completedLessons,
    progress,
    expired,
    completed,
  } = item;

  const courseName = course.name.toLowerCase();

  // COURSE IMAGES
  const courseImage = courseName.includes("makeup")
    ? "/courses/makeup.jpg"
    : courseName.includes("hair")
    ? "/courses/hair-styling.jpg"
    : courseName.includes("nail")
    ? "/courses/nail-art.jpg"
    : courseName.includes("eyebrow") || courseName.includes("eyelash")
    ? "/courses/eyebrow-eyelash.jpg"
    : courseName.includes("skin")
    ? "/courses/skincare.jpg"
    : "/beauty-banner.png";

  // COURSE DESCRIPTIONS
  const description = courseName.includes("makeup")
    ? "Master professional makeup, bridal looks, HD makeup and advanced beauty techniques."
    : courseName.includes("hair")
    ? "Discover beautiful hairstyles, blow-drying, curls and professional hair styling."
    : courseName.includes("nail")
    ? "Explore creative nail art, nail care, gel designs and professional nail techniques."
    : courseName.includes("eyebrow") || courseName.includes("eyelash")
    ? "Learn eyebrow mapping, shaping, threading, lash lifting and eyelash styling techniques."
    : courseName.includes("skin")
    ? "Learn skincare routines, facial treatments and essential professional beauty care."
    : courseName.includes("saree")
    ? "Master elegant saree draping, pleating and professional styling techniques."
    : "Build your beauty skills with expert-led lessons and practical training.";

  return (
    <article className="group w-[290px] min-w-[290px] snap-start overflow-hidden rounded-[24px] border border-[#C9A45C]/15 bg-white/90 shadow-[0_14px_38px_rgba(73,54,31,0.08)] backdrop-blur-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C9A45C]/45 hover:shadow-[0_24px_52px_rgba(126,91,43,0.17)] sm:w-[320px] sm:min-w-[320px] animate-[courseSlideIn_650ms_ease-out_both]">

      {/* COURSE IMAGE */}

     <div className="relative aspect-[16/9] overflow-hidden bg-[#FFFFFF]">

        <img
          src={courseImage}
          alt={course.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/25 via-transparent to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#2A2118]/70 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#F5F0E8] backdrop-blur-xl">
          {completed
            ? "COMPLETED"
            : expired
            ? "EXPIRED"
            : "YOUR LEARNING"}
        </span>

        <span className="absolute bottom-4 right-4 rounded-full bg-[#FFFFFF]/75 px-3 py-1.5 text-xs font-semibold text-[#C9A45C] backdrop-blur-xl">
          {progress}% Complete
        </span>

      </div>

      {/* COURSE CONTENT */}

      <div className="relative space-y-4 bg-white/70 p-5">

        <div>

          <div className="mb-2 flex items-center justify-between gap-2">

            <span className="text-[9px] font-semibold uppercase tracking-[2px] text-[#C9A45C]">
              PROFESSIONAL COURSE
            </span>

            <span className="text-[10px] text-[#806F5C]">
              {totalLessons} Lessons
            </span>

          </div>

          <h3 className="text-lg font-semibold leading-snug text-[#2A2118] transition-colors group-hover:text-[#A87932]">
            {course.name}
          </h3>

          <p className="mt-2 min-h-[60px] text-xs leading-5 text-[#756451]">
            {description}
          </p>

        </div>

        {/* LESSON PROGRESS */}

        <div>

          <div className="mb-2 flex justify-between text-[11px]">

            <span className="text-[#756451]">
              Learning progress
            </span>

            <span className="font-semibold text-[#C9A45C]">
              {completedLessons}/{totalLessons} lessons
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#EFE8A8]/45">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#C9A45C] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

        {/* COURSE ACCESS */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8D8C5] pt-4">

          <div className="text-[10px] text-[#806F5C]">

            {expired ? (
              "Access expired"
            ) : completed ? (
              "All lessons completed"
            ) : (
              <Countdown ms={enrollment.msLeft} />
            )}

          </div>

          <Link
            href={
              expired
                ? `/courses/${course.id}`
                : `/watch/${course.id}?done=${enrollment.done}`
            }
            className="group/button inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9A45C]/30 bg-gradient-to-r from-[#C9A45C] to-[#C9A45C] px-5 py-2.5 text-[11px] font-bold text-[#171717] shadow-[0_5px_18px_rgba(184,153,112,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_8px_25px_rgba(184,153,112,0.28)]"
          >

            {expired ? "Re-enroll" : "Explore Course"}

            <span className="transition-transform duration-300 group-hover/button:translate-x-1">
              ↗
            </span>

          </Link>

        </div>

      </div>

    </article>
  );
}

// ============================================
// PREMIUM RECORDING CARD
// ============================================

function RecordingCard({
  recording,
}: {
  recording: (typeof recordings)[number];
}) {
  const originalTitle = recording.title;
  const normalizedTitle = originalTitle.toLowerCase();

  // Friendly display names for the two featured learning sessions.
  // Other recording titles continue to come directly from your data file.
  const displayTitle = normalizedTitle.includes("bridal") && normalizedTitle.includes("makeup")
    ? "Bridal Makeup Masterclass"
    : normalizedTitle.includes("hair") && (
        normalizedTitle.includes("q&a") ||
        normalizedTitle.includes("question") ||
        normalizedTitle.includes("doubt")
      )
    ? "Hair Styling Q&A"
    : originalTitle;

  const isBridal = displayTitle === "Bridal Makeup Masterclass";
  const isHair = displayTitle === "Hair Styling Q&A";

  return (
    <article className="group relative flex items-center gap-4 overflow-hidden rounded-[22px] border border-[#E8D8C5] bg-white/90 p-4 shadow-[0_10px_30px_rgba(73,54,31,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A45C]/45 hover:shadow-[0_18px_42px_rgba(126,91,43,0.13)] sm:gap-5 sm:p-5">

      {/* Decorative premium session tile — no external image required */}
      <div className={`relative grid h-[68px] w-[68px] shrink-0 place-items-center overflow-hidden rounded-2xl border ${
        isBridal
          ? "border-[#C9A45C]/35 bg-gradient-to-br from-[#EFE8A8] via-[#F8F0D7] to-[#E8D8C5]"
          : isHair
          ? "border-[#C9A45C]/30 bg-gradient-to-br from-[#E8D8C5] via-[#FAF5ED] to-[#EFE8A8]"
          : "border-[#C9A45C]/25 bg-gradient-to-br from-[#FAF5ED] to-[#EFE8A8]/70"
      }`}>
        <div className="absolute inset-1 rounded-[13px] border border-white/70" />
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="relative h-7 w-7 text-[#9B7135] transition-transform duration-300 group-hover:scale-110"
          fill="none"
        >
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.35" />
          <path d="M10 8.7L15.2 12L10 15.3V8.7Z" fill="currentColor" />
          <path d="M7.2 4.9L8.4 3.7M16.8 4.9L15.6 3.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>

      <div className="min-w-0 flex-1 py-1">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-[#A87932]">
          {isBridal ? "Bridal Makeup Session" : isHair ? "Expert Hair Session" : "Recorded Learning"}
        </p>
        <h4 className={`truncate text-sm font-semibold tracking-tight transition-colors duration-300 sm:text-[15px] ${
          isBridal
            ? "text-[#9A6A22] group-hover:text-[#704713]"
            : isHair
            ? "text-[#80603B] group-hover:text-[#5C4027]"
            : "text-[#2A2118] group-hover:text-[#A87932]"
        }`}>
          {displayTitle}
        </h4>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#806F5C]">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
            <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10 5.8V10L12.8 11.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {recording.when}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#C9A45C]/35 bg-[#FAF5ED] px-3.5 py-2.5 text-[11px] font-bold text-[#8D672F] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C9A45C] hover:bg-[#C9A45C] hover:text-white sm:px-4"
      >
        <span>Watch</span>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
          <path d="M5.5 3.5L10.5 8L5.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-gradient-to-r from-[#C9A45C] via-[#EFE8A8] to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </article>
  );
}
