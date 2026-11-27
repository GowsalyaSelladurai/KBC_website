
"use client";

import { useMemo, useState } from "react";
import { courses } from "@/data/mock";
import CourseCard from "./CourseCard";
import { Search, Sparkles, SlidersHorizontal } from "lucide-react";

export default function CourseBrowser({
  search = false,
}: {
  search?: boolean;
}) {
  const [f, setF] = useState<number | "all">("all");
  const [q, setQ] = useState("");

  const filters = ["all", 1, 2, 7] as const;

  const list = useMemo(
    () =>
      courses.filter(
        (c) =>
          (f === "all" || c.days === f) &&
          c.name.toLowerCase().includes(q.toLowerCase().trim())
      ),
    [f, q]
  );

  return (
    <div className="w-full">
      {/* Search and Filter Header */}
      <div className="mb-8 space-y-6">
        {search && (
          <div className="relative mx-auto max-w-2xl">
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#C9A45C]/30 via-[#EFE8A8]/40 to-[#C9A45C]/30 opacity-70 blur-md" />

            <div className="relative flex items-center rounded-2xl border border-[#C9A45C]/35 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(100,75,35,0.07)] transition-all duration-300 focus-within:border-[#C9A45C] focus-within:shadow-[0_0_25px_rgba(201,164,92,0.20)]">
              <Search className="mr-3 h-5 w-5 shrink-0 text-[#B18A45]" />

              <input
                className="w-full border-0 bg-transparent text-sm text-[#242424] outline-none placeholder:text-[#A59C8D] focus:outline-none focus:ring-0"
                placeholder="Search your favourite beauty course..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search courses"
              />

              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="ml-3 rounded-full px-3 py-1 text-xs font-semibold text-[#A77B32] transition hover:bg-[#EFE8A8]/40"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#B18A45]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#766A55]">
              Find your learning duration
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A18F70]">
            <Sparkles className="h-3.5 w-3.5" />
            Curated learning experiences
          </div>
        </div>

        {/* Duration Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {filters.map((d) => {
            const active = f === d;

            return (
              <button
                key={d}
                type="button"
                onClick={() => setF(d)}
                aria-pressed={active}
                className={`group relative overflow-hidden rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  active
                    ? "border-[#B18A45] bg-gradient-to-r from-[#B18A45] via-[#D9BD7B] to-[#B18A45] text-[#242424] shadow-[0_5px_18px_rgba(177,138,69,0.30)]"
                    : "border-[#C9A45C]/35 bg-white text-[#766A55] hover:-translate-y-0.5 hover:border-[#B18A45] hover:bg-[#EFE8A8]/30 hover:text-[#94743A] hover:shadow-[0_5px_18px_rgba(177,138,69,0.13)]"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}

                <span className="relative">
                  {d === "all" ? "✦ All Courses" : `${d} Day${d > 1 ? "s" : ""}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-5 flex items-center justify-between border-b border-[#C9A45C]/20 pb-4">
        <p className="text-sm text-[#817766]">
          Showing{" "}
          <span className="font-bold text-[#A77B32]">{list.length}</span>{" "}
          {list.length === 1 ? "course" : "courses"}
        </p>

        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18A45]">
          KBC Signature Collection
        </span>
      </div>

      {/* Premium Course Cards */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c, index) => (
            <div
              key={c.id}
              className="group relative h-full rounded-[22px] p-[1px] transition-all duration-500 hover:-translate-y-2 active:scale-[0.99]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Animated Gold Glow */}
              <div className="pointer-events-none absolute -inset-[2px] rounded-[24px] bg-gradient-to-br from-[#C9A45C] via-[#EFE8A8] to-[#A77B32] opacity-0 blur-[8px] transition-all duration-500 group-hover:opacity-60 group-active:opacity-50" />

              {/* Gold Border */}
              <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#C9A45C]/50 via-white/70 to-[#B18A45]/40 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Card Content */}
              <div className="relative h-full overflow-hidden rounded-[21px] bg-white shadow-[0_8px_28px_rgba(80,60,30,0.07)] transition-all duration-500 group-hover:shadow-[0_18px_45px_rgba(120,88,35,0.17)]">
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#A77B32] via-[#EFE8A8] to-[#A77B32] transition-transform duration-500 group-hover:scale-x-100" />

                <div className="h-full [&>*]:h-full">
                  <CourseCard c={c} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#C9A45C]/40 bg-white/70 px-5 py-16 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#EFE8A8]/50">
            <Search className="h-6 w-6 text-[#A77B32]" />
          </div>

          <h3 className="text-lg font-bold text-[#3B352B]">
            No courses found
          </h3>

          <p className="mt-2 text-sm text-[#8B8172]">
            Try another search term or choose a different duration.
          </p>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setF("all");
            }}
            className="mt-5 rounded-full bg-gradient-to-r from-[#B18A45] to-[#D9BD7B] px-6 py-2.5 text-sm font-semibold text-[#242424] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            View all courses
          </button>
        </div>
      )}
    </div>
  );
}
