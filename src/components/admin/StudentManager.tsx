"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import { api } from "@/lib/client";
type S = { id: number; name: string; email: string; phone: string; courses: { name: string; active: boolean }[] };
export default function StudentManager({ students, courses }: { students: S[]; courses: { id: number; name: string; days: number }[] }) {
  const r = useRouter(); const [f, setF] = useState<any>(null); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const run = async (fn: () => Promise<any>, done: (d: any) => string) => { try { const d = await fn(); setMsg({ ok: true, t: done(d) }); r.refresh(); return true; } catch (e: any) { setMsg({ ok: false, t: e.message }); return false; } };
  const save = async () => { const b = { name: f.name, email: f.email, phone: f.phone };
    const okk = f.id ? await run(() => api(`/api/admin/students/${f.id}`, "PUT", b), () => "Details updated") : await run(() => api("/api/admin/students", "POST", { ...b, courseId: f.courseId }), (d) => d.password ? `Enrolled. Give the student this password (shown once): ${d.password}` : "Enrolled in course (student keeps their existing password)");
    if (okk) setF(null); };
  return (<div>
    <div className="mb-5 flex items-center justify-between"><h1 className="text-3xl font-bold">Students</h1><button className="btn btn-sm" onClick={() => { setMsg(null); setF({ id: 0, name: "", email: "", phone: "", courseId: courses[0]?.id }); }}>+ Enroll student</button></div>
    {!f && <Notice msg={msg} />}
    <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[640px]"><thead><tr>{["Name", "Contact", "Courses", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody>{students.map((s) => (
      <tr key={s.id}><td className="td">{s.name}</td><td className="td">{s.email}<p className="text-mute">{s.phone}</p></td><td className="td space-x-1">{s.courses.map((c, i) => <span key={i} className={`tag ${c.active ? "" : "opacity-50"}`}>{c.name}{c.active ? "" : " (expired)"}</span>)}</td>
        <td className="td space-x-1 whitespace-nowrap"><button className="btn-o btn-sm" onClick={() => { setMsg(null); setF(s); }}>Edit</button>
          <button className="btn-o btn-sm" onClick={() => run(() => api(`/api/admin/students/${s.id}/reset-device`, "POST"), () => "Device reset — the student can log in on a new device")}>Reset device</button>
          <button className="btn-d btn-sm" onClick={() => confirm("Remove this student?") && run(() => api(`/api/admin/students/${s.id}`, "DELETE"), () => "Student removed")}>Remove</button></td></tr>))}</tbody></table></div>
    {f && <Modal onClose={() => setF(null)}><h3 className="text-xl">{f.id ? "Edit student" : "Enroll student"}</h3><Notice msg={msg} />
      {(["name", "email", "phone"] as const).map((k) => <div key={k}><label className="label capitalize">{k}</label><input className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
      {!f.id && <><label className="label">Course plan</label><select className="input" value={f.courseId} onChange={(e) => setF({ ...f, courseId: +e.target.value })}>{courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.days}d)</option>)}</select></>}
      <button className="btn mt-5" onClick={save}>{f.id ? "Save" : "Enroll & generate password"}</button></Modal>}
  </div>);
}
