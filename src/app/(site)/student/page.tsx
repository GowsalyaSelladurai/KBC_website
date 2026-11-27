"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { enrolled, getCourse, recordings } from "@/data/mock";

import Countdown from "@/components/Countdown";
import LiveList from "@/components/LiveList";
import Sidebar from "@/components/sidebar";
import StudentLearningBanner from "@/components/Student/StudentLearningBanner";
import ButterflyCursor from "@/components/ButterflyCursor";

// ============================================
// KAVYAS BEAUTY CENTRE
// ROYAL GOLD LUXURY STUDENT DASHBOARD
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

const goldText = "text-[#98702E]";
const mutedText = "text-[#786B58]";
const panel =
  "rounded-[28px] border border-[#D8C49C]/70 bg-gradient-to-br from-[#FFFDF8] via-[#FBF5E9] to-[#F2E5CF] shadow-[0_14px_40px_rgba(112,79,35,0.09)]";

const goldButton =
  "rounded-xl border border-[#B58A49] bg-gradient-to-r from-[#A87932] via-[#D5B66F] to-[#B58A49] px-4 py-2.5 text-xs font-bold text-white shadow-[0_7px_18px_rgba(168,121,50,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_25px_rgba(168,121,50,0.28)]";

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
    (item) => !item.expired && !item.completed && item.completedLessons > 0
  ).length;

  const pendingCourses = courses.filter(
    (item) => !item.completed && item.completedLessons === 0
  ).length;

  const completedLessons = courses.reduce(
    (total, item) => total + item.completedLessons,
    0
  );

  const totalLessons = courses.reduce(
    (total, item) => total + item.totalLessons,
    0
  );

  const remainingLessons = Math.max(0, totalLessons - completedLessons);

  const overallProgress =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
      : 0;

  const completedCourses = courses.filter((item) => item.completed).length;

  const courseCompletionRate =
    totalCourses > 0
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0;

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
    <main className="student-dashboard-cursor relative flex min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_10%_5%,rgba(239,232,168,0.55),transparent_32%),radial-gradient(ellipse_at_90%_80%,rgba(201,164,92,0.22),transparent_35%),linear-gradient(135deg,#FFFCF5_0%,#F8EFDF_48%,#EADBC4_100%)] text-[#33291D]">

      <ButterflyCursor />

      <style jsx global>{`
        @keyframes courseSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes goldShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes softFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .student-dashboard-cursor {
          isolation: isolate;
        }

        .student-dashboard-cursor ::selection {
          background: rgba(201, 164, 92, 0.3);
          color: #33291D;
        }

        .student-dashboard-cursor button,
        .student-dashboard-cursor a {
          -webkit-tap-highlight-color: transparent;
        }

        .student-dashboard-cursor button:focus-visible,
        .student-dashboard-cursor a:focus-visible {
          outline: 2px solid #B58A49;
          outline-offset: 3px;
        }

        .student-dashboard-cursor ::-webkit-scrollbar {
          width: 8px;
          height: 7px;
        }

        .student-dashboard-cursor ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #D8BD83, #A87932);
          border-radius: 99px;
        }

        .student-dashboard-cursor ::-webkit-scrollbar-track {
          background: rgba(232, 216, 197, 0.4);
          border-radius: 99px;
        }
      `}</style>

      {/* SIDEBAR - PRESERVED */}

      <Sidebar activeItem={tab} onNavigate={setTab} />

      {/* MAIN DASHBOARD CONTENT */}

      <section className="relative min-w-0 flex-1 overflow-hidden px-5 py-7 sm:px-8 lg:px-10 xl:px-12">

        {/* AMBIENT GOLD BACKGROUND EFFECTS */}

        <div className="pointer-events-none fixed right-[-5rem] top-[-5rem] -z-0 h-[30rem] w-[30rem] rounded-full bg-[#D9BD83]/25 blur-[110px]" />

        <div className="pointer-events-none fixed bottom-[-4rem] left-[28%] -z-0 h-[26rem] w-[26rem] rounded-full bg-[#E8D8C5]/65 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-[1540px]">

          {/* WELCOME HEADER */}

          <header className="relative mb-10 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[30px] border border-[#D4B77E]/70 bg-[linear-gradient(120deg,#FFFDF8_0%,#F8EEDB_52%,#EBD8B5_100%)] px-5 py-6 shadow-[0_18px_48px_rgba(112,79,35,0.12)] sm:px-7">

            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#D7B56F]/20 blur-[70px]" />

            <div className="relative">

              <div className="mb-3 flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#A87932] shadow-[0_0_12px_#C9A45C]" />

                <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#98702E]">
                  Student Learning Portal
                </p>

              </div>

              <h1 className="text-[2rem] font-semibold tracking-[-0.045em] text-[#33291D] sm:text-[2.65rem]">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[#A87932] via-[#D0A94F] to-[#98702E] bg-clip-text text-transparent">
                  Anjali
                </span>
                <span className="ml-2 text-[#B58A49]">✦</span>
              </h1>

              <p className="mt-2 text-[13px] tracking-wide text-[#786B58]">
                Track your progress. Stay focused. Keep learning.
              </p>

            </div>

            <div className="relative flex items-center gap-3">

              <button
                aria-label="Notifications"
                className="group relative grid h-12 w-12 place-items-center rounded-2xl border border-[#D4B77E] bg-white/70 text-lg text-[#98702E] shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#A87932] hover:bg-[#F7EACB]"
              >
                ♧
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#B58A49] shadow-[0_0_10px_#C9A45C]" />
              </button>

              <div className="flex items-center gap-3 rounded-[18px] border border-[#D4B77E]/80 bg-white/70 p-2 pr-5 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#A87932]">

                <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-br from-[#E8D39B] via-[#C9A45C] to-[#A87932] font-serif text-lg font-bold text-white shadow-[0_5px_14px_rgba(168,121,50,0.28)]">
                  A
                </div>

                <div>
                  <p className="text-xs font-bold text-[#33291D]">Anjali</p>
                  <p className="mt-1 text-[10px] text-[#786B58]">
                    Student Account
                  </p>
                </div>

              </div>

            </div>

          </header>

          {/* DASHBOARD NAVIGATION */}

          <div className="mb-9 flex flex-wrap gap-2.5">

            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                  tab === item.id
                    ? "border-[#A87932] bg-gradient-to-r from-[#A87932] via-[#D0AE67] to-[#B58A49] text-white shadow-[0_8px_22px_rgba(168,121,50,0.24)]"
                    : "border-[#D8C49C] bg-white/75 text-[#786B58] shadow-sm hover:border-[#B58A49] hover:bg-[#FBF1DF] hover:text-[#98702E]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}

          </div>

          {/* ======================================
              DASHBOARD OVERVIEW
          ====================================== */}

          {tab === "dashboard" && (

            <div className="space-y-9">

              {/* LEARNING BANNER */}

              <StudentLearningBanner
                progress={overallProgress}
                onExploreCourses={() => setTab("courses")}
              />

              {/* STATISTICS */}

              <div>

                <SectionHeading
                  eyebrow="PERFORMANCE OVERVIEW"
                  title="Your Learning Statistics"
                  description="Your current learning performance at a glance."
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">

                  <StatCard icon="▤" label="Total Courses" value={totalCourses} subtitle="Enrolled courses" number="01" />
                  <StatCard icon="◉" label="Course Completion" value={`${courseCompletionRate}%`} subtitle={`${completedCourses} of ${totalCourses} completed`} number="02" />
                  <StatCard icon="↗" label="Active Courses" value={activeCourses} subtitle="Currently in progress" number="03" />
                  <StatCard icon="◷" label="Pending Courses" value={pendingCourses} subtitle="Not started yet" number="04" />
                  <StatCard icon="✧" label="Practical Hours" value="—" subtitle="Hours tracking not connected" number="05" />
                  <StatCard icon="▷" label="Recordings" value={recordings.length} subtitle="Available sessions" number="06" />

                </div>

              </div>

              {/* LEARNING ANALYTICS */}

              <div className="grid gap-5 xl:grid-cols-3">

                {/* COMPLETION CHART */}

                <div className={`${panel} p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(112,79,35,0.16)] xl:col-span-2`}>

                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>
                      <p className="text-[10px] font-bold tracking-[2px] text-[#98702E]">
                        LEARNING ANALYTICS
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-[#33291D]">
                        Course Completion
                      </h3>
                    </div>

                    <span className="rounded-lg border border-[#D4B77E] bg-[#F7EACB] px-3 py-1.5 text-[10px] font-semibold text-[#98702E]">
                      Overall Performance
                    </span>

                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-8">

                    <div
                      className="grid h-44 w-44 shrink-0 place-items-center rounded-full shadow-[0_10px_28px_rgba(168,121,50,0.16)] transition-transform duration-500 hover:scale-105"
                      style={{
                        background: `conic-gradient(#B58A49 ${overallProgress}%, #E8DCC6 ${overallProgress}% 100%)`,
                      }}
                    >

                      <div className="grid h-36 w-36 place-items-center rounded-full border-[5px] border-[#F4E8D2] bg-gradient-to-br from-[#FFFDF8] to-[#F4E8D2] shadow-inner">

                        <div className="text-center">

                          <p className="text-3xl font-bold text-[#98702E]">
                            {overallProgress}%
                          </p>

                          <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-[#786B58]">
                            Completed
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="min-w-[170px] flex-1 space-y-6">

                      <Legend color="#B58A49" label="Completed lessons" value={completedLessons} />
                      <Legend color="#D8C49C" label="Remaining lessons" value={remainingLessons} />
                      <Legend color="#98702E" label="Total lessons" value={totalLessons} />

                    </div>

                  </div>

                  <div className="mt-8 border-t border-[#E2D3B8] pt-5">

                    <div className="flex justify-between text-xs">

                      <span className={mutedText}>
                        Overall completion
                      </span>

                      <span className="font-bold text-[#98702E]">
                        {completedLessons} / {totalLessons}
                      </span>

                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E8DCC6]">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#98702E] via-[#D9BD83] to-[#B58A49] transition-all duration-1000"
                        style={{ width: `${overallProgress}%` }}
                      />

                    </div>

                  </div>

                </div>

                {/* ACHIEVEMENTS */}

                <div className="group relative overflow-hidden rounded-[28px] border border-[#D4B77E] bg-[radial-gradient(circle_at_90%_5%,rgba(201,164,92,0.28),transparent_40%),linear-gradient(145deg,#FFFDF8,#F1E2C8)] p-7 shadow-[0_16px_42px_rgba(112,79,35,0.12)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(168,121,50,0.18)]">

                  <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#D7B56F]/25 blur-[70px] transition duration-500 group-hover:bg-[#C9A45C]/40" />

                  <div className="relative">

                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#D4B77E] bg-white/70 text-2xl text-[#A87932] shadow-sm">
                      ✦
                    </div>

                    <p className="mt-7 text-[10px] font-bold tracking-[2px] text-[#98702E]">
                      ACHIEVEMENTS
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-[#33291D]">
                      Great progress!
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#786B58]">
                      Your learning journey is moving forward. Keep completing lessons and courses.
                    </p>

                    <div className="mt-8 border-t border-[#DCC9A7] pt-5">

                      <p className="text-4xl font-bold text-[#98702E]">
                        {completedCourses}
                      </p>

                      <p className="mt-2 text-xs text-[#786B58]">
                        Courses completed
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* PERFORMANCE AND CALENDAR */}

              <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">

                <section className={`${panel} p-7`}>

                  <div className="flex flex-wrap items-start justify-between gap-4">

                    <div>
                      <p className="text-[9px] font-bold tracking-[0.24em] text-[#98702E]">
                        PERFORMANCE REPORT
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-[#33291D]">
                        Overall Performance
                      </h3>

                      <p className="mt-1 text-xs text-[#786B58]">
                        A clear view of your learning progress
                      </p>
                    </div>

                    <span className="rounded-full border border-[#D4B77E] bg-[#F7EACB] px-3 py-1.5 text-[10px] font-bold text-[#98702E]">
                      LIVE SUMMARY
                    </span>

                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-4">

                    <div className="rounded-2xl border border-[#E0D0B2] bg-white/75 p-4 shadow-sm">
                      <p className="text-[10px] text-[#786B58]">Lessons completed</p>
                      <p className="mt-2 text-2xl font-bold text-[#33291D]">
                        {completedLessons}
                        <span className="ml-1 text-xs font-normal text-[#98702E]">/ {totalLessons}</span>
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E0D0B2] bg-white/75 p-4 shadow-sm">
                      <p className="text-[10px] text-[#786B58]">Courses completed</p>
                      <p className="mt-2 text-2xl font-bold text-[#98702E]">
                        {completedCourses}
                        <span className="ml-1 text-xs font-normal text-[#98702E]">/ {totalCourses}</span>
                      </p>
                    </div>

                  </div>

                  <div className="mt-7">

                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-[#786B58]">Overall learning progress</span>
                      <span className="font-bold text-[#98702E]">{overallProgress}%</span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[#E8DCC6]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#98702E] via-[#D7B56F] to-[#E8D09A] shadow-[0_0_16px_rgba(201,164,92,0.25)] transition-all duration-700"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>

                  </div>

                  <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#E2D3B8] pt-5">

                    <div>
                      <p className="text-xl font-bold text-[#33291D]">{activeCourses}</p>
                      <p className="mt-1 text-[10px] text-[#786B58]">Active</p>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-[#33291D]">{pendingCourses}</p>
                      <p className="mt-1 text-[10px] text-[#786B58]">Pending</p>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-[#33291D]">{recordings.length}</p>
                      <p className="mt-1 text-[10px] text-[#786B58]">Recordings</p>
                    </div>

                  </div>

                </section>

                <LearningCalendar />

              </div>

              {/* COURSE PERFORMANCE */}

              <div className={`${panel} p-7`}>

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <p className="text-[10px] font-bold tracking-[2px] text-[#98702E]">
                      COURSE PERFORMANCE
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-[#33291D]">
                      Progress by Course
                    </h3>
                  </div>

                  <button
                    onClick={() => setTab("courses")}
                    className={goldButton}
                  >
                    View All →
                  </button>

                </div>

                <div className="mt-7 space-y-6">

                  {courses.length === 0 && (
                    <p className="text-sm text-[#786B58]">
                      No enrolled courses available.
                    </p>
                  )}

                  {courses.slice(0, 5).map((item) => (

                    <div key={item.course.id} className="group">

                      <div className="mb-3 flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#E0D0B2] bg-[#F7EACB] text-lg text-[#98702E]">
                            {item.course.icon}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#33291D]">
                              {item.course.name}
                            </p>

                            <p className="mt-1 text-[10px] text-[#786B58]">
                              {item.completedLessons} / {item.totalLessons} lessons
                            </p>
                          </div>

                        </div>

                        <span className="shrink-0 text-sm font-bold text-[#98702E]">
                          {item.progress}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#E8DCC6]">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#98702E] via-[#D9BD83] to-[#B58A49] transition-all duration-1000 group-hover:brightness-110"
                          style={{ width: `${item.progress}%` }}
                        />

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* MY COURSES */}

              <div>

                <SectionHeading
                  eyebrow="YOUR LEARNING SPACE"
                  title="My Courses"
                  description="Manage your enrolled courses and continue learning."
                />

                <CourseFilters
                  courseFilter={courseFilter}
                  setCourseFilter={setCourseFilter}
                />

                <div className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 pr-2 scroll-smooth">

                  {filteredCourses.map((item) => (
                    <CourseCard key={item.course.id} item={item} />
                  ))}

                  {filteredCourses.length === 0 && (
                    <div className={`${panel} w-full p-8 text-center text-sm text-[#786B58]`}>
                      No courses found in this category.
                    </div>
                  )}

                </div>

              </div>

              {/* LIVE CLASSES */}

              <div className={`${panel} p-7`}>

                <SectionHeading
                  eyebrow="LIVE LEARNING"
                  title="Live Classes"
                  description="Stay connected with your learning sessions."
                />

                <div className="mt-5">
                  <LiveList />
                </div>

              </div>

              {/* RECENT RECORDINGS */}

              <div>

                <SectionHeading
                  eyebrow="YOUR VIDEO LIBRARY"
                  title="Recent Recordings"
                  description="Revisit your previous learning sessions."
                />

                <div className="mt-5 space-y-3">

                  {recordings.slice(0, 4).map((recording) => (
                    <RecordingCard key={recording.id} recording={recording} />
                  ))}

                  {recordings.length === 0 && (
                    <div className={`${panel} p-7 text-center text-sm text-[#786B58]`}>
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

              <CourseFilters
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
              />

              <div className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 pr-2 scroll-smooth">

                {filteredCourses.map((item) => (
                  <CourseCard key={item.course.id} item={item} />
                ))}

                {filteredCourses.length === 0 && (
                  <p className="text-sm text-[#786B58]">
                    No courses found.
                  </p>
                )}

              </div>

            </div>

          )}

          {/* LIVE CLASSES PAGE */}

          {tab === "live" && (

            <div>

              <SectionHeading
                eyebrow="LIVE LEARNING"
                title="Live Classes"
                description="Join your learning sessions."
              />

              <div className={`${panel} mt-6 p-6`}>
                <LiveList />
              </div>

            </div>

          )}

          {/* RECORDINGS PAGE */}

          {tab === "rec" && (

            <div>

              <SectionHeading
                eyebrow="YOUR LIBRARY"
                title="Recordings"
                description="Revisit your previous learning sessions."
              />

              <div className="mt-6 space-y-3">

                {recordings.map((recording) => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))}

                {recordings.length === 0 && (
                  <div className={`${panel} p-8 text-center text-sm text-[#786B58]`}>
                    No recordings available.
                  </div>
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
// SECTION HEADING
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
      <p className="text-[9px] font-bold tracking-[0.24em] text-[#98702E]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-[1.35rem] font-bold tracking-[-0.025em] text-[#33291D]">
        {title}
      </h2>

      <p className="mt-1.5 text-[12px] leading-5 text-[#786B58]">
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
  value: number | string;
  subtitle: string;
  number: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-[#D4B77E]/65 bg-[radial-gradient(circle_at_90%_5%,rgba(232,208,154,0.48),transparent_38%),linear-gradient(145deg,#FFFDF8_0%,#F8F0E2_55%,#EEDFC5_100%)] p-6 shadow-[0_14px_35px_rgba(112,79,35,0.10)] transition-all duration-500 hover:-translate-y-2 hover:border-[#B58A49] hover:shadow-[0_22px_45px_rgba(168,121,50,0.19)]">

      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#D7B56F]/20 blur-[40px] transition duration-500 group-hover:bg-[#C9A45C]/40" />

      <div className="relative flex items-center justify-between">

        <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#D8C49C] bg-white/75 text-xl text-[#98702E] shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>

        <span className="text-[10px] font-bold tracking-widest text-[#A89A83]">
          {number}
        </span>

      </div>

      <div className="relative mt-6">

        <p className="text-3xl font-bold tracking-tight text-[#33291D]">
          {value}
        </p>

        <h3 className="mt-1 text-sm font-bold text-[#4B3B27]">
          {label}
        </h3>

        <p className="mt-2 text-[10px] text-[#786B58]">
          {subtitle}
        </p>

      </div>

      <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-[#98702E] via-[#D9BD83] to-[#B58A49] transition-all duration-500 group-hover:w-full" />

      <span className="pointer-events-none absolute right-5 top-5 text-xs text-[#B58A49]/0 transition-all duration-500 group-hover:text-[#B58A49]/70">
        ✦
      </span>

    </div>
  );
}

// ============================================
// COURSE FILTERS
// ============================================

function CourseFilters({
  courseFilter,
  setCourseFilter,
}: {
  courseFilter: CourseFilter;
  setCourseFilter: (filter: CourseFilter) => void;
}) {
  const filters = [
    { id: "all", label: "All Courses" },
    { id: "active", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ] as const;

  return (
    <div className="mt-5 flex flex-wrap gap-2">

      {filters.map((filter) => (

        <button
          key={filter.id}
          onClick={() => setCourseFilter(filter.id)}
          className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition duration-300 ${
            courseFilter === filter.id
              ? "border-[#A87932] bg-gradient-to-r from-[#A87932] to-[#D0AE67] text-white shadow-[0_6px_16px_rgba(168,121,50,0.20)]"
              : "border-[#D8C49C] bg-white/75 text-[#786B58] hover:border-[#B58A49] hover:bg-[#F7EACB] hover:text-[#98702E]"
          }`}
        >
          {filter.label}
        </button>

      ))}

    </div>
  );
}

// ============================================
// LEARNING CALENDAR
// ============================================

function LearningCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = visibleMonth.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

  const cells = [
    ...Array.from({ length: firstDay }, (_, index) => ({
      key: `blank-${index}`,
      day: null as number | null,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];

  const selectedLabel = selectedDate.toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const changeMonth = (amount: number) => {
    setVisibleMonth(new Date(year, month + amount, 1));
  };

  return (
    <section className={`${panel} p-7`}>

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[9px] font-bold tracking-[0.24em] text-[#98702E]">
            PLAN YOUR JOURNEY
          </p>

          <h3 className="mt-2 text-xl font-bold text-[#33291D]">
            Learning Calendar
          </h3>

          <p className="mt-1 text-xs text-[#786B58]">
            Choose a date to view your study plan
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#D8C49C] bg-white/75 text-xl text-[#98702E] shadow-sm">
          ▦
        </div>

      </div>

      <div className="mt-6 flex items-center justify-between">

        <p className="text-sm font-bold text-[#33291D]">
          {monthLabel}
        </p>

        <div className="flex gap-2">

          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#D8C49C] bg-white text-[#98702E] transition hover:border-[#A87932] hover:bg-[#F7EACB]"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#D8C49C] bg-white text-[#98702E] transition hover:border-[#A87932] hover:bg-[#F7EACB]"
          >
            ›
          </button>

        </div>

      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5">

        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="pb-2 text-center text-[10px] font-bold text-[#98702E]"
          >
            {day}
          </div>
        ))}

        {cells.map((cell) => {

          if (cell.day === null) {
            return <div key={cell.key} className="h-9" />;
          }

          const date = new Date(year, month, cell.day);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedDate(date)}
              aria-pressed={isSelected}
              className={`relative h-9 rounded-xl text-xs transition duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-[#A87932] to-[#D7B56F] font-bold text-white shadow-[0_5px_15px_rgba(201,164,92,0.25)]"
                  : isToday
                  ? "border border-[#B58A49] bg-[#F7EACB] font-bold text-[#98702E]"
                  : "text-[#786B58] hover:bg-[#F7EACB] hover:text-[#98702E]"
              }`}
            >
              {cell.day}

              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#B58A49]" />
              )}

            </button>
          );
        })}

      </div>

      <div className="mt-5 rounded-2xl border border-[#E0D0B2] bg-white/75 p-4 shadow-sm">

        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#98702E]">
          Selected date
        </p>

        <p className="mt-1.5 text-sm font-bold text-[#33291D]">
          {selectedLabel}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-[#786B58]">
          No class schedule is connected yet. Your live classes and study events can appear here when calendar data is added.
        </p>

      </div>

    </section>
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

        <span className="text-xs text-[#786B58]">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-[#33291D]">
        {value}
      </span>

    </div>
  );
}

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
    <article className="group w-[290px] min-w-[290px] snap-start overflow-hidden rounded-[28px] border border-[#D8C49C]/75 bg-[#FFFDF8] shadow-[0_14px_35px_rgba(112,79,35,0.12)] transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-[#B58A49] hover:shadow-[0_25px_55px_rgba(126,91,43,0.20)] sm:w-[320px] sm:min-w-[320px] animate-[courseSlideIn_650ms_ease-out_both]">

      {/* COURSE IMAGE */}

      <div className="relative aspect-[16/9] overflow-hidden bg-[#E8D8C5]">

        <img
          src={courseImage}
          alt={course.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#33291D]/40 via-transparent to-[#FFFDF8]/10" />

        <span className="absolute left-4 top-4 rounded-full border border-[#F0D99A]/70 bg-[#FFFDF8]/90 px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#76501F] shadow-sm backdrop-blur-xl">
          {completed
            ? "COMPLETED"
            : expired
            ? "EXPIRED"
            : "YOUR LEARNING"}
        </span>

        <span className="absolute bottom-4 right-4 rounded-full border border-[#E7D1A3] bg-[#FFFDF8]/95 px-3 py-1.5 text-xs font-bold text-[#98702E] shadow-sm backdrop-blur-xl">
          {progress}% Complete
        </span>

      </div>

      {/* COURSE CONTENT */}

      <div className="relative space-y-4 bg-gradient-to-br from-[#FFFDF8] via-[#FBF5E9] to-[#F2E5CF] p-5">

        <div>

          <div className="mb-2 flex items-center justify-between gap-2">

            <span className="text-[9px] font-bold uppercase tracking-[2px] text-[#98702E]">
              PROFESSIONAL COURSE
            </span>

            <span className="text-[10px] font-medium text-[#786B58]">
              {totalLessons} Lessons
            </span>

          </div>

          <h3 className="text-lg font-bold leading-snug text-[#33291D] transition-colors group-hover:text-[#98702E]">
            {course.name}
          </h3>

          <p className="mt-2 min-h-[60px] text-xs leading-5 text-[#786B58]">
            {description}
          </p>

        </div>

        {/* LESSON PROGRESS */}

        <div>

          <div className="mb-2 flex justify-between text-[11px]">

            <span className="text-[#786B58]">
              Learning progress
            </span>

            <span className="font-bold text-[#98702E]">
              {completedLessons}/{totalLessons} lessons
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#E6D8BF]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#98702E] via-[#D9BD83] to-[#B58A49] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

        {/* COURSE ACCESS */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2D3B8] pt-4">

          <div className="text-[10px] text-[#786B58]">

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
            className="group/button inline-flex items-center justify-center gap-2 rounded-xl border border-[#B58A49] bg-gradient-to-r from-[#A87932] via-[#D9BD83] to-[#B58A49] px-5 py-2.5 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(168,121,50,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_8px_25px_rgba(184,153,112,0.30)]"
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

  const displayTitle =
    normalizedTitle.includes("bridal") && normalizedTitle.includes("makeup")
      ? "Bridal Makeup Masterclass"
      : normalizedTitle.includes("hair") &&
          (normalizedTitle.includes("q&a") ||
            normalizedTitle.includes("question") ||
            normalizedTitle.includes("doubt"))
      ? "Hair Styling Q&A"
      : originalTitle;

  const isBridal = displayTitle === "Bridal Makeup Masterclass";
  const isHair = displayTitle === "Hair Styling Q&A";

  return (
    <article className="group relative flex items-center gap-4 overflow-hidden rounded-[26px] border border-[#D8C49C]/75 bg-gradient-to-r from-[#FFFDF8] via-[#FBF5E9] to-[#F1E3CC] p-4 shadow-[0_12px_30px_rgba(112,79,35,0.10)] transition-all duration-500 hover:-translate-y-1 hover:border-[#B58A49] hover:shadow-[0_20px_40px_rgba(126,91,43,0.17)] sm:gap-5 sm:p-5">

      {/* SESSION TILE */}

      <div
        className={`relative grid h-[68px] w-[68px] shrink-0 place-items-center overflow-hidden rounded-2xl border shadow-sm ${
          isBridal
            ? "border-[#D4B77E] bg-gradient-to-br from-[#F8E8BF] via-[#D9BD83] to-[#A87932]"
            : isHair
            ? "border-[#D4B77E] bg-gradient-to-br from-[#F1E3CC] via-[#D9BD83] to-[#98702E]"
            : "border-[#D4B77E] bg-gradient-to-br from-[#FFFDF8] to-[#D9BD83]"
        }`}
      >

        <div className="absolute inset-1 rounded-[13px] border border-white/60" />

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="relative h-7 w-7 text-white transition-transform duration-300 group-hover:scale-110"
          fill="none"
        >
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.35" />
          <path d="M10 8.7L15.2 12L10 15.3V8.7Z" fill="currentColor" />
          <path d="M7.2 4.9L8.4 3.7M16.8 4.9L15.6 3.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>

      </div>

      <div className="min-w-0 flex-1 py-1">

        <p className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-[#98702E]">
          {isBridal
            ? "Bridal Makeup Session"
            : isHair
            ? "Expert Hair Session"
            : "Recorded Learning"}
        </p>

        <h4 className="truncate text-sm font-bold tracking-tight text-[#33291D] transition-colors duration-300 group-hover:text-[#98702E] sm:text-[15px]">
          {displayTitle}
        </h4>

        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#786B58]">

          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
            <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10 5.8V10L12.8 11.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>

          {recording.when}

        </p>

      </div>

      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#B58A49] bg-gradient-to-r from-[#A87932] to-[#D0AE67] px-3.5 py-2.5 text-[11px] font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:px-4"
      >

        <span>Watch</span>

        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
          <path d="M5.5 3.5L10.5 8L5.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

      </button>

      <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#98702E] via-[#D9BD83] to-transparent transition-transform duration-500 group-hover:scale-x-100" />

    </article>
  );
}