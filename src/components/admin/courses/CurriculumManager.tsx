"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LessonVideoUploader from "./LessonVideoUploader";
import {
  detectVideoDuration,
  formatVideoDuration,
} from "@/lib/videoDuration";

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

type LessonForm = {
  title: string;
  description: string;
  isPreview: boolean;
};

const emptyLessonForm: LessonForm = {
  title: "",
  description: "",
  isPreview: false,
};

const VIDEO_STATUS_META: Record<
  Lesson["videoStatus"],
  {
    label: string;
    pillClass: string;
    dotClass: string;
    actionLabel: string;
    actionClass: string;
  }
> = {
  READY: {
    label: "Video ready",
    pillClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClass: "bg-emerald-400",
    actionLabel: "Preview Video",
    actionClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  },
  PROCESSING: {
    label: "Preparing",
    pillClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClass: "bg-amber-400 animate-pulse",
    actionLabel: "View Status",
    actionClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
  },
  FAILED: {
    label: "Needs retry",
    pillClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dotClass: "bg-rose-400",
    actionLabel: "Retry Video",
    actionClass:
      "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
  },
  NOT_UPLOADED: {
    label: "No video",
    pillClass: "border-[#3a3025] bg-[#161412] text-[#9b9488]",
    dotClass: "bg-[#6d665c]",
    actionLabel: "Upload Video",
    actionClass:
      "border-[#c9a66a]/45 bg-[#c9a66a]/15 text-[#f4e5c5] hover:bg-[#c9a66a]/25",
  },
};

export default function CurriculumManager({
  courseId,
  courseImageUrl = null,
}: {
  courseId: string;
  courseImageUrl?: string | null;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  // Focused Lesson Editor Modal state
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoDuration, setPendingVideoDuration] = useState<
    number | null
  >(null);
  const [detectingPendingDuration, setDetectingPendingDuration] =
    useState(false);
  const [pendingDragOver, setPendingDragOver] = useState(false);
  const [autoStartUploadLessonId, setAutoStartUploadLessonId] = useState<
    string | null
  >(null);
  const [modalError, setModalError] = useState("");
  const isSubmittingLessonRef = useRef(false);

  const loadModules = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load curriculum.");
      }

      setModules(data);
      setExpandedModules((prev) =>
        prev.length === 0 ? data.map((m: Module) => m.id) : prev,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load curriculum.",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  function toggleModule(moduleId: string) {
    setExpandedModules((previous) =>
      previous.includes(moduleId)
        ? previous.filter((id) => id !== moduleId)
        : [...previous, moduleId],
    );
  }

  async function addModule() {
    const title = newModuleTitle.trim();
    if (!title) {
      setError("Please enter a module title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to add module.");
      }

      setNewModuleTitle("");
      setExpandedModules((previous) => [...previous, data.id]);
      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add module.");
    } finally {
      setSaving(false);
    }
  }

  async function saveModule(moduleId: string) {
    const title = editingModuleTitle.trim();
    if (!title) {
      setError("Module title cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to rename module.");
      }

      setEditingModuleId(null);
      setEditingModuleTitle("");
      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to rename module.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module and all of its lessons?")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to delete module.");
      }

      setExpandedModules((previous) =>
        previous.filter((id) => id !== moduleId),
      );
      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete module.");
    } finally {
      setSaving(false);
    }
  }

  function openAddLesson(moduleId: string) {
    setLessonModuleId(moduleId);
    setEditingLessonId(null);
    setLessonForm(emptyLessonForm);
    setPendingVideoFile(null);
    setPendingVideoDuration(null);
    setAutoStartUploadLessonId(null);
    setModalError("");
  }

  function openEditLesson(moduleId: string, lesson: Lesson) {
    setLessonModuleId(moduleId);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      isPreview: lesson.isPreview,
    });
    setPendingVideoFile(null);
    setPendingVideoDuration(null);
    setAutoStartUploadLessonId(null);
    setModalError("");
  }

  function closeLessonModal() {
    setLessonModuleId(null);
    setEditingLessonId(null);
    setLessonForm(emptyLessonForm);
    setPendingVideoFile(null);
    setPendingVideoDuration(null);
    setAutoStartUploadLessonId(null);
    setModalError("");
  }

  async function handleSelectPendingVideo(file: File | null) {
    setPendingVideoFile(file);
    setPendingVideoDuration(null);
    if (!file) return;
    setDetectingPendingDuration(true);
    const secs = await detectVideoDuration(file);
    setPendingVideoDuration(secs);
    setDetectingPendingDuration(false);
  }

  function syncLessonStatusInState(
    moduleId: string,
    lessonId: string,
    newStatus: Lesson["videoStatus"],
    newVideoId: string | null,
    newDuration?: number | null,
  ) {
    setModules((prevModules) =>
      prevModules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      videoStatus: newStatus,
                      bunnyVideoId: newVideoId,
                      durationSeconds:
                        newDuration !== undefined
                          ? newDuration
                          : l.durationSeconds,
                    }
                  : l,
              ),
            }
          : m,
      ),
    );
  }

  async function saveLesson() {
    if (!lessonModuleId || isSubmittingLessonRef.current || saving) return;

    const title = lessonForm.title.trim();
    if (!title) {
      setModalError("Please enter a lesson title.");
      return;
    }

    isSubmittingLessonRef.current = true;
    setSaving(true);
    setModalError("");

    try {
      const baseUrl = `/api/admin/courses/${courseId}/modules/${lessonModuleId}/lessons`;

      if (editingLessonId) {
        const response = await fetch(`${baseUrl}/${editingLessonId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: lessonForm.description.trim() || null,
            isPreview: lessonForm.isPreview,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to update lesson.");
        }

        closeLessonModal();
        await loadModules();
      } else {
        const createResponse = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: lessonForm.description.trim() || null,
          }),
        });

        const createdLesson = await createResponse.json();
        if (!createResponse.ok) {
          throw new Error(createdLesson.message || "Unable to create lesson.");
        }

        const updateResponse = await fetch(`${baseUrl}/${createdLesson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: lessonForm.description.trim() || null,
            durationSeconds: pendingVideoDuration ?? null,
            isPreview: lessonForm.isPreview,
          }),
        });

        const updatedData = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new Error(
            updatedData.error || "Lesson created, but settings could not be saved.",
          );
        }

        await loadModules();

        if (pendingVideoFile) {
          setEditingLessonId(createdLesson.id);
          setAutoStartUploadLessonId(createdLesson.id);
        } else {
          closeLessonModal();
        }
      }
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Unable to save lesson.",
      );
    } finally {
      isSubmittingLessonRef.current = false;
      setSaving(false);
    }
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to delete lesson.");
      }

      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete lesson.");
    } finally {
      setSaving(false);
    }
  }

  const summary = useMemo(() => {
    const allLessons = modules.flatMap((m) => m.lessons);
    const ready = allLessons.filter((l) => l.videoStatus === "READY").length;
    const processing = allLessons.filter(
      (l) => l.videoStatus === "PROCESSING",
    ).length;
    const totalSeconds = allLessons.reduce(
      (sum, l) =>
        sum + (l.durationSeconds && l.durationSeconds > 0 ? l.durationSeconds : 0),
      0,
    );

    return {
      modulesCount: modules.length,
      lessonsCount: allLessons.length,
      ready,
      processing,
      totalSeconds,
    };
  }, [modules]);

  const activeEditingLesson = useMemo(() => {
    if (!editingLessonId) return null;
    for (const m of modules) {
      const found = m.lessons.find((l) => l.id === editingLessonId);
      if (found) return found;
    }
    return null;
  }, [editingLessonId, modules]);

  const activeModuleTitle = useMemo(() => {
    if (!lessonModuleId) return "";
    return modules.find((m) => m.id === lessonModuleId)?.title || "";
  }, [lessonModuleId, modules]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#2a241d] bg-[#121110] p-8 text-center text-sm text-[#9b9488]">
        Loading curriculum...
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {/* Compact Header & Add Module Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#2a241d] bg-[#121110] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-[#f4e5c5]">
            Course Curriculum
          </h2>
          <p className="mt-1 text-xs text-[#8a857b]">
            {summary.modulesCount}{" "}
            {summary.modulesCount === 1 ? "Module" : "Modules"} ·{" "}
            {summary.lessonsCount}{" "}
            {summary.lessonsCount === 1 ? "Lesson" : "Lessons"}
            {summary.lessonsCount > 0 && (
              <>
                {" · "}
                <span className="text-emerald-300">
                  {summary.ready} Ready
                </span>
                {summary.processing > 0 && (
                  <>
                    {" · "}
                    <span className="text-amber-300">
                      {summary.processing} Preparing
                    </span>
                  </>
                )}
                {summary.totalSeconds > 0 && (
                  <> · {formatVideoDuration(summary.totalSeconds)} total</>
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto sm:min-w-[340px]">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addModule();
            }}
            placeholder="New module title..."
            className="flex-1 rounded-xl border border-[#2e2720] bg-[#0b0c0c] px-3.5 py-2 text-xs text-[#f4e5c5] outline-none transition placeholder:text-[#5e574d] focus:border-[#c9a66a]"
          />
          <button
            type="button"
            disabled={saving}
            onClick={addModule}
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-4 py-2 text-xs font-semibold text-[#1a140d] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
          >
            + Add Module
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Module List */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#3a3025] bg-[#11100f] p-10 text-center">
          <p className="text-sm text-[#cfc6b8]">No modules yet</p>
          <p className="mt-1 text-xs text-[#7a7469]">
            Add your first module above to begin organizing lessons and videos.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.includes(module.id);
            const modLessons = module.lessons.length;
            const modReady = module.lessons.filter(
              (l) => l.videoStatus === "READY",
            ).length;
            const modProcessing = module.lessons.filter(
              (l) => l.videoStatus === "PROCESSING",
            ).length;
            const modMissing = modLessons - modReady - modProcessing;
            const readyPercent =
              modLessons > 0 ? Math.round((modReady / modLessons) * 100) : 0;

            return (
              <div
                key={module.id}
                className="overflow-hidden rounded-2xl border border-[#2a241d] bg-[#11100f] transition-colors hover:border-[#3d3224]"
              >
                {/* Module Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#c9a66a]/30 bg-[#c9a66a]/10 text-xs font-semibold text-[#d8b16d]">
                      {String(moduleIndex + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#f4e5c5]">
                        {module.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[#7a7469]">
                        <span>
                          {modLessons} {modLessons === 1 ? "Lesson" : "Lessons"}
                        </span>
                        {modLessons > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-300/90">
                              {modReady} Ready
                            </span>
                            {modProcessing > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-amber-300/90">
                                  {modProcessing} Preparing
                                </span>
                              </>
                            )}
                            {modMissing > 0 && (
                              <>
                                <span>·</span>
                                <span>{modMissing} Missing</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {modLessons > 0 && (
                        <div className="mt-1.5 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-[#1e1a16]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#c9a66a] to-emerald-400 transition-all duration-500"
                            style={{ width: `${readyPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openAddLesson(module.id)}
                      className="rounded-lg border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-2.5 py-1.5 text-xs font-medium text-[#e5be75] transition hover:bg-[#c9a66a]/20"
                    >
                      + Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModuleId(module.id);
                        setEditingModuleTitle(module.title);
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-[#9b9488] transition hover:bg-white/5 hover:text-[#e8dfd1]"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deleteModule(module.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-rose-300/80 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      aria-label={isExpanded ? "Collapse module" : "Expand module"}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-xs text-[#8a857b] transition hover:bg-white/5 hover:text-[#c9a66a]"
                    >
                      {isExpanded ? "−" : "+"}
                    </button>
                  </div>
                </div>

                {/* Inline Rename Module */}
                {editingModuleId === module.id && (
                  <div className="animate-kbc-in border-t border-[#211d18] bg-[#0c0c0b] px-4 py-3 sm:px-5">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        autoFocus
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveModule(module.id);
                        }}
                        className="flex-1 rounded-xl border border-[#3a3025] bg-[#121110] px-3 py-2 text-xs text-[#f4e5c5] outline-none focus:border-[#c9a66a]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveModule(module.id)}
                          disabled={saving}
                          className="rounded-xl bg-[#c9a66a] px-3.5 py-2 text-xs font-medium text-[#17130d] disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingModuleId(null);
                            setEditingModuleTitle("");
                          }}
                          className="rounded-xl border border-[#2e2720] px-3.5 py-2 text-xs text-[#9b9488] hover:text-[#e8dfd1]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lessons List */}
                {isExpanded && (
                  <div className="border-t border-[#211d18] bg-[#0c0c0b]">
                    {module.lessons.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <p className="text-xs text-[#7a7469]">
                          No lessons in this module yet.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#1c1915]">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const videoMeta =
                            VIDEO_STATUS_META[lesson.videoStatus];

                          return (
                            <div
                              key={lesson.id}
                              className="flex flex-col gap-3 px-4 py-3.5 transition hover:bg-white/[0.015] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <span className="mt-0.5 text-xs font-mono text-[#7a7469]">
                                  {moduleIndex + 1}.{lessonIndex + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-[#e8dcc5]">
                                      {lesson.title}
                                    </p>
                                    {lesson.isPreview && (
                                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                                        Free preview
                                      </span>
                                    )}
                                  </div>
                                  {lesson.description && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-[#7a7469]">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11px]">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium ${videoMeta.pillClass}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${videoMeta.dotClass}`}
                                      />
                                      {videoMeta.label}
                                    </span>
                                    {lesson.durationSeconds &&
                                      lesson.durationSeconds > 0 && (
                                        <span className="text-[#8a857b]">
                                          {formatVideoDuration(
                                            lesson.durationSeconds,
                                          )}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditLesson(module.id, lesson)
                                  }
                                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${videoMeta.actionClass}`}
                                >
                                  {videoMeta.actionLabel}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditLesson(module.id, lesson)
                                  }
                                  className="rounded-lg px-2.5 py-1.5 text-xs text-[#9b9488] transition hover:bg-white/5 hover:text-[#e8dfd1]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() =>
                                    deleteLesson(module.id, lesson.id)
                                  }
                                  className="rounded-lg px-2.5 py-1.5 text-xs text-rose-300/80 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="border-t border-[#1c1915] px-4 py-2.5 sm:px-5">
                      <button
                        type="button"
                        onClick={() => openAddLesson(module.id)}
                        className="text-xs font-medium text-[#c9a66a] transition hover:text-[#f0cf91]"
                      >
                        + Add Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Focused Lesson Editor Modal (Create, Edit & Video Upload) */}
      {lessonModuleId && (
        <div
          className="animate-kbc-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeLessonModal}
        >
          <div
            className="animate-kbc-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D6AD65]/30 bg-[#15120F] p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#26211b] pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#c9a66a]">
                  {activeModuleTitle}
                </p>
                <h3 className="mt-0.5 font-serif text-xl font-medium text-[#f4e5c5]">
                  {editingLessonId ? "Edit Lesson" : "New Lesson"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLessonModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2e2720] text-xs text-[#8a857b] transition hover:text-[#e8dfd1]"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              {/* Lesson Title */}
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Lesson Title <span className="text-rose-400">*</span>
                </label>
                <input
                  autoFocus
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Introduction to Hair Styling"
                  className="w-full rounded-xl border border-[#2e2720] bg-[#0b0c0c] px-3.5 py-2.5 text-xs text-[#f4e5c5] outline-none transition placeholder:text-[#55534d] focus:border-[#c9a66a]"
                />
              </div>

              {/* Lesson Description */}
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={lessonForm.description}
                  onChange={(e) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief overview of what students will learn..."
                  className="w-full resize-none rounded-xl border border-[#2e2720] bg-[#0b0c0c] p-3 text-xs leading-relaxed text-[#f4e5c5] outline-none transition placeholder:text-[#55534d] focus:border-[#c9a66a]"
                />
              </div>

              {/* Free Preview Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#26211b] bg-[#0b0c0c] px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-medium text-[#e8dfd1]">
                    Free Preview
                  </p>
                  <p className="text-[11px] text-[#7a7469]">
                    Allow students to watch this lesson before enrolling
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={lessonForm.isPreview}
                  onChange={(e) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      isPreview: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#c9a66a]"
                />
              </label>

              {/* Integrated Lesson Video Section */}
              <div className="space-y-3 border-t border-[#26211b] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#e8dfd1]">
                    Lesson Video {!editingLessonId && "(Optional)"}
                  </p>
                  {(editingLessonId
                    ? activeEditingLesson?.durationSeconds
                    : pendingVideoFile) && (
                    <span className="text-[11px] text-[#c9a66a]">
                      Duration:{" "}
                      {editingLessonId
                        ? formatVideoDuration(
                            activeEditingLesson?.durationSeconds,
                          )
                        : detectingPendingDuration
                          ? "Detecting..."
                          : formatVideoDuration(pendingVideoDuration)}
                    </span>
                  )}
                </div>

                {editingLessonId && activeEditingLesson ? (
                  <LessonVideoUploader
                    courseId={courseId}
                    moduleId={lessonModuleId}
                    lessonId={editingLessonId}
                    initialVideoId={activeEditingLesson.bunnyVideoId}
                    initialStatus={activeEditingLesson.videoStatus}
                    initialDuration={activeEditingLesson.durationSeconds}
                    courseImageUrl={courseImageUrl}
                    autoStartFile={
                      autoStartUploadLessonId === editingLessonId
                        ? pendingVideoFile
                        : null
                    }
                    autoStartDuration={pendingVideoDuration}
                    onStatusChange={(newStatus, newVideoId, newDuration) =>
                      syncLessonStatusInState(
                        lessonModuleId,
                        editingLessonId,
                        newStatus,
                        newVideoId,
                        newDuration,
                      )
                    }
                  />
                ) : (
                  <div className="space-y-2.5">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setPendingDragOver(true);
                      }}
                      onDragLeave={() => setPendingDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setPendingDragOver(false);
                        const dropped = e.dataTransfer.files?.[0];
                        if (dropped) {
                          handleSelectPendingVideo(dropped);
                        }
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition ${
                        pendingDragOver
                          ? "border-[#c9a66a] bg-[#c9a66a]/10"
                          : "border-[#3a3025] bg-[#0b0c0c] hover:border-[#c9a66a]/60"
                      }`}
                    >
                      <p className="text-xs text-[#8a857b]">
                        Drag and drop a video here, or
                      </p>
                      <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-4 py-1.5 text-xs font-semibold text-[#1a140d] transition hover:opacity-95">
                        <span>Choose Video</span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          onChange={(e) =>
                            handleSelectPendingVideo(e.target.files?.[0] ?? null)
                          }
                          className="hidden"
                        />
                      </label>
                      <p className="mt-2 text-[11px] text-[#635d54]">
                        MP4, MOV, WebM · Max 500MB
                      </p>
                    </div>

                    {pendingVideoFile && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2e2720] bg-[#0b0c0c] p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#e8dcc5]">
                            {pendingVideoFile.name}
                          </p>
                          <p className="text-[11px] text-[#7a7469]">
                            {(pendingVideoFile.size / (1024 * 1024)).toFixed(
                              1,
                            )}{" "}
                            MB ·{" "}
                            {detectingPendingDuration
                              ? "Detecting duration..."
                              : formatVideoDuration(pendingVideoDuration)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectPendingVideo(null)}
                          className="rounded-lg px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#26211b] pt-4">
              <button
                type="button"
                onClick={closeLessonModal}
                className="rounded-xl border border-[#2e2720] px-4 py-2 text-xs text-[#9b9488] transition hover:bg-white/5 hover:text-[#e8dfd1]"
              >
                {editingLessonId ? "Done" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveLesson}
                className="rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-5 py-2 text-xs font-semibold text-[#1a140d] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingLessonId
                    ? "Save Changes"
                    : pendingVideoFile
                      ? "Create & Upload Video"
                      : "Create Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
