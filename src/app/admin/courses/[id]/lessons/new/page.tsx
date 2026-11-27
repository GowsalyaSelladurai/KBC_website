"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as tus from "tus-js-client";
import {
  detectVideoDuration,
  formatVideoDuration,
} from "@/lib/videoDuration";

type Course = {
  id: string;
  courseCode: string;
  title: string;
  imageUrl: string | null;
};

type Module = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: {
    id: string;
    title: string;
    sortOrder: number;
  }[];
};

export default function AddVideoLessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const preselectedModuleId = searchParams.get("module");

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Retain created lesson state to prevent duplicate lesson creation upon retry
  const isSubmittingRef = useRef(false);
  const [createdLessonId, setCreatedLessonId] = useState<string | null>(null);
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null);

  // Form states (clean defaults, no fake video or duration)
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [detectedDurationSeconds, setDetectedDurationSeconds] = useState<
    number | null
  >(null);
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          fetch(`/api/admin/courses/${courseId}`, { cache: "no-store" }),
          fetch(`/api/admin/courses/${courseId}/modules`, {
            cache: "no-store",
          }),
        ]);

        const courseData = await courseRes.json();
        const modulesData = await modulesRes.json();

        if (!courseRes.ok)
          throw new Error(courseData.message || "Failed to load course.");
        if (!modulesRes.ok)
          throw new Error(modulesData.message || "Failed to load modules.");

        setCourse(courseData);
        setModules(modulesData);

        if (preselectedModuleId) {
          setSelectedModuleId(preselectedModuleId);
        } else if (modulesData.length > 0) {
          setSelectedModuleId(modulesData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, preselectedModuleId]);

  useEffect(() => {
    if (!videoFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setLocalPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  async function handleVideoChange(file: File | null) {
    setVideoFile(file);
    setUploadProgress(0);
    setDetectedDurationSeconds(null);
    if (!file) return;
    setDetectingDuration(true);
    const secs = await detectVideoDuration(file);
    setDetectedDurationSeconds(secs);
    setDetectingDuration(false);
  }

  async function handleSave() {
    // Guard against rapid duplicate clicks
    if (isSubmittingRef.current || saving) {
      return;
    }

    if (!lessonTitle.trim()) {
      setError("Lesson title is required.");
      return;
    }
    if (!selectedModuleId && modules.length > 0 && !createdModuleId) {
      setError("Please select a module.");
      return;
    }

    isSubmittingRef.current = true;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let targetModuleId = createdModuleId || selectedModuleId;

      // If no module exists, create a default one
      if (!targetModuleId) {
        const modRes = await fetch(`/api/admin/courses/${courseId}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Module 1 : Basics" }),
        });
        const modData = await modRes.json();
        if (!modRes.ok) throw new Error("Failed to create module.");
        targetModuleId = modData.id;
        setCreatedModuleId(targetModuleId);
      }

      const baseUrl = `/api/admin/courses/${courseId}/modules/${targetModuleId}/lessons`;
      let lessonId = createdLessonId;

      // Only create the lesson record if it has not been created yet
      if (!lessonId) {
        const createRes = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            description: lessonDescription.trim() || null,
          }),
        });

        const lesson = await createRes.json();
        if (!createRes.ok) {
          throw new Error(lesson.message || "Failed to create lesson.");
        }

        lessonId = lesson.id;
        setCreatedLessonId(lesson.id);
        setCreatedModuleId(targetModuleId);
      }

      // Update lesson metadata (title, description, auto-detected duration, preview)
      const updateRes = await fetch(`${baseUrl}/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          description: lessonDescription.trim() || null,
          durationSeconds: detectedDurationSeconds,
          isPreview,
        }),
      });

      if (!updateRes.ok) {
        const updateData = await updateRes.json().catch(() => ({}));
        throw new Error(
          updateData.message || "Failed to update lesson details.",
        );
      }

      // If an actual video file was selected by the admin, initiate TUS upload to Bunny Stream
      if (videoFile) {
        setSuccess("Lesson details saved! Uploading video...");
        const credRes = await fetch(`${baseUrl}/${lessonId}/video`, {
          method: "PUT",
        });

        const creds = await credRes.json();
        if (!credRes.ok) {
          throw new Error(
            creds.error || "Could not start video upload. Please try again.",
          );
        }

        await new Promise<void>((resolve, reject) => {
          const upload = new tus.Upload(videoFile, {
            endpoint: creds.endpoint,
            headers: {
              AuthorizationSignature: creds.signature,
              AuthorizationExpire: String(creds.expirationTime),
              VideoId: creds.videoId,
              LibraryId: creds.libraryId,
            },
            metadata: {
              filetype: videoFile.type || "video/mp4",
              title: videoFile.name,
            },
            retryDelays: [0, 3000, 5000, 10000],
            onProgress(bytesUploaded, bytesTotal) {
              const percent = Math.round((bytesUploaded / bytesTotal) * 100);
              setUploadProgress(percent);
            },
            onError(err) {
              console.error("TUS error during lesson create:", err);
              reject(err);
            },
            onSuccess: async () => {
              setUploadProgress(100);
              try {
                await fetch(`${baseUrl}/${lessonId}/video/complete`, {
                  method: "POST",
                });
              } catch (compErr) {
                console.error("Video completion call failed:", compErr);
              }
              resolve();
            },
          });

          upload.start();
        });
      }

      setSuccess(
        videoFile
          ? "Video lesson saved and uploaded successfully!"
          : "Lesson saved successfully!",
      );
      setTimeout(() => {
        router.push(`/admin/courses/${courseId}`);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save lesson or upload video. You can retry without creating duplicate lessons.",
      );
    } finally {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#aaa59a]">
        Loading lesson editor...
      </div>
    );
  }

  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const lessonOrder = (selectedModule?.lessons?.length ?? 0) + 1;

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/courses/${courseId}`)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b251e] text-[#c9a66a] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/10"
          >
            ←
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
              Add Video Lesson
            </h1>
            <p className="mt-0.5 text-xs text-[#8a857b]">
              Upload and configure a video lesson for this course
            </p>
          </div>
        </div>

        {/* Course Info Pill on Right */}
        {course && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#26211b] bg-[#121110] p-2 pr-3">
            <div className="h-10 w-12 shrink-0 overflow-hidden rounded-xl border border-[#3d3224]/50 bg-[#0c0c0b]">
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

            <div>
              <p className="text-xs font-medium text-[#e8dfd1]">{course.title}</p>
              <p className="text-[10px] text-[#7a7469]">{course.courseCode}</p>
            </div>

            <button
              onClick={() =>
                router.push(`/admin/courses/${courseId}?curriculum=1`)
              }
              className="ml-2 flex items-center gap-1.5 rounded-xl border border-[#2e2720] px-3 py-1.5 text-xs text-[#d8b16d] transition hover:bg-[#c9a66a]/10"
            >
              <span>←</span>
              <span>Curriculum</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          {success}
        </div>
      )}

      {/* Main Grid: Left Column + Right Column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* Left Column: Lesson Details & Upload */}
        <div className="space-y-6">
          {/* Lesson Details Card */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-6">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">▶</span>
              <h2 className="text-sm font-medium text-[#e8dfd1]">
                Lesson Details
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              {/* Module Selector (if modules exist) */}
              {modules.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs text-[#8a857b]">
                    Target Module <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lesson Title */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs text-[#8a857b]">
                    Lesson Title <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-[#635d54]">
                    {lessonTitle.length}/100
                  </span>
                </div>
                <input
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value.slice(0, 100))}
                  placeholder="Foundation Application"
                  className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                />
              </div>

              {/* Lesson Description */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs text-[#8a857b]">
                    Lesson Description
                  </label>
                  <span className="text-[10px] text-[#635d54]">
                    {lessonDescription.length}/500
                  </span>
                </div>

                <div className="rounded-xl border border-[#2e2720] bg-[#0c0c0b]">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 border-b border-[#211d19] px-3 py-1.5 text-xs text-[#8a857b]">
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      B
                    </span>
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded italic hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      I
                    </span>
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded underline hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      U
                    </span>
                    <span className="mx-1 h-3.5 w-px bg-[#26211b]" />
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      ☰
                    </span>
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      ☷
                    </span>
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      🔗
                    </span>
                    <span className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#1a1815] hover:text-[#e8dfd1]">
                      🖼
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={lessonDescription}
                    onChange={(e) =>
                      setLessonDescription(e.target.value.slice(0, 500))
                    }
                    placeholder="Learn the right technique to apply foundation for a flawless and natural look."
                    className="w-full resize-none bg-transparent p-3.5 text-xs leading-relaxed text-[#e8dfd1] outline-none placeholder:text-[#5a544a]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Lesson Video Card */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-6">
            <h2 className="text-sm font-medium text-[#e8dfd1]">
              Upload Lesson Video <span className="text-red-400">*</span>
            </h2>

            {/* Drag & Drop Box */}
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#80623c]/40 bg-[#0c0c0b] px-4 py-8 text-center transition hover:border-[#c9a66a]">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a66a]/10 text-xl text-[#c9a66a]">
                ☁
              </div>
              <p className="text-xs text-[#8a857b]">
                Drag & Drop your video here
              </p>
              <p className="my-1 text-[11px] text-[#635d54]">or</p>
              <span className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-4 py-1.5 text-xs font-semibold text-[#1a140d]">
                📁 Browse Videos
              </span>
              <p className="mt-3 text-[10px] text-[#635d54]">
                Supported formats: MP4 · Max size: 500MB
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>

            {/* Selected Video Status Box */}
            {videoFile && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-[#2e2720] bg-[#0c0c0b] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181614] text-[#c9a66a]">
                      🎬
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#e8dfd1]">
                        {videoFile.name}
                      </p>
                      <p className="text-[10px] text-[#7a7469]">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB ·{" "}
                        {detectingDuration
                          ? "Detecting duration..."
                          : formatVideoDuration(detectedDurationSeconds)}{" "}
                        · {uploadProgress}%
                      </p>
                    </div>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                      ✓
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#1e1b17]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#c9a66a] to-emerald-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>

                {/* Status + action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span>✓</span>
                    <span>
                      {saving
                        ? `Uploading video: ${uploadProgress}%`
                        : "Video ready to upload on Save"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#2e2720] px-2.5 py-1 text-xs text-[#d8b16d] hover:bg-[#c9a66a]/10">
                      <span>🔄</span>
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleVideoChange(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2e2720] text-[#736c62] hover:text-rose-400"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video Preview & Lesson Settings */}
        <div className="space-y-6">
          {/* Video Preview Card */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-5">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">📺</span>
              <h2 className="text-sm font-medium text-[#e8dfd1]">
                Video Preview
              </h2>
            </div>

            {/* Video Player Display */}
            <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-[#2e2720] bg-[#0c0c0b]">
              {localPreviewUrl ? (
                <video
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="h-full w-full object-cover"
                  src={localPreviewUrl}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <span className="text-3xl text-[#c9a66a]/40">🎬</span>
                  <p className="text-xs text-[#7a7469]">
                    Select a video file to preview it here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Settings Card */}
          <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-5">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">⚙</span>
              <h2 className="text-sm font-medium text-[#e8dfd1]">
                Lesson Settings
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              {/* Duration (Auto) */}
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Duration (Auto-Detected)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-[#736c62]">
                    🕐
                  </span>
                  <input
                    readOnly
                    value={
                      detectingDuration
                        ? "Detecting..."
                        : formatVideoDuration(detectedDurationSeconds)
                    }
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2.5 pl-9 pr-4 text-xs text-[#e8dfd1] outline-none"
                  />
                </div>
              </div>

              {/* Free Preview Toggle */}
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Free Preview
                </label>
                <div className="flex items-center justify-between rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5">
                  <span className="text-xs text-[#7a7469]">
                    Allow students to preview this lesson
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      isPreview ? "bg-[#c9a66a]" : "bg-[#2b251e]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        isPreview ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Lesson Order */}
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Lesson Order
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-[#736c62]">
                    ☰
                  </span>
                  <input
                    readOnly
                    value={lessonOrder}
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2.5 pl-9 pr-24 text-xs text-[#e8dfd1] outline-none"
                  />
                  <span className="absolute right-3.5 text-[11px] text-[#736c62]">
                    in this module
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-[#26211b] pt-5">
        <button
          type="button"
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="rounded-xl border border-[#2e2720] px-6 py-2.5 text-xs text-[#b8b0a2] transition hover:bg-[#1a1815] hover:text-[#e8dfd1]"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-6 py-2.5 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/20 transition hover:brightness-110 disabled:opacity-50"
        >
          <span>✓</span>
          <span>
            {saving
              ? videoFile && createdLessonId
                ? "Uploading Video..."
                : "Saving..."
              : createdLessonId && videoFile
                ? "Retry Video Upload"
                : "Save Lesson"}
          </span>
        </button>
      </div>
    </div>
  );
}
