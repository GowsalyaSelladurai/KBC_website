import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { q } from "@/lib/db";
export const DELETE = route(async (_r, { params }) => { await requireUser(true); await q("delete from live_classes where id=$1", [Number(params.id)]); return ok({ ok: true }); });
