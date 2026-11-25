import crypto from "node:crypto";
import { q } from "./db";
import { HttpError } from "./api";
// Enforces the course timer and sequential unlock on the server.
export async function assertCanWatch(user: any, videoId: number) {
  const [v] = await q("select id,title,position,course_id,bunny_video_id from videos where id=$1", [videoId]);
  if (!v) throw new HttpError(404, "Video not found");
  if (user.role === "admin") return v;
  const [e] = await q("select 1 from enrollments where user_id=$1 and course_id=$2 and expires_at>now()", [user.id, v.course_id]);
  if (!e) throw new HttpError(403, "Your access to this course has expired");
  const [blocked] = await q(`select 1 from videos pv where pv.course_id=$1 and (pv.position,pv.id)<($2,$3) and not exists(select 1 from video_progress p where p.video_id=pv.id and p.user_id=$4 and p.completed)`, [v.course_id, v.position, v.id, user.id]);
  if (blocked) throw new HttpError(403, "Complete the previous video first");
  return v;
}
export function bunnyEmbed(videoId?: string | null) {
  const lib = process.env.BUNNY_LIBRARY_ID, key = process.env.BUNNY_TOKEN_KEY; if (!lib || !key || !videoId) return null;
  const exp = Math.floor(Date.now() / 1000) + 3600, token = crypto.createHash("sha256").update(key + videoId + exp).digest("hex");
  return `https://iframe.mediadelivery.net/embed/${lib}/${videoId}?token=${token}&expires=${exp}&preload=false`;
}
