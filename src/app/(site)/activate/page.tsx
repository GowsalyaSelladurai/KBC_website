"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import Notice from "@/components/ui/Notice";

type Step = "request" | "otp" | "password" | "done";
const COOLDOWN = 30;

export default function Activate() {
  const [step, setStep] = useState<Step>("request"); const [identifier, setIdentifier] = useState(""); const [code, setCode] = useState("");
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [token, setToken] = useState(""); const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [wait, setWait] = useState(0);

  // Coming from the enrolment screen: the code was already sent, so start at "Enter OTP".
  useEffect(() => { const id = sessionStorage.getItem("kbc_activate_id"); if (id) { setIdentifier(id); setStep("otp"); setWait(COOLDOWN); } }, []);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const run = async (fn: () => Promise<void>) => { setBusy(true); setMsg(null); try { await fn(); } catch (e: any) { setMsg({ ok: false, t: e.message }); } setBusy(false); };
  const send = (channel?: "sms" | "email") => run(async () => {
    await api("/api/auth/activation/request", "POST", { identifier, channel });
    setStep("otp"); setCode(""); setWait(COOLDOWN);
    setMsg({ ok: true, t: `If this account is awaiting activation, a verification code has been sent to your ${channel === "email" ? "email" : "mobile number"}.` });
  });
  const verify = () => run(async () => { const d = await api("/api/auth/activation/verify", "POST", { identifier, code }); setToken(d.setupToken); setStep("password"); });
  const complete = () => run(async () => {
    if (pw !== pw2) throw new Error("Passwords do not match");
    try { await api("/api/auth/activation/complete", "POST", { setupToken: token, password: pw }); } catch (e: any) { if (e.code === "SETUP_EXPIRED") { setStep("otp"); setCode(""); } throw e; }
    sessionStorage.removeItem("kbc_activate_id"); setPw(""); setPw2(""); setToken(""); setStep("done");
  });
  const strong = pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);

  return (<div className="wrap max-w-md py-16"><div className="card">
    <p className="mb-2 text-sm font-semibold text-gold">KBC SALOON ACADEMY</p>
    <h1 className="text-3xl font-bold">Activate your <span className="text-gold">account</span></h1>
    <div className="mt-4"><Notice msg={msg} /></div>

    {step === "request" && (<>
      <p className="mb-3 mt-2 text-sm text-mute">Enter the mobile number or email you enrolled with. We’ll send you a verification code.</p>
      <label className="label" htmlFor="act-id">Mobile number or email</label>
      <input id="act-id" className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
      <button className="btn mt-4 w-full" disabled={busy || identifier.trim().length < 3} onClick={() => send()}>{busy ? "Sending…" : "Send verification code"}</button></>)}

    {step === "otp" && (<>
      <p className="mb-3 mt-2 text-sm text-mute">Enter the 6-digit code we sent for <b className="text-white">{identifier}</b>. It expires in 10 minutes.</p>
      <label className="label" htmlFor="act-otp">Verification code</label>
      <input id="act-otp" className="input tracking-[0.5em]" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
      <button className="btn mt-4 w-full" disabled={busy || code.length !== 6} onClick={verify}>{busy ? "Verifying…" : "Verify"}</button>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
        <button className="text-gold disabled:text-mute" disabled={busy || wait > 0} onClick={() => send()}>{wait > 0 ? `Resend code in ${wait}s` : "Resend code"}</button>
        <button className="text-gold disabled:text-mute" disabled={busy || wait > 0} onClick={() => send("email")}>Send to email instead</button>
        <button className="text-mute" onClick={() => { sessionStorage.removeItem("kbc_activate_id"); setStep("request"); setMsg(null); }}>Use a different number</button></div></>)}

    {step === "password" && (<>
      <p className="mb-3 mt-2 text-sm text-mute">Verified. Create a password to finish activating your account.</p>
      <label className="label" htmlFor="act-pw">New password</label>
      <input id="act-pw" className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      <p className={`mt-1 text-xs ${strong || !pw ? "text-mute" : "text-red-400"}`}>At least 8 characters, with a letter and a number.</p>
      <label className="label" htmlFor="act-pw2">Confirm password</label>
      <input id="act-pw2" className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
      <button className="btn mt-4 w-full" disabled={busy || !strong || !pw2} onClick={complete}>{busy ? "Activating…" : "Create password & activate"}</button></>)}

    {step === "done" && (<>
      <p className="mt-2 text-lg font-semibold">Account Activated</p>
      <p className="mb-4 mt-1 text-sm text-mute">Your account is ready. Log in with your mobile number or email and your new password.</p>
      <Link href="/login?activated=1" className="btn block text-center">Go to Login</Link></>)}
  </div></div>);
}
