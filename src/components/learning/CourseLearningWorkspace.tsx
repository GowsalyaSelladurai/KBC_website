"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CourseProgressionResult,
  LessonProgressionItem,
} from "@/lib/learning/progression";
import { getDevStudentKey } from "@/lib/learning/devStudentSession";
import { formatVideoDuration } from "@/lib/videoDuration";
import CurriculumSidebar from "./CurriculumSidebar";
import StudentVideoPlayer, { type PlaybackPayload } from "./StudentVideoPlayer";

export type LearningCourseMeta = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
};

export default function CourseLearningWorkspace({
  course,
}: {
  course: LearningCourseMeta;
}) {
  const [studentKey, setStudentKey] = useState<string | null>(null);
  const [progression, setProgression] =
    useState<CourseProgressionResult | null>(null);
  const [loadingProgression, setLoadingProgression] = useState(true);
  const [progressionError, setProgressionError] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<PlaybackPayload | null>(null);
  const [loadingPlayback, setLoadingPlayback] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const playbackRequestIdRef = useRef(0);

  useEffect(() => {
    setStudentKey(getDevStudentKey());
  }, []);

  const allLessons = useMemo(
    () => (progression ? progression.modules.flatMap((m) => m.lessons) : []),
    [progression],
  );

  const selectedLesson = useMemo<LessonProgressionItem | null>(() => {
    if (!selectedLessonId) return null;
    return allLessons.find((l) => l.id === selectedLessonId) ?? null;
  }, [allLessons, selectedLessonId]);

  const selectedIndex = useMemo(() => {
    if (!selectedLesson) return -1;
    return allLessons.findIndex((l) => l.id === selectedLesson.id);
  }, [allLessons, selectedLesson]);

  const previousLesson = useMemo<LessonProgressionItem | null>(() => {
    if (selectedIndex <= 0) return null;
    for (let i = selectedIndex - 1; i >= 0; i--) {
      if (allLessons[i].isEligible && allLessons[i].isUnlocked) {
        return allLessons[i];
      }
    }
    return null;
  }, [allLessons, selectedIndex]);

  const nextLesson = useMemo<LessonProgressionItem | null>(() => {
    if (selectedIndex < 0 || selectedIndex >= allLessons.length - 1) {
      return null;
    }
    const candidate = allLessons[selectedIndex + 1];
    return candidate ?? null;
  }, [allLessons, selectedIndex]);

  const canGoNext = Boolean(
    nextLesson && nextLesson.isEligible && nextLesson.isUnlocked,
  );

  const fetchProgression = useCallback(
    async (activeStudentKey: string, preserveSelection = true) => {
      setLoadingProgression(true);
      setProgressionError(null);

      try {
        const res = await fetch(
          `/api/learning/courses/${encodeURIComponent(course.id)}/progress?studentKey=${encodeURIComponent(activeStudentKey)}`,
          { cache: "no-store" },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setProgressionError(
            data?.error || "Unable to load course progression.",
          );
          setProgression(null);
          return null;
        }

        const nextProg = data as CourseProgressionResult;
        setProgression(nextProg);

        const flat = nextProg.modules.flatMap((m) => m.lessons);
        setSelectedLessonId((prev) => {
          if (preserveSelection && prev && flat.some((l) => l.id === prev)) {
            return prev;
          }
          if (nextProg.currentUnlockableLesson) {
            return nextProg.currentUnlockableLesson.id;
          }
          const firstPlayable = flat.find((l) => l.isEligible && l.isUnlocked);
          if (firstPlayable) return firstPlayable.id;
          return flat[0]?.id ?? null;
        });

        return nextProg;
      } catch {
        setProgressionError(
          "Network error while loading your course progress.",
        );
        return null;
      } finally {
        setLoadingProgression(false);
      }
    },
    [course.id],
  );

  useEffect(() => {
    if (!studentKey) return;
    fetchProgression(studentKey, false);
  }, [studentKey, fetchProgression]);

  const fetchPlayback = useCallback(
    async (
      activeStudentKey: string,
      lessonId: string,
      isEligible: boolean,
      isUnlocked: boolean,
    ) => {
      const requestId = ++playbackRequestIdRef.current;

      // Clear previous playback immediately so switching lessons stops the video.
      setPlayback(null);
      setPlaybackError(null);

      if (!isEligible || !isUnlocked) {
        setLoadingPlayback(false);
        return;
      }

      setLoadingPlayback(true);
      try {
        const res = await fetch(
          `/api/learning/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(lessonId)}/playback?studentKey=${encodeURIComponent(activeStudentKey)}`,
          { cache: "no-store" },
        );
        if (requestId !== playbackRequestIdRef.current) return;

        const data = await res.json().catch(() => ({}));
        if (requestId !== playbackRequestIdRef.current) return;

        if (!res.ok || !data?.playback?.embedUrl) {
          setPlaybackError(
            data?.error || "Unable to load playback for this lesson.",
          );
          return;
        }
        setPlayback(data.playback as PlaybackPayload);
      } catch {
        if (requestId !== playbackRequestIdRef.current) return;
        setPlaybackError("Network error while loading lesson playback.");
      } finally {
        if (requestId === playbackRequestIdRef.current) {
          setLoadingPlayback(false);
        }
      }
    },
    [course.id],
  );

  const selectedCanPlay = Boolean(
    selectedLesson?.isEligible && selectedLesson?.isUnlocked,
  );

  useEffect(() => {
    if (!studentKey || !selectedLessonId) {
      playbackRequestIdRef.current++;
      setPlayback(null);
      setPlaybackError(null);
      setLoadingPlayback(false);
      return;
    }
    fetchPlayback(
      studentKey,
      selectedLessonId,
      Boolean(selectedLesson?.isEligible),
      Boolean(selectedLesson?.isUnlocked),
    );
    // Intentionally keyed on ID and playability so marking complete doesn't reload the iframe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentKey, selectedLessonId, selectedCanPlay, fetchPlayback]);

  const handleSelectLesson = (lesson: LessonProgressionItem) => {
    if (!lesson.isEligible || !lesson.isUnlocked) return;
    setActionError(null);
    setActionNotice(null);
    setSelectedLessonId(lesson.id);
  };

  const handleMarkComplete = async () => {
    if (!studentKey || !selectedLesson || completing) return;
    if (!selectedLesson.isEligible || !selectedLesson.isUnlocked) return;
    if (selectedLesson.isCompleted) return;

    setCompleting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const res = await fetch(
        `/api/learning/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(selectedLesson.id)}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentKey }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data?.error || "Could not mark lesson as complete.");
        return;
      }

      const refreshed = await fetchProgression(studentKey, true);
      if (refreshed?.summary.completionPercentage === 100) {
        setActionNotice(
          "Congratulations! You have completed all available lessons in this course.",
        );
      } else if (data?.nextUnlockableLesson) {
        setActionNotice(
          `Lesson marked complete. Next up: ${data.nextUnlockableLesson.title}`,
        );
      } else {
        setActionNotice("Lesson marked complete.");
      }
    } catch {
      setActionError("Network error while saving lesson completion.");
    } finally {
      setCompleting(false);
    }
  };

  const summary = progression?.summary;
  const isCourseCompleted =
    Boolean(summary) &&
    summary!.totalEligibleLessons > 0 &&
    summary!.completedLessons === summary!.totalEligibleLessons &&
    summary!.totalEligibleLessons === summary!.totalLessons;

  return (
    <div className="animate-kbc-in mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex flex-wrap items-center gap-2 border-b border-[#D6AD65]/20 pb-4 text-xs text-[#BDB4A7]"
      >
        <Link href="/" className="transition hover:text-[#F1D69A]">
          Home
        </Link>
        <span className="text-[#D6AD65]/50">›</span>
        <Link href="/courses" className="transition hover:text-[#F1D69A]">
          Courses
        </Link>
        <span className="text-[#D6AD65]/50">›</span>
        <Link
          href={`/courses/${course.id}`}
          className="max-w-[200px] truncate transition hover:text-[#F1D69A] sm:max-w-xs"
        >
          {course.title}
        </Link>
        {selectedLesson && (
          <>
            <span className="text-[#D6AD65]/50">›</span>
            <span className="max-w-[220px] truncate font-medium text-[#F1D69A] sm:max-w-sm">
              {selectedLesson.title}
            </span>
          </>
        )}
      </nav>

      {loadingProgression && !progression ? (
        <div className="kbc-gold-card rounded-2xl py-20 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#D6AD65] border-t-transparent" />
          <p className="text-sm text-[#BDB4A7]">
            Loading your course curriculum...
          </p>
        </div>
      ) : progressionError ? (
        <div className="kbc-gold-card space-y-3 rounded-2xl py-12 text-center">
          <p className="text-sm text-rose-300">{progressionError}</p>
          {studentKey && (
            <button
              type="button"
              onClick={() => fetchProgression(studentKey, false)}
              className="kbc-outline-btn !rounded-full"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Video Player + Lesson Info + Navigation */}
          <div className="min-w-0 space-y-5">
            {isCourseCompleted && (
              <div className="rounded-xl border border-[#D6AD65]/40 bg-[#211A12] px-4 py-3 text-sm text-[#F1D69A]">
                Course completed — all {summary?.completedLessons} lessons
                finished. You can revisit any lesson from the curriculum.
              </div>
            )}

            <StudentVideoPlayer
              lesson={selectedLesson}
              playback={playback}
              loading={loadingPlayback}
              error={playbackError}
              onRetry={() => {
                if (studentKey && selectedLesson) {
                  fetchPlayback(
                    studentKey,
                    selectedLesson.id,
                    selectedLesson.isEligible,
                    selectedLesson.isUnlocked,
                  );
                }
              }}
            />

            {selectedLesson && (
              <div className="space-y-4 pt-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#D6AD65]">
                      <span>{selectedLesson.moduleTitle}</span>
                      {selectedLesson.durationSeconds ? (
                        <>
                          <span className="text-[#D6AD65]/40">·</span>
                          <span className="text-[#BDB4A7]">
                            {formatVideoDuration(
                              selectedLesson.durationSeconds,
                              "--",
                            )}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                      {selectedIndex >= 0
                        ? `Lesson ${selectedIndex + 1} – ${selectedLesson.title}`
                        : selectedLesson.title}
                    </h1>
                  </div>
                </div>

                {selectedLesson.description && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[#BDB4A7]">
                    {selectedLesson.description}
                  </p>
                )}

                {actionError && (
                  <p className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-2.5 text-xs text-rose-300">
                    {actionError}
                  </p>
                )}
                {actionNotice && (
                  <p className="rounded-xl border border-[#D6AD65]/30 bg-[#211A12] px-4 py-2.5 text-xs text-[#F1D69A]">
                    {actionNotice}
                  </p>
                )}

                {/* Bottom Action Bar matching reference */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D6AD65]/20 pt-5">
                  <button
                    type="button"
                    disabled={!previousLesson}
                    onClick={() => {
                      if (previousLesson) handleSelectLesson(previousLesson);
                    }}
                    className="kbc-outline-btn !rounded-full !px-5 !py-2.5"
                  >
                    ← Previous Lesson
                  </button>

                  {selectedLesson.isCompleted ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-5 py-2.5 text-xs font-semibold text-emerald-300">
                      <span>✓</span>
                      <span>Completed</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        completing ||
                        !selectedLesson.isEligible ||
                        !selectedLesson.isUnlocked
                      }
                      onClick={handleMarkComplete}
                      className="kbc-gold-btn !rounded-full !px-6 !py-2.5"
                    >
                      <span>{completing ? "Saving..." : "Mark as Completed"}</span>
                      {!completing && <span>✓</span>}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() => {
                      if (nextLesson && canGoNext) {
                        handleSelectLesson(nextLesson);
                      }
                    }}
                    className="kbc-outline-btn !rounded-full !px-5 !py-2.5"
                  >
                    Next Lesson →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Course Content Sidebar */}
          <CurriculumSidebar
            modules={progression?.modules ?? []}
            summary={summary}
            selectedLessonId={selectedLessonId}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      )}
    </div>
  );
}
