import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { q } from "./db";
import { HttpError } from "./api";
const key = () => new TextEncoder().encode(process.env.JWT_SECRET!);
// A new login replaces session_id, so any older device's token stops matching (single-device rule).
export async function createSession(uid: number, role: string) {
  const sid = crypto.randomUUID();
  await q("update users set session_id=$1 where id=$2", [sid, uid]);
  const t = await new SignJWT({ role, sid }).setSubject(String(uid)).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  cookies().set("kbc", t, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function getUser() {
  const t = cookies().get("kbc")?.value; if (!t) return null;
  try { const { payload } = await jwtVerify(t, key()); const [u] = await q("select id,name,email,phone,role,session_id from users where id=$1", [payload.sub]); return u && u.session_id === payload.sid ? u : null; } catch { return null; }
}
export async function requireUser(admin = false) {
  const u = await getUser(); if (!u) throw new HttpError(401, "Please log in again");
  if (admin && u.role !== "admin") throw new HttpError(403, "Admins only"); return u;
}
