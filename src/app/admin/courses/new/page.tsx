"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();

  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Makeup");
  const [duration, setDuration] = useState("7 Days");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [learningPoints, setLearningPoints] = useState<string[]>([""]);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function generateCourseCode() {
    const num = Math.floor(100 + Math.random() * 900);
    setCourseCode(`KBC-CRS-${num}`);
  }

  function handleImageChange(file: File | null) {
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  }

  function addLearningPoint() {
    setLearningPoints((prev) => [...prev, ""]);
  }

  function updateLearningPoint(index: number, value: string) {
    setLearningPoints((prev) =>
      prev.map((point, i) => (i === index ? value : point)),
    );
  }

  function removeLearningPoint(index: number) {
    setLearningPoints((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(asDraft?: boolean) {
    setError("");

    if (!courseCode.trim() || !title.trim() || price === "") {
      setError("Course code, title, and price are required.");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price in rupees.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadResponse = await fetch("/api/admin/courses/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Image upload failed.");
        }
        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: courseCode.trim(),
          title: title.trim(),
          description: description.trim(),
          duration: duration.trim(),
          price: numericPrice,
          imageUrl: imageUrl || null,
          learningPoints: learningPoints
            .map((p) => p.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const validationErrors = data.errors;
        if (Array.isArray(validationErrors)) {
          throw new Error(validationErrors.join(" "));
        }
        throw new Error(data.message || "Failed to create course.");
      }

      // If user toggled to published and not draft, update status
      if (!asDraft && status === "PUBLISHED") {
        await fetch(`/api/admin/courses/${data.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" }),
        });
      }

      // Redirect back to courses dashboard and revalidate
      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong while creating the course.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/courses")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b251e] text-[#c9a66a] transition hover:border-[#c9a66a] hover:bg-[#c9a66a]/10"
        >
          ←
        </button>
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#f4e5c5] sm:text-3xl">
            Add Course
          </h1>
          <p className="mt-0.5 text-xs text-[#8a857b]">
            Create a new course for KBC Salon Academy
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
                  onClick={() => {
                    setImage(null);
                    setImagePreview("");
                  }}
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
                  placeholder="e.g. Professional Makeup Masterclass"
                  className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#8a857b]">
                  Course Code <span className="text-red-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. KBC-CRS-003"
                    className="w-full rounded-xl border border-[#2e2720] bg-[#0c0c0b] px-3.5 py-2.5 pr-32 text-xs text-[#e8dfd1] outline-none focus:border-[#d8b16d]/60"
                  />
                  <button
                    type="button"
                    onClick={generateCourseCode}
                    className="absolute right-1.5 rounded-lg bg-[#c9a66a]/15 px-2.5 py-1 text-[11px] font-medium text-[#e5be75] transition hover:bg-[#c9a66a]/25"
                  >
                    ✨ Auto Generate
                  </button>
                </div>
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
                  Duration <span className="text-red-400">*</span>
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
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
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
                    placeholder="e.g. 5000"
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

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs text-[#8a857b]">
                Course Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                className="w-full resize-none rounded-xl border border-[#2e2720] bg-[#0c0c0b] p-3 text-xs leading-relaxed text-[#e8dfd1] outline-none placeholder:text-[#5a544a] focus:border-[#d8b16d]/60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Learning Points */}
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

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#26211b] pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="rounded-xl border border-[#2e2720] px-6 py-2.5 text-xs text-[#b8b0a2] transition hover:bg-[#1a1815] hover:text-[#e8dfd1]"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-2 rounded-xl border border-[#80623c]/50 bg-[#161412] px-5 py-2.5 text-xs font-medium text-[#e5be75] transition hover:bg-[#201c18]"
          >
            <span>💾</span>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d5a45a] to-[#f0cf91] px-6 py-2.5 text-xs font-semibold text-[#1a140d] shadow-lg shadow-[#c9a66a]/20 transition hover:brightness-110 disabled:opacity-50"
          >
            <span>{loading ? "Creating..." : "Create Course →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
