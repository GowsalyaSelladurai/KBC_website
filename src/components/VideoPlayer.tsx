"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
type V = { id: number; title: string };
export default function VideoPlayer({ videos, doneIds, watermark }: { videos: V[]; doneIds: number[]; watermark: string }) {
  const [done, setDone] = useState(new Set(doneIds)); const first = videos.findIndex((v) => !done.has(v.id));
  const [i, setI] = useState(first < 0 ? 0 : first); const [prog, setProg] = useState(0); const [play, setPlay] = useState(false);
  const [embed, setEmbed] = useState<string | null>(null); const [msg, setMsg] = useState(""); const v = videos[i];
  const complete = async () => { try { await api(`/api/videos/${v.id}/complete`, "POST"); const n = new Set(done).add(v.id); setDone(n); setPlay(false);
    setMsg(n.size === videos.length ? "Course completed 🎉" : "Video completed — next lesson unlocked!"); if (i < videos.length - 1) setI(i + 1); } catch (e: any) { setMsg(e.message); } };
  useEffect(() => { setProg(0); setPlay(false); setEmbed(null); api(`/api/videos/${v.id}/play`).then((d) => setEmbed(d.embedUrl)).catch((e) => setMsg(e.message)); }, [i]); // eslint-disable-line
  useEffect(() => { if (!play || embed) return; const t = setInterval(() => setProg((p) => Math.min(100, p + 1.5)), 400); return () => clearInterval(t); }, [play, embed]);
  useEffect(() => { if (prog >= 100 && !done.has(v.id)) complete(); }, [prog]); // eslint-disable-line
  return (
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="relative grid aspect-video select-none place-items-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#262a2a] to-black" onContextMenu={(e) => e.preventDefault()}>
          {embed ? <iframe src={embed} className="absolute inset-0 h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen /> : <button onClick={() => { setMsg(""); setPlay(!play); }} className="h-16 w-16 rounded-full bg-gold text-2xl text-ink">{play ? "❚❚" : "▶"}</button>}
          <span className="pointer-events-none absolute animate-drift text-xs text-white/40">{watermark}</span>
          <span className="tag absolute left-3 top-3">🛡 Protected · no download</span>
        </div>
        {!embed && <div className="mt-3 h-1.5 cursor-pointer overflow-hidden rounded bg-line" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProg(Math.round(((e.clientX - r.left) / r.width) * 100)); }}><div className="h-full bg-gold" style={{ width: `${prog}%` }} /></div>}
        <div className="mt-3 flex flex-wrap items-center gap-3"><b>{i + 1}. {v.title}</b>{embed && !done.has(v.id) && <button className="btn btn-sm" onClick={complete}>Mark as completed</button>}</div>
        {msg && <p className="mt-2 text-sm text-gold">{msg}</p>}
      </div>
      <div className="space-y-2"><h3 className="text-lg">Lessons</h3>{videos.map((x, k) => { const lock = first >= 0 && k > first; return (
        <button key={x.id} disabled={lock} onClick={() => setI(k)} className={`card flex w-full items-center gap-3 !p-3 text-left ${lock ? "opacity-50" : ""} ${k === i ? "!border-gold" : ""}`}>
          <span>{lock ? "🔒" : done.has(x.id) ? "✅" : "▶️"}</span><span className="text-sm">{k + 1}. {x.title}</span></button>); })}</div>
    </div>);
}
