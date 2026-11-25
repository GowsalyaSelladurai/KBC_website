import CourseManager from "@/components/admin/CourseManager";
import { q } from "@/lib/db";
export default async function Page() {
  const courses = await q(`select c.id,c.name,c.icon,c.duration_days as days,c.price::float as price,coalesce((select json_agg(json_build_object('id',v.id,'title',v.title) order by v.position,v.id) from videos v where v.course_id=c.id),'[]') as videos from courses c order by c.id`);
  return <CourseManager courses={courses} />;
}
