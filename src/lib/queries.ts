
import { q } from "./db";
export const listCourses = () => q(`select c.id,c.name,c.icon,c.duration_days as days,c.price::float as price,(select count(*)::int from videos v where v.course_id=c.id) as video_count from courses c where c.active order by c.id`);
export async function getCourse(id: number) {
  if (!Number.isInteger(id)) return null;
  const [c] = await q("select id,name,icon,duration_days as days,price::float as price from courses where id=$1 and active", [id]); if (!c) return null;
  c.videos = await q("select id,title,duration_min from videos where course_id=$1 order by position,id", [id]); return c;
}
export const listLive = () => q("select id,title,starts_at,frequency,meeting_url from live_classes where starts_at>now()-interval '1 day' order by starts_at");
export const myEnrollments = (uid: number) => q(`select c.id,c.name,c.icon,e.payment_status,(extract(epoch from (e.expires_at-now()))*1000)::float8 as ms_left,
 (select count(*)::int from videos v where v.course_id=c.id) as total,
 (select count(*)::int from video_progress p join videos v on v.id=p.video_id where p.user_id=e.user_id and v.course_id=c.id and p.completed) as done
 from enrollments e join courses c on c.id=e.course_id where e.user_id=$1 order by e.enrolled_at desc`, [uid]);
export const myRecordings = (uid: number) => q("select id,title,video_url from recordings where course_id in (select course_id from enrollments where user_id=$1 and expires_at>now() and payment_status='paid') order by created_at desc", [uid]);
