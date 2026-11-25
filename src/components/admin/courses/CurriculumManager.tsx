"use client";

import { useCallback, useEffect, useState } from "react";
import LessonVideoUploader from "./LessonVideoUploader";

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
  durationMinutes: string;
  isPreview: boolean;
};

const emptyLessonForm: LessonForm = {
  title: "",
  description: "",
  durationMinutes: "",
  isPreview: false,
};

const VIDEO_STATUS_META: Record<
  Lesson["videoStatus"],
  {
    label: string;
    pillClass: string;
    dotClass: string;
    buttonLabel: string;
    buttonClass: string;
  }
> = {
  READY: {
    label: "Video ready",
    pillClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClass: "bg-emerald-400",
    buttonLabel: "🎬 Preview / Manage Video",
    buttonClass:
      "border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  },
  PROCESSING: {
    label: "Processing",
    pillClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClass: "bg-amber-400 animate-pulse",
    buttonLabel: "⏳ View Processing",
    buttonClass:
      "border-amber-500/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
  },
  FAILED: {
    label: "Upload failed",
    pillClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dotClass: "bg-rose-400",
    buttonLabel: "⚠ Retry Lesson Video",
    buttonClass:
      "border-rose-500/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
  },
  NOT_UPLOADED: {
    label: "No video uploaded",
    pillClass: "border-[#3d3224] bg-[#161412] text-[#aaa59a]",
    dotClass: "bg-[#77736b]",
    buttonLabel: "🎬 Upload Lesson Video",
    buttonClass:
      "border-[#c9a66a]/50 bg-[#c9a66a]/15 text-[#f4e5c5] hover:bg-[#c9a66a]/25",
  },
};

export default function CurriculumManager({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);
  const [videoUploadLessonId, setVideoUploadLessonId] = useState<string | null>(
    null,
  );

  const loadModules = useCallback(async () => {
    setError("");

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load curriculum.");
      }

      setModules(data);
      // Auto-expand all modules so lessons and Upload Video buttons are visible
      setExpandedModules((prev) =>
        prev.length === 0 ? data.map((m: Module) => m.id) : prev,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load curriculum.",
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
      alert("Please enter a module title.");
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
        throw new Error(data.message || "Failed to create module.");
      }

      setNewModuleTitle("");
      setExpandedModules((previous) => [...previous, data.id]);
      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create module.");
    } finally {
      setSaving(false);
    }
  }

  async function saveModule(moduleId: string) {
    const title = editingModuleTitle.trim();

    if (!title) {
      alert("Module title is required.");
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
        throw new Error(data.message || "Failed to update module.");
      }

      setEditingModuleId(null);
      setEditingModuleTitle("");
      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update module.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteModule(moduleId: string) {
    if (
      !confirm(
        "Delete this module and all its lessons? This action cannot be undone.",
      )
    ) {
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
        throw new Error(data.message || "Failed to delete module.");
      }

      setExpandedModules((previous) =>
        previous.filter((id) => id !== moduleId),
      );

      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete module.");
    } finally {
      setSaving(false);
    }
  }

  function openAddLesson(moduleId: string) {
    setLessonModuleId(moduleId);
    setEditingLessonId(null);
    setLessonForm(emptyLessonForm);
  }

  function openEditLesson(moduleId: string, lesson: Lesson) {
    setLessonModuleId(moduleId);
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      durationMinutes:
        lesson.durationSeconds !== null && lesson.durationSeconds > 0
          ? String(Math.round(lesson.durationSeconds / 60))
          : "",
      isPreview: lesson.isPreview,
    });
  }

  function closeLessonForm() {
    setLessonModuleId(null);
    setEditingLessonId(null);
    setLessonForm(emptyLessonForm);
  }

  async function saveLesson() {
    if (!lessonModuleId) return;

    const title = lessonForm.title.trim();

    if (!title) {
      alert("Lesson title is required.");
      return;
    }

    const minutes = lessonForm.durationMinutes.trim();

    if (minutes && (!Number.isFinite(Number(minutes)) || Number(minutes) < 0)) {
      alert("Please enter a valid lesson duration in minutes.");
      return;
    }

    const durationSeconds = minutes ? Math.round(Number(minutes) * 60) : null;

    setSaving(true);
    setError("");

    try {
      const baseUrl = `/api/admin/courses/${courseId}/modules/${lessonModuleId}/lessons`;

      if (editingLessonId) {
        const response = await fetch(`${baseUrl}/${editingLessonId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: lessonForm.description.trim() || null,
            durationSeconds,
            isPreview: lessonForm.isPreview,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update lesson.");
        }
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
          throw new Error(createdLesson.message || "Failed to create lesson.");
        }

        const updateResponse = await fetch(`${baseUrl}/${createdLesson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: lessonForm.description.trim() || null,
            durationSeconds,
            isPreview: lessonForm.isPreview,
          }),
        });

        const updatedData = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(
            updatedData.error ||
              "Lesson created, but settings could not be saved.",
          );
        }
      }

      closeLessonForm();
      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lesson.");
    } finally {
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
        throw new Error(data.error || "Failed to delete lesson.");
      }

      await loadModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lesson.");
    } finally {
      setSaving(false);
    }
  }

  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#302a23] bg-[#121313] p-8 text-center text-sm text-[#aaa59a]">
        Loading curriculum...
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-[#302a23] bg-[#121313] p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#f4e5c5]">
            Course Curriculum
          </h2>
          <p className="mt-2 text-sm text-[#89877f]">
            Organize your course into modules and lessons.
          </p>
        </div>

        <div className="text-sm text-[#c9a66a]">
          {modules.length} modules · {totalLessons} lessons
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Add Module */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addModule();
          }}
          placeholder="Enter new module title"
          className="flex-1 rounded-xl border border-[#302a23] bg-[#0b0c0c] px-4 py-3 text-sm text-[#f4e5c5] outline-none transition focus:border-[#c9a66a]"
        />

        <button
          disabled={saving}
          onClick={addModule}
          className="rounded-xl bg-[#c9a66a] px-5 py-3 text-sm font-medium text-[#17130d] transition hover:bg-[#e2c18a] disabled:opacity-50"
        >
          + Add Module
        </button>
      </div>

      {/* Modules */}
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#40372d] p-10 text-center">
          <p className="text-[#aaa59a]">No modules added yet.</p>
          <p className="mt-2 text-xs text-[#77736b]">
            Start building your curriculum by adding your first module.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.includes(module.id);

            return (
              <div
                key={module.id}
                className="overflow-hidden rounded-xl border border-[#302a23] bg-[#0b0c0c]"
              >
                {/* Module Header */}
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#80623c]/30 bg-[#c9a66a]/10 text-sm text-[#c9a66a]">
                      {moduleIndex + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[#e8dcc5]">
                        {module.title}
                      </p>
                      <p className="mt-1 text-xs text-[#77736b]">
                        {module.lessons.length} lessons
                      </p>
                    </div>

                    <span className="text-[#c9a66a]">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingModuleId(module.id);
                        setEditingModuleTitle(module.title);
                      }}
                      className="rounded-lg border border-[#40372d] px-3 py-2 text-xs text-[#c9a66a] transition hover:bg-[#c9a66a]/10"
                    >
                      Rename
                    </button>

                    <button
                      onClick={() => deleteModule(module.id)}
                      disabled={saving}
                      className="rounded-lg border border-rose-500/20 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Rename Module */}
                {editingModuleId === module.id && (
                  <div className="border-t border-[#302a23] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        autoFocus
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveModule(module.id);
                        }}
                        className="flex-1 rounded-lg border border-[#40372d] bg-[#121313] px-3 py-2 text-sm text-[#f4e5c5] outline-none focus:border-[#c9a66a]"
                      />

                      <button
                        onClick={() => saveModule(module.id)}
                        disabled={saving}
                        className="rounded-lg bg-[#c9a66a] px-4 py-2 text-sm text-[#17130d] disabled:opacity-50"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingModuleId(null);
                          setEditingModuleTitle("");
                        }}
                        className="rounded-lg border border-[#40372d] px-4 py-2 text-sm text-[#aaa59a]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Module Content */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-[#302a23] p-4 sm:p-5">
                    {/* Lessons */}
                    {module.lessons.length === 0 ? (
                      <p className="py-4 text-center text-sm text-[#77736b]">
                        No lessons in this module yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const videoMeta = VIDEO_STATUS_META[lesson.videoStatus];
                          const isVideoOpen = videoUploadLessonId === lesson.id;

                          return (
                          <div
                            key={lesson.id}
                            className="flex flex-col gap-3 rounded-xl border border-[#302a23] bg-[#121313] p-4 sm:flex-row sm:flex-wrap sm:items-center"
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <span className="mt-0.5 text-xs text-[#89877f]">
                                {moduleIndex + 1}.{lessonIndex + 1}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-medium text-[#e8dcc5]">
                                  {lesson.title}
                                </p>

                                {lesson.description && (
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#89877f]">
                                    {lesson.description}
                                  </p>
                                )}

                                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs">
                                  <span className="text-[#89877f]">
                                    {lesson.durationSeconds !== null &&
                                    lesson.durationSeconds > 0
                                      ? `${Math.floor(lesson.durationSeconds / 60)} min${
                                          lesson.durationSeconds % 60
                                            ? ` ${lesson.durationSeconds % 60} sec`
                                            : ""
                                        }`
                                      : "Duration not set"}
                                  </span>

                                  {lesson.isPreview && (
                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                                      Free preview
                                    </span>
                                  )}

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${videoMeta.pillClass}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${videoMeta.dotClass}`}
                                    />
                                    {videoMeta.label}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  openEditLesson(module.id, lesson)
                                }
                                className="rounded-lg border border-[#40372d] px-3 py-2 text-xs text-[#c9a66a] transition hover:bg-[#c9a66a]/10"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  setVideoUploadLessonId(
                                    isVideoOpen ? null : lesson.id,
                                  )
                                }
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                  isVideoOpen
                                    ? "border-[#c9a66a] bg-[#c9a66a] text-[#17130d]"
                                    : videoMeta.buttonClass
                                }`}
                              >
                                {isVideoOpen
                                  ? "Close Lesson Video"
                                  : videoMeta.buttonLabel}
                              </button>

                              <button
                                onClick={() =>
                                  deleteLesson(module.id, lesson.id)
                                }
                                disabled={saving}
                                className="rounded-lg border border-rose-500/20 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>

                            {isVideoOpen && (
                              <div className="w-full space-y-3 rounded-xl border border-[#80623c]/40 bg-[#0b0c0c] p-4 sm:basis-full">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#26211b] pb-3">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="font-semibold uppercase tracking-wider text-[#c9a66a]">
                                      🎬 Lesson Video
                                    </span>
                                    <span className="text-[#55534d]">·</span>
                                    <span className="font-medium text-[#e8dcc5]">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${videoMeta.pillClass}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${videoMeta.dotClass}`}
                                    />
                                    {videoMeta.label}
                                  </span>
                                </div>

                                <LessonVideoUploader
                                  courseId={courseId}
                                  moduleId={module.id}
                                  lessonId={lesson.id}
                                  initialVideoId={lesson.bunnyVideoId}
                                  initialStatus={lesson.videoStatus}
                                  initialDuration={lesson.durationSeconds}
                                  onStatusChange={(
                                    newStatus,
                                    newVideoId,
                                    newDuration,
                                  ) => {
                                    setModules((prevModules) =>
                                      prevModules.map((m) =>
                                        m.id === module.id
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l) =>
                                                l.id === lesson.id
                                                  ? {
                                                      ...l,
                                                      videoStatus: newStatus,
                                                      bunnyVideoId: newVideoId,
                                                      durationSeconds:
                                                        newDuration !==
                                                        undefined
                                                          ? newDuration
                                                          : l.durationSeconds,
                                                    }
                                                  : l,
                                              ),
                                            }
                                          : m,
                                      ),
                                    );
                                  }}
                                  onClose={() => setVideoUploadLessonId(null)}
                                />
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Lesson */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => openAddLesson(module.id)}
                        className="flex-1 rounded-xl border border-dashed border-[#80623c]/50 px-4 py-3 text-sm text-[#c9a66a] transition hover:bg-[#c9a66a]/5"
                      >
                        + Add Lesson
                      </button>
                      <a
                        href={`/admin/courses/${courseId}/lessons/new?module=${module.id}`}
                        className="rounded-xl border border-blue-500/30 px-4 py-3 text-sm text-blue-300 transition hover:bg-blue-500/5"
                      >
                        🎬 Add Video Lesson
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lesson Form */}
      {lessonModuleId && (
        <div className="rounded-2xl border border-[#80623c]/40 bg-[#0b0c0c] p-5 sm:p-7">
          <div className="mb-6 border-b border-[#302a23] pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl text-[#f4e5c5]">
                  {editingLessonId ? "Edit Lesson" : "Create New Lesson"}
                </h3>
                <p className="mt-2 text-sm text-[#89877f]">
                  Configure the lesson content and learning settings.
                </p>
              </div>

              <button
                onClick={closeLessonForm}
                className="rounded-lg border border-[#40372d] px-3 py-2 text-xs text-[#aaa59a] transition hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Lesson Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#e8dcc5]">
                Lesson Title <span className="text-rose-400">*</span>
              </label>

              <input
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm((previous) => ({
                    ...previous,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g. Introduction to Hair Coloring"
                className="w-full rounded-xl border border-[#302a23] bg-[#121313] px-4 py-3 text-sm text-[#f4e5c5] outline-none transition placeholder:text-[#55534d] focus:border-[#c9a66a]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#e8dcc5]">
                Lesson Description
              </label>

              <textarea
                rows={4}
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm((previous) => ({
                    ...previous,
                    description: e.target.value,
                  }))
                }
                placeholder="Explain what students will learn in this lesson..."
                className="w-full resize-y rounded-xl border border-[#302a23] bg-[#121313] px-4 py-3 text-sm leading-6 text-[#f4e5c5] outline-none transition placeholder:text-[#55534d] focus:border-[#c9a66a]"
              />

              <p className="mt-2 text-xs text-[#77736b]">
                Briefly describe the concepts, techniques or skills covered.
              </p>
            </div>

            {/* Duration */}
            <div className="max-w-md">
              <label className="mb-2 block text-sm font-medium text-[#e8dcc5]">
                Lesson Duration
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={lessonForm.durationMinutes}
                  onChange={(e) =>
                    setLessonForm((previous) => ({
                      ...previous,
                      durationMinutes: e.target.value,
                    }))
                  }
                  placeholder="e.g. 15"
                  className="w-full rounded-xl border border-[#302a23] bg-[#121313] px-4 py-3 pr-20 text-sm text-[#f4e5c5] outline-none transition placeholder:text-[#55534d] focus:border-[#c9a66a]"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#89877f]">
                  Minutes
                </span>
              </div>
            </div>

            {/* Preview Setting */}
            <div className="rounded-xl border border-[#302a23] bg-[#121313] p-4 sm:p-5">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={lessonForm.isPreview}
                  onChange={(e) =>
                    setLessonForm((previous) => ({
                      ...previous,
                      isPreview: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-[#c9a66a]"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[#e8dcc5]">
                      Free Preview Lesson
                    </p>

                    {lessonForm.isPreview && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                        Enabled
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#77736b]">
                    Allow learners to access this lesson as a free preview.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 border-t border-[#302a23] pt-5">
              <button
                onClick={saveLesson}
                disabled={saving}
                className="rounded-xl bg-[#c9a66a] px-6 py-3 text-sm font-medium text-[#17130d] transition hover:bg-[#e2c18a] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingLessonId
                    ? "Save Changes"
                    : "Create Lesson"}
              </button>

              <button
                onClick={closeLessonForm}
                className="rounded-xl border border-[#40372d] px-6 py-3 text-sm text-[#aaa59a] transition hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {saving && (
        <p className="text-center text-xs text-[#89877f]">Saving changes...</p>
      )}
    </section>
  );
}
