import { liveClasses } from "@/data/mock";
export default function LiveList() {
  return (<div className="space-y-2">{liveClasses.map((l) => (
    <div key={l.id} className="card flex items-center gap-3 !p-3"><span>🎥</span><div className="flex-1"><b>{l.title}</b><p className="text-sm text-mute">{l.when} · {l.freq}</p></div><button className="btn btn-sm">Join</button></div>))}</div>);
}
