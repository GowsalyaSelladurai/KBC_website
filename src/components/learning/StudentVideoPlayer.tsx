"use client";

import type { LessonProgressionItem } from "@/lib/learning/progression";

export type PlaybackPayload = {
  embedUrl: string;
  tokenProtected: boolean;
  expiresAt: string | null;
  securityNote?: string;
};

export default function StudentVideoPlayer({
  lesson,
  playback,
  loading,
  error,
  onRetry,
}: {
  lesson: LessonProgressionItem | null;
  playback: PlaybackPayload | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (!lesson) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[#D6AD65]/25 bg-[#090807] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
        <div className="max-w-md space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D6AD65]/30 bg-[#1B1713] text-lg text-[#D6AD65]">
            ✦
          </div>
          <p className="font-serif text-lg font-medium text-white">
            No lesson available to play yet
          </p>
          <p className="text-sm text-[#BDB4A7]">
            Lessons will appear here once course videos are ready.
          </p>
        </div>
      </div>
    );
  }

  if (!lesson.isEligible) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[#D6AD65]/25 bg-[#090807] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
        <div className="max-w-md space-y-2.5">
          <span className="inline-block rounded-full border border-[#D6AD65]/35 bg-[#211A12] px-3 py-1 text-xs font-medium text-[#F1D69A]">
            Video Unavailable
          </span>
          <h3 className="font-serif text-xl font-medium text-white">
            {lesson.title}
          </h3>
          <p className="text-sm text-[#BDB4A7]">
            This lesson&apos;s video is currently{" "}
            {lesson.videoStatus === "PROCESSING"
              ? "processing"
              : "unavailable"}
            . Subsequent lessons remain locked until this lesson is ready and
            completed.
          </p>
        </div>
      </div>
    );
  }

  if (!lesson.isUnlocked) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[#D6AD65]/25 bg-[#090807] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
        <div className="max-w-md space-y-2.5">
          <span className="inline-block rounded-full border border-[#D6AD65]/25 bg-[#15120F] px-3 py-1 text-xs font-medium text-[#BDB4A7]">
            Lesson Locked
          </span>
          <h3 className="font-serif text-xl font-medium text-white">
            {lesson.title}
          </h3>
          <p className="text-sm text-[#BDB4A7]">
            Complete the preceding lessons in order to unlock this lesson.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[#D6AD65]/25 bg-[#090807] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
        <div className="space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D6AD65] border-t-transparent" />
          <p className="text-sm text-[#BDB4A7]">Loading lesson player...</p>
        </div>
      </div>
    );
  }

  if (error || !playback?.embedUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-rose-500/30 bg-[#090807] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
        <div className="max-w-md space-y-3">
          <p className="text-sm text-rose-300">
            {error || "Unable to load lesson video right now."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="kbc-outline-btn !rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D6AD65]/30 bg-black shadow-[0_18px_48px_rgba(0,0,0,0.65)]">
      <div className="aspect-video w-full">
        <iframe
          key={`${lesson.id}:${playback.embedUrl}`}
          src={playback.embedUrl}
          title={lesson.title}
          className="h-full w-full border-0"
          allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
