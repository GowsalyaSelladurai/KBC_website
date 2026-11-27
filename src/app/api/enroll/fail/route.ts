import { route, ok } from "@/lib/api";
import { failSchema, markPaymentFailed } from "@/modules/enrollment";
export const POST = route(async (req) => { const b = failSchema.parse(await req.json()); await markPaymentFailed(b.paymentId, b.reason); return ok({ ok: true }); });
