import { route, ok } from "@/lib/api";
import { verifyCodeSchema, verifyActivationCode } from "@/modules/auth";
export const POST = route(async (req) => { const b = verifyCodeSchema.parse(await req.json()); return ok(await verifyActivationCode(b.identifier, b.code)); });
