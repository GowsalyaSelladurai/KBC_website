import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { staffEnrollSchema, enrollByStaff } from "@/modules/enrollment";
// Same enrolment + account-activation pipeline as online self-enrolment; only the payment step differs (recorded by staff).
export const POST = route(async (req) => { await requireUser(true); return ok(await enrollByStaff(staffEnrollSchema.parse(await req.json()) as Parameters<typeof enrollByStaff>[0]), 201); });
