import Link from "next/link";
export type CourseLite = { id: number; name: string; icon: string; days: number; price: number; video_count: number };
export default function CourseCard({ c }: { c: CourseLite }) {
  return (
    <div className="card flex flex-col gap-2 transition hover:-translate-y-1 hover:border-gold">
      <div className="grid h-32 place-items-center rounded-xl border border-line bg-gradient-to-br from-[#262a2a] to-ink text-5xl">{c.icon}</div>
      <span className="tag w-fit">{c.days} day{c.days > 1 ? "s" : ""} access</span>
      <h3 className="text-lg">{c.name}</h3>
      <p className="text-sm text-mute">{c.video_count} video lessons · {c.days * 24}h from enrolment</p>
      <div className="mt-auto flex items-center justify-between pt-2"><b className="text-gold">₹{c.price.toLocaleString("en-IN")}</b><Link href={`/courses/${c.id}`} className="btn btn-sm">View course</Link></div>
    </div>);
}
