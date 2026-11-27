"use client";
import { useState } from "react";
import { students as seed, courses, getCourse } from "@/data/mock";
import Modal from "@/components/ui/Modal";
type St = { id: number; name: string; email: string; phone: string; courses: number[] };
export default function StudentManager() {
  const [list, setList] = useState<St[]>(seed); const [f, setF] = useState<St | null>(null); const [note, setNote] = useState("");
  const save = () => { if (!f) return; const isNew = !list.some((s) => s.id === f.id); setList(isNew ? [...list, f] : list.map((s) => (s.id === f.id ? f : s))); setNote(isNew ? `Enrolled · course password KBC-${Math.floor(1000 + Math.random() * 9000)}` : "Details updated"); setF(null); };
  return (<div>
    <div className="mb-5 flex items-center justify-between"><h1 className="text-3xl font-bold">Students</h1><button className="btn btn-sm" onClick={() => setF({ id: Date.now(), name: "", email: "", phone: "", courses: [1] })}>+ Enroll student</button></div>
    {note && <p className="mb-3 rounded-xl bg-gold/10 p-3 text-sm text-gold">{note}</p>}
    <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[640px]"><thead><tr>{["Name", "Contact", "Courses", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody>{list.map((s) => (
      <tr key={s.id}><td className="td">{s.name}</td><td className="td">{s.email}<p className="text-mute">{s.phone}</p></td><td className="td space-x-1">{s.courses.map((i) => <span key={i} className="tag">{getCourse(i)?.name}</span>)}</td>
        <td className="td space-x-1 whitespace-nowrap"><button className="btn-o btn-sm" onClick={() => setF(s)}>Edit</button><button className="btn-o btn-sm" onClick={() => setNote("Device reset — student can log in on a new device")}>Reset device</button><button className="btn-d btn-sm" onClick={() => confirm("Remove this student?") && setList(list.filter((x) => x.id !== s.id))}>Remove</button></td></tr>))}</tbody></table></div>
    {f && <Modal onClose={() => setF(null)}><h3 className="text-xl">Student details</h3>
      {(["name", "email", "phone"] as const).map((k) => <div key={k}><label className="label capitalize">{k}</label><input className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
      <label className="label">Course plan</label><select className="input" value={f.courses[0]} onChange={(e) => setF({ ...f, courses: [+e.target.value] })}>{courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.days}d)</option>)}</select>
      <button className="btn mt-5" onClick={save}>Save</button></Modal>}
  </div>);
}
