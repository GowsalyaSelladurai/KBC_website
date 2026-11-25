// Authentication module — contact helpers (normalisation + masking).
export type Channel = "sms" | "email";

export const normalizeEmail = (v: string) => String(v ?? "").trim().toLowerCase();

/** Digits only; strips a leading +91 / 91 / 0 from Indian numbers so one number has one canonical form. */
export function normalizePhone(v: string) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}
/** Last 10 digits — used to match legacy rows stored as "+91 98765 43210". */
export const phoneKey = (v: string) => normalizePhone(v).slice(-10);
export const isEmail = (v: string) => v.includes("@");

export function toE164(phone: string) {
  const d = normalizePhone(phone), cc = process.env.DEFAULT_COUNTRY_CODE || "91";
  return d.length === 10 ? `+${cc}${d}` : `+${d}`;
}
export function maskPhone(p: string) { const d = normalizePhone(p); return d.length > 4 ? "•".repeat(d.length - 4) + d.slice(-4) : "••••"; }
export function maskEmail(e: string) { const [l, dom] = e.split("@"); return `${l.slice(0, 2)}${"•".repeat(Math.max(1, l.length - 2))}@${dom}`; }
