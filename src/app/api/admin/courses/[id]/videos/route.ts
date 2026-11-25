import { z } from "zod"; import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { q } from "@/lib/db";
const S = z.object({ title: z.string().trim().min(2, "Video title is required"), bunnyVideoId: z.string().trim().optional() });
export const POST = route(async (req, { params }) => { await requireUser(true); const b = S.parse(await req.json()); const id = Number(params.id);
  const [v] = await q("insert into videos(course_id,title,bunny_video_id,position) values($1,$2,$3,(select coalesce(max(position),0)+1 from videos where course_id=$1)) returning id", [id, b.title, b.bunnyVideoId || null]); return ok(v, 201); });
