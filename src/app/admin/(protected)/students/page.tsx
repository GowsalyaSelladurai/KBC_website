import StudentManager from "@/components/admin/StudentManager";
import { q } from "@/lib/db";
export default async function Page() {
  const students = await q(`select u.id,u.name,u.email,u.phone,coalesce(json_agg(json_build_object('name',c.name,'active',e.expires_at>now())) filter (where c.id is not null),'[]') as courses from users u left join enrollments e on e.user_id=u.id left join courses c on c.id=e.course_id where u.role='student' group by u.id order by u.id desc`);
  const courses = await q("select id,name,duration_days as days from courses where active order by id");
  return <StudentManager students={students} courses={courses} />;
}
