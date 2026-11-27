"use client";

import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import {
  detectVideoDuration,
  formatVideoDuration,
} from "@/lib/videoDuration";

type VideoStatus = "NOT_UPLOADED" | "PROCESSING" | "READY" | "FAILED";

interface Props {
  courseId: string;
  moduleId: string;
  lessonId: string;
  initialVideoId?: string | null;
  initialStatus?: VideoStatus;
  initialDuration?: number | null;
  courseImageUrl?: string | null;
  thumbnailUrl?: string | null;
  autoStartFile?: File | null;
  autoStartDuration?: number | null;
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
  courseImageUrl = null,
  thumbnailUrl = null,
  autoStartFile = null,
  autoStartDuration = null,
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

  const [file, setFile] = useState<File | null>(autoStartFile);
  const [detectedDuration, setDetectedDuration] = useState<number | null>(
    autoStartDuration,
  );
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
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
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(false);

  const tusUploadRef = useRef<tus.Upload | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const autoStartedRef = useRef(false);

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

  // Manage local object URL for selected file preview cleanly
  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Auto-start upload when mounted from integrated lesson creation with a preselected file
  useEffect(() => {
    if (autoStartFile && !autoStartedRef.current) {
      autoStartedRef.current = true;
      handleStartUpload(false, autoStartFile, autoStartDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartFile, lessonId]);

  async function handleFileSelected(selected: File) {
    setFile(selected);
    setError("");
    setMessage("");
    setDetectingDuration(true);
    const secs = await detectVideoDuration(selected);
    if (isMountedRef.current) {
      setDetectedDuration(secs);
      setDetectingDuration(false);
    }
  }

  function formatTime(seconds: number | null): string {
    return formatVideoDuration(seconds, "Duration unavailable");
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
          setMessage("Video is ready for playback.");
          onStatusChange?.(
            "READY",
            data.bunnyVideoId || videoId,
            data.durationSeconds !== undefined ? data.durationSeconds : durationSeconds,
          );
        } else if (data.videoStatus === "FAILED") {
          setError("This video could not be prepared. Please try uploading again.");
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
            "Your video is still being prepared. Check back in a few moments.",
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

  async function handleStartUpload(
    replace = false,
    overrideFile?: File,
    overrideDuration?: number | null,
  ) {
    const targetFile = overrideFile ?? file;
    const targetDuration =
      overrideDuration !== undefined ? overrideDuration : detectedDuration;

    if (!targetFile) {
      setError("Please select a video file first.");
      return;
    }

    // Check file size (e.g., max 500MB)
    if (targetFile.size > 500 * 1024 * 1024) {
      setError("File exceeds maximum allowed size (500MB).");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(targetFile.size);
    setError("");
    setMessage(
      replace
        ? "Preparing replacement upload..."
        : "Starting upload...",
    );

    try {
      const url = `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video${
        replace ? "?replace=true" : ""
      }`;

      const res = await fetch(url, { method: "PUT" });
      const credentials: UploadCredentials = await res.json();

      if (!res.ok) {
        throw new Error(
          (credentials as any).error || "Could not start video upload. Please try again.",
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

      const upload = new tus.Upload(targetFile, {
        endpoint: credentials.endpoint,
        headers: {
          AuthorizationSignature: credentials.signature,
          AuthorizationExpire: String(credentials.expirationTime),
          VideoId: credentials.videoId,
          LibraryId: credentials.libraryId,
        },
        metadata: {
          filetype: targetFile.type || "video/mp4",
          title: targetFile.name,
        },
        retryDelays: [0, 3000, 5000, 10000, 20000],
        onProgress(uploaded, total) {
          const percent = Math.round((uploaded / total) * 100);
          setProgress(percent);
          setUploadedBytes(uploaded);
          setTotalBytes(total);
          setMessage(`Uploading video: ${percent}%`);
        },
        onError(tusErr) {
          console.error("TUS upload error:", tusErr);
          if (replace) {
            setError(
              "Replacement upload was interrupted. Your previous video is still safe. You can retry or cancel.",
            );
          } else {
            setError("Upload was interrupted. Please click Retry to continue.");
          }
          setUploading(false);
        },
        onSuccess: async () => {
          setProgress(100);
          setMessage("Upload complete. Finalizing video...");

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
                compData.error || "Could not finalize the uploaded video.",
              );
            }

            // Persist browser-detected duration if available (Bunny status polling will also verify)
            if (targetDuration && targetDuration > 0) {
              setDurationSeconds(targetDuration);
              fetch(
                `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ durationSeconds: targetDuration }),
                },
              ).catch((durErr) =>
                console.error("Failed to persist detected duration:", durErr),
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
              replace
                ? "Video updated! Preparing for playback..."
                : "Upload complete! Video is being prepared...",
            );
            onStatusChange?.(
              "PROCESSING",
              credentials.videoId,
              targetDuration ?? null,
            );

            // Begin polling status for the new video
            startPollingStatus();
          } catch (compErr) {
            console.error("Completion endpoint error:", compErr);
            if (replace) {
              setError(
                "Could not finalize replacement video. Your previous video is still preserved.",
              );
            } else {
              setError(
                "Upload finished, but we could not confirm video readiness. Please refresh status.",
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
                  Video ready
                </p>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-[#7a7469]">
                Available for student playback
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
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#D6AD65]/25 bg-black">
          {embedUrl && (showEmbedPlayer || !(thumbnailUrl || courseImageUrl)) ? (
            <iframe
              src={embedUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          ) : thumbnailUrl || courseImageUrl ? (
            <div className="relative h-full w-full">
              <img
                src={(thumbnailUrl || courseImageUrl)!}
                alt="Lesson video poster"
                className="h-full w-full object-cover"
              />
              {embedUrl && (
                <button
                  type="button"
                  onClick={() => setShowEmbedPlayer(true)}
                  aria-label="Play video preview"
                  className="absolute inset-0 flex items-center justify-center bg-black/35 transition hover:bg-black/45"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] pl-0.5 text-lg text-[#090807] shadow-xl">
                    ▶
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-xs text-[#BDB4A7]">
              <span className="text-2xl text-[#D6AD65]/40">✦</span>
              <span>Video preview ready</span>
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
                  Video is being prepared
                </p>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  Preparing
                </span>
              </div>
              <p className="text-[11px] text-[#8a857b]">
                Optimizing video quality for smooth playback...
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
              {isCheckingStatus ? "Refreshing..." : "Refresh status"}
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
                  Video could not be prepared
                </p>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                  Needs retry
                </span>
              </div>
              <p className="text-[11px] text-[#8a857b]">
                Please upload an MP4, MOV, or WebM video and try again.
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
    <div className="space-y-4 rounded-2xl border border-[#D6AD65]/25 bg-[#15120F] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D6AD65]">
              {isReplacing ? "Replace Lesson Video" : "Upload Video"}
            </h4>
            {uploading ? (
              <span className="rounded-full border border-[#D6AD65]/40 bg-[#211A12] px-2.5 py-0.5 text-[10px] font-medium text-[#F1D69A]">
                Uploading ({progress}%)
              </span>
            ) : error ? (
              <span className="rounded-full border border-rose-500/30 bg-rose-950/60 px-2.5 py-0.5 text-[10px] font-medium text-rose-300">
                Upload failed
              </span>
            ) : isReplacing ? (
              <span className="rounded-full border border-[#D6AD65]/40 bg-[#211A12] px-2.5 py-0.5 text-[10px] font-medium text-[#F1D69A]">
                Replacing video
              </span>
            ) : (
              <span className="rounded-full border border-[#D6AD65]/20 bg-[#1B1713] px-2.5 py-0.5 text-[10px] font-medium text-[#BDB4A7]">
                No video uploaded
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-[#BDB4A7]">
            Supports: MP4, MOV, WebM · Max size: 500MB
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isReplacing && (
            <button
              type="button"
              onClick={handleCancelReplacement}
              className="kbc-outline-btn !px-3 !py-1.5"
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
              className="rounded-lg border border-[#D6AD65]/25 px-2.5 py-1.5 text-xs text-[#BDB4A7] hover:text-white"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice during replacement */}
      {isReplacing && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <p className="font-medium">Active Video Protected</p>
          <p className="mt-0.5 text-[11px] text-[#BDB4A7]">
            Your current video remains published and live for learners until the
            replacement upload completes and is verified.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/25 bg-rose-950/40 p-3 text-xs text-rose-300">
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

      <div className={file ? "grid grid-cols-1 gap-4 md:grid-cols-2" : ""}>
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
                handleFileSelected(droppedFile);
              }
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
              isDragging
                ? "border-[#D6AD65] bg-[#211A12]"
                : "border-[#D6AD65]/30 bg-[#090807] hover:border-[#D6AD65]/60"
            }`}
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#D6AD65]/30 bg-[#1B1713] text-xl text-[#F1D69A]">
              ☁
            </div>
            <p className="text-xs text-white">
              Drag &amp; drop your video here
            </p>
            <p className="my-1.5 text-[11px] text-[#BDB4A7]">or</p>

            <label className="kbc-gold-btn cursor-pointer">
              <span>Choose File</span>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    handleFileSelected(selected);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Selected File Preview & Upload Action */}
        {file && (
          <div className="space-y-3 rounded-2xl border border-[#D6AD65]/25 bg-[#1B1713] p-4">
            <p className="text-xs font-medium text-[#F1D69A]">Video Preview</p>

            {localPreviewUrl && !uploading && (
              <div className="overflow-hidden rounded-xl border border-[#D6AD65]/20 bg-black">
                <video
                  src={localPreviewUrl}
                  poster={thumbnailUrl || courseImageUrl || undefined}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="aspect-video w-full"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {file.name}
                </p>
                <p className="text-[11px] text-[#BDB4A7]">
                  {formatFileSize(file.size)} ·{" "}
                  {detectingDuration
                    ? "Detecting duration..."
                    : formatVideoDuration(detectedDuration)}
                </p>
              </div>
            </div>

            {!uploading && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isReplacing) {
                      handleCancelReplacement();
                    } else {
                      setFile(null);
                    }
                  }}
                  className="kbc-outline-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStartUpload(isReplacing)}
                  className="kbc-gold-btn"
                >
                  {isReplacing ? "Upload Replacement" : "Upload Video"}
                </button>
              </div>
            )}

            {uploading && (
              <div className="space-y-2 pt-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#090807]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#BDB4A7]">
                  <span>{message || `${progress}% uploaded`}</span>
                  <span>
                    {formatFileSize(uploadedBytes)} /{" "}
                    {formatFileSize(totalBytes)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
