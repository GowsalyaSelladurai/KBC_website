"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DraftCurriculumEditor, {
  type EditorModule,
} from "./DraftCurriculumEditor";
import DeleteCourseModal from "./DeleteCourseModal";
import {
  validateMinimumCourseVideos,
  type VideoStatusValue,
} from "@/lib/courses/validation";

export type InitialCourseData = {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  price: string | number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  learningPoints: { id: string; content: string }[];
  modules: {
    id: string;
    title: string;
    sortOrder: number;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      sortOrder: number;
      durationSeconds: number | null;
      isPreview: boolean;
      bunnyVideoId: string | null;
      videoStatus: VideoStatusValue;
    }[];
  }[];
};

interface CourseEditorFormProps {
  mode: "create" | "edit";
  initialCourse?: InitialCourseData;
}

export default function CourseEditorForm({
  mode,
  initialCourse,
}: CourseEditorFormProps) {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  const [courseCode, setCourseCode] = useState(
    initialCourse?.courseCode ?? "",
  );
  const [title, setTitle] = useState(initialCourse?.title ?? "");
  const [description, setDescription] = useState(
    initialCourse?.description ?? "",
  );
  const [category, setCategory] = useState("Makeup");
  const [duration, setDuration] = useState(
    initialCourse?.duration || "7 Days",
  );
  const [price, setPrice] = useState(
    initialCourse ? String(initialCourse.price) : "",
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialCourse?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  );
  const [learningPoints, setLearningPoints] = useState<string[]>(
    initialCourse && initialCourse.learningPoints.length > 0
      ? initialCourse.learningPoints.map((p) => p.content)
      : [""],
  );
  const [modules, setModules] = useState<EditorModule[]>(() =>
    (initialCourse?.modules ?? []).map((mod, modIndex) => ({
      clientId: mod.id,
      id: mod.id,
      title: mod.title,
      sortOrder: modIndex,
      lessons: (mod.lessons ?? []).map((lesson, lessonIndex) => ({
        clientId: lesson.id,
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        sortOrder: lessonIndex,
        durationSeconds: lesson.durationSeconds,
        isPreview: lesson.isPreview,
        bunnyVideoId: lesson.bunnyVideoId,
        videoStatus: lesson.videoStatus,
      })),
    })),
  );

  const [savedImageUrl, setSavedImageUrl] = useState(
    initialCourse?.imageUrl ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    initialCourse?.imageUrl ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function generateCourseCode() {
    const num = Math.floor(100 + Math.random() * 900);
    setCourseCode(`KBC-${num}`);
  }

  function handleImageChange(file: File | null) {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : savedImageUrl);
    if (file) {
      setImageError("");
    }
  }

  function applyDescriptionFormat(prefix: string, suffix = "") {
    const el = descRef.current;
    if (!el) {
      setDescription((prev) => `${prev}${prefix}${suffix}`);
      return;
    }
    const start = el.selectionStart ?? description.length;
    const end = el.selectionEnd ?? description.length;
    const selected = description.slice(start, end) || "text";
    const next =
      description.slice(0, start) +
      prefix +
      selected +
      suffix +
      description.slice(end);
    setDescription(next);
  }

  function addLearningPoint() {
    setLearningPoints((prev) => [...prev, ""]);
  }

  function updateLearningPoint(index: number, value: string) {
    setLearningPoints((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function removeLearningPoint(index: number) {
    setLearningPoints((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index),
    );
  }

  async function handleFinalSave(targetStatus: "DRAFT" | "PUBLISHED") {
    if (isSubmittingRef.current || saving) return;
    setError("");
    setImageError("");

    if (!imageFile && !savedImageUrl.trim()) {
      setImageError("Course image is required.");
      setError("Course image is required.");
      return;
    }

    if (!courseCode.trim() || !title.trim() || price === "") {
      setError("Please enter a course title, course code, and price.");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    const videoRuleError = validateMinimumCourseVideos(duration, modules);
    if (videoRuleError) {
      setError(videoRuleError);
      return;
    }

    if (targetStatus === "PUBLISHED") {
      if (modules.length === 0) {
        setError("Add at least one module before publishing.");
        return;
      }
      const hasLesson = modules.some((m) => m.lessons.length > 0);
      if (!hasLesson) {
        setError("Add at least one lesson before publishing.");
        return;
      }
    }

    isSubmittingRef.current = true;
    setSaving(true);

    try {
      let imageUrl = savedImageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await fetch("/api/admin/courses/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.error ||
              "Could not upload cover image. Please try again.",
          );
        }
        imageUrl = uploadData.imageUrl;
        setSavedImageUrl(imageUrl);
        setImageFile(null);
      }

      const payload = {
        courseCode: courseCode.trim(),
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim(),
        price: numericPrice,
        imageUrl: imageUrl || null,
        learningPoints: learningPoints.map((p) => p.trim()).filter(Boolean),
        modules: modules.map((mod, modIndex) => ({
          ...(mod.id ? { id: mod.id } : {}),
          title: mod.title.trim() || `Module ${modIndex + 1}`,
          sortOrder: modIndex,
          lessons: mod.lessons.map((lesson, lessonIndex) => ({
            ...(lesson.id ? { id: lesson.id } : {}),
            title: lesson.title.trim(),
            description: lesson.description,
            sortOrder: lessonIndex,
            durationSeconds: lesson.durationSeconds,
            isPreview: lesson.isPreview,
            bunnyVideoId: lesson.bunnyVideoId,
            videoStatus: lesson.videoStatus,
          })),
        })),
      };

      const isEdit = mode === "edit" && initialCourse?.id;
      const endpoint = isEdit
        ? `/api/admin/courses/${initialCourse.id}`
        : "/api/admin/courses";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const savedCourse = await response.json();
      if (!response.ok) {
        const validationErrors = savedCourse.errors;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          throw new Error(validationErrors.join(" "));
        }
        throw new Error(
          savedCourse.message || "Unable to save course right now.",
        );
      }

      const savedCourseId = savedCourse.id || initialCourse?.id;
      const currentSavedStatus = savedCourse.status || "DRAFT";

      if (savedCourseId && targetStatus !== currentSavedStatus) {
        const statusRes = await fetch(
          `/api/admin/courses/${savedCourseId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: targetStatus }),
          },
        );
        const statusData = await statusRes.json().catch(() => ({}));
        if (!statusRes.ok) {
          throw new Error(
            statusData.error || "Course saved, but publish status failed.",
          );
        }
      }

      setStatus(targetStatus);
      router.push(
        isEdit ? `/admin/courses/${savedCourseId}` : "/admin/courses",
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the course.",
      );
    } finally {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  }

  const backHref =
    mode === "edit" && initialCourse
      ? `/admin/courses/${initialCourse.id}`
      : "/admin/courses";

  return (
    <div className="animate-kbc-in mx-auto max-w-[1440px] space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex items-center gap-1.5 text-xs text-[#BDB4A7] transition hover:text-[#F1D69A]"
          >
            <span>←</span>
            <span>Back to Courses</span>
          </button>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            {mode === "edit" ? "Edit Course" : "Add New Course"}
          </h1>
          <p className="mt-1 text-xs text-[#BDB4A7] sm:text-sm">
            {mode === "edit"
              ? "Update your course details and curriculum"
              : "Create a new course and inspire more learners"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleFinalSave("DRAFT")}
            className="kbc-outline-btn"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleFinalSave("PUBLISHED")}
            className="kbc-gold-btn"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Update & Publish"
                : "Publish Course"}
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.45fr_1fr]">
        {/* Left Column: Course Information + Course Curriculum */}
        <div className="space-y-6">
          {/* 1. Course Information */}
          <section className="kbc-gold-card rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D6AD65] to-[#F1D69A] text-xs font-bold text-[#090807]">
                1
              </span>
              <h2 className="font-serif text-lg font-medium text-white">
                Course Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[210px_1fr]">
              {/* Cover Image */}
              <div className="space-y-3">
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-[#090807] transition-colors md:aspect-square ${
                    imageError
                      ? "border-rose-500/80 ring-1 ring-rose-500/40"
                      : "border-[#D6AD65]/25"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Course cover"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove cover image"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setSavedImageUrl("");
                        }}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-xs text-white transition hover:bg-rose-500"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                      <span className="text-2xl text-[#D6AD65]/50">✦</span>
                      <span className="mt-1 text-[11px] text-[#BDB4A7]">
                        JPG, PNG, WEBP (Max 5MB)
                      </span>
                    </div>
                  )}
                </div>

                <label className="kbc-gold-btn w-full cursor-pointer">
                  <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                </label>

                {imageError && (
                  <p className="text-xs font-medium text-rose-400">
                    {imageError}
                  </p>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs text-[#BDB4A7]">
                      Course Title <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-[#BDB4A7]/70">
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Professional Makeup Techniques"
                    className="kbc-input"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-[#BDB4A7]">
                      Course Code <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="KBC-001"
                        className="kbc-input pr-20"
                      />
                      <button
                        type="button"
                        onClick={generateCourseCode}
                        className="absolute right-1.5 rounded-lg border border-[#D6AD65]/30 bg-[#211A12] px-2.5 py-1 text-[10px] font-semibold text-[#F1D69A] transition hover:border-[#D6AD65]"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs text-[#BDB4A7]">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="kbc-input"
                    >
                      <option value="Makeup">Makeup</option>
                      <option value="Hair">Hair Styling</option>
                      <option value="Nails">Nail Art</option>
                      <option value="Skincare">Skincare</option>
                      <option value="Beauty">Styling &amp; Draping</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-[#BDB4A7]">
                      Price (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2999"
                      className="kbc-input"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs text-[#BDB4A7]">
                      Duration (Days) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="kbc-input"
                    >
                      <option value="1 Day">1 Day</option>
                      <option value="2 Days">2 Days</option>
                      <option value="3 Days">3 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="7 Days">7 Days</option>
                      <option value="10 Days">10 Days</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months">3 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs text-[#BDB4A7]">
                      Description
                    </label>
                    <span className="text-[10px] text-[#BDB4A7]/70">
                      {description.length}/500
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[#D6AD65]/25 bg-[#090807] focus-within:border-[#D6AD65]">
                    <div className="flex items-center gap-1 border-b border-[#D6AD65]/15 bg-[#15120F] px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => applyDescriptionFormat("**", "**")}
                        title="Bold"
                        className="rounded px-2 py-0.5 font-serif text-xs font-bold text-[#BDB4A7] hover:bg-[#211A12] hover:text-[#F1D69A]"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDescriptionFormat("*", "*")}
                        title="Italic"
                        className="rounded px-2 py-0.5 font-serif text-xs italic text-[#BDB4A7] hover:bg-[#211A12] hover:text-[#F1D69A]"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDescriptionFormat("\n- ")}
                        title="Bullet item"
                        className="rounded px-2 py-0.5 text-xs text-[#BDB4A7] hover:bg-[#211A12] hover:text-[#F1D69A]"
                      >
                        • List
                      </button>
                    </div>
                    <textarea
                      ref={descRef}
                      rows={3}
                      maxLength={500}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Master professional makeup techniques from basics to advanced level..."
                      className="w-full resize-none bg-transparent p-3 text-sm leading-relaxed text-white outline-none placeholder:text-[#7a7165]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Course Curriculum (includes per-lesson video upload) */}
          <DraftCurriculumEditor
            duration={duration}
            courseImageUrl={imagePreview || null}
            modules={modules}
            onChange={setModules}
          />
        </div>

        {/* Right Column: Learning Outcomes + Publishing Settings */}
        <div className="space-y-6">
          {/* 2. Learning Outcomes */}
          <section className="kbc-gold-card rounded-2xl p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D6AD65] to-[#F1D69A] text-xs font-bold text-[#090807]">
                2
              </span>
              <h2 className="font-serif text-lg font-medium text-white">
                Learning Outcomes
              </h2>
            </div>
            <p className="mb-4 text-xs text-[#BDB4A7]">
              What will students learn?
            </p>

            <div className="space-y-2.5">
              {learningPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 rounded-xl border border-[#D6AD65]/20 bg-[#090807] px-3 py-2.5 transition focus-within:border-[#D6AD65]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D6AD65] to-[#F1D69A] text-[10px] font-bold text-[#090807]">
                    ✓
                  </span>
                  <input
                    value={point}
                    onChange={(e) => updateLearningPoint(index, e.target.value)}
                    placeholder={`Learning outcome ${index + 1}`}
                    className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#7a7165]"
                  />
                  {learningPoints.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove outcome ${index + 1}`}
                      onClick={() => removeLearningPoint(index)}
                      className="text-xs text-[#BDB4A7] transition hover:text-rose-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLearningPoint}
              className="kbc-outline-btn mt-4 w-full"
            >
              <span>+</span>
              <span>Add Outcome</span>
            </button>
          </section>

          {/* 4. Publishing Settings */}
          <section className="kbc-gold-card rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D6AD65] to-[#F1D69A] text-xs font-bold text-[#090807]">
                4
              </span>
              <h2 className="font-serif text-lg font-medium text-white">
                Publishing Settings
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#D6AD65]/20 bg-[#090807] p-4">
              <div>
                <p className="text-xs font-medium text-white">
                  Course Visibility
                </p>
                <p className="mt-0.5 text-[11px] text-[#BDB4A7]">
                  {status === "PUBLISHED"
                    ? "Your course will be visible to all users."
                    : "Saved as draft. Hidden from public students."}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={status === "PUBLISHED"}
                onClick={() =>
                  setStatus((prev) =>
                    prev === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  )
                }
                className="flex shrink-0 items-center gap-2"
              >
                <span className="text-xs font-medium text-[#F1D69A]">
                  {status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    status === "PUBLISHED"
                      ? "bg-[#D6AD65]"
                      : "bg-[#211A12] ring-1 ring-[#D6AD65]/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-[#090807] transition-transform ${
                      status === "PUBLISHED"
                        ? "translate-x-6"
                        : "translate-x-1 bg-[#BDB4A7]"
                    }`}
                  />
                </span>
              </button>
            </div>

            {mode === "edit" && initialCourse && (
              <div className="mt-4 border-t border-[#D6AD65]/15 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/15"
                >
                  Delete Course
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Validation Error Banner */}
      {error && (
        <div className="animate-kbc-in rounded-xl border border-rose-500/35 bg-rose-950/40 px-4 py-3 text-xs font-medium text-rose-200">
          {error}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#D6AD65]/20 pt-5">
        <button
          type="button"
          disabled={saving}
          onClick={() => router.push(backHref)}
          className="kbc-outline-btn"
        >
          Cancel
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleFinalSave("DRAFT")}
            className="kbc-outline-btn"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleFinalSave("PUBLISHED")}
            className="kbc-gold-btn"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Update & Publish"
                : "Publish Course"}
          </button>
        </div>
      </div>

      {showDeleteModal && initialCourse && (
        <DeleteCourseModal
          courseId={initialCourse.id}
          courseTitle={title || initialCourse.title}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            router.push("/admin/courses");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
