"use client";

import { useEffect, useState } from "react";
import type {
  LessonProgressionItem,
  ModuleProgressionItem,
  ProgressionSummary,
} from "@/lib/learning/progression";
import { formatVideoDuration } from "@/lib/videoDuration";

function getUnavailableLabel(lesson: LessonProgressionItem): string {
  if (lesson.videoStatus === "PROCESSING") return "Video processing";
  if (lesson.videoStatus === "FAILED") return "Video unavailable";
  return "Not uploaded yet";
}

export default function CurriculumSidebar({
  modules,
  summary,
  selectedLessonId,
  onSelectLesson,
}: {
  modules: ModuleProgressionItem[];
  summary: ProgressionSummary | undefined;
  selectedLessonId: string | null;
  onSelectLesson: (lesson: LessonProgressionItem) => void;
}) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    if (modules.length > 0 && expandedModules.length === 0) {
      setExpandedModules(modules.map((m) => m.id));
    }
  }, [modules, expandedModules.length]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  return (
    <aside
      className="kbc-gold-card overflow-hidden rounded-2xl lg:sticky lg:top-24"
      aria-label="Course Content"
    >
      {/* Sidebar Header + Progress Bar */}
      <div className="border-b border-[#D6AD65]/20 bg-[#15120F] p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-white">
            Course Content
          </h2>
          {summary && (
            <span className="text-xs font-semibold text-[#F1D69A]">
              {summary.completionPercentage}%
            </span>
          )}
        </div>

        {summary && (
          <>
            <p className="mt-1 text-xs text-[#BDB4A7]">
              {summary.completedLessons} of {summary.totalEligibleLessons}{" "}
              lessons completed
            </p>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#090807]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] transition-all duration-300"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Modules & Lessons */}
      {modules.length === 0 ? (
        <div className="p-6 text-center text-sm text-[#BDB4A7]">
          No modules or lessons have been added to this course yet.
        </div>
      ) : (
        <div className="max-h-[620px] divide-y divide-[#D6AD65]/15 overflow-y-auto">
          {modules.map((mod, mIdx) => {
            const isExpanded = expandedModules.includes(mod.id);
            const completedInModule = mod.lessons.filter(
              (l) => l.isCompleted,
            ).length;

            return (
              <div key={mod.id} className="bg-[#15120F]/60">
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-[#1B1713]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xs font-semibold text-[#D6AD65]">
                        {String(mIdx + 1).padStart(2, "0")}.
                      </span>
                      <h3 className="truncate text-sm font-semibold text-white">
                        {mod.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#BDB4A7]">
                      {completedInModule} / {mod.lessons.length}{" "}
                      {mod.lessons.length === 1 ? "Lesson" : "Lessons"}
                    </p>
                  </div>

                  <svg
                    className={`h-4 w-4 shrink-0 text-[#BDB4A7] transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-[#F1D69A]" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#D6AD65]/10 bg-[#090807]/60">
                    {mod.lessons.length === 0 ? (
                      <div className="px-5 py-3 text-xs text-[#BDB4A7]">
                        No lessons in this module.
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#D6AD65]/10">
                        {mod.lessons.map((lesson, lIdx) => {
                          const isSelected = lesson.id === selectedLessonId;
                          const canSelect =
                            lesson.isEligible && lesson.isUnlocked;
                          const durationText = formatVideoDuration(
                            lesson.durationSeconds,
                            "",
                          );

                          return (
                            <li key={lesson.id}>
                              <button
                                type="button"
                                disabled={!canSelect}
                                onClick={() => {
                                  if (canSelect) onSelectLesson(lesson);
                                }}
                                aria-current={isSelected ? "step" : undefined}
                                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition ${
                                  isSelected
                                    ? "bg-[#211A12] ring-1 ring-inset ring-[#D6AD65]/45"
                                    : canSelect
                                      ? "hover:bg-[#1B1713]"
                                      : "cursor-not-allowed opacity-60"
                                }`}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                                    lesson.isCompleted
                                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                                      : isSelected
                                        ? "bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] text-[#090807]"
                                        : canSelect
                                          ? "border border-[#D6AD65]/45 bg-[#1B1713] text-[#F1D69A]"
                                          : "border border-[#D6AD65]/15 bg-[#15120F] text-[#BDB4A7]"
                                  }`}
                                  aria-hidden="true"
                                >
                                  {lesson.isCompleted
                                    ? "✓"
                                    : !lesson.isEligible
                                      ? "!"
                                      : canSelect
                                        ? "▶"
                                        : "🔒"}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-xs font-medium sm:text-sm ${
                                      isSelected
                                        ? "text-[#F1D69A]"
                                        : canSelect
                                          ? "text-white"
                                          : "text-[#BDB4A7]"
                                    }`}
                                  >
                                    {lIdx + 1}. {lesson.title}
                                  </p>

                                  {!lesson.isEligible && (
                                    <p className="mt-0.5 text-[10px] text-amber-300/90">
                                      {getUnavailableLabel(lesson)}
                                    </p>
                                  )}
                                  {lesson.isEligible && !lesson.isUnlocked && (
                                    <p className="mt-0.5 text-[10px] text-[#BDB4A7]/70">
                                      Locked
                                    </p>
                                  )}
                                </div>

                                {durationText && (
                                  <span className="shrink-0 text-[11px] text-[#BDB4A7]">
                                    {durationText}
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
