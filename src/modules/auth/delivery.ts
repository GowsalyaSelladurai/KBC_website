// Authentication module — OTP delivery. Providers are chosen by env; failures never throw (the caller gets false).
import { Channel, toE164 } from "./contact";
import { OTP_TTL_MINUTES } from "./otp";

export async function deliverOtp(p: { channel: Channel; destination: string; code: string }): Promise<boolean> {
  const text = `${p.code} is your KBC Saloon Academy verification code. It expires in ${OTP_TTL_MINUTES} minutes. Do not share it with anyone.`;
  const provider = (p.channel === "sms" ? process.env.OTP_SMS_PROVIDER : process.env.OTP_EMAIL_PROVIDER) || "console";
  try {
    if (provider === "console") { console.log(`[OTP · ${p.channel} · ${p.destination}] ${text}`); return true; } // development only
    if (p.channel === "sms" && provider === "twilio") {
      const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_FROM: from, TWILIO_MESSAGING_SERVICE_SID: svc } = process.env;
      const body = new URLSearchParams({ To: toE164(p.destination), Body: text }); svc ? body.set("MessagingServiceSid", svc) : body.set("From", from || "");
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: "POST", headers: { Authorization: "Basic " + Buffer.from(`${sid}:${tok}`).toString("base64") }, body });
      if (!r.ok) throw new Error(`Twilio ${r.status}: ${await r.text()}`); return true;
    }
    if (p.channel === "email" && provider === "resend") {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [p.destination], subject: "Your KBC Saloon Academy verification code", text }) });
      if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`); return true;
    }
    throw new Error(`Unsupported OTP provider "${provider}" for ${p.channel}`);
  } catch (e) { console.error("OTP delivery failed:", e); return false; }
}
