import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { q } from "@/lib/db";
export const POST = route(async (_r, { params }) => { await requireUser(true); await q("update users set session_id=null where id=$1 and role='student'", [Number(params.id)]); return ok({ ok: true }); });
