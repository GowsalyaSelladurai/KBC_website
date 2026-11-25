// Authentication module — OTP generation, storage (hashed), expiry, attempt limits and verification.
import crypto from "node:crypto";
import { tx, Db } from "@/lib/db";
import { HttpError } from "@/lib/api";
import type { Channel } from "./contact";

export type Purpose = "activation" | "password_reset";
export const OTP_TTL_MINUTES = 10, MAX_ATTEMPTS = 5, RESEND_COOLDOWN_SECONDS = 30, MAX_SENDS_PER_HOUR = 5;

const hashCode = (userId: number, purpose: string, code: string) => {
  const secret = process.env.JWT_SECRET; if (!secret) throw new Error("JWT_SECRET is not set");
  return crypto.createHmac("sha256", secret).update(`${userId}:${purpose}:${code}`).digest("hex");
};
const safeEqual = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));

/** Creates a fresh code and invalidates older ones. Returns null when throttled (cooldown / hourly cap). */
export async function issueOtp(db: Db, p: { userId: number; purpose: Purpose; channel: Channel; destination: string }) {
  const { rows: [s] } = await db.query(`select (count(*) filter (where created_at>now()-interval '1 hour'))::int as sent_hour, extract(epoch from (now()-max(created_at)))::float8 as since from otp_codes where user_id=$1 and purpose=$2`, [p.userId, p.purpose]);
  if ((s.since !== null && s.since < RESEND_COOLDOWN_SECONDS) || s.sent_hour >= MAX_SENDS_PER_HOUR) return null;
  await db.query("update otp_codes set used_at=now() where user_id=$1 and purpose=$2 and used_at is null and verified_at is null", [p.userId, p.purpose]);
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  await db.query("insert into otp_codes(user_id,purpose,channel,destination,code_hash,expires_at) values($1,$2,$3,$4,$5,now()+make_interval(mins=>$6::int))", [p.userId, p.purpose, p.channel, p.destination, hashCode(p.userId, p.purpose, code), OTP_TTL_MINUTES]);
  return { code };
}

/** Checks the latest live code. Wrong guesses are counted (and committed) before the error is thrown. */
export async function verifyOtp(userId: number, purpose: Purpose, code: string) {
  const r = await tx(async (c) => {
    const { rows: [o] } = await c.query(`select id,channel,code_hash,attempts,(expires_at<=now()) as expired from otp_codes where user_id=$1 and purpose=$2 and used_at is null and verified_at is null order by created_at desc limit 1 for update`, [userId, purpose]);
    if (!o || o.expired) return { kind: "invalid" as const };
    if (o.attempts >= MAX_ATTEMPTS) return { kind: "locked" as const };
    if (!safeEqual(o.code_hash, hashCode(userId, purpose, code))) { await c.query("update otp_codes set attempts=attempts+1 where id=$1", [o.id]); return { kind: "wrong" as const, left: MAX_ATTEMPTS - o.attempts - 1 }; }
    await c.query("update otp_codes set verified_at=now(), attempts=attempts+1 where id=$1", [o.id]);
    return { kind: "ok" as const, otpId: o.id as number, channel: o.channel as Channel };
  });
  if (r.kind === "ok") return r;
  if (r.kind === "locked" || (r.kind === "wrong" && r.left <= 0)) throw new HttpError(429, "Too many incorrect attempts. Please request a new code.", "OTP_LOCKED");
  if (r.kind === "wrong") throw new HttpError(400, `Incorrect code. ${r.left} attempt${r.left === 1 ? "" : "s"} left.`, "OTP_WRONG");
  throw new HttpError(400, "This code is invalid or has expired. Please request a new one.", "OTP_INVALID");
}
