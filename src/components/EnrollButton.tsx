"use client";
import { useState } from "react";
import Link from "next/link";
import Modal from "./ui/Modal";
import Notice from "./ui/Notice";
import { api } from "@/lib/client";

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if ((window as any).Razorpay) return resolve(true);
  const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s);
});

// steps: 1 details → 2 payment → 3 success → 4 payment failed
export default function EnrollButton({ course }: { course: { id: number; name: string; days: number; price: number } }) {
  const [open, setOpen] = useState(false); const [step, setStep] = useState(1); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "" }); const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null); const [res, setRes] = useState<any>(null);
  const close = () => { if (busy) return; setOpen(false); setStep(1); setErr(null); setOrder(null); setRes(null); };

  const validEmail = /^\S+@\S+\.\S+$/.test(f.email.trim()); const phoneDigits = f.phone.replace(/\D/g, "");
  const validPhone = phoneDigits.length >= 8 && phoneDigits.length <= 15; const valid = f.name.trim().length >= 2 && validEmail && validPhone;

  // Step 1 → create the payment order on the server (also catches "already enrolled" / conflicting accounts early).
  const startPayment = async () => {
    setBusy(true); setErr(null);
    try { setOrder(await api("/api/enroll/checkout", "POST", { ...f, courseId: course.id })); setStep(2); } catch (e: any) { setErr(e.message); }
    setBusy(false);
  };

  const finish = (r: any) => {
    setRes(r); setStep(3);
    if (r.account?.activationRequired) sessionStorage.setItem("kbc_activate_id", f.phone.trim()); // lets /activate start at the OTP step
  };
  const confirm = async (extra: Record<string, any>) => {
    try { finish(await api("/api/enroll/confirm", "POST", { paymentId: order.paymentId, ...extra })); }
    catch (e: any) { setErr(e.message); setStep(e.code === "PAYMENT_FAILED" ? 4 : 2); }
    setBusy(false);
  };

  const pay = async (outcome: "success" | "failure" = "success") => {
    setBusy(true); setErr(null);
    if (order.mode === "mock") return confirm({ outcome });
    if (!(await loadRazorpay())) { setErr("Could not load the payment window. Check your connection and try again."); setBusy(false); return; }
    const rz = new (window as any).Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amountPaise, currency: order.currency, name: "KBC Saloon Academy", description: order.course.name,
      prefill: { name: f.name, email: f.email, contact: f.phone },
      handler: (r: any) => confirm({ razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature }),
      modal: { ondismiss: () => setBusy(false) },
    });
    rz.on("payment.failed", async (r: any) => { await api("/api/enroll/fail", "POST", { paymentId: order.paymentId, reason: r?.error?.description }).catch(() => {}); setErr(r?.error?.description || "Payment failed."); setStep(4); setBusy(false); });
    rz.open();
  };

  const acct = res?.account;
  return (<>
    <button className="btn w-full" onClick={() => setOpen(true)}>Enroll Now</button>
    {open && <Modal onClose={close}>
      {step === 1 && (<><h3 className="text-xl">Enroll in {course.name}</h3><p className="text-sm text-mute">{course.days}-day access · ₹{course.price}</p>
        {(["name", "email", "phone"] as const).map((k) => <div key={k}><label className="label capitalize">{k === "phone" ? "Mobile number" : k}</label><input className="input" type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
        <div className="mt-3"><Notice msg={err ? { ok: false, t: err } : null} /></div>
        <button className="btn mt-2 w-full" disabled={!valid || busy} onClick={startPayment}>{busy ? "Please wait…" : "Continue to payment"}</button>
        {!valid && (f.email || f.phone) && <p className="mt-2 text-xs text-mute">Enter a valid email and a mobile number (8–15 digits).</p>}</>)}
      {step === 2 && order && (<><h3 className="text-xl">Payment</h3>
        {order.mode === "mock" && <p className="mt-2 text-xs text-mute">Test mode — no real money is charged.</p>}
        <div className="card mt-4 flex justify-between"><span>{order.course.name}</span><b className="text-gold">₹{order.amount}</b></div>
        <div className="mt-3"><Notice msg={err ? { ok: false, t: err } : null} /></div>
        <button className="btn mt-2 w-full" disabled={busy} onClick={() => pay("success")}>{busy ? "Processing…" : `Pay ₹${order.amount}`}</button>
        {order.mode === "mock" && <button className="mt-2 w-full text-sm text-mute underline" disabled={busy} onClick={() => pay("failure")}>Simulate a failed payment</button>}</>)}
      {step === 3 && res && (<><h3 className="text-xl">Enrollment Successful!</h3>
        <p className="mt-2 text-sm">Your course enrollment is confirmed.</p>
        {acct.activationRequired ? (<>
          <p className="mt-1 text-sm">{acct.created ? "Your account has been created." : "Your account is awaiting activation."}</p>
          <p className="mt-1 text-sm">Please verify your mobile number to activate your account.</p>
          {res.activation?.sent && <p className="mt-2 text-xs text-mute">A verification code was sent to {res.activation.destination}.</p>}
          {res.activation && !res.activation.sent && !res.activation.throttled && <p className="mt-2 text-xs text-red-400">We could not send the code automatically — use “Resend code” on the next screen.</p>}
          <Link href="/activate" className="btn mt-5 block text-center">Verify &amp; Activate Account</Link></>)
        : (<><p className="mt-1 text-sm">{acct.created ? "Your account has been created." : "This course has been added to your existing account."}</p>
          <Link href="/login" className="btn mt-5 block text-center">Go to Login</Link></>)}</>)}
      {step === 4 && (<><h3 className="text-xl">Payment failed</h3>
        <p className="mt-2 text-sm text-mute">Your payment did not go through, so no enrollment was created and you have not been charged.</p>
        <div className="mt-3"><Notice msg={err ? { ok: false, t: err } : null} /></div>
        <button className="btn mt-2 w-full" onClick={() => { setErr(null); setStep(2); }}>Try again</button></>)}
    </Modal>}
  </>);
}
