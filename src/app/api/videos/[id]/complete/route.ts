import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { assertCanWatch } from "@/lib/access"; import { q } from "@/lib/db";
export const POST = route(async (_r, { params }) => {
  const u = await requireUser(); const v = await assertCanWatch(u, Number(params.id));
  await q("insert into video_progress(user_id,video_id,completed,completed_at) values($1,$2,true,now()) on conflict(user_id,video_id) do update set completed=true,completed_at=now()", [u.id, v.id]); return ok({ ok: true });
});
