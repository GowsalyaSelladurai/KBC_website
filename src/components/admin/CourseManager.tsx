"use client";
import { useState } from "react";
import { courses as seed, Course } from "@/data/mock";
import Modal from "@/components/ui/Modal";
export default function CourseManager() {
  const [list, setList] = useState<Course[]>(seed);
  const [edit, setEdit] = useState<Course | null>(null); const [vid, setVid] = useState<Course | null>(null);
  const save = () => { if (!edit) return; setList(list.some((c) => c.id === edit.id) ? list.map((c) => (c.id === edit.id ? edit : c)) : [...list, edit]); setEdit(null); };
  const setV = (c: Course, videos: string[]) => { const n = { ...c, videos }; setList(list.map((x) => (x.id === c.id ? n : x))); setVid(n); };
  return (<div>
    <div className="mb-5 flex items-center justify-between"><h1 className="text-3xl font-bold">Courses</h1><button className="btn btn-sm" onClick={() => setEdit({ id: Date.now(), name: "", days: 1, price: 0, icon: "✨", videos: [] })}>+ Add course</button></div>
    <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[560px]"><thead><tr>{["Course", "Duration", "Price", "Videos", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody>{list.map((c) => (
      <tr key={c.id}><td className="td">{c.icon} {c.name}</td><td className="td">{c.days} day(s)</td><td className="td">₹{c.price}</td><td className="td">{c.videos.length}</td>
        <td className="td space-x-1 whitespace-nowrap"><button className="btn-o btn-sm" onClick={() => setEdit(c)}>Edit</button><button className="btn-o btn-sm" onClick={() => setVid(c)}>Videos</button><button className="btn-d btn-sm" onClick={() => confirm("Delete this course?") && setList(list.filter((x) => x.id !== c.id))}>Delete</button></td></tr>))}</tbody></table></div>
    {edit && <Modal onClose={() => setEdit(null)}><h3 className="text-xl">Course details</h3>
      <label className="label">Name</label><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
      <div className="grid grid-cols-2 gap-3"><div><label className="label">Duration (days)</label><input className="input" type="number" value={edit.days} onChange={(e) => setEdit({ ...edit, days: +e.target.value })} /></div>
        <div><label className="label">Price (₹)</label><input className="input" type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: +e.target.value })} /></div></div>
      <button className="btn mt-5" onClick={save}>Save</button></Modal>}
    {vid && <Modal onClose={() => setVid(null)}><h3 className="text-xl">{vid.name} · Videos</h3>
      <div className="my-3 cursor-pointer rounded-xl border-2 border-dashed border-line p-5 text-center text-mute hover:border-gold hover:text-gold" onClick={() => setV(vid, [...vid.videos, `New video ${vid.videos.length + 1}`])}>⬆ Upload video</div>
      <div className="space-y-2">{vid.videos.map((v, i) => <div key={i} className="card flex items-center justify-between !p-2.5 text-sm"><span>{i + 1}. {v}</span><button className="btn-d btn-sm" onClick={() => setV(vid, vid.videos.filter((_, k) => k !== i))}>Remove</button></div>)}</div>
      <button className="btn-o mt-4" onClick={() => setVid(null)}>Done</button></Modal>}
  </div>);
}
