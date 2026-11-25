"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import { api } from "@/lib/client";
type C = { id: number; name: string; icon: string; days: number; price: number; videos: { id: number; title: string }[] };
export default function CourseManager({ courses }: { courses: C[] }) {
  const r = useRouter(); const [edit, setEdit] = useState<C | null>(null); const [vid, setVid] = useState<number | null>(null);
  const [t, setT] = useState(""); const [bid, setBid] = useState(""); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const run = async (fn: () => Promise<any>, done: string) => { try { await fn(); setMsg({ ok: true, t: done }); r.refresh(); return true; } catch (e: any) { setMsg({ ok: false, t: e.message }); return false; } };
  const save = async () => { if (!edit) return; const b = { name: edit.name, icon: edit.icon, days: edit.days, price: edit.price };
    if (await run(() => (edit.id ? api(`/api/admin/courses/${edit.id}`, "PUT", b) : api("/api/admin/courses", "POST", b)), "Course saved")) setEdit(null); };
  const vc = courses.find((c) => c.id === vid);
  return (<div>
    <div className="mb-5 flex items-center justify-between"><h1 className="text-3xl font-bold">Courses</h1><button className="btn btn-sm" onClick={() => { setMsg(null); setEdit({ id: 0, name: "", icon: "✨", days: 1, price: 0, videos: [] }); }}>+ Add course</button></div>
    {!edit && !vc && <Notice msg={msg} />}
    <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[560px]"><thead><tr>{["Course", "Duration", "Price", "Videos", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody>{courses.map((c) => (
      <tr key={c.id}><td className="td">{c.icon} {c.name}</td><td className="td">{c.days} day(s)</td><td className="td">₹{c.price}</td><td className="td">{c.videos.length}</td>
        <td className="td space-x-1 whitespace-nowrap"><button className="btn-o btn-sm" onClick={() => { setMsg(null); setEdit(c); }}>Edit</button><button className="btn-o btn-sm" onClick={() => { setMsg(null); setVid(c.id); }}>Videos</button>
          <button className="btn-d btn-sm" onClick={() => confirm("Delete this course and its videos?") && run(() => api(`/api/admin/courses/${c.id}`, "DELETE"), "Course deleted")}>Delete</button></td></tr>))}</tbody></table></div>
    {edit && <Modal onClose={() => setEdit(null)}><h3 className="text-xl">Course details</h3><Notice msg={msg} />
      <label className="label">Name</label><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
      <div className="grid grid-cols-2 gap-3"><div><label className="label">Duration (days)</label><input className="input" type="number" min={1} value={edit.days} onChange={(e) => setEdit({ ...edit, days: +e.target.value })} /></div>
        <div><label className="label">Price (₹)</label><input className="input" type="number" min={0} value={edit.price} onChange={(e) => setEdit({ ...edit, price: +e.target.value })} /></div></div>
      <button className="btn mt-5" onClick={save}>Save</button></Modal>}
    {vc && <Modal onClose={() => setVid(null)}><h3 className="text-xl">{vc.name} · Videos</h3><Notice msg={msg} />
      <label className="label">Video title</label><input className="input" value={t} onChange={(e) => setT(e.target.value)} />
      <label className="label">Bunny Stream video ID (optional)</label><input className="input" value={bid} onChange={(e) => setBid(e.target.value)} />
      <button className="btn btn-sm mt-3" onClick={async () => { if (await run(() => api(`/api/admin/courses/${vc.id}/videos`, "POST", { title: t, bunnyVideoId: bid }), "Video added")) { setT(""); setBid(""); } }}>+ Add video</button>
      <div className="mt-4 space-y-2">{vc.videos.map((v, i) => <div key={v.id} className="card flex items-center justify-between !p-2.5 text-sm"><span>{i + 1}. {v.title}</span><button className="btn-d btn-sm" onClick={() => run(() => api(`/api/admin/videos/${v.id}`, "DELETE"), "Video removed")}>Remove</button></div>)}</div>
      <button className="btn-o mt-4" onClick={() => setVid(null)}>Done</button></Modal>}
  </div>);
}
