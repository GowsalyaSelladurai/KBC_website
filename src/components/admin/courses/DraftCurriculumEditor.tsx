"use client";

import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import {
  detectVideoDuration,
  formatVideoDuration,
} from "@/lib/videoDuration";
import {
  countValidUploadedVideos,
  parseCourseDurationDays,
  type VideoStatusValue,
} from "@/lib/courses/validation";

export type EditorLesson = {
  clientId: string;
  id?: string;
  title: string;
  description: string | null;
  sortOrder: number;
  durationSeconds: number | null;
  isPreview: boolean;
  bunnyVideoId: string | null;
  videoStatus: VideoStatusValue;
};

export type EditorModule = {
  clientId: string;
  id?: string;
  title: string;
  sortOrder: number;
  lessons: EditorLesson[];
};

const STATUS_BADGE: Record<
  VideoStatusValue,
  { label: string; pillClass: string; dotClass: string }
> = {
  READY: {
    label: "Video ready",
    pillClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClass: "bg-emerald-400",
  },
  PROCESSING: {
    label: "Preparing",
    pillClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClass: "bg-amber-400 animate-pulse",
  },
  FAILED: {
    label: "Upload failed",
    pillClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    dotClass: "bg-rose-400",
  },
  NOT_UPLOADED: {
    label: "No video",
    pillClass: "border-[#3a3025] bg-[#161412] text-[#9b9488]",
    dotClass: "bg-[#6d665c]",
  },
};

function makeClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface DraftCurriculumEditorProps {
  duration: string;
  courseImageUrl?: string | null;
  modules: EditorModule[];
  onChange: React.Dispatch<React.SetStateAction<EditorModule[]>>;
}

export default function DraftCurriculumEditor({
  duration,
  courseImageUrl = null,
  modules,
  onChange,
}: DraftCurriculumEditorProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [renamingModuleId, setRenamingModuleId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");

  // Modal state for adding/editing a lesson + uploading its video in memory
  const [modalModuleClientId, setModalModuleClientId] = useState<string | null>(
    null,
  );
  const [editingLessonClientId, setEditingLessonClientId] = useState<
    string | null
  >(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonVideoId, setLessonVideoId] = useState<string | null>(null);
  const [lessonVideoStatus, setLessonVideoStatus] =
    useState<VideoStatusValue>("NOT_UPLOADED");
  const [lessonDurationSeconds, setLessonDurationSeconds] = useState<
    number | null
  >(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  // Upload state inside modal
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [modalError, setModalError] = useState("");

  const tusRef = useRef<tus.Upload | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
      if (tusRef.current) tusRef.current.abort();
    };
  }, []);

  // Auto-expand newly loaded modules on first load
  useEffect(() => {
    if (modules.length > 0 && expandedModules.length === 0) {
      setExpandedModules(modules.map((m) => m.clientId));
    }
  }, [modules, expandedModules.length]);

  const requiredVideos = parseCourseDurationDays(duration);
  const uploadedCount = countValidUploadedVideos(modules);

  function stopPolling() {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }

  function handleAddModule() {
    const nextNumber = modules.length + 1;
    const newMod: EditorModule = {
      clientId: makeClientId("mod"),
      title: `Module ${nextNumber}`,
      sortOrder: modules.length,
      lessons: [],
    };
    onChange((prev) => [...prev, newMod]);
    setExpandedModules((prev) => [...prev, newMod.clientId]);
    setRenamingModuleId(newMod.clientId);
    setRenameText(newMod.title);
  }

  function handleConfirmRename(clientId: string) {
    const trimmed = renameText.trim();
    if (!trimmed) return;
    onChange((prev) =>
      prev.map((m) => (m.clientId === clientId ? { ...m, title: trimmed } : m)),
    );
    setRenamingModuleId(null);
    setRenameText("");
  }

  function handleDeleteModule(clientId: string) {
    onChange((prev) =>
      prev
        .filter((m) => m.clientId !== clientId)
        .map((m, idx) => ({ ...m, sortOrder: idx })),
    );
  }

  function openNewLessonModal(moduleClientId: string) {
    stopPolling();
    setModalModuleClientId(moduleClientId);
    setEditingLessonClientId(null);
    setLessonTitle("");
    setLessonDescription("");
    setLessonIsPreview(false);
    setLessonVideoId(null);
    setLessonVideoStatus("NOT_UPLOADED");
    setLessonDurationSeconds(null);
    setEmbedUrl(null);
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadMessage("");
    setUploadError("");
    setModalError("");
  }

  function openEditLessonModal(moduleClientId: string, lesson: EditorLesson) {
    stopPolling();
    setModalModuleClientId(moduleClientId);
    setEditingLessonClientId(lesson.clientId);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || "");
    setLessonIsPreview(lesson.isPreview);
    setLessonVideoId(lesson.bunnyVideoId);
    setLessonVideoStatus(lesson.videoStatus);
    setLessonDurationSeconds(lesson.durationSeconds);
    setEmbedUrl(null);
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadMessage("");
    setUploadError("");
    setModalError("");

    if (lesson.bunnyVideoId) {
      fetch(`/api/admin/videos/${lesson.bunnyVideoId}/status`, {
        cache: "no-store",
      })
        .then(async (r) => {
          const data = await r.json().catch(() => null);
          return { ok: r.ok, status: r.status, data };
        })
        .then(({ ok, data }) => {
          if (!data) return;
          if (!ok || data.exists === false) {
            setEmbedUrl(null);
            setUploadError(
              data.error ||
                "Video is unavailable or no longer exists in Bunny Stream.",
            );
            return;
          }
          if (data.embedUrl) setEmbedUrl(data.embedUrl);
          if (data.videoStatus) setLessonVideoStatus(data.videoStatus);
          if (typeof data.durationSeconds === "number") {
            setLessonDurationSeconds(data.durationSeconds);
          }
        })
        .catch(() => {});
    }
  }

  function closeModal() {
    if (uploading && tusRef.current) {
      tusRef.current.abort();
    }
    stopPolling();
    setModalModuleClientId(null);
    setEditingLessonClientId(null);
    setUploading(false);
  }

  async function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    setUploadError("");
    setUploadMessage("");
    if (!file) return;

    setDetectingDuration(true);
    const secs = await detectVideoDuration(file);
    if (secs && secs > 0) {
      setLessonDurationSeconds(secs);
    }
    setDetectingDuration(false);
  }

  function startStatusPoll(videoId: string) {
    stopPolling();
    let attempts = 0;

    async function tick() {
      attempts++;
      try {
        const res = await fetch(
          `/api/admin/videos/${videoId}/status?afterUpload=1`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.embedUrl) setEmbedUrl(data.embedUrl);
          if (data.durationSeconds)
            setLessonDurationSeconds(data.durationSeconds);
          if (data.videoStatus === "READY") {
            setLessonVideoStatus("READY");
            setUploadMessage("Video is ready for playback.");
            stopPolling();
            return;
          }
          if (data.videoStatus === "FAILED") {
            setLessonVideoStatus("FAILED");
            setUploadError(
              "This video could not be prepared. Please try uploading again.",
            );
            stopPolling();
            return;
          }
        }
      } catch {
        // continue polling
      }

      if (attempts < 40) {
        pollRef.current = setTimeout(tick, 4000);
      }
    }

    pollRef.current = setTimeout(tick, 3500);
  }

  async function handleUploadSelectedVideo() {
    if (!selectedFile || uploading) return;
    if (selectedFile.size > 500 * 1024 * 1024) {
      setUploadError("File exceeds maximum allowed size (500MB).");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadMessage("Starting upload...");

    try {
      const prepRes = await fetch("/api/admin/videos/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle.trim() || selectedFile.name,
        }),
      });
      const creds = await prepRes.json();
      if (!prepRes.ok) {
        throw new Error(
          creds.error || "Could not start video upload. Please try again.",
        );
      }

      const upload = new tus.Upload(selectedFile, {
        endpoint: creds.endpoint,
        headers: {
          AuthorizationSignature: creds.signature,
          AuthorizationExpire: String(creds.expirationTime),
          VideoId: creds.videoId,
          LibraryId: creds.libraryId,
        },
        metadata: {
          filetype: selectedFile.type || "video/mp4",
          title: selectedFile.name,
        },
        retryDelays: [0, 3000, 5000, 10000],
        onProgress(uploaded, total) {
          const pct = Math.round((uploaded / total) * 100);
          setUploadProgress(pct);
          setUploadMessage(`Uploading video: ${pct}%`);
        },
        onError() {
          setUploading(false);
          setLessonVideoStatus("FAILED");
          setUploadError("Upload was interrupted. Click Retry to try again.");
        },
        onSuccess() {
          setUploading(false);
          setUploadProgress(100);
          setLessonVideoId(creds.videoId);
          setLessonVideoStatus("PROCESSING");
          setEmbedUrl(creds.embedUrl || null);
          setSelectedFile(null);
          setUploadMessage("Upload complete! Video is being prepared...");
          startStatusPoll(creds.videoId);
        },
      });

      tusRef.current = upload;
      upload.start();
    } catch (err) {
      setUploading(false);
      setUploadError(
        err instanceof Error
          ? err.message
          : "Could not start video upload. Please try again.",
      );
    }
  }

  function handleSaveLessonInState() {
    if (!modalModuleClientId) return;
    const trimmedTitle = lessonTitle.trim();
    if (!trimmedTitle) {
      setModalError("Please enter a lesson title.");
      return;
    }
    if (uploading) {
      setModalError("Please wait for the video upload to finish.");
      return;
    }

    onChange((prev) =>
      prev.map((mod) => {
        if (mod.clientId !== modalModuleClientId) return mod;

        if (editingLessonClientId) {
          return {
            ...mod,
            lessons: mod.lessons.map((l) =>
              l.clientId === editingLessonClientId
                ? {
                    ...l,
                    title: trimmedTitle,
                    description: lessonDescription.trim() || null,
                    isPreview: lessonIsPreview,
                    bunnyVideoId: lessonVideoId,
                    videoStatus: lessonVideoStatus,
                    durationSeconds: lessonDurationSeconds,
                  }
                : l,
            ),
          };
        }

        const newLesson: EditorLesson = {
          clientId: makeClientId("les"),
          title: trimmedTitle,
          description: lessonDescription.trim() || null,
          sortOrder: mod.lessons.length,
          durationSeconds: lessonDurationSeconds,
          isPreview: lessonIsPreview,
          bunnyVideoId: lessonVideoId,
          videoStatus: lessonVideoStatus,
        };

        return {
          ...mod,
          lessons: [...mod.lessons, newLesson],
        };
      }),
    );

    closeModal();
  }

  function handleDeleteLesson(moduleClientId: string, lessonClientId: string) {
    onChange((prev) =>
      prev.map((mod) =>
        mod.clientId === moduleClientId
          ? {
              ...mod,
              lessons: mod.lessons
                .filter((l) => l.clientId !== lessonClientId)
                .map((l, idx) => ({ ...l, sortOrder: idx })),
            }
          : mod,
      ),
    );
  }

  return (
    <section className="kbc-gold-card space-y-4 rounded-2xl p-5 sm:p-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D6AD65] to-[#F1D69A] text-xs font-bold text-[#090807]">
              3
            </span>
            <h2 className="font-serif text-lg font-medium text-white">
              Course Curriculum
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#BDB4A7]">
            Organize your course into modules and lessons
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {requiredVideos !== null && (
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${
                uploadedCount >= requiredVideos
                  ? "border-emerald-500/35 bg-emerald-950/60 text-emerald-300"
                  : "border-[#D6AD65]/35 bg-[#211A12] text-[#F1D69A]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  uploadedCount >= requiredVideos
                    ? "bg-emerald-400"
                    : "bg-[#D6AD65]"
                }`}
              />
              <span>
                Videos: {uploadedCount} / {requiredVideos} min
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddModule}
            className="kbc-gold-btn"
          >
            <span>+</span>
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D6AD65]/30 bg-[#090807] p-8 text-center">
          <p className="text-sm text-white">No modules added yet</p>
          <p className="mt-1 text-xs text-[#BDB4A7]">
            Add a module to start building your course lessons and videos.
          </p>
          <button
            type="button"
            onClick={handleAddModule}
            className="kbc-gold-btn mt-4"
          >
            + Add Module
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, modIndex) => {
            const isExpanded = expandedModules.includes(mod.clientId);
            const modUploaded = countValidUploadedVideos([mod]);

            return (
              <div
                key={mod.clientId}
                className="overflow-hidden rounded-xl border border-[#D6AD65]/25 bg-[#090807] transition-colors"
              >
                {/* Module Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#15120F] px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedModules((prev) =>
                        prev.includes(mod.clientId)
                          ? prev.filter((id) => id !== mod.clientId)
                          : [...prev, mod.clientId],
                      )
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <svg
                      className={`h-4 w-4 shrink-0 text-[#D6AD65] transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D6AD65]/30 bg-[#211A12] text-[11px] font-semibold text-[#F1D69A]">
                      {String(modIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {mod.title}
                      </p>
                      <p className="text-[11px] text-[#BDB4A7]">
                        {mod.lessons.length}{" "}
                        {mod.lessons.length === 1 ? "Lesson" : "Lessons"} ·{" "}
                        <span className="text-emerald-300">
                          {modUploaded} Uploaded
                        </span>
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openNewLessonModal(mod.clientId)}
                      className="rounded-lg border border-[#D6AD65]/35 bg-[#211A12] px-2.5 py-1.5 text-xs font-medium text-[#F1D69A] transition hover:border-[#D6AD65]"
                    >
                      + Add Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingModuleId(mod.clientId);
                        setRenameText(mod.title);
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-[#BDB4A7] transition hover:bg-[#211A12] hover:text-white"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.clientId)}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-rose-300/80 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline Rename inside module */}
                {renamingModuleId === mod.clientId && (
                  <div className="border-t border-[#211d18] bg-[#0c0c0b] px-4 py-3 sm:px-5">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        autoFocus
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleConfirmRename(mod.clientId);
                          }
                        }}
                        className="flex-1 rounded-xl border border-[#3a3025] bg-[#121110] px-3 py-2 text-xs text-[#f4e5c5] outline-none focus:border-[#c9a66a]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmRename(mod.clientId)}
                          className="rounded-xl bg-[#c9a66a] px-3.5 py-2 text-xs font-medium text-[#17130d]"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingModuleId(null)}
                          className="rounded-xl border border-[#2e2720] px-3.5 py-2 text-xs text-[#9b9488]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lessons inside module */}
                {isExpanded && (
                  <div className="border-t border-[#211d18] bg-[#0c0c0b]">
                    {mod.lessons.length === 0 ? (
                      <div className="px-5 py-6 text-center text-xs text-[#7a7469]">
                        No lessons in this module yet. Click{" "}
                        <button
                          type="button"
                          onClick={() => openNewLessonModal(mod.clientId)}
                          className="text-[#c9a66a] underline"
                        >
                          + Add Lesson
                        </button>{" "}
                        to add a lesson and upload its video.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#1c1915]">
                        {mod.lessons.map((lesson, lessonIndex) => {
                          const badge = STATUS_BADGE[lesson.videoStatus];

                          return (
                            <div
                              key={lesson.clientId}
                              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-lg border border-[#D6AD65]/20 bg-[#15120F]">
                                  {lesson.bunnyVideoId ? (
                                    <img
                                      src={
                                        courseImageUrl ||
                                        `/api/admin/videos/${lesson.bunnyVideoId}/thumbnail`
                                      }
                                      alt={lesson.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : courseImageUrl ? (
                                    <img
                                      src={courseImageUrl}
                                      alt={lesson.title}
                                      className="h-full w-full object-cover opacity-75"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-[#D6AD65]/50">
                                      ✦
                                    </div>
                                  )}
                                </div>
                                <span className="mt-0.5 font-mono text-xs text-[#7a7469]">
                                  {modIndex + 1}.{lessonIndex + 1}
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
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium ${badge.pillClass}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
                                      />
                                      {badge.label}
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

                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditLessonModal(mod.clientId, lesson)
                                  }
                                  className="rounded-lg border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-2.5 py-1.5 text-xs font-medium text-[#e5be75] transition hover:bg-[#c9a66a]/20"
                                >
                                  {lesson.bunnyVideoId
                                    ? "Edit / Video"
                                    : "Upload Video"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteLesson(
                                      mod.clientId,
                                      lesson.clientId,
                                    )
                                  }
                                  className="rounded-lg px-2.5 py-1.5 text-xs text-rose-300/80 transition hover:bg-rose-500/10 hover:text-rose-300"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Module button inside Curriculum section (below modules) */}
          <button
            type="button"
            onClick={handleAddModule}
            className="w-full rounded-2xl border border-dashed border-[#80623c]/50 bg-[#11100f] py-3.5 text-xs font-medium text-[#d8b16d] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/10"
          >
            + Add Another Module
          </button>
        </div>
      )}

      {/* Focused Lesson & Video Editor Modal */}
      {modalModuleClientId && (
        <div
          className="animate-kbc-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="animate-kbc-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D6AD65]/30 bg-[#15120F] p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#26211b] pb-4">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#f4e5c5]">
                  {editingLessonClientId ? "Edit Lesson" : "Add Lesson"}
                </h3>
                <p className="mt-0.5 text-xs text-[#8a857b]">
                  Configure lesson details and upload your lesson video.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2e2720] text-xs text-[#8a857b] hover:text-[#e8dfd1]"
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
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Lesson Title <span className="text-rose-400">*</span>
                </label>
                <input
                  autoFocus
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Foundation & Base Techniques"
                  className="w-full rounded-xl border border-[#2e2720] bg-[#0b0c0c] px-3.5 py-2.5 text-xs text-[#f4e5c5] outline-none focus:border-[#c9a66a]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Brief summary of this lesson..."
                  className="w-full resize-none rounded-xl border border-[#2e2720] bg-[#0b0c0c] p-3 text-xs text-[#f4e5c5] outline-none focus:border-[#c9a66a]"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#26211b] bg-[#0b0c0c] px-3.5 py-2.5">
                <span className="text-xs text-[#e8dfd1]">
                  Allow free preview for this lesson
                </span>
                <input
                  type="checkbox"
                  checked={lessonIsPreview}
                  onChange={(e) => setLessonIsPreview(e.target.checked)}
                  className="h-4 w-4 accent-[#c9a66a]"
                />
              </label>

              {/* Video Upload & Preview */}
              <div className="space-y-3 border-t border-[#26211b] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#e8dfd1]">
                    Lesson Video
                  </p>
                  <span className="text-[11px] text-[#c9a66a]">
                    {detectingDuration
                      ? "Detecting duration..."
                      : lessonDurationSeconds
                        ? `Duration: ${formatVideoDuration(lessonDurationSeconds)}`
                        : "Duration auto-detected on upload"}
                  </span>
                </div>

                {uploadError && (
                  <div className="flex items-center justify-between rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <span>{uploadError}</span>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleUploadSelectedVideo}
                        className="ml-3 underline hover:text-white"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                {uploadMessage && !uploadError && (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                    {uploadMessage}
                  </div>
                )}

                {lessonVideoId &&
                (lessonVideoStatus === "READY" ||
                  lessonVideoStatus === "PROCESSING") &&
                !selectedFile ? (
                  <div className="space-y-3 rounded-xl border border-[#2e2720] bg-[#0b0c0c] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[lessonVideoStatus].pillClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_BADGE[lessonVideoStatus].dotClass}`}
                        />
                        {STATUS_BADGE[lessonVideoStatus].label}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer rounded-lg border border-[#3d3224] px-2.5 py-1 text-xs text-[#d8b16d] hover:bg-[#c9a66a]/10">
                          Replace Video
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={(e) =>
                              handleFileSelect(e.target.files?.[0] ?? null)
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setLessonVideoId(null);
                            setLessonVideoStatus("NOT_UPLOADED");
                            setEmbedUrl(null);
                            setUploadMessage("");
                          }}
                          className="rounded-lg border border-rose-500/25 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {lessonVideoStatus === "READY" && embedUrl && (
                      <div className="aspect-video overflow-hidden rounded-xl border border-[#26211b] bg-black">
                        <iframe
                          src={embedUrl}
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          className="h-full w-full border-0"
                          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!uploading && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          const dropped = e.dataTransfer.files?.[0];
                          if (dropped) handleFileSelect(dropped);
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition ${
                          dragOver
                            ? "border-[#c9a66a] bg-[#c9a66a]/10"
                            : "border-[#3a3025] bg-[#0b0c0c] hover:border-[#c9a66a]/60"
                        }`}
                      >
                        <p className="text-xs text-[#8a857b]">
                          Drag &amp; drop a video file here, or
                        </p>
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-4 py-1.5 text-xs font-semibold text-[#1a140d]">
                          <span>Choose Video</span>
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={(e) =>
                              handleFileSelect(e.target.files?.[0] ?? null)
                            }
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-[11px] text-[#635d54]">
                          MP4, MOV, WebM · Max 500MB
                        </p>
                      </div>
                    )}

                    {selectedFile && (
                      <div className="space-y-3 rounded-xl border border-[#2e2720] bg-[#0b0c0c] p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-[#e8dcc5]">
                              {selectedFile.name}
                            </p>
                            <p className="text-[11px] text-[#7a7469]">
                              {(selectedFile.size / (1024 * 1024)).toFixed(1)}{" "}
                              MB ·{" "}
                              {detectingDuration
                                ? "Detecting..."
                                : formatVideoDuration(lessonDurationSeconds)}
                            </p>
                          </div>

                          {!uploading && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleUploadSelectedVideo}
                                className="rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-3.5 py-1.5 text-xs font-semibold text-[#1a140d]"
                              >
                                Upload Video
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFileSelect(null)}
                                className="rounded-xl border border-[#2e2720] px-2.5 py-1.5 text-xs text-[#9b9488]"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {localPreviewUrl && !uploading && (
                          <video
                            src={localPreviewUrl}
                            poster={courseImageUrl || undefined}
                            controls
                            controlsList="nodownload"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                            className="aspect-video w-full rounded-lg border border-[#26211b] bg-black"
                          />
                        )}

                        {uploading && (
                          <div className="space-y-1.5">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#1e1b17]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#c9a66a] to-emerald-400 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-[#9b9488]">
                              {uploadProgress}% uploaded
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#26211b] pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#2e2720] px-4 py-2 text-xs text-[#9b9488] hover:text-[#e8dfd1]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={handleSaveLessonInState}
                className="rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-5 py-2 text-xs font-semibold text-[#1a140d] disabled:opacity-50"
              >
                {editingLessonClientId ? "Update Lesson" : "Save Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
