import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { tx } from "./db";
import { HttpError } from "./api";
// Creates the student account on first enrolment (password shown once), then (re)starts the course timer.
export async function enrollStudent(p: { name: string; email: string; phone: string; courseId: number; source: "online" | "staff"; paymentRef?: string }) {
  return tx(async (c) => {
    const { rows: [course] } = await c.query("select id,duration_days from courses where id=$1 and active", [p.courseId]);
    if (!course) throw new HttpError(404, "Course not found");
    let { rows: [u] } = await c.query("select id from users where lower(email)=lower($1) and role='student'", [p.email]);
    let password: string | null = null;
    if (!u) {
      password = "KBC-" + crypto.randomBytes(5).toString("hex");
      ({ rows: [u] } = await c.query("insert into users(name,email,phone,password_hash) values($1,$2,$3,$4) returning id", [p.name, p.email, p.phone, await bcrypt.hash(password, 10)]));
    }
    const { rows: [e] } = await c.query(`insert into enrollments(user_id,course_id,source,payment_ref,expires_at) values($1,$2,$3,$4,now()+make_interval(days=>$5))
      on conflict(user_id,course_id) do update set enrolled_at=now(),expires_at=excluded.expires_at,source=excluded.source,payment_ref=excluded.payment_ref returning expires_at`, [u.id, p.courseId, p.source, p.paymentRef ?? null, course.duration_days]);
    return { userId: u.id, password, expiresAt: e.expires_at };
  });
}
