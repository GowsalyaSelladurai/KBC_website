// Authentication module — student account registration / lookup. The ONLY place that creates student users.
import { Db } from "@/lib/db";
import { HttpError } from "@/lib/api";
import { normalizeEmail, normalizePhone, phoneKey, isEmail } from "./contact";

export type StudentAccount = { id: number; name: string; email: string; phone: string | null; role: string; status: "pending" | "active" | "disabled" };
const COLS = "id,name,email,phone,role,status";
const PHONE_EXPR = "right(regexp_replace(phone,'\\D','','g'),10)";

/** Finds the single account that owns this email and/or mobile. Throws if the details are ambiguous or unusable. */
export async function findStudentForContact(db: Db, email: string, phone: string): Promise<StudentAccount | null> {
  const { rows } = await db.query(`select ${COLS} from users where lower(email)=$1 or (phone is not null and phone<>'' and ${PHONE_EXPR}=$2)`, [normalizeEmail(email), phoneKey(phone)]);
  if (!rows.length) return null;
  if (new Set(rows.map((r) => r.id)).size > 1) throw new HttpError(409, "This email and mobile number belong to different accounts. Please contact the academy.", "ACCOUNT_CONFLICT");
  const u = rows[0] as StudentAccount;
  if (u.role !== "student") throw new HttpError(409, "These contact details cannot be used for course enrolment.", "ACCOUNT_CONFLICT");
  if (u.status === "disabled") throw new HttpError(403, "This account is disabled. Please contact the academy.", "ACCOUNT_DISABLED");
  return u;
}

/** Existing account (matched by mobile OR email) or a new PENDING account. Never creates duplicates, even under races. */
export async function resolveStudentAccount(db: Db, p: { name: string; email: string; phone: string }) {
  const existing = await findStudentForContact(db, p.email, p.phone);
  if (existing) return { user: existing, created: false };
  const { rows: [n] } = await db.query(`insert into users(name,email,phone,password_hash,role,status) values($1,$2,$3,null,'student','pending') on conflict do nothing returning ${COLS}`, [p.name.trim(), normalizeEmail(p.email), normalizePhone(p.phone)]);
  if (n) return { user: n as StudentAccount, created: true };
  const raced = await findStudentForContact(db, p.email, p.phone); // a concurrent request created it first
  if (!raced) throw new HttpError(409, "Could not create the account. Please try again.");
  return { user: raced, created: false };
}

/** Pending student by mobile or email (used by the activation screens). */
export async function findPendingStudent(db: Db, identifier: string): Promise<StudentAccount | null> {
  const id = identifier.trim();
  const { rows } = isEmail(id)
    ? await db.query(`select ${COLS} from users where lower(email)=$1 and role='student' and status='pending'`, [normalizeEmail(id)])
    : phoneKey(id).length >= 8 ? await db.query(`select ${COLS} from users where phone is not null and ${PHONE_EXPR}=$1 and role='student' and status='pending'`, [phoneKey(id)]) : { rows: [] };
  return (rows[0] as StudentAccount) ?? null;
}
