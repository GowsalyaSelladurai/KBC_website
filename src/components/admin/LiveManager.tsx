"use client";
import { useState } from "react";
import { liveClasses, recordings, courses } from "@/data/mock";
export default function LiveManager() {
  const [live, setLive] = useState(liveClasses); const [t, setT] = useState(""); const [w, setW] = useState(""); const [fq, setFq] = useState("Weekly"); const [rec, setRec] = useState(recordings);
  return (<div><h1 className="mb-5 text-3xl font-bold">Live classes</h1>
    <div className="card mb-5"><h3 className="mb-2">Schedule a class</h3><div className="grid gap-3 sm:grid-cols-2"><div><label className="label">Title</label><input className="input" value={t} onChange={(e) => setT(e.target.value)} /></div><div><label className="label">Date &amp; time</label><input className="input" type="datetime-local" value={w} onChange={(e) => setW(e.target.value)} /></div></div>
      <label className="label">Frequency</label><select className="input" value={fq} onChange={(e) => setFq(e.target.value)}><option>Weekly</option><option>Monthly (twice)</option></select>
      <label className="label">Meeting link (Zoom / Google Meet)</label><input className="input" placeholder="https://meet.google.com/…" />
      <button className="btn btn-sm mt-4" onClick={() => { setLive([...live, { id: Date.now(), title: t || "New class", when: w || "TBD", freq: fq }]); setT(""); }}>Schedule</button></div>
    <h3 className="mb-2">Upcoming</h3><div className="mb-5 space-y-2">{live.map((l) => <div key={l.id} className="card !p-3 text-sm"><b>{l.title}</b> · {l.when} · {l.freq}</div>)}</div>
    <h3 className="mb-2">Recordings</h3><div className="space-y-2">{rec.map((r) => <div key={r.id} className="card flex items-center gap-3 !p-3"><div className="flex-1 text-sm"><b>{r.title}</b><p className="text-mute">{r.when} · {r.course}</p></div>
      <select className="input !w-auto" value="" onChange={(e) => setRec(rec.map((x) => (x.id === r.id ? { ...x, course: e.target.value } : x)))}><option value="">Add to course…</option>{courses.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>)}</div></div>);
}
