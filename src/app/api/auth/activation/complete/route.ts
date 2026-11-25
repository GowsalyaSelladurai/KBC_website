import { route, ok } from "@/lib/api";
import { completeSchema, completeActivation } from "@/modules/auth";
export const POST = route(async (req) => { const b = completeSchema.parse(await req.json()); await completeActivation(b.setupToken, b.password); return ok({ ok: true }); });
