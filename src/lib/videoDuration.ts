/**
 * Reads the actual duration (in whole seconds) of a local video File
 * using browser HTML5 video metadata. Returns null if unavailable or invalid.
 */
export function detectVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(null);
      return;
    }

    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    const finish = (seconds: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      cleanup();
      resolve(seconds);
    };

    const timeoutId = setTimeout(() => finish(null), 5000);

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const raw = video.duration;
      if (Number.isFinite(raw) && raw > 0) {
        finish(Math.round(raw));
      } else {
        finish(null);
      }
    };
    video.onerror = () => finish(null);
    video.src = objectUrl;
  });
}

/**
 * Formats seconds into MM:SS or HH:MM:SS.
 * Returns fallback (default "Duration unavailable") when duration is missing.
 */
export function formatVideoDuration(
  seconds: number | null | undefined,
  fallback = "Duration unavailable",
): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) {
    return fallback;
  }

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
