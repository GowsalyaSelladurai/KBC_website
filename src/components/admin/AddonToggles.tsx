"use client";
import { useState } from "react";
const items = [["intro", "Permanent intro video", "Shown at the start of every course", "Upload intro video"], ["pdf", "PDF resources", "Upload PDFs from admin and show them to students", "Upload PDF"]];
export default function AddonToggles() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  return (<div><h1 className="mb-5 text-3xl font-bold">Add-ons <span className="tag">Phase 2</span></h1><div className="space-y-3">{items.map(([k, t, d, u]) => (
    <div key={k} className="card"><div className="flex items-center gap-3"><div className="flex-1"><b>{t}</b><p className="text-sm text-mute">{d}</p></div>
      <button aria-label={t} onClick={() => setOn({ ...on, [k]: !on[k] })} className={`relative h-6 w-11 rounded-full ${on[k] ? "bg-gold" : "bg-line"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${on[k] ? "left-6 !bg-ink" : "left-1"}`} /></button></div>
      {on[k] && <div className="mt-3 cursor-pointer rounded-xl border-2 border-dashed border-line p-5 text-center text-mute hover:border-gold hover:text-gold">⬆ {u}</div>}</div>))}</div></div>);
}
