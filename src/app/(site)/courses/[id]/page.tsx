import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/data/mock";
import EnrollButton from "@/components/EnrollButton";
export default function CourseDetail({ params }: { params: { id: string } }) {
  const c = getCourse(Number(params.id)); if (!c) notFound();
  return (<div className="wrap py-10"><Link href="/courses" className="text-sm text-mute">← Back to courses</Link>
    <div className="mt-4 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div><div className="mb-4 grid h-52 place-items-center rounded-2xl border border-line bg-gradient-to-br from-[#262a2a] to-ink text-8xl">{c.icon}</div>
        <h1 className="text-4xl font-bold">{c.name}</h1>
        <p className="my-3 text-mute">Access starts the moment you enrol and lasts {c.days * 24} hours ({c.days} day{c.days > 1 ? "s" : ""}). Videos unlock in order as you complete them.</p>
        <h3 className="mb-2 text-lg">Course videos</h3><div className="space-y-2">{c.videos.map((v, i) => (
          <div key={v} className={`card flex gap-3 !p-3 ${i ? "opacity-60" : ""}`}><span>{i ? "🔒" : "▶️"}</span><span className="flex-1">{i + 1}. {v}</span><span className="text-sm text-mute">{8 + i * 3} min</span></div>))}</div></div>
      <div className="card lg:sticky lg:top-24"><b className="font-serif text-3xl text-gold">₹{c.price.toLocaleString("en-IN")}</b>
        <p className="my-2 text-sm text-mute">{c.days}-day plan · {c.videos.length} videos · HD streaming</p><EnrollButton course={c} />
        <p className="mt-3 text-xs text-mute">Enrolling in another course adds it to the same login — each course keeps its own timer.</p></div>
    </div></div>);
}
