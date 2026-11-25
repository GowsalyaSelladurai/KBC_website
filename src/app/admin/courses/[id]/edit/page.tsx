"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type CourseData = {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  duration: string | null;
  price: string | number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  learningPoints: { content: string }[];
  modules: {
    id: string;
    title: string;
    sortOrder: number;
    lessons: { id: string; title: string }[];
  }[];
};

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Makeup");
  const [duration, setDuration] = useState("7 Days");
  const [price, setPrice] = useState("");
  const [learningPoints, setLearningPoints] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [modules, setModules] = useState<CourseData["modules"]>([]);

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load course.");
        }

        const course: CourseData = data;
        setCourseCode(course.courseCode);
        setTitle(course.title);
        setDescription(course.description || "");
        setDuration(course.duration || "7 Days");
        setPrice(String(course.price));
        setImageUrl(course.imageUrl || "");
        setImagePreview(course.imageUrl || "");
        setStatus(course.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
        setModules(course.modules || []);
        setLearningPoints(
          course.learningPoints.length > 0
            ? course.learningPoints.map((p) => p.content)
            : ["Advanced makeup techniques", "Professional bridal makeup"],
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load course.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  function handleImageChange(file: File | null) {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(imageUrl);
    }
  }

  function addLearningPoint() {
    setLearningPoints((prev) => [...prev, ""]);
  }

  function updateLearningPoint(index: number, value: string) {
    setLearningPoints((prev) =>
      prev.map((p, i) => (i === index ? value : p)),
    );
  }

  function removeLearningPoint(index: number) {
    setLearningPoints((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(asDraft?: boolean) {
    setSaving(true);
    setError("");

    try {
      let updatedImageUrl = imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await fetch("/api/admin/courses/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Image upload failed.");
        }
        updatedImageUrl = uploadData.imageUrl;
      }

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode,
          title,
          description,
          duration,
          price: Number(price),
          imageUrl: updatedImageUrl,
          learningPoints: learningPoints.filter(Boolean),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || data.errors?.join(", ") || "Failed to update course.",
        );
      }

      // Update status
      const targetStatus = asDraft ? "DRAFT" : status;
      await fetch(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  const totalLessons = modules.reduce((t, m) => t + m.lessons.length, 0);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#aaa59a]">
        Loading course details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b251e] text-[#c9a66a] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/10"
        >
          ←
        </button>
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
            Edit Course
          </h1>
          <p className="mt-0.5 text-xs text-[#8a857b]">
            Update course details, media and learning outcomes
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Top Row: Course Image + Course Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left Card: Course Image */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#26211b] bg-[#121110] p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">🖼</span>
              <h2 className="text-sm font-medium text-[#e8dfd1]">
                Course Image <span className="text-red-400">*</span>
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#7a7469]">
              Upload a beautiful cover image for your course
            </p>

            {/* Drag & Drop Upload Zone */}
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#80623c]/40 bg-[#0c0c0b] px-4 py-8 text-center transition hover:border-[#c9a66a]">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a66a]/10 text-xl text-[#c9a66a]">
                ☁
              </div>
              <p className="text-xs text-[#8a857b]">
                Drag & Drop your image here
              </p>
              <p className="my-1 text-[11px] text-[#635d54]">or</p>
              <span className="rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-4 py-1.5 text-xs font-semibold text-[#1a140d]">
                Browse Files
              </span>
              <p className="mt-3 text-[10px] text-[#635d54]">
                Supports: JPG, PNG, WEBP · Max Size: 5MB
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview Card */}
          {imagePreview && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#2e2720] bg-[#0c0c0b] p-2.5">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-[#3d3224]/50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview("")}
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[9px] text-white"
                >
                  ✕
                </button>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#2e2720] px-3 py-1.5 text-xs text-[#d8b16d] transition hover:bg-[#c9a66a]/10">
                <span>🔄</span>
                <span>Change Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Card: Course Details */}
        <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-6">
          <div className="flex items-center gap-2">
            <span className="text-[#c9a66a]">📄</span>
            <h2 className="text-sm font-medium text-[#e8dfd1]">
              Course Details
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {/* Title + Code */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Course Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Professional Makeup"
                  className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Course Code
                </label>
                <input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="KBC-CRS-006"
                  className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                />
              </div>
            </div>

            {/* Category + Duration */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#c9a66a]">
                    🎨
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2.5 pl-9 pr-4 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                  >
                    <option value="Makeup">Makeup</option>
                    <option value="Hair">Hair Styling</option>
                    <option value="Nails">Nail Art</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Beauty">Beauty & Draping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Duration (Days) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#c9a66a]">
                    📅
                  </span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2.5 pl-9 pr-4 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                  >
                    <option value="3 Days">3 Days</option>
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="10 Days">10 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8a857b]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] py-2.5 pl-8 pr-4 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("PUBLISHED")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition ${
                      status === "PUBLISHED"
                        ? "bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] text-[#1a140d] font-semibold"
                        : "border border-[#2e2720] bg-[#0c0c0b] text-[#8a857b] hover:text-[#d8b16d]"
                    }`}
                  >
                    <span>✓</span>
                    <span>Publish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("DRAFT")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition ${
                      status === "DRAFT"
                        ? "bg-[#2b251e] text-[#f4e5c5] border border-[#d8b16d]/40"
                        : "border border-[#2e2720] bg-[#0c0c0b] text-[#8a857b] hover:text-[#d8b16d]"
                    }`}
                  >
                    <span>◎</span>
                    <span>Draft</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description with Toolbar */}
            <div>
              <label className="mb-1.5 block text-xs text-[#8a857b]">
                Course Description <span className="text-red-400">*</span>
              </label>
              <div className="rounded-xl border border-[#2e2720] bg-[#0c0c0b]">
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
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full resize-none bg-transparent p-3.5 text-xs leading-relaxed text-[#e8dfd1] outline-none placeholder:text-[#5a544a]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: What You Will Learn + Course Curriculum */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: What You Will Learn */}
        <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">📖</span>
              <h2 className="text-sm font-medium text-[#e8dfd1]">
                What You Will Learn
              </h2>
            </div>
            <button
              type="button"
              onClick={addLearningPoint}
              className="rounded-lg border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-3 py-1 text-xs text-[#d8b16d] transition hover:bg-[#c9a66a]/20"
            >
              + Add Point
            </button>
          </div>
          <p className="mt-1 text-xs text-[#7a7469]">
            Add key learning points for this course
          </p>

          <div className="mt-4 space-y-2.5">
            {learningPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 rounded-xl border border-[#26211b] bg-[#0c0c0b] p-2"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                  ✓
                </div>
                <input
                  value={point}
                  onChange={(e) => updateLearningPoint(index, e.target.value)}
                  placeholder={`Learning point ${index + 1}`}
                  className="flex-1 bg-transparent text-xs text-[#e8dfd1] outline-none"
                />
                {learningPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLearningPoint(index)}
                    className="flex h-6 w-6 items-center justify-center rounded text-xs text-[#736c62] hover:text-rose-400"
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Course Curriculum */}
        <div className="rounded-2xl border border-[#26211b] bg-[#121110] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#c9a66a]">▶</span>
              <h2 className="text-sm font-medium text-[#e8dfd1]">
                Course Curriculum
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#2e2720] bg-[#0c0c0b] px-2.5 py-0.5 text-[10px] text-[#8a857b]">
                {modules.length} Modules · {totalLessons} Lessons
              </span>
              <button
                type="button"
                onClick={() => router.push(`/admin/courses/${courseId}?curriculum=1`)}
                className="rounded-lg border border-[#c9a66a]/40 bg-[#c9a66a]/10 px-3 py-1 text-xs text-[#d8b16d] transition hover:bg-[#c9a66a]/20"
              >
                Manage
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-[#7a7469]">
            Add modules and video lessons
          </p>

          <div className="mt-4 space-y-2.5">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between rounded-xl border border-[#26211b] bg-[#0c0c0b] px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#c9a66a]">▶</span>
                  <span className="font-medium text-[#e8dfd1]">{mod.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#7a7469]">
                    {mod.lessons.length} Lessons
                  </span>
                  <svg className="h-3.5 w-3.5 text-[#736c62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ))}
            {modules.length === 0 && (
              <p className="py-6 text-center text-xs text-[#7a7469]">
                No modules added yet. Manage curriculum in Course Preview.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#26211b] pt-5">
        <button
          type="button"
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="rounded-xl border border-[#2e2720] px-6 py-2.5 text-xs text-[#b8b0a2] transition hover:bg-[#1a1815] hover:text-[#e8dfd1]"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-2 rounded-xl border border-[#80623c]/50 bg-[#161412] px-5 py-2.5 text-xs font-medium text-[#e5be75] transition hover:bg-[#201c18]"
          >
            <span>💾</span>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-6 py-2.5 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/20 transition hover:brightness-110 disabled:opacity-50"
          >
            <span>{saving ? "Saving..." : "Save Changes →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
