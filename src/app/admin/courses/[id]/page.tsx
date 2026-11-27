"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CurriculumManager from "@/components/admin/courses/CurriculumManager";
import DeleteCourseModal from "@/components/admin/courses/DeleteCourseModal";
import { formatVideoDuration } from "@/lib/videoDuration";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [previewItem, setPreviewItem] = useState<{
    moduleId: string;
    moduleTitle: string;
    lesson: Lesson;
  } | null>(null);
  const [previewEmbedUrl, setPreviewEmbedUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [failedThumbnails, setFailedThumbnails] = useState<
    Record<string, boolean>
  >({});

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

  async function openLessonPreview(
    moduleId: string,
    moduleTitle: string,
    lesson: Lesson,
  ) {
    if (!lesson.bunnyVideoId || lesson.videoStatus !== "READY") {
      return;
    }

    setPreviewItem({ moduleId, moduleTitle, lesson });
    setPreviewEmbedUrl(null);
    setPreviewError("");
    setPreviewLoading(true);

    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/video`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok || !data.embedUrl) {
        throw new Error(data.error || "Unable to load video playback.");
      }
      setPreviewEmbedUrl(data.embedUrl);
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Unable to load video playback.",
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  function closeLessonPreview() {
    setPreviewItem(null);
    setPreviewEmbedUrl(null);
    setPreviewError("");
    setPreviewLoading(false);
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
            className="flex items-center gap-1.5 rounded-xl border border-[#3d3224] bg-[#141210] px-4 py-2 text-xs font-medium text-[#e5be75] transition hover:border-[#c9a66a] hover:bg-[#1f1b15]"
          >
            <span>✏️</span>
            <span>Edit Course</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <span>🗑</span>
            <span>Delete Course</span>
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

      {deleteSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          ✓ {deleteSuccess}
        </div>
      )}

      {/* Main Grid: Left Column + Right Column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Course Cover Image & Header Card */}
          <div className="overflow-hidden rounded-2xl border border-[#2b251e] bg-[#121110]">
            {course.imageUrl && (
              <div className="relative flex w-full items-center justify-center border-b border-[#241e17] bg-[#0b0a09] p-3 sm:p-4">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
                    {course.title}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${
                      course.status === "PUBLISHED"
                        ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                        : "border-amber-500/40 bg-amber-950/60 text-amber-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        course.status === "PUBLISHED"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />
                    {course.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-[#a8a194]">
                  {course.courseCode}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-[#d8d2c6]">
                  <span className="flex items-center gap-1.5">
                    <span>🕐</span>
                    <span>{course.duration || "Not set"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>₹</span>
                    <span>{formatPrice(course.price)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span>📚</span>
                    <span>
                      {course.modules.length} Modules · {totalLessons} Lessons
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About This Course Card with Official KBC Logo */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_210px]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#c9a66a]">📖</span>
                  <h3 className="text-sm font-medium text-[#e8dfd1]">
                    About This Course
                  </h3>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-[#8a857b]">
                  {course.description || "No course description provided."}
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
                    {course.learningPoints.length > 0 ? (
                      course.learningPoints.map((point) => (
                        <div
                          key={point.id}
                          className="flex items-center gap-2 text-xs text-[#a9a296]"
                        >
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">
                            ✓
                          </div>
                          <span>{point.content}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7a7469]">
                        No learning points added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Official KBC Salon Academy Logo Card */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#3d3224]/50 bg-gradient-to-b from-[#1a1510] to-[#0c0b09] p-4 text-center">
                <img
                  src="/KBC%20logo.png"
                  alt="KBC Salon Academy"
                  className="max-h-28 w-auto max-w-full object-contain"
                />
                <p className="mt-3 font-serif text-xs font-medium text-[#e5be75]">
                  KBC Luxury Makeover
                </p>
                <p className="mt-0.5 text-[10px] text-[#7a7469]">
                  Academy Certified
                </p>
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
                <CurriculumManager
                  courseId={courseId}
                  courseImageUrl={course.imageUrl}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {course.modules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2e2720] bg-[#0c0c0b] px-4 py-8 text-center">
                    <p className="text-xs text-[#aaa59a]">
                      No modules or lessons added to this course yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowManageCurriculum(true)}
                      className="mt-3 rounded-lg border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-3.5 py-1.5 text-xs text-[#d8b16d] transition hover:bg-[#c9a66a]/20"
                    >
                      + Add Modules & Lessons
                    </button>
                  </div>
                ) : (
                  course.modules.map((mod, modIndex) => {
                  const isExpanded = expandedPreviewModules.includes(mod.id);
                  const readyLessonsCount = mod.lessons.filter(
                    (l) => Boolean(l.bunnyVideoId) && l.videoStatus === "READY",
                  ).length;

                  return (
                    <div
                      key={mod.id}
                      className="overflow-hidden rounded-xl border border-[#2a241d] bg-[#0c0c0b] transition-colors hover:border-[#3d3224]"
                    >
                      <button
                        type="button"
                        onClick={() => togglePreviewModule(mod.id)}
                        className="flex w-full items-center justify-between bg-[#15120e] px-4 py-3.5 text-left transition hover:bg-[#1a1611]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#c9a66a]/30 bg-[#c9a66a]/10 text-[11px] font-semibold text-[#e5be75]">
                            {String(modIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="truncate text-xs font-medium text-[#f4e5c5] sm:text-sm">
                            {mod.title}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-[11px] text-[#8a857b]">
                            {mod.lessons.length}{" "}
                            {mod.lessons.length === 1 ? "Lesson" : "Lessons"}
                            {readyLessonsCount > 0 && (
                              <span className="text-emerald-300/90">
                                {" "}
                                · {readyLessonsCount} Video
                                {readyLessonsCount === 1 ? "" : "s"}
                              </span>
                            )}
                          </span>
                          <svg
                            className={`h-3.5 w-3.5 text-[#c9a66a] transition-transform duration-200 ${
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

                      {isExpanded && (
                        <div className="space-y-2 border-t border-[#241e17] bg-[#0b0a09] p-3">
                          {mod.lessons.length === 0 ? (
                            <p className="py-3 text-center text-xs text-[#736c62]">
                              No lessons in this module yet.
                            </p>
                          ) : (
                            mod.lessons.map((lesson, lessonIndex) => {
                              const isPlayable =
                                Boolean(lesson.bunnyVideoId) &&
                                lesson.videoStatus === "READY";
                              const isSelected =
                                previewItem?.lesson.id === lesson.id;

                              if (!isPlayable) {
                                return (
                                  <div
                                    key={lesson.id}
                                    aria-disabled="true"
                                    className="flex cursor-not-allowed items-center justify-between gap-3 rounded-xl border border-[#1f1b16] bg-[#11100e]/60 px-3.5 py-3 opacity-65"
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2e2720] bg-[#16130f] text-[10px] text-[#736c62]">
                                        —
                                      </span>
                                      <div className="min-w-0">
                                        <p className="truncate text-xs font-medium text-[#9b9488]">
                                          {modIndex + 1}.{lessonIndex + 1}{" "}
                                          {lesson.title}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-[#6d665c]">
                                          {lesson.videoStatus === "PROCESSING"
                                            ? "Video is being prepared"
                                            : lesson.videoStatus === "FAILED"
                                              ? "Video unavailable"
                                              : "No video uploaded"}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="shrink-0 rounded-full border border-[#2e2720] bg-[#14120f] px-2.5 py-0.5 text-[10px] text-[#736c62]">
                                      Unavailable
                                    </span>
                                  </div>
                                );
                              }

                              const thumbFailed = Boolean(
                                failedThumbnails[lesson.id],
                              );

                              return (
                                <div
                                  key={lesson.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() =>
                                    openLessonPreview(
                                      mod.id,
                                      mod.title,
                                      lesson,
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      openLessonPreview(
                                        mod.id,
                                        mod.title,
                                        lesson,
                                      );
                                    }
                                  }}
                                  className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                                    isSelected
                                      ? "border-[#c9a66a] bg-[#c9a66a]/15 ring-1 ring-[#c9a66a]/35"
                                      : "border-[#262018] bg-[#12100d] hover:border-[#c9a66a]/55 hover:bg-[#191510]"
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-3.5">
                                    {/* 16:9 Lesson Video Thumbnail */}
                                    <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg border border-[#3d3224]/60 bg-[#0b0a09] sm:w-28">
                                      {!thumbFailed && lesson.bunnyVideoId ? (
                                        <>
                                          <img
                                            src={`/api/admin/videos/${lesson.bunnyVideoId}/thumbnail`}
                                            alt={lesson.title}
                                            onError={() =>
                                              setFailedThumbnails((prev) => ({
                                                ...prev,
                                                [lesson.id]: true,
                                              }))
                                            }
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
                                            <span
                                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] shadow ${
                                                isSelected
                                                  ? "bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] text-[#1a140d]"
                                                  : "bg-black/70 text-[#f4e5c5]"
                                              }`}
                                            >
                                              ▶
                                            </span>
                                          </div>
                                        </>
                                      ) : course.imageUrl ? (
                                        <>
                                          <img
                                            src={course.imageUrl}
                                            alt={lesson.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/45">
                                            <span
                                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] shadow ${
                                                isSelected
                                                  ? "bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] text-[#1a140d]"
                                                  : "bg-black/70 text-[#f4e5c5]"
                                              }`}
                                            >
                                              ▶
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                          <span
                                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                                              isSelected
                                                ? "border-[#e5be75] bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] text-[#1a140d]"
                                                : "border-[#c9a66a]/40 bg-[#c9a66a]/10 text-[#e5be75]"
                                            }`}
                                          >
                                            ▶
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-xs font-medium text-[#f4e5c5] sm:text-sm">
                                          {modIndex + 1}.{lessonIndex + 1}{" "}
                                          {lesson.title}
                                        </p>
                                        {lesson.isPreview && (
                                          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                                            Free preview
                                          </span>
                                        )}
                                      </div>
                                      {lesson.description && (
                                        <p className="mt-0.5 line-clamp-1 text-[11px] text-[#7a7469]">
                                          {lesson.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2.5">
                                    <span className="text-[11px] font-medium text-[#c9a66a]">
                                      {lesson.durationSeconds &&
                                      lesson.durationSeconds > 0
                                        ? formatVideoDuration(
                                            lesson.durationSeconds,
                                          )
                                        : formatDuration(
                                            lesson.durationSeconds,
                                          )}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label="Play lesson video"
                                      title="Play lesson video"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLessonPreview(
                                          mod.id,
                                          mod.title,
                                          lesson,
                                        );
                                      }}
                                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                        isSelected
                                          ? "border-[#e5be75] bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] text-[#1a140d] shadow-md shadow-[#c9a66a]/25"
                                          : "border-[#c9a66a]/45 bg-[#0c0b09] text-[#e5be75] hover:border-[#e5be75] hover:bg-[#c9a66a]/20"
                                      }`}
                                    >
                                      <svg
                                        className="ml-0.5 h-3.5 w-3.5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M8 5.14v14l11-7-11-7z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
                )}
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
                <span className="text-[#e8dfd1]">{course.duration || "Not set"}</span>
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

          {/* Ready to Publish Card — only shown for unpublished courses */}
          {course.status !== "PUBLISHED" && (
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
          )}
        </div>
      </div>

      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeLessonPreview}
        >
          <div
            className="animate-kbc-in w-full max-w-3xl overflow-hidden rounded-2xl border border-[#3d3224]/70 bg-[#121110] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#26211b] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-[#c9a66a]">
                  {previewItem.moduleTitle}
                </p>
                <h3 className="mt-0.5 truncate font-serif text-lg font-medium text-[#f4e5c5]">
                  {previewItem.lesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLessonPreview}
                aria-label="Close video preview"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2e2720] text-xs text-[#8a857b] transition hover:border-[#c9a66a]/50 hover:text-[#f4e5c5]"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#26211b] bg-black">
                {previewLoading ? (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#9b9488]">
                    Loading video player...
                  </div>
                ) : previewError ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <p className="text-xs text-rose-300">{previewError}</p>
                    <button
                      type="button"
                      onClick={() =>
                        openLessonPreview(
                          previewItem.moduleId,
                          previewItem.moduleTitle,
                          previewItem.lesson,
                        )
                      }
                      className="rounded-lg border border-[#3d3224] px-3 py-1.5 text-xs text-[#d8b16d] hover:bg-[#c9a66a]/10"
                    >
                      Try Again
                    </button>
                  </div>
                ) : previewEmbedUrl ? (
                  <iframe
                    key={previewEmbedUrl}
                    src={previewEmbedUrl}
                    loading="eager"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full border-0"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen
                  />
                ) : null}
              </div>

              {previewItem.lesson.description && (
                <p className="mt-3 text-xs leading-relaxed text-[#8a857b]">
                  {previewItem.lesson.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteCourseModal
          courseId={course.id}
          courseTitle={course.title}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            setDeleteSuccess(
              `Course "${course.title}" deleted successfully. Redirecting to Courses...`,
            );
            setTimeout(() => {
              router.push("/admin/courses");
              router.refresh();
            }, 800);
          }}
        />
      )}
    </div>
  );
}
