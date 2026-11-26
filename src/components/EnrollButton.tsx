"use client";
import { useState } from "react";
import Link from "next/link";
import Modal from "./ui/Modal";
import { Course } from "@/data/mock";
export default function EnrollButton({ course, label = "Enroll Now", className = "btn w-full" }: { course: Course; label?: string; className?: string }) {
  const [open, setOpen] = useState(false); const [step, setStep] = useState(1); const [pay, setPay] = useState("UPI");
  const close = () => { setOpen(false); setStep(1); };
  return (<>
    <button className={className} onClick={() => setOpen(true)}>{label}</button>
    {open && <Modal onClose={close}>
      {step === 1 && (<><h3 className="text-xl">Enroll in {course.name}</h3><p className="text-sm text-mute">{course.days}-day access · ₹{course.price}</p>
        <label className="label">Full name</label><input className="input" /><label className="label">Email</label><input className="input" type="email" /><label className="label">Phone</label><input className="input" type="tel" />
        <button className="btn mt-5 w-full" onClick={() => setStep(2)}>Continue to payment</button></>)}
      {step === 2 && (<><h3 className="text-xl">Payment</h3>
        <div className="my-3 flex gap-2">{["UPI", "Card", "Net banking"].map((p) => <button key={p} onClick={() => setPay(p)} className={`rounded-full border px-3 py-1 text-sm ${pay === p ? "border-gold bg-gold text-ink" : "border-line text-mute"}`}>{p}</button>)}</div>
        <label className="label">{pay === "UPI" ? "UPI ID" : pay === "Card" ? "Card number" : "Select bank"}</label><input className="input" />
        <div className="card mt-4 flex justify-between"><span>{course.name}</span><b className="text-gold">₹{course.price}</b></div>
        <button className="btn mt-5 w-full" onClick={() => setStep(3)}>Pay ₹{course.price}</button></>)}
      {step === 3 && (<><h3 className="text-xl">🎉 You’re enrolled!</h3><p className="text-sm text-mute">Use these credentials to open your course. Your {course.days * 24}h timer has started.</p>
        <div className="card mt-3"><p className="text-xs text-mute">Course password</p><b className="text-gold">KBC-{course.id}7Q-4821</b></div>
        <Link href="/login" className="btn mt-5 block text-center">Go to login</Link></>)}
    </Modal>}
  </>);
}
