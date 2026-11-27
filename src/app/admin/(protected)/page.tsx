import { q } from "@/lib/db";
export default async function Dashboard() {
  const [k] = await q(`select (select count(*)::int from users where role='student') students,(select count(*)::int from courses) courses,
    (select coalesce(sum(c.price),0)::float from enrollments e join courses c on c.id=e.course_id where e.payment_status='paid') revenue,(select count(*)::int from live_classes where starts_at>now()) live`);
  const week = await q(`select to_char(g.d,'Dy') label,count(e.id)::int n from generate_series(current_date-6,current_date,'1 day') g(d) left join enrollments e on e.enrolled_at::date=g.d group by g.d order by g.d`);
  const recent = await q(`select u.name,c.name course from enrollments e join users u on u.id=e.user_id join courses c on c.id=e.course_id order by e.enrolled_at desc limit 5`);
  const max = Math.max(1, ...week.map((w: any) => w.n));
  const kpi = [[k.students, "Students"], [k.courses, "Courses"], `₹${Number(k.revenue).toLocaleString("en-IN")}`, [k.live, "Upcoming live"]].map((x: any) => (Array.isArray(x) ? x : [x, "Revenue"]));
  return (<div><h1 className="mb-5 text-3xl font-bold">Dashboard</h1>
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{kpi.map(([v, l]: any) => <div key={l} className="card"><b className="font-serif text-3xl text-gold">{v}</b><p className="text-sm text-mute">{l}</p></div>)}</div>
    <div className="card mb-5"><h3 className="mb-3">Enrolments (last 7 days)</h3><div className="flex h-36 items-end gap-3">{week.map((w: any, i: number) => (
      <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="text-xs text-mute">{w.n}</span><div className="w-full rounded-t-md bg-gradient-to-b from-gold to-[#8c8750]" style={{ height: `${(w.n / max) * 80 + 2}%` }} /><span className="text-xs text-mute">{w.label}</span></div>))}</div></div>
    <div className="card"><h3 className="mb-2">Recent enrolments</h3>{recent.length ? recent.map((s: any, i: number) => <div key={i} className="border-t border-line py-2.5 text-sm"><b>{s.name}</b><p className="text-mute">{s.course}</p></div>) : <p className="text-sm text-mute">No enrolments yet.</p>}</div></div>);
}
