
"use client";

import { useState } from "react";
import { courses } from "@/data/mock";
import CourseCard from "./CourseCard";

export default function CourseBrowser({
  search = false,
}: {
  search?: boolean;
}) {
  const [f, setF] = useState<number | "all">("all");
  const [q, setQ] = useState("");

  const filters = ["all", 1, 2, 7] as const;

  const list = courses.filter(
    (c) =>
      (f === "all" || c.days === f) &&
      c.name.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="w-full">

      {/* Search Bar */}
      {search && (
        <div className="relative mb-5 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D8C58A]">
            ⌕
          </span>

          <input
            className="w-full rounded-xl border border-white/10 bg-[#191c1a] py-3 pl-11 pr-4 text-sm text-[#F2EEE3] outline-none transition-all placeholder:text-[#777A73] focus:border-[#D8C58A]/60 focus:ring-1 focus:ring-[#D8C58A]/20"
            placeholder="Search your favourite course..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((d) => {
          const active = f === d;

          return (
            <button
              key={d}
              onClick={() => setF(d)}
              className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                active
                  ? "border-[#D8C58A] bg-[#D8C58A] text-[#171918] shadow-[0_4px_15px_rgba(216,197,138,0.15)]"
                  : "border-white/10 bg-[#191c1a] text-[#AAA99F] hover:border-[#D8C58A]/50 hover:text-[#D8C58A]"
              }`}
            >
              {d === "all"
                ? "All Courses"
                : `${d} Day${d > 1 ? "s" : ""}`}
            </button>
          );
        })}
      </div>

      {/* Course Count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs tracking-wide text-[#999B94]">
          Explore our courses
        </p>

        <span className="text-[11px] text-[#D8C58A]">
          {list.length} Courses
        </span>
      </div>

      {/* Course Grid */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#191c1a] px-5 py-12 text-center">
          <span className="text-3xl">⌕</span>

          <p className="mt-3 text-sm font-medium text-[#E8E3D5]">
            No courses found
          </p>

          <p className="mt-1 text-xs text-[#999B94]">
            Try another search or select a different filter.
          </p>

          <button
            onClick={() => {
              setF("all");
              setQ("");
            }}
            className="mt-4 text-xs font-semibold text-[#D8C58A] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
