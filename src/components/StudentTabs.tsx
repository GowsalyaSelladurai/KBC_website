"use client";
import { useState } from "react";
import Link from "next/link";
import Countdown from "./Countdown";
import LiveList, { Live } from "./LiveList";
export default function StudentTabs({ name, enrollments, live, recordings }: { name: string; enrollments: any[]; live: Live[]; recordings: any[] }) {
  const [tab, setTab] = useState("courses");
  return (<div className="wrap py-10"><h1 className="text-3xl font-bold">Welcome back, <span className="text-gold">{name}</span></h1>
    <div className="card my-4 text-sm text-mute">📱 Active on this device only. Logging in on another device signs this one out.</div>
    <div className="mb-4 flex gap-2">{[["courses", "My courses"], ["live", "Live classes"], ["rec", "Recordings"]].map(([k, l]) => (
      <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === k ? "border-gold bg-gold text-ink" : "border-line text-mute"}`}>{l}</button>))}</div>
    {tab === "courses" && <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{enrollments.map((e) => { const pend = e.payment_status === "pending", ex = !pend && e.ms_left <= 0; return (
      <div key={e.id} className="card flex flex-col gap-2"><div className="grid h-28 place-items-center rounded-xl border border-line text-4xl">{e.icon}</div><h3 className="text-lg">{e.name}</h3>{pend ? <span className="tag w-fit">Payment pending</span> : <Countdown ms={e.ms_left} />}
        <p className="text-sm text-mute">{pend ? "Access starts once the academy confirms your payment." : ex ? "Access expired — re-enrol to continue." : `${e.done} of ${e.total} videos completed`}</p>
        {pend ? null : ex ? <Link href={`/courses/${e.id}`} className="btn-o btn-sm w-fit">Re-enroll</Link> : <Link href={`/watch/${e.id}`} className="btn btn-sm w-fit">Continue learning</Link>}</div>); })}</div>
      <p className="mt-4 text-xs text-mute">One account, many courses: each course locks on its own timer.</p></>}
    {tab === "live" && <LiveList items={live} />}
    {tab === "rec" && (recordings.length ? <div className="space-y-2">{recordings.map((r) => <div key={r.id} className="card flex items-center gap-3 !p-3"><span>🎞</span><b className="flex-1">{r.title}</b>{r.video_url && <a className="btn btn-sm" href={r.video_url} target="_blank" rel="noopener noreferrer">Watch</a>}</div>)}</div> : <p className="text-mute">No recordings yet.</p>)}
  </div>);
}
