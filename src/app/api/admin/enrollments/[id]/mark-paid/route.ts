import { z } from "zod"; import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { markEnrollmentPaid } from "@/modules/enrollment";
const S = z.object({ reference: z.string().trim().max(100).optional() });
export const POST = route(async (req, { params }) => { await requireUser(true); const b = S.parse(await req.json().catch(() => ({}))); await markEnrollmentPaid(Number(params.id), b.reference); return ok({ ok: true }); });
