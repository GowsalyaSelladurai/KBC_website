import { cookies } from "next/headers"; import { route, ok } from "@/lib/api"; import { getUser } from "@/lib/auth"; import { q } from "@/lib/db";
export const POST = route(async () => { const u = await getUser(); if (u) await q("update users set session_id=null where id=$1", [u.id]); cookies().delete("kbc"); return ok({ ok: true }); });
