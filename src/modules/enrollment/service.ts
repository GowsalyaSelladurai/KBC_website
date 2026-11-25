// Enrollment module — checkout, payment confirmation, enrollment records (one row per student+course), staff enrollment.
// Accounts are never created here directly: everything goes through the Authentication module's public API.
import { pool, q, tx, Db } from "@/lib/db";
import { HttpError } from "@/lib/api";
import { findStudentForContact, resolveStudentAccount, sendActivationForUser, maskEmail, maskPhone } from "@/modules/auth";
import { paymentMode, assertGatewayReady, createGatewayOrder, verifyGatewayPayment, verifyWebhookSignature } from "./payments";

type Contact = { name: string; email: string; phone: string };

async function loadCourse(db: Db, id: number) {
  const { rows: [c] } = await db.query("select id,name,duration_days,price::float as price from courses where id=$1 and active", [id]);
  if (!c) throw new HttpError(404, "Course not found");
  return c;
}

/** Adds or renews ONE enrollment row. Other courses of the same student are never touched. */
async function upsertEnrollment(c: Db, p: { userId: number; course: any; source: "online" | "staff"; paymentStatus: "paid" | "pending"; paymentId: number | null; paymentRef: string | null }) {
  const { rows: [e] } = await c.query(`insert into enrollments(user_id,course_id,source,payment_status,payment_ref,payment_id,enrolled_at,expires_at)
    values($1,$2,$3,$4::text,$5,$6,now(),case when $4::text='paid' then now()+make_interval(days=>$7::int) else now() end)
    on conflict(user_id,course_id) do update set
      source=excluded.source, payment_ref=excluded.payment_ref, payment_id=excluded.payment_id,
      payment_status=case when enrollments.payment_status='paid' then 'paid' else excluded.payment_status end,
      enrolled_at=case when enrollments.payment_status='paid' and enrollments.expires_at>now() then enrollments.enrolled_at else now() end,
      expires_at=case when enrollments.payment_status='paid' and enrollments.expires_at>now() then enrollments.expires_at+make_interval(days=>$7::int) else excluded.expires_at end
    returning id,payment_status,expires_at`, [p.userId, p.course.id, p.source, p.paymentStatus, p.paymentRef, p.paymentId, p.course.duration_days]);
  return e;
}

// ───────────── Self-enrolment (online) ─────────────

export async function startCheckout(i: Contact & { courseId: number }) {
  const course = await loadCourse(pool, i.courseId);
  if (!(course.price > 0)) throw new HttpError(400, "This course cannot be bought online. Please contact the academy.");
  assertGatewayReady();
  const existing = await findStudentForContact(pool, i.email, i.phone);
  if (existing) {
    const { rows: [a] } = await pool.query("select 1 from enrollments where user_id=$1 and course_id=$2 and payment_status='paid' and expires_at>now()", [existing.id, course.id]);
    if (a) throw new HttpError(409, "You are already enrolled in this course and your access is still active.", "ALREADY_ENROLLED");
  }
  const provider = paymentMode();
  const { rows: [pay] } = await pool.query(`insert into payments(user_id,course_id,payer_name,payer_email,payer_phone,amount,provider,source) values($1,$2,$3,$4,$5,$6,$7,'online') returning id`,
    [existing?.id ?? null, course.id, i.name, i.email, i.phone, course.price, provider]);
  try {
    const order = await createGatewayOrder({ provider, paymentId: pay.id, amount: course.price, currency: "INR" });
    await pool.query("update payments set provider_order_id=$2 where id=$1", [pay.id, order.orderId]);
    return { paymentId: pay.id as number, mode: provider, orderId: order.orderId, amount: course.price, amountPaise: Math.round(course.price * 100), currency: "INR", keyId: provider === "razorpay" ? process.env.RAZORPAY_KEY_ID : undefined, course: { id: course.id, name: course.name } };
  } catch (e) {
    console.error(e); await pool.query("update payments set status='failed',failure_reason='gateway order creation failed' where id=$1", [pay.id]);
    throw new HttpError(502, "We could not start the payment. Please try again.");
  }
}

export async function markPaymentFailed(paymentId: number, reason?: string) {
  await pool.query("update payments set status='failed',failure_reason=$2 where id=$1 and status='created' and source='online'", [paymentId, (reason || "payment failed").slice(0, 200)]);
}

/** Idempotent. Locks the payment row, so concurrent confirms / webhook retries can never enrol or charge twice. */
async function fulfill(paymentId: number, providerPaymentId: string) {
  return tx(async (c) => {
    const { rows: [p] } = await c.query("select * from payments where id=$1 for update", [paymentId]);
    if (!p) throw new HttpError(404, "Payment not found");
    if (p.fulfilled_at) return { replay: true as const, p };
    const course = await loadCourse(c, p.course_id).catch(() => { throw new HttpError(409, "This course is no longer available. Please contact the academy with your payment reference."); });
    const { user, created } = await resolveStudentAccount(c, { name: p.payer_name, email: p.payer_email, phone: p.payer_phone });
    const enr = await upsertEnrollment(c, { userId: user.id, course, source: "online", paymentStatus: "paid", paymentId: p.id, paymentRef: providerPaymentId });
    await c.query("update payments set status='paid',provider_payment_id=$2,user_id=$3,account_created=$4,failure_reason=null,paid_at=now(),fulfilled_at=now() where id=$1", [p.id, providerPaymentId, user.id, created]);
    return { replay: false as const, p, user, created, enr, course };
  });
}

async function resultFor(r: Awaited<ReturnType<typeof fulfill>>) {
  if (r.replay) {
    const [u] = await q("select id,email,phone,status from users where id=$1", [r.p.user_id]);
    const [e] = await q("select id,expires_at from enrollments where user_id=$1 and course_id=$2", [r.p.user_id, r.p.course_id]);
    const [c] = await q("select id,name from courses where id=$1", [r.p.course_id]);
    return { status: "paid", replay: true, course: c, enrollment: e && { id: e.id, expiresAt: e.expires_at }, account: { created: r.p.account_created, status: u?.status, activationRequired: u?.status === "pending", maskedPhone: u?.phone ? maskPhone(u.phone) : null, maskedEmail: u ? maskEmail(u.email) : null }, activation: null as any };
  }
  const pending = r.user.status === "pending";
  const activation = pending ? await sendActivationForUser(r.user.id).catch((e) => { console.error(e); return null; }) : null; // after commit, never blocks the enrolment
  return { status: "paid", replay: false, course: { id: r.course.id, name: r.course.name }, enrollment: { id: r.enr.id, expiresAt: r.enr.expires_at },
    account: { created: r.created, status: r.user.status, activationRequired: pending, maskedPhone: r.user.phone ? maskPhone(r.user.phone) : null, maskedEmail: maskEmail(r.user.email) }, activation };
}

export async function confirmPayment(i: { paymentId: number; razorpayPaymentId?: string; razorpaySignature?: string; outcome?: string }) {
  const { rows: [p] } = await pool.query("select * from payments where id=$1 and source='online'", [i.paymentId]);
  if (!p) throw new HttpError(404, "Payment not found");
  if (p.fulfilled_at) return resultFor({ replay: true, p });
  let providerPaymentId = p.provider_payment_id as string | null;
  if (p.status !== "paid") {
    try { providerPaymentId = (await verifyGatewayPayment({ provider: p.provider, orderId: p.provider_order_id, ...i })).providerPaymentId; }
    catch (e: any) { if (e?.code === "PAYMENT_FAILED") await markPaymentFailed(p.id, "payment failed"); throw e; }
  }
  return resultFor(await fulfill(p.id, providerPaymentId!));
}

/** Razorpay webhook: completes enrolments even if the student closed the browser right after paying. */
export async function handleGatewayWebhook(rawBody: string, signature: string | null) {
  if (!verifyWebhookSignature(rawBody, signature)) throw new HttpError(400, "Invalid signature");
  const ev = JSON.parse(rawBody); const ent = ev?.payload?.payment?.entity;
  if (!ent?.order_id) return;
  const { rows: [p] } = await pool.query("select id,status,fulfilled_at from payments where provider='razorpay' and provider_order_id=$1", [ent.order_id]);
  if (!p || p.fulfilled_at) return;
  if (ev.event === "payment.captured" || ev.event === "order.paid") await resultFor(await fulfill(p.id, ent.id));
  else if (ev.event === "payment.failed") await markPaymentFailed(p.id, ent.error_description);
}

// ───────────── Admin enrolment (staff) ─────────────

export async function enrollByStaff(i: Contact & { courseId: number; paymentStatus: "paid" | "pending"; reference?: string }) {
  const out = await tx(async (c) => {
    const course = await loadCourse(c, i.courseId);
    const { user, created } = await resolveStudentAccount(c, i);
    const { rows: [ex] } = await c.query("select id,payment_status,(expires_at>now()) as active from enrollments where user_id=$1 and course_id=$2 for update", [user.id, course.id]);
    if (ex?.payment_status === "paid" && ex.active) throw new HttpError(409, "This student already has active access to this course.");
    if (ex?.payment_status === "pending") {
      if (i.paymentStatus === "pending") throw new HttpError(409, "This student already has an enrolment for this course that is awaiting payment.");
      await markPaid(c, ex.id, i.reference);
      return { user, created, enrollmentId: ex.id as number, paymentStatus: "paid" };
    }
    const paid = i.paymentStatus === "paid";
    const { rows: [pay] } = await c.query(`insert into payments(user_id,course_id,payer_name,payer_email,payer_phone,amount,provider,status,source,reference,paid_at,fulfilled_at,account_created) values($1,$2,$3,$4,$5,$6,'offline',$7,'staff',$8,$9,$9,$10) returning id`,
      [user.id, course.id, i.name, i.email, i.phone, course.price, paid ? "paid" : "created", i.reference || null, paid ? new Date() : null, created]);
    const enr = await upsertEnrollment(c, { userId: user.id, course, source: "staff", paymentStatus: i.paymentStatus, paymentId: pay.id, paymentRef: i.reference || null });
    return { user, created, enrollmentId: enr.id as number, paymentStatus: enr.payment_status as string };
  });
  const activation = out.user.status === "pending" ? await sendActivationForUser(out.user.id).catch((e) => { console.error(e); return null; }) : null;
  return { created: out.created, enrollmentId: out.enrollmentId, paymentStatus: out.paymentStatus, account: { name: out.user.name, status: out.user.status }, activation };
}

async function markPaid(c: Db, enrollmentId: number, reference?: string) {
  const { rows: [e] } = await c.query("select e.id,e.user_id,e.course_id,e.payment_id,e.payment_status,c.duration_days,c.price::float as price,u.name,u.email,u.phone from enrollments e join courses c on c.id=e.course_id join users u on u.id=e.user_id where e.id=$1 for update of e", [enrollmentId]);
  if (!e) throw new HttpError(404, "Enrollment not found");
  if (e.payment_status === "paid") throw new HttpError(409, "This enrollment is already paid.");
  await c.query("update enrollments set payment_status='paid',enrolled_at=now(),expires_at=now()+make_interval(days=>$2::int),payment_ref=coalesce($3,payment_ref) where id=$1", [e.id, e.duration_days, reference || null]);
  const upd = e.payment_id ? (await c.query("update payments set status='paid',paid_at=now(),fulfilled_at=now(),reference=coalesce($2,reference) where id=$1 returning id", [e.payment_id, reference || null])).rows : [];
  if (!upd.length) {
    const { rows: [pay] } = await c.query(`insert into payments(user_id,course_id,payer_name,payer_email,payer_phone,amount,provider,status,source,reference,paid_at,fulfilled_at) values($1,$2,$3,$4,$5,$6,'offline','paid','staff',$7,now(),now()) returning id`, [e.user_id, e.course_id, e.name, e.email, e.phone || "", e.price, reference || null]);
    await c.query("update enrollments set payment_id=$2 where id=$1", [e.id, pay.id]);
  }
}
export const markEnrollmentPaid = (enrollmentId: number, reference?: string) => tx((c) => markPaid(c, enrollmentId, reference));

// ───────────── Access checks shared with login ─────────────

/** 'ok' = at least one paid, unexpired enrolment · 'pending' = only awaiting payment · 'expired' = nothing usable. */
export async function enrollmentAccessState(userId: number): Promise<"ok" | "pending" | "expired"> {
  const rows = await q("select payment_status,(expires_at>now()) as active from enrollments where user_id=$1", [userId]);
  if (rows.some((r) => r.payment_status === "paid" && r.active)) return "ok";
  return rows.some((r) => r.payment_status === "pending") ? "pending" : "expired";
}
