// Authentication module — account activation: send OTP → verify OTP → set password → account becomes 'active'.
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { pool, tx } from "@/lib/db";
import { HttpError } from "@/lib/api";
import { jwtKey } from "@/lib/auth";
import { Channel, maskEmail, maskPhone } from "./contact";
import { findPendingStudent } from "./accounts";
import { issueOtp, verifyOtp } from "./otp";
import { deliverOtp } from "./delivery";

const SETUP_MINUTES = 15;

/** Sends an activation code for a pending student account (mobile by default, email if asked / no mobile on file). */
export async function sendActivationForUser(userId: number, preferred?: Channel) {
  const { rows: [u] } = await pool.query("select id,email,phone,role,status from users where id=$1", [userId]);
  if (!u || u.role !== "student" || u.status !== "pending") throw new HttpError(409, "This account does not need activation.");
  const channel: Channel = preferred === "email" || !u.phone ? "email" : "sms";
  const destination: string = channel === "sms" ? u.phone : u.email;
  const masked = channel === "sms" ? maskPhone(destination) : maskEmail(destination);
  const issued = await issueOtp(pool, { userId, purpose: "activation", channel, destination });
  if (!issued) return { sent: false, throttled: true, channel, destination: masked };
  return { sent: await deliverOtp({ channel, destination, code: issued.code }), throttled: false, channel, destination: masked };
}

/** Public "send code" — always succeeds from the caller's view so it cannot be used to discover accounts. */
export async function requestActivationCode(identifier: string, channel?: Channel) {
  const u = await findPendingStudent(pool, identifier);
  if (u) await sendActivationForUser(u.id, channel).catch((e) => console.error("activation send failed", e));
}

export async function verifyActivationCode(identifier: string, code: string) {
  const u = await findPendingStudent(pool, identifier);
  if (!u) throw new HttpError(400, "This code is invalid or has expired. Please request a new one.", "OTP_INVALID");
  const { otpId } = await verifyOtp(u.id, "activation", code);
  const setupToken = await new SignJWT({ purpose: "activation-setup", otp: otpId }).setSubject(String(u.id)).setProtectedHeader({ alg: "HS256" }).setExpirationTime(`${SETUP_MINUTES}m`).sign(jwtKey());
  return { setupToken };
}

/** Single-use: the verified OTP row is consumed, the password is stored (bcrypt) and the account is activated. */
export async function completeActivation(setupToken: string, password: string) {
  let uid: number, otpId: number;
  try {
    const { payload } = await jwtVerify(setupToken, jwtKey());
    if (payload.purpose !== "activation-setup") throw new Error("wrong token");
    uid = Number(payload.sub); otpId = Number(payload.otp);
  } catch { throw new HttpError(400, "Your verification has expired. Please verify your mobile number again.", "SETUP_EXPIRED"); }
  const hash = await bcrypt.hash(password, 12);
  await tx(async (c) => {
    const { rows: [o] } = await c.query(`select channel from otp_codes where id=$1 and user_id=$2 and purpose='activation' and verified_at is not null and used_at is null and verified_at>now()-make_interval(mins=>$3::int) for update`, [otpId, uid, SETUP_MINUTES]);
    if (!o) throw new HttpError(400, "Your verification has expired or was already used. Please verify again.", "SETUP_EXPIRED");
    const { rows: [u] } = await c.query(`update users set password_hash=$1,status='active',activated_at=now(),phone_verified_at=case when $2='sms' then now() else phone_verified_at end,email_verified_at=case when $2='email' then now() else email_verified_at end where id=$3 and role='student' and status='pending' returning id`, [hash, o.channel, uid]);
    if (!u) throw new HttpError(409, "This account is already activated. Please log in.", "ALREADY_ACTIVE");
    await c.query("update otp_codes set used_at=now() where user_id=$1 and purpose='activation' and used_at is null", [uid]);
  });
}
