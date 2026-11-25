"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/client";
const items = [["/admin", "Dashboard"], ["/admin/courses", "Courses"], ["/admin/students", "Students"], ["/admin/live", "Live classes"], ["/admin/addons", "Add-ons (Phase 2)"]];
export default function Sidebar() {
  const p = usePathname(); const r = useRouter();
  return (<aside className="flex gap-1 overflow-x-auto border-b border-line bg-[#0f1111] p-3 md:flex-col md:border-b-0 md:border-r md:p-4">
    <Link href="/" className="mb-2 hidden items-center gap-2 font-serif font-bold text-gold md:flex">👑 KBC Admin</Link>
    {items.map(([h, l]) => <Link key={h} href={h} className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm ${p === h ? "bg-gold/10 text-gold" : "text-mute hover:text-gold"}`}>{l}</Link>)}
    <button className="whitespace-nowrap px-3.5 py-2.5 text-left text-sm text-mute md:mt-auto" onClick={async () => { await api("/api/auth/logout", "POST"); r.push("/admin/login"); r.refresh(); }}>Log out</button></aside>);
}
