"use client";
import { useState } from "react";
import Link from "next/link";
import Modal from "./ui/Modal";
import Notice from "./ui/Notice";
import { api } from "@/lib/client";
export default function EnrollButton({ course }: { course: { id: number; name: string; days: number; price: number } }) {
  const [open, setOpen] = useState(false); const [step, setStep] = useState(1); const [pay, setPay] = useState("UPI"); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "" }); const [err, setErr] = useState<string | null>(null); const [res, setRes] = useState<any>(null);
  const close = () => { setOpen(false); setStep(1); setErr(null); };
  const submit = async () => { setBusy(true); setErr(null);
    try { setRes(await api("/api/enroll", "POST", { ...f, courseId: course.id, paymentRef: `mock-${Date.now()}` })); setStep(3); } catch (e: any) { setErr(e.message); } setBusy(false); };
  return (<>
    <button className="btn w-full" onClick={() => setOpen(true)}>Enroll Now</button>
    {open && <Modal onClose={close}>
      {step === 1 && (<><h3 className="text-xl">Enroll in {course.name}</h3><p className="text-sm text-mute">{course.days}-day access · ₹{course.price}</p>
        {(["name", "email", "phone"] as const).map((k) => <div key={k}><label className="label capitalize">{k}</label><input className="input" type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
        <button className="btn mt-5 w-full" disabled={!f.name || !f.email || !f.phone} onClick={() => setStep(2)}>Continue to payment</button></>)}
      {step === 2 && (<><h3 className="text-xl">Payment</h3>
        <div className="my-3 flex gap-2">{["UPI", "Card", "Net banking"].map((p) => <button key={p} onClick={() => setPay(p)} className={`rounded-full border px-3 py-1 text-sm ${pay === p ? "border-gold bg-gold text-ink" : "border-line text-mute"}`}>{p}</button>)}</div>
        <p className="text-xs text-mute">Payment gateway runs in mock mode — connect Razorpay/Stripe in <code>lib/payment.ts</code>.</p>
        <div className="card mt-4 flex justify-between"><span>{course.name}</span><b className="text-gold">₹{course.price}</b></div><div className="mt-3"><Notice msg={err ? { ok: false, t: err } : null} /></div>
        <button className="btn mt-2 w-full" disabled={busy} onClick={submit}>{busy ? "Processing…" : `Pay ₹${course.price}`}</button></>)}
      {step === 3 && (<><h3 className="text-xl">🎉 You’re enrolled!</h3><p className="text-sm text-mute">Your {course.days * 24}h access timer has started.</p>
        <div className="card mt-3"><p className="text-xs text-mute">Login: {f.email}</p>{res?.password ? <><p className="mt-2 text-xs text-mute">Your password (shown once — save it)</p><b className="text-gold">{res.password}</b></> : <p className="mt-2 text-sm">Use your existing password to log in.</p>}</div>
        <Link href="/login" className="btn mt-5 block text-center">Go to login</Link></>)}
    </Modal>}
  </>);
}
