"use client";
import { useState } from "react";
import CourseCard, { PublicCourse } from "./CourseCard";

export default function CourseBrowser({
  courses = [],
  search = false,
}: {
  courses?: PublicCourse[];
  search?: boolean;
}) {
  const [q, setQ] = useState("");
  const list = courses.filter((c) =>
    c.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      {search && (
        <input
          className="input mb-4"
          placeholder="Search courses…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      )}
      {list.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-mute">
          {courses.length === 0
            ? "No published courses available yet."
            : "No courses match your search."}
        </div>
      )}
    </div>
  );
}
