"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useState } from "react";
const pub = [["/", "Home"], ["/courses", "Courses"], ["/live", "Live Classes"], ["/login", "Student Login"], ["/admin/login", "Admin Portal"]];
const stu = [["/student", "My Learning"], ["/live", "Live Classes"]];
export default function Navbar() {
  const p = usePathname(); const r = useRouter(); const [o, setO] = useState(false);
  const inStu = p.startsWith("/student") || p.startsWith("/watch");
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif font-bold text-gold"><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold">👑</span>KBC Saloon Academy</Link>
        <button aria-label="Menu" className="rounded-lg border border-line px-3 py-1.5 md:hidden" onClick={() => setO(!o)}>☰</button>
        <div className={`${o ? "flex" : "hidden"} absolute left-0 right-0 top-16 flex-col gap-1 border-b border-line bg-ink p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:p-0`}>
          {(inStu ? stu : pub).map(([h, l]) => (
            <Link key={h} href={h} onClick={() => setO(false)} className={`rounded-lg px-3 py-2 text-sm ${p === h ? "text-gold" : "text-mute hover:text-gold"}`}>{l}</Link>))}
          {inStu ? <button className="btn-o btn-sm" onClick={async () => { await api("/api/auth/logout", "POST"); r.push("/"); r.refresh(); }}>Log out</button> : <Link href="/courses" className="btn btn-sm">Enroll Now</Link>}
        </div>
      </div>
    </nav>);
}
