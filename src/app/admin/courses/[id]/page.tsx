"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CurriculumManager from "@/components/admin/courses/CurriculumManager";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  durationSeconds: number | null;
  isPreview: boolean;
  bunnyVideoId: string | null;
  videoStatus: "NOT_UPLOADED" | "PROCESSING" | "READY" | "FAILED";
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
  price: string | number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  learningPoints: { id: string; content: string }[];
  modules: Module[];
  createdAt: string;
  updatedAt: string;
};

function formatPrice(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedPreviewModules, setExpandedPreviewModules] = useState<string[]>([]);
  const [showManageCurriculum, setShowManageCurriculum] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load course.");
      }

      setCourse(data);
      if (data.modules?.length > 0) {
        setExpandedPreviewModules((prev) =>
          prev.length === 0 ? [data.modules[0].id] : prev,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load course.",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("curriculum") === "1"
    ) {
      setShowManageCurriculum(true);
    }
    loadCourse();
  }, [loadCourse]);

  function togglePreviewModule(moduleId: string) {
    setExpandedPreviewModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#aaa59a]">
        Loading course preview...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <p className="text-sm text-rose-300">{error || "Course not found."}</p>
        <button
          onClick={() => router.push("/admin/courses")}
          className="mt-4 rounded-xl border border-[#c9a66a]/40 px-4 py-2 text-xs text-[#d8b16d]"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/courses")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b251e] text-[#c9a66a] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/10"
          >
            ←
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
              Course Preview
            </h1>
            <p className="mt-0.5 text-xs text-[#8a857b]">
              Review your course details before publishing
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center gap-2 rounded-xl border border-[#3d3224]/70 bg-[#141210] px-4 py-2 text-xs font-medium text-[#e5be75] transition hover:bg-[#1f1b15]"
          >
            <span>👁</span>
            <span>Preview Course</span>
          </button>

          {course.status !== "PUBLISHED" ? (
            <button
              onClick={() => router.push(`/admin/courses/${courseId}/publish`)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-5 py-2 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/20 transition hover:brightness-110"
            >
              <span>🚀</span>
              <span>Publish Course</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Published Live
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column + Right Column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Hero Banner Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#2b251e] bg-gradient-to-r from-[#171411] to-[#12110f]">
            <div className="relative h-60 w-full overflow-hidden sm:h-72">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#171410] text-4xl text-[#d8b16d]/30">
                  ✦
                </div>
              )}
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-[#0e0d0c]/60 to-transparent" />

              {/* Status Badge in Top Right */}
              <div className="absolute right-4 top-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${
                    course.status === "PUBLISHED"
                      ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                      : "border-amber-500/40 bg-amber-950/60 text-amber-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      course.status === "PUBLISHED" ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {course.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>

              {/* Title & Stats at Bottom */}
              <div className="absolute bottom-5 left-5 right-5">
                <h2 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
                  {course.title}
                </h2>
                <p className="mt-1 text-xs text-[#a8a194]">
                  Makeup · Beauty
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-[#d8d2c6]">
                  <span className="flex items-center gap-1.5">
                    <span>🕐</span>
                    <span>{course.duration || "7 Days"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>₹</span>
                    <span>{formatPrice(course.price)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>👥</span>
                    <span>428 Enrolled</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About This Course Card (with model portrait on right) */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_200px]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#c9a66a]">📖</span>
                  <h3 className="text-sm font-medium text-[#e8dfd1]">
                    About This Course
                  </h3>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-[#8a857b]">
                  {course.description ||
                    "Learn professional makeup techniques with expert guidance from KBC Salon Academy. Master the art of beauty and enhance your skills."}
                </p>

                {/* What You Will Learn */}
                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c9a66a]">🏆</span>
                    <h4 className="text-xs font-semibold text-[#e8dfd1]">
                      What You Will Learn
                    </h4>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(course.learningPoints.length > 0
                      ? course.learningPoints
                      : [
                          { id: "1", content: "Advanced makeup techniques" },
                          { id: "2", content: "Professional bridal makeup" },
                          { id: "3", content: "Makeup for different skin types" },
                        ]
                    ).map((point) => (
                      <div key={point.id} className="flex items-center gap-2 text-xs text-[#a9a296]">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">
                          ✓
                        </div>
                        <span>{point.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Portrait on Right */}
              <div className="relative hidden h-52 overflow-hidden rounded-2xl border border-[#3d3224]/40 bg-gradient-to-t from-[#1b1610] to-[#0d0c0a] sm:flex sm:items-center sm:justify-center">
                <div className="text-center p-4">
                  <div className="mb-2 text-4xl">✨</div>
                  <p className="text-[11px] font-serif font-medium text-[#e5be75]">
                    KBC Luxury Makeover
                  </p>
                  <p className="mt-1 text-[9px] text-[#7a7469]">
                    Academy Certified
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Curriculum Card */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#c9a66a]">🎓</span>
                <h3 className="text-sm font-medium text-[#e8dfd1]">
                  Course Curriculum
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-[#2e2720] bg-[#0c0c0b] px-3 py-0.5 text-xs text-[#8a857b]">
                  {course.modules.length} Modules · {totalLessons} Lessons
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (showManageCurriculum) {
                      loadCourse();
                    }
                    setShowManageCurriculum(!showManageCurriculum);
                  }}
                  className="rounded-lg border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-3 py-1 text-xs text-[#d8b16d] hover:bg-[#c9a66a]/20"
                >
                  {showManageCurriculum ? "Show Overview" : "Manage Curriculum"}
                </button>
              </div>
            </div>

            {showManageCurriculum ? (
              <div className="mt-6 border-t border-[#26211b] pt-4">
                <CurriculumManager courseId={courseId} />
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {(course.modules.length > 0
                  ? course.modules
                  : [
                      {
                        id: "m1",
                        title: "Module 1 : Makeup Basics",
                        sortOrder: 1,
                        lessons: [
                          { id: "l1", title: "Lesson 1 – Introduction", durationSeconds: 765 },
                          { id: "l2", title: "Lesson 2 – Tools & Products", durationSeconds: 1100 },
                          { id: "l3", title: "Lesson 3 – Skin Preparation", durationSeconds: 910 },
                        ],
                      },
                      {
                        id: "m2",
                        title: "Module 2 : Foundation Techniques",
                        sortOrder: 2,
                        lessons: [
                          { id: "l4", title: "Lesson 1 – Shade Matching", durationSeconds: 840 },
                          { id: "l5", title: "Lesson 2 – Blending Methods", durationSeconds: 950 },
                        ],
                      },
                      {
                        id: "m3",
                        title: "Module 3 : Eye Makeup Mastery",
                        sortOrder: 3,
                        lessons: [
                          { id: "l6", title: "Lesson 1 – Smokey Eye Look", durationSeconds: 1200 },
                        ],
                      },
                    ]
                ).map((mod) => {
                  const isExpanded = expandedPreviewModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className="overflow-hidden rounded-xl border border-[#26211b] bg-[#0c0c0b]"
                    >
                      <button
                        onClick={() => togglePreviewModule(mod.id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#141311]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#c9a66a]">▶</span>
                          <span className="text-xs font-medium text-[#e8dfd1]">
                            {mod.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#7a7469]">
                            {mod.lessons.length} Lessons
                          </span>
                          <svg
                            className={`h-3.5 w-3.5 text-[#736c62] transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && mod.lessons.length > 0 && (
                        <div className="divide-y divide-[#1e1b17] border-t border-[#26211b] bg-[#11100f] px-4 py-2">
                          {mod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between py-2 text-xs text-[#a9a296]"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[#c9a66a]">▶</span>
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-[11px] text-[#736c62]">
                                {formatDuration(lesson.durationSeconds)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Summary & Ready to Publish */}
        <div className="space-y-6">
          {/* Course Summary Card */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-5">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">📋</span>
              <h3 className="text-sm font-medium text-[#e8dfd1]">
                Course Summary
              </h3>
            </div>

            {/* Thumbnail + info */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#2b251e] bg-[#0c0c0b] p-2.5">
              <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg border border-[#3d3224]/50">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm">
                    💄
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#e8dfd1]">
                  {course.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-[#7a7469]">
                    {course.courseCode}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                      course.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    ● {course.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Table */}
            <div className="mt-4 space-y-3 divide-y divide-[#1e1b17] text-xs">
              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-2 text-[#8a857b]">
                  <span>📅</span>
                  <span>Duration</span>
                </span>
                <span className="text-[#e8dfd1]">{course.duration || "7 Days"}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-2 text-[#8a857b]">
                  <span>₹</span>
                  <span>Price</span>
                </span>
                <span className="font-medium text-[#e8dfd1]">
                  {formatPrice(course.price)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-2 text-[#8a857b]">
                  <span>👥</span>
                  <span>Modules</span>
                </span>
                <span className="text-[#e8dfd1]">{course.modules.length} Modules</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-2 text-[#8a857b]">
                  <span>📚</span>
                  <span>Lessons</span>
                </span>
                <span className="text-[#e8dfd1]">{totalLessons} Lessons</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[#8a857b]">Course Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    course.status === "PUBLISHED"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  ● {course.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* Ready to Publish Card */}
          <div className="rounded-2xl border border-[#7a592e]/40 bg-gradient-to-br from-[#1a1612] to-[#0e0d0c] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⭐</span>
                <h3 className="text-xs font-semibold text-[#f4e5c5]">
                  Ready to Publish?
                </h3>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c9a66a] bg-[#c9a66a]/15 text-sm text-[#c9a66a]">
                ✓
              </div>
            </div>

            <p className="mt-2 text-xs text-[#8a857b]">
              Your course is ready to go live for students.
            </p>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2e2720] py-2 text-xs text-[#b8b0a2] transition hover:bg-[#161513] hover:text-[#e8dfd1]"
              >
                <span>←</span>
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/admin/courses/${courseId}/publish`)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] py-2 text-xs font-semibold text-[#1a140d] shadow-md shadow-[#c9a66a]/20 transition hover:brightness-110"
              >
                <span>🚀</span>
                <span>Publish Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
