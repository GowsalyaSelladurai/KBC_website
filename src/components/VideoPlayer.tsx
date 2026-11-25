"use client";
import { useEffect, useState } from "react";
import { Course } from "@/data/mock";
export default function VideoPlayer({ course, startDone = 0 }: { course: Course; startDone?: number }) {
  const [i, setI] = useState(Math.min(startDone, course.videos.length - 1)); const [prog, setProg] = useState(0);
  const [play, setPlay] = useState(false); const [done, setDone] = useState(startDone); const [msg, setMsg] = useState("");
  useEffect(() => { if (!play) return; const t = setInterval(() => setProg((p) => Math.min(100, p + 1.5)), 400); return () => clearInterval(t); }, [play]);
  useEffect(() => {
    if (prog < 100) return; setPlay(false);
    if (i === done && done < course.videos.length) { setDone(done + 1); setMsg(done + 1 < course.videos.length ? "Video completed — next lesson unlocked!" : "Course completed 🎉"); if (i < course.videos.length - 1) setI(i + 1); setProg(0); }
  }, [prog]); // eslint-disable-line
  return (
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="relative grid aspect-video select-none place-items-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#262a2a] to-black" onContextMenu={(e) => e.preventDefault()}>
          <span className="pointer-events-none absolute animate-drift text-xs text-white/35">anjali@mail.com · 98765 43210</span>
          <span className="tag absolute left-3 top-3">🛡 Protected · no download</span>
          <button onClick={() => { setMsg(""); setPlay(!play); }} className="h-16 w-16 rounded-full bg-gold text-2xl text-ink">{play ? "❚❚" : "▶"}</button>
        </div>
        <div className="mt-3 h-1.5 cursor-pointer overflow-hidden rounded bg-line" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProg(Math.round(((e.clientX - r.left) / r.width) * 100)); }}><div className="h-full bg-gold" style={{ width: `${prog}%` }} /></div>
        <div className="mt-3 flex flex-wrap items-center gap-3"><b>{i + 1}. {course.videos[i]}</b><span className="text-sm text-mute">{Math.round(prog)}%</span>
          <select className="input !w-auto"><option>Auto (HD)</option><option>1080p</option><option>720p</option><option>480p</option></select></div>
        {msg && <p className="mt-2 text-sm text-gold">{msg}</p>}
      </div>
      <div className="space-y-2"><h3 className="text-lg">Lessons</h3>{course.videos.map((t, k) => { const lock = k > done; return (
        <button key={k} disabled={lock} onClick={() => { setI(k); setProg(0); setPlay(false); }} className={`card flex w-full items-center gap-3 !p-3 text-left ${lock ? "opacity-50" : ""} ${k === i ? "!border-gold" : ""}`}>
          <span>{lock ? "🔒" : k < done ? "✅" : "▶️"}</span><span className="text-sm">{k + 1}. {t}</span></button>); })}</div>
    </div>);
}
