import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { enrollSchema } from "@/lib/schemas"; import { enrollStudent } from "@/lib/enroll";
export const POST = route(async (req) => { await requireUser(true); return ok(await enrollStudent({ ...enrollSchema.parse(await req.json()), source: "staff" }), 201); });
