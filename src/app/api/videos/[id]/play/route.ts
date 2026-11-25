import { route, ok } from "@/lib/api"; import { requireUser } from "@/lib/auth"; import { assertCanWatch, bunnyEmbed } from "@/lib/access";
export const GET = route(async (_r, { params }) => { const u = await requireUser(); const v = await assertCanWatch(u, Number(params.id)); return ok({ title: v.title, embedUrl: bunnyEmbed(v.bunny_video_id) }); });
