import { courses, students, liveClasses, getCourse } from "@/data/mock";
export default function Dashboard() {
  const kpi = [[students.length + 42, "Students"], [courses.length, "Courses"], ["₹1.2L", "Revenue"], [liveClasses.length, "Upcoming live"]];
  return (<div><h1 className="mb-5 text-3xl font-bold">Dashboard</h1>
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{kpi.map(([v, l]) => <div key={l} className="card"><b className="font-serif text-3xl text-gold">{v}</b><p className="text-sm text-mute">{l}</p></div>)}</div>
    <div className="card mb-5"><h3 className="mb-3">Enrolments this week</h3><div className="flex h-36 items-end gap-3">{[40, 65, 30, 80, 55, 90, 60].map((h, i) => (
      <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t-md bg-gradient-to-b from-gold to-[#8c8750]" style={{ height: `${h}%` }} /><span className="text-xs text-mute">{"MTWTFSS"[i]}</span></div>))}</div></div>
    <div className="card"><h3 className="mb-2">Recent enrolments</h3>{students.map((s) => <div key={s.id} className="flex items-center justify-between border-t border-line py-2.5 text-sm"><div><b>{s.name}</b><p className="text-mute">{s.courses.map((i) => getCourse(i)?.name).join(", ")}</p></div><span className="tag">Active</span></div>)}</div></div>);
}
