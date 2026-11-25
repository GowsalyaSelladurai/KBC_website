"use client";

import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";

type VideoStatus = "NOT_UPLOADED" | "PROCESSING" | "READY" | "FAILED";

interface Props {
  courseId: string;
  moduleId: string;
  lessonId: string;
  initialVideoId?: string | null;
  initialStatus?: VideoStatus;
  initialDuration?: number | null;
  onStatusChange?: (
    status: VideoStatus,
    videoId: string | null,
    durationSeconds?: number | null,
  ) => void;
  onClose?: () => void;
}

interface UploadCredentials {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
  endpoint: string;
  isReplacement?: boolean;
}

const POLL_INTERVAL = 4000;
const MAX_POLL_ATTEMPTS = 60;

export default function LessonVideoUploader({
  courseId,
  moduleId,
  lessonId,
  initialVideoId = null,
  initialStatus = "NOT_UPLOADED",
  initialDuration = null,
  onStatusChange,
  onClose,
}: Props) {
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(initialStatus);
  const [videoId, setVideoId] = useState<string | null>(initialVideoId);
  const [libraryId, setLibraryId] = useState<string>("");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(
    initialDuration,
  );

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const tusUploadRef = useRef<tus.Upload | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Stop polling and safely clear any active timer
  function stopPolling() {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  // Lifecycle unmount cleanup to prevent timer leaks and post-unmount updates
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, []);

  // Sync state if props change
  useEffect(() => {
    if (initialStatus) setVideoStatus(initialStatus);
    if (initialVideoId) setVideoId(initialVideoId);
    if (initialDuration) setDurationSeconds(initialDuration);
  }, [initialStatus, initialVideoId, initialDuration]);

  // Initial fetch of video information if status is PROCESSING or READY
  useEffect(() => {
    async function fetchVideoInfo() {
      try {
        const res = await fetch(
          `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`,
          { cache: "no-store" },
        );
        if (!isMountedRef.current || !res.ok) return;

        const data = await res.json();
        if (isMountedRef.current) {
          if (data.bunnyVideoId) setVideoId(data.bunnyVideoId);
          if (data.videoStatus) setVideoStatus(data.videoStatus);
          if (data.embedUrl) setEmbedUrl(data.embedUrl);
          if (data.durationSeconds !== undefined) {
            setDurationSeconds(data.durationSeconds);
          }

          if (
            data.videoStatus === "READY" &&
            data.durationSeconds !== undefined &&
            data.durationSeconds !== initialDuration
          ) {
            onStatusChange?.(
              "READY",
              data.bunnyVideoId || videoId,
              data.durationSeconds,
            );
          }

          // If still processing, kick off status polling
          if (data.videoStatus === "PROCESSING") {
            startPollingStatus();
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error("Failed to load video details:", err);
        }
      }
    }

    fetchVideoInfo();

    return () => {
      stopPolling();
    };
  }, [courseId, moduleId, lessonId]);

  function formatTime(seconds: number | null): string {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function formatFileSize(bytes: number): string {
    if (bytes <= 0) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function checkVideoStatusOnce(): Promise<VideoStatus | null> {
    if (!isMountedRef.current) return null;
    setIsCheckingStatus(true);
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video/status`,
        { cache: "no-store" },
      );
      if (!isMountedRef.current || !res.ok) return null;

      const data = await res.json();
      if (!isMountedRef.current) return null;

      if (data.videoStatus) {
        setVideoStatus(data.videoStatus);
        if (data.embedUrl) setEmbedUrl(data.embedUrl);
        if (data.durationSeconds !== undefined) {
          setDurationSeconds(data.durationSeconds);
        }

        if (data.videoStatus === "READY") {
          setMessage("Video is ready and streamable!");
          onStatusChange?.(
            "READY",
            data.bunnyVideoId || videoId,
            data.durationSeconds !== undefined ? data.durationSeconds : durationSeconds,
          );
        } else if (data.videoStatus === "FAILED") {
          setError("Video processing failed on Bunny Stream.");
          onStatusChange?.("FAILED", videoId, null);
        }
        return data.videoStatus;
      }
      return null;
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Status check failed:", err);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsCheckingStatus(false);
      }
    }
  }

  async function startPollingStatus() {
    stopPolling();
    if (!isMountedRef.current) return;

    let attempts = 0;
    async function poll() {
      if (!isMountedRef.current) return;
      attempts++;
      const current = await checkVideoStatusOnce();

      if (!isMountedRef.current) return;

      if (
        current === "READY" ||
        current === "FAILED" ||
        current === "NOT_UPLOADED"
      ) {
        stopPolling();
        return;
      }

      if (attempts < MAX_POLL_ATTEMPTS) {
        if (isMountedRef.current) {
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
        }
      } else {
        if (isMountedRef.current) {
          setMessage(
            "Video encoding is still underway in Bunny CDN. Check back in a few minutes.",
          );
        }
        stopPolling();
      }
    }

    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
  }

  async function handleCancelReplacement() {
    if (uploading && tusUploadRef.current) {
      tusUploadRef.current.abort();
    }
    setUploading(false);
    setProgress(0);
    setFile(null);
    setIsReplacing(false);
    setError("");
    setMessage("");

    // Notify backend to safely clean up the pending video without touching the committed one
    try {
      await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video?pending=true`,
        { method: "DELETE" },
      );
    } catch (err) {
      console.error("Failed to cancel pending replacement:", err);
    }
  }

  async function handleStartUpload(replace = false) {
    if (!file) {
      setError("Please select a video file first.");
      return;
    }

    // Check file size (e.g., max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError("File exceeds maximum allowed size (500MB).");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);
    setError("");
    setMessage(
      replace
        ? "Preparing replacement upload session..."
        : "Preparing upload session...",
    );

    try {
      const url = `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video${
        replace ? "?replace=true" : ""
      }`;

      const res = await fetch(url, { method: "PUT" });
      const credentials: UploadCredentials = await res.json();

      if (!res.ok) {
        throw new Error(
          (credentials as any).error || "Failed to obtain upload token",
        );
      }

      setLibraryId(credentials.libraryId);

      // In initial upload, set the videoId immediately.
      // During replacement, keep the committed videoId until upload & verification complete!
      if (!replace) {
        setVideoId(credentials.videoId);
        setEmbedUrl(
          `https://iframe.mediadelivery.net/embed/${credentials.libraryId}/${credentials.videoId}?autoplay=false&preload=true`,
        );
      }

      const upload = new tus.Upload(file, {
        endpoint: credentials.endpoint,
        headers: {
          AuthorizationSignature: credentials.signature,
          AuthorizationExpire: String(credentials.expirationTime),
          VideoId: credentials.videoId,
          LibraryId: credentials.libraryId,
        },
        metadata: {
          filetype: file.type || "video/mp4",
          title: file.name,
        },
        retryDelays: [0, 3000, 5000, 10000, 20000],
        onProgress(uploaded, total) {
          const percent = Math.round((uploaded / total) * 100);
          setProgress(percent);
          setUploadedBytes(uploaded);
          setTotalBytes(total);
          setMessage(`Uploading to Bunny Stream: ${percent}%`);
        },
        onError(tusErr) {
          console.error("TUS upload error:", tusErr);
          if (replace) {
            setError(
              "Replacement upload interrupted. Your existing video remains preserved. You can retry or cancel.",
            );
          } else {
            setError("Upload interrupted. You can click Retry to resume.");
          }
          setUploading(false);
        },
        onSuccess: async () => {
          setProgress(100);
          setMessage("Upload complete. Verifying video with Bunny Stream...");

          try {
            const compRes = await fetch(
              `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video/complete`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId: credentials.videoId }),
              },
            );

            if (!compRes.ok) {
              const compData = await compRes.json().catch(() => ({}));
              throw new Error(
                compData.error || "Failed to verify and register video.",
              );
            }

            // Only AFTER verification and commit, update the committed video state
            setVideoId(credentials.videoId);
            setEmbedUrl(
              `https://iframe.mediadelivery.net/embed/${credentials.libraryId}/${credentials.videoId}?autoplay=false&preload=true`,
            );
            setVideoStatus("PROCESSING");
            setIsReplacing(false);
            setFile(null);
            setMessage(
              "Replacement committed successfully! Video is processing on Bunny CDN...",
            );
            onStatusChange?.("PROCESSING", credentials.videoId, null);

            // Begin polling status for the new video
            startPollingStatus();
          } catch (compErr) {
            console.error("Completion endpoint error:", compErr);
            if (replace) {
              setError(
                "Replacement verification failed. Your existing video remains preserved.",
              );
            } else {
              setError(
                "Upload finished, but status sync failed. Check status below.",
              );
            }
          } finally {
            setUploading(false);
          }
        },
      });

      tusUploadRef.current = upload;
      upload.start();
    } catch (err) {
      console.error("Upload start error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initiate video upload.",
      );
      setUploading(false);
    }
  }

  function handleRetryUpload() {
    if (tusUploadRef.current) {
      setError("");
      setUploading(true);
      tusUploadRef.current.start();
    } else {
      handleStartUpload(isReplacing);
    }
  }

  async function handleDeleteVideo() {
    if (
      !confirm("Are you sure you want to remove the video from this lesson?")
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        throw new Error("Failed to remove video");
      }

      setVideoStatus("NOT_UPLOADED");
      setVideoId(null);
      setEmbedUrl(null);
      setDurationSeconds(null);
      setFile(null);
      setIsReplacing(false);
      setMessage("Video removed successfully.");
      onStatusChange?.("NOT_UPLOADED", null, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete video.");
    } finally {
      setDeleting(false);
    }
  }

  // --- RENDER READY STATE (when NOT in active replacement mode) ---
  if (videoStatus === "READY" && !isReplacing) {
    return (
      <div className="space-y-4 rounded-2xl border border-[#2b251e] bg-[#0c0c0b] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#211d19] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
              ✓
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-[#e8dfd1]">
                  Lesson Video Ready
                </p>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Video ready
                </span>
              </div>
              <p className="text-[11px] text-[#7a7469]">
                Hosted on Bunny Stream CDN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {durationSeconds && (
              <span className="rounded-lg border border-[#3d3224]/50 bg-[#161412] px-2.5 py-1 text-xs text-[#c9a66a]">
                ⏱ {formatTime(durationSeconds)}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setIsReplacing(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#3d3224] px-3 py-1.5 text-xs text-[#d8b16d] transition hover:bg-[#c9a66a]/10"
            >
              <span>🔄</span>
              <span>Replace Video</span>
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteVideo}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
            >
              <span>🗑</span>
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#2b251e] px-2.5 py-1.5 text-xs text-[#7a7469] hover:text-[#e8dfd1]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Video Preview Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#26211b] bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              loading="lazy"
              className="h-full w-full border-0"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#7a7469]">
              Player embed ready
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER PROCESSING STATE (when NOT in active replacement mode) ---
  if (videoStatus === "PROCESSING" && !isReplacing) {
    return (
      <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-[#121110] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-amber-500/20 border-t-amber-400 text-xs text-amber-400">
              ⟳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-amber-300">
                  Processing Lesson Video on Bunny Stream
                </p>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  Processing
                </span>
              </div>
              <p className="text-[11px] text-[#8a857b]">
                Transcoding into multiple resolutions & generating HLS stream...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isCheckingStatus}
              onClick={() => checkVideoStatusOnce()}
              className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 transition hover:bg-amber-500/10 disabled:opacity-50"
            >
              {isCheckingStatus ? "Checking..." : "Check Status"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setIsReplacing(true);
              }}
              className="rounded-lg border border-[#2b251e] px-3 py-1.5 text-xs text-[#aaa59a] hover:bg-white/5"
            >
              Replace
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#2b251e] px-2.5 py-1.5 text-xs text-[#7a7469] hover:text-[#e8dfd1]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {message && <p className="text-xs text-[#7a7469]">{message}</p>}
      </div>
    );
  }

  // --- RENDER FAILED STATE (when NOT in active replacement mode) ---
  if (videoStatus === "FAILED" && !isReplacing) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-500/30 bg-[#121110] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-xs text-rose-400">
              ✕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-rose-300">
                  Lesson Video processing failed
                </p>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                  Upload failed
                </span>
              </div>
              <p className="text-[11px] text-[#8a857b]">
                Bunny Stream could not encode this video format. Please
                re-upload.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setIsReplacing(true);
              }}
              className="rounded-lg bg-[#c9a66a] px-3 py-1.5 text-xs font-medium text-[#17130d] hover:bg-[#e2c18a]"
            >
              Re-upload Video
            </button>
            <button
              type="button"
              onClick={handleDeleteVideo}
              className="rounded-lg border border-rose-500/20 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10"
            >
              Remove
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#2b251e] px-2.5 py-1.5 text-xs text-[#7a7469] hover:text-[#e8dfd1]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER UPLOAD / DROPZONE STATE (NOT_UPLOADED or isReplacing) ---
  return (
    <div className="space-y-4 rounded-2xl border border-[#2b251e] bg-[#0c0c0b] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c9a66a]">
              {isReplacing ? "Replace Lesson Video" : "Upload Lesson Video"}
            </h4>
            {uploading ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                Uploading ({progress}%)
              </span>
            ) : error ? (
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                Upload failed
              </span>
            ) : isReplacing ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                Replacing video
              </span>
            ) : (
              <span className="rounded-full border border-[#3d3224] bg-[#161412] px-2 py-0.5 text-[10px] font-medium text-[#aaa59a]">
                No video uploaded
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-[#7a7469]">
            Supported formats: MP4, MOV, WebM · Max size: 500MB
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isReplacing && (
            <button
              type="button"
              onClick={handleCancelReplacement}
              className="rounded-lg border border-[#3d3224] px-2.5 py-1.5 text-xs text-[#d8b16d] hover:bg-[#c9a66a]/10"
            >
              Cancel Replacement
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                if (isReplacing) {
                  handleCancelReplacement();
                }
                onClose();
              }}
              className="rounded-lg border border-[#2b251e] px-2.5 py-1.5 text-xs text-[#7a7469] hover:text-[#e8dfd1]"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice during replacement */}
      {isReplacing && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <p className="font-medium">Active Video Protected</p>
          <p className="mt-0.5 text-[11px] text-[#8a857b]">
            Your current video remains published and live for learners until the
            replacement upload completes and is verified.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetryUpload}
            className="ml-3 underline hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!uploading && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              setFile(droppedFile);
              setError("");
              setMessage("");
            }
          }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            isDragging
              ? "border-[#c9a66a] bg-[#c9a66a]/5"
              : "border-[#80623c]/30 bg-[#121110]/50 hover:border-[#80623c]/60"
          }`}
        >
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a66a]/10 text-xl text-[#c9a66a]">
            ☁
          </div>
          <p className="text-xs text-[#8a857b]">
            Drag & Drop your video file here
          </p>
          <p className="my-1.5 text-[11px] text-[#635d54]">or</p>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-4 py-2 text-xs font-semibold text-[#1a140d] transition hover:opacity-95">
            <span>📁 Browse Videos</span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) {
                  setFile(selected);
                  setError("");
                  setMessage("");
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Selected File Details & Upload Action */}
      {file && (
        <div className="space-y-3 rounded-xl border border-[#2e2720] bg-[#121110] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#181614] text-lg text-[#c9a66a]">
                🎬
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#e8dfd1]">
                  {file.name}
                </p>
                <p className="text-[10px] text-[#7a7469]">
                  {formatFileSize(file.size)} · Ready to upload
                </p>
              </div>
            </div>

            {!uploading && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartUpload(isReplacing)}
                  className="rounded-xl bg-gradient-to-r from-[#c9a66a] to-[#dfbf88] px-4 py-2 text-xs font-semibold text-[#17130d] transition hover:brightness-105"
                >
                  {isReplacing ? "Upload Replacement" : "Upload Video"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isReplacing) {
                      handleCancelReplacement();
                    } else {
                      setFile(null);
                    }
                  }}
                  className="rounded-xl border border-[#3d3224] px-3 py-2 text-xs text-[#aaa59a] hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2 pt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1e1b17]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c9a66a] to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8a857b]">
                <span>{message || `${progress}% uploaded`}</span>
                <span>
                  {formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
