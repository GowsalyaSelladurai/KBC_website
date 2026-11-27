export default function Notice({ msg }: { msg: { ok: boolean; t: string } | null }) {
  if (!msg) return null;
  return <p role="status" className={`mb-3 rounded-xl p-3 text-sm ${msg.ok ? "bg-gold/10 text-gold" : "bg-red-400/10 text-red-400"}`}>{msg.t}</p>;
}
