export type Live = { id: number; title: string; starts_at: string | Date; frequency: string; meeting_url: string | null };
export const fmtDate = (d: string | Date) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
export default function LiveList({ items }: { items: Live[] }) {
  if (!items.length) return <p className="text-mute">No live classes scheduled yet.</p>;
  return (<div className="space-y-2">{items.map((l) => (
    <div key={l.id} className="card flex items-center gap-3 !p-3"><span>🎥</span><div className="flex-1"><b>{l.title}</b><p className="text-sm text-mute">{fmtDate(l.starts_at)} · {l.frequency}</p></div>
      {l.meeting_url && <a href={l.meeting_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Join</a>}</div>))}</div>);
}
