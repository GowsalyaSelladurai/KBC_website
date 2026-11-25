"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import Notice from "@/components/ui/Notice";
export default function Login() {
  const r = useRouter(); const [id, setId] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(null);
    try { const d = await api("/api/auth/login", "POST", { identifier: id, password: pw, expectedRole: "student" }); r.push(d.role === "admin" ? "/admin" : "/student"); r.refresh(); } catch (x: any) { setErr(x.message); setBusy(false); } };
  return (<div className="wrap max-w-md py-16"><form onSubmit={submit} className="card"><h1 className="text-3xl font-bold">Student <span className="text-gold">login</span></h1>
    <label className="label">Email or phone</label><input className="input" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
    <label className="label">Password</label><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
    <p className="my-3 text-xs text-mute">🔒 Videos play on one device at a time. Logging in here signs you out of other devices.</p><Notice msg={err ? { ok: false, t: err } : null} />
    <button className="btn w-full" disabled={busy}>{busy ? "Logging in…" : "Login"}</button>
    <p className="mt-3 text-xs text-mute">No password? <Link href="/courses" className="text-gold">Enrol in a course</Link> or ask academy staff. Admin? <Link href="/admin/login" className="text-gold">Admin Login</Link>.</p></form></div>);
}
