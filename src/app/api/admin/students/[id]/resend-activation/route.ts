import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { sendActivationForUser } from "@/modules/auth";
export const POST = route(async (req, { params }) => { await requireUser(true); return ok(await sendActivationForUser(Number(params.id))); });
