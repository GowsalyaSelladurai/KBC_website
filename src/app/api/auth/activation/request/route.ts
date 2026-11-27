import { route, ok } from "@/lib/api";
import { requestCodeSchema, requestActivationCode } from "@/modules/auth";
// Always answers the same way, so it cannot be used to find out which numbers/emails have accounts.
export const POST = route(async (req) => { const b = requestCodeSchema.parse(await req.json()); await requestActivationCode(b.identifier, b.channel); return ok({ ok: true, message: "If this account is awaiting activation, a verification code has been sent." }); });
