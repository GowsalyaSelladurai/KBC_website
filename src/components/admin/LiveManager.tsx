"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Notice from "@/components/ui/Notice";
import { fmtDate, Live } from "@/components/LiveList";
import { api } from "@/lib/client";
export default function LiveManager({ items }: { items: Live[] }) {
  const r = useRouter(); const [f, setF] = useState({ title: "", startsAt: "", frequency: "Weekly", meetingUrl: "" }); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const run = async (fn: () => Promise<any>, done: string) => { try { await fn(); setMsg({ ok: true, t: done }); r.refresh(); return true; } catch (e: any) { setMsg({ ok: false, t: e.message }); return false; } };
  return (<div><h1 className="mb-5 text-3xl font-bold">Live classes</h1><Notice msg={msg} />
    <div className="card mb-5"><h3 className="mb-2">Schedule a class</h3><div className="grid gap-3 sm:grid-cols-2"><div><label className="label">Title</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div><label className="label">Date &amp; time</label><input className="input" type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} /></div></div>
      <label className="label">Frequency</label><select className="input" value={f.frequency} onChange={(e) => setF({ ...f, frequency: e.target.value })}><option>Weekly</option><option>Monthly (twice)</option></select>
      <label className="label">Meeting link (Zoom / Google Meet)</label><input className="input" placeholder="https://meet.google.com/…" value={f.meetingUrl} onChange={(e) => setF({ ...f, meetingUrl: e.target.value })} />
      <button className="btn btn-sm mt-4" onClick={async () => { if (await run(() => api("/api/admin/live", "POST", f), "Live class scheduled")) setF({ ...f, title: "", meetingUrl: "" }); }}>Schedule</button></div>
    <div className="space-y-2">{items.map((l) => <div key={l.id} className="card flex items-center gap-3 !p-3 text-sm"><div className="flex-1"><b>{l.title}</b><p className="text-mute">{fmtDate(l.starts_at)} · {l.frequency}</p></div>
      <button className="btn-d btn-sm" onClick={() => confirm("Delete this class?") && run(() => api(`/api/admin/live/${l.id}`, "DELETE"), "Class deleted")}>Delete</button></div>)}</div></div>);
}
