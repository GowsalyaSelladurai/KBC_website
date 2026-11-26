"use client";
import { useState } from "react";
import Link from "next/link";
import { enrolled, getCourse, recordings } from "@/data/mock";
import Countdown from "@/components/Countdown";
import LiveList from "@/components/LiveList";
export default function Student() {
  const [tab, setTab] = useState("courses");
  return (<div className="wrap py-10"><h1 className="text-3xl font-bold">Welcome back, <span className="text-gold">Anjali</span></h1>
    <div className="card my-4 text-sm text-mute">📱 Active on this device only. Playing on another device will sign this one out.</div>
    <div className="mb-4 flex gap-2">{[["courses", "My courses"], ["live", "Live classes"], ["rec", "Recordings"]].map(([k, l]) => (
      <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === k ? "border-gold bg-gold text-ink" : "border-line text-mute"}`}>{l}</button>))}</div>
    {tab === "courses" && <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{enrolled.map((e) => { const c = getCourse(e.courseId)!; const ex = e.msLeft <= 0; return (
      <div key={c.id} className="card flex flex-col gap-2"><div className="grid h-28 place-items-center rounded-xl border border-line text-4xl">{c.icon}</div><h3 className="text-lg">{c.name}</h3><Countdown ms={e.msLeft} />
        <p className="text-sm text-mute">{ex ? "Access expired — re-enrol to continue." : `${e.done} of ${c.videos.length} videos completed`}</p>
        {ex ? <Link href={`/courses/${c.id}`} className="btn-o btn-sm w-fit">Re-enroll</Link> : <Link href={`/watch/${c.id}?done=${e.done}`} className="btn btn-sm w-fit">Continue learning</Link>}</div>); })}</div>
      <p className="mt-4 text-xs text-mute">One account, many courses: each course locks on its own timer — an expired course never blocks your login.</p></>}
    {tab === "live" && <LiveList />}
    {tab === "rec" && <div className="space-y-2">{recordings.map((r) => <div key={r.id} className="card flex items-center gap-3 !p-3"><span>🎞</span><div className="flex-1"><b>{r.title}</b><p className="text-sm text-mute">{r.when}</p></div><button className="btn btn-sm">Watch</button></div>)}</div>}
  </div>);
}
