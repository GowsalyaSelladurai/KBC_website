"use client";
import { useState } from "react";
import { courses } from "@/data/mock";
import CourseCard from "./CourseCard";
export default function CourseBrowser({ search = false }: { search?: boolean }) {
  const [f, setF] = useState<number | "all">("all"); const [q, setQ] = useState("");
  const list = courses.filter((c) => (f === "all" || c.days === f) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (<div>
    {search && <input className="input mb-3" placeholder="Search courses…" value={q} onChange={(e) => setQ(e.target.value)} />}
    <div className="mb-4 flex flex-wrap gap-2">{(["all", 1, 2, 7] as const).map((d) => (
      <button key={d} onClick={() => setF(d)} className={`rounded-full border px-4 py-1.5 text-sm ${f === d ? "border-gold bg-gold text-ink" : "border-line text-mute"}`}>{d === "all" ? "All courses" : `${d} day${d > 1 ? "s" : ""}`}</button>))}</div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((c) => <CourseCard key={c.id} c={c} />)}</div>
    {!list.length && <p className="text-mute">No courses match.</p>}
  </div>);
}
