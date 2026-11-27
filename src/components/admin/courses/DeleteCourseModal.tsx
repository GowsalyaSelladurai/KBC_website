"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DeleteCourseModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteCourseModal({
  courseId,
  courseTitle,
  onClose,
  onDeleted,
}: DeleteCourseModalProps) {
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleting, onClose]);

  async function handleConfirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete course.");
      }

      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete course.",
      );
      setDeleting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="animate-kbc-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => !deleting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-course-title"
    >
      <div
        className="animate-kbc-modal max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-[#D6AD65]/30 bg-[#15120F] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-500/35 bg-rose-950/60 text-base text-rose-300">
            🗑
          </div>
          <div>
            <h3
              id="delete-course-title"
              className="font-serif text-lg font-medium text-white"
            >
              Delete Course
            </h3>
            <p className="mt-1 text-xs text-[#BDB4A7]">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="rounded-xl border border-[#D6AD65]/20 bg-[#090807] p-3.5 text-xs leading-relaxed text-[#BDB4A7]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            &ldquo;{courseTitle}&rdquo;
          </span>
          ? All modules, lessons, and learning outcomes in this course will be
          removed.
        </p>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/50 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="kbc-outline-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirmDelete}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Course"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
