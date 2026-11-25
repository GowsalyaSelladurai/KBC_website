"use client";
import { useEffect, useRef, useState } from "react";
const fmt = (ms: number) => { if (ms <= 0) return "Expired"; const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return `${d ? d + "d " : ""}${h}h ${m}m ${s % 60}s`; };
export default function Countdown({ ms }: { ms: number }) {
  const end = useRef(0); const [left, setLeft] = useState(ms);
  useEffect(() => { end.current = Date.now() + ms; const t = setInterval(() => setLeft(end.current - Date.now()), 1000); return () => clearInterval(t); }, [ms]);
  return <span className={`tag w-fit ${left <= 0 ? "!bg-red-400/15 !text-red-400" : "!bg-green-400/15 !text-green-400"}`}>{fmt(left)}</span>;
}
