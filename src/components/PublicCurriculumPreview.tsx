"use client";

import { useEffect, useState } from "react";
import { formatVideoDuration } from "@/lib/videoDuration";

export type PublicPreviewLesson = {
  id: string;
  title: string;
  description: string | null;
  durationSeconds: number | null;
  canPreview: boolean;
};

export type PublicPreviewModule = {
  id: string;
  title: string;
  lessons: PublicPreviewLesson[];
};

export default function PublicCurriculumPreview({
  courseId,
  modules,
}: {
  courseId: string;
  modules: PublicPreviewModule[];
}) {
  const [activeLesson, setActiveLesson] = useState<PublicPreviewLesson | null>(
    null,
  );
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closePreview = () => {
    setActiveLesson(null);
    setEmbedUrl(null);
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    if (!activeLesson) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeLesson]);

  const openPreview = async (lesson: PublicPreviewLesson) => {
    if (!lesson.canPreview) return;
    setActiveLesson(lesson);
    setEmbedUrl(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lesson.id)}/preview`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.embedUrl) {
        setError(data?.error || "Unable to load preview video.");
        return;
      }
      setEmbedUrl(data.embedUrl);
    } catch {
      setError("Network error while loading preview video.");
    } finally {
      setLoading(false);
    }
  };

  if (modules.length === 0) {
    return (
      <div className="card text-sm text-mute">
        Curriculum details will be published soon.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {modules.map((mod, mIdx) => (
          <div
            key={mod.id}
            className="overflow-hidden rounded-xl border border-line bg-ink/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white/[0.03] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-[11px] font-semibold text-gold">
                  {mIdx + 1}
                </span>
                <h3 className="text-sm font-semibold text-white md:text-base">
                  {mod.title}
                </h3>
              </div>
              <span className="text-xs text-mute">
                {mod.lessons.length}{" "}
                {mod.lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>

            {mod.lessons.length === 0 ? (
              <div className="px-5 py-4 text-xs text-mute">
                No lessons added to this module yet.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {mod.lessons.map((lesson, lIdx) => {
                  const durationLabel = formatVideoDuration(
                    lesson.durationSeconds,
                    "--",
                  );

                  if (lesson.canPreview) {
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => openPreview(lesson)}
                          aria-label={`Play free preview: ${lesson.title}`}
                          className="group flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition hover:bg-gold/[0.06]"
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/15 text-gold transition group-hover:bg-gold group-hover:text-ink">
                              <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="ml-0.5 h-3.5 w-3.5"
                                aria-hidden="true"
                              >
                                <path d="M8 5.14v14l11-7-11-7z" />
                              </svg>
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sm font-medium text-white group-hover:text-gold">
                                  {lIdx + 1}. {lesson.title}
                                </span>
                                <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                                  Free Preview
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 text-xs text-mute">
                            {durationLabel}
                          </span>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 text-mute"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.02] text-mute">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <rect
                              x="5"
                              y="11"
                              width="14"
                              height="9"
                              rx="2"
                            />
                            <path d="M8 11V7a4 4 0 1 1 8 0v4" />
                          </svg>
                        </span>
                        <span className="truncate text-sm text-white/80">
                          {lIdx + 1}. {lesson.title}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-mute">
                        {durationLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {activeLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Free Preview: ${activeLesson.title}`}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gold/30 bg-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                  Free Preview
                </span>
                <h4 className="mt-1 truncate text-base font-semibold text-white">
                  {activeLesson.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={closePreview}
                aria-label="Close preview"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-mute transition hover:border-gold/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {loading && (
                <div className="flex h-full items-center justify-center text-sm text-mute">
                  Loading preview video...
                </div>
              )}
              {!loading && error && (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={closePreview}
                    className="btn-o text-xs"
                  >
                    Close
                  </button>
                </div>
              )}
              {!loading && !error && embedUrl && (
                <iframe
                  src={embedUrl}
                  title={activeLesson.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
