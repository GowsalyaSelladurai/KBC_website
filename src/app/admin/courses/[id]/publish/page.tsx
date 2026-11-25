"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  price: string | number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  modules: {
    id: string;
    title: string;
    lessons: { id: string }[];
  }[];
};

function formatPrice(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function PublishConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Unable to load course.");
        setCourse(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load course.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  async function handlePublish() {
    if (!course) return;
    setPublishing(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to publish.");

      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#aaa59a]">
        Loading publication details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-rose-300">{error || "Course not found."}</p>
        <button
          onClick={() => router.push("/admin/courses")}
          className="mt-5 rounded-lg border border-[#80623c]/50 px-4 py-2 text-sm text-[#c9a66a]"
        >
          Back to courses
        </button>
      </div>
    );
  }

  const totalModules = course.modules?.length ?? 3;
  const totalLessons =
    course.modules?.reduce((t, m) => t + (m.lessons?.length ?? 0), 0) || 12;

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-10">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b251e] text-[#c9a66a] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/10"
        >
          ←
        </button>
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
            Publish Confirmation
          </h1>
          <p className="mt-0.5 text-xs text-[#8a857b]">
            Confirm and make your course live
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Glowing Checkmark & Title Section */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2b251e] bg-[#121110] py-10 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#d8b16d]/10 to-transparent blur-2xl" />

        {/* Large Glowing Gold Checkmark Circle */}
        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d8b16d] bg-gradient-to-tr from-[#241c12] to-[#12110f] shadow-[0_0_50px_rgba(216,177,109,0.35)] ring-4 ring-[#d8b16d]/10">
          <svg
            className="h-12 w-12 text-[#f4e5c5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h2 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
          Ready to Publish?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#8a857b]">
          Your course &ldquo;
          <strong className="font-semibold text-[#e8dfd1]">{course.title}</strong>
          &rdquo; will be published and available for students immediately.
        </p>
      </div>

      {/* Course Summary Horizontal Box */}
      <div className="overflow-hidden rounded-2xl border border-[#3d3224]/60 bg-[#121110] p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1px_340px]">
          {/* Left Column: Image + Main details */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-[#3d3224]/50 bg-[#0c0c0b]">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-[#d8b16d]/40">
                  💄
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Published
              </span>

              <h3 className="font-serif text-xl font-medium text-[#f4e5c5]">
                {course.title}
              </h3>

              <p className="flex items-center gap-2 text-xs text-[#8a857b]">
                <span>🎓</span>
                <span>Makeup · Beauty</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#a9a296]">
                <span className="flex items-center gap-1.5">
                  <span>🕐</span>
                  <span>{course.duration || "7 Days"}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#e8dfd1]">
                  <span>₹</span>
                  <span>{formatPrice(course.price)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span>👥</span>
                  <span>428 Enrolled</span>
                </span>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden bg-[#241f1a] md:block" />

          {/* Right Column: Course Summary Stats */}
          <div className="flex flex-col justify-center space-y-3 pl-0 md:pl-2">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">📜</span>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d8b16d]">
                Course Summary
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-[#a9a296]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7a7469]">
                  <span>👥</span>
                  <span>Modules</span>
                </span>
                <span className="font-medium text-[#e8dfd1]">
                  {totalModules} Modules
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7a7469]">
                  <span>📚</span>
                  <span>Lessons</span>
                </span>
                <span className="font-medium text-[#e8dfd1]">
                  {totalLessons} Lessons
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7a7469]">
                  <span>📅</span>
                  <span>Duration</span>
                </span>
                <span className="font-medium text-[#e8dfd1]">
                  {course.duration || "7 Days"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7a7469]">
                  <span>₹</span>
                  <span>Price</span>
                </span>
                <span className="font-medium text-[#e8dfd1]">
                  {formatPrice(course.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice Box */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-[#c9a66a]/30 bg-[#c9a66a]/5 p-4 sm:p-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9a66a]/20 text-xs font-bold text-[#f4e5c5]">
          i
        </div>
        <div>
          <h5 className="text-xs font-semibold text-[#f4e5c5]">Important</h5>
          <p className="mt-0.5 text-xs text-[#8a857b]">
            Once published, students will be able to enroll and access this course
            from your website.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <button
          onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#2e2720] bg-[#121110] px-7 py-3 text-xs font-medium text-[#b8b0a2] transition hover:bg-[#1c1a17] hover:text-[#e8dfd1] sm:w-auto"
        >
          <span>←</span>
          <span>Go Back to Edit</span>
        </button>

        <button
          disabled={publishing}
          onClick={handlePublish}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-8 py-3 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/25 transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
        >
          <span>🚀</span>
          <span>{publishing ? "Publishing..." : "Confirm Publish"}</span>
        </button>
      </div>
    </div>
  );
}
